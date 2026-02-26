// ============================================================
//  IBE Construction — Firebase Configuration
//  ➜ Remplacez les valeurs ci-dessous par celles de VOTRE
//    projet Firebase (Console → Paramètres → Config web)
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyArm2Cy3dT-XV6a6v8viMN9OT9X0XjzGQ0",
    authDomain: "ibe-construction-portal.firebaseapp.com",
    projectId: "ibe-construction-portal",
    storageBucket: "ibe-construction-portal.firebasestorage.app",
    messagingSenderId: "804752130676",
    appId: "1:804752130676:web:d4150fdb27feccc57a4721",
    measurementId: "G-07ZHF4XGK0"
};

// Initialisation Firebase (compat SDK — fonctionne sans bundler)
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// ============================================================
//  ARCHITECTURE FICHIERS :
//  - Cloudinary : stockage physique des fichiers (PDF, DWG…)
//  - Firestore  : uniquement utilisateurs, projets, messages
//  - Sous-collection Firestore : documents/{uid}/files/{docId}
//    → stocke SEULEMENT les métadonnées (nom, taille, URL Cloudinary)
//    → aucun contenu de fichier dans Firestore
// ============================================================

const CLOUDINARY_CLOUD_NAME = 'dvko6pc6f';
const CLOUDINARY_UPLOAD_PRESET = 'ibe-docs';

// ── Upload Cloudinary + sauvegarde métadonnées ────────────────
/**
 * Upload un fichier vers Cloudinary, puis enregistre SEULEMENT
 * ses métadonnées (nom, taille, URL) dans la sous-collection
 * Firestore: documents/{uid}/files/{docId}
 *
 * Firestore ne stocke AUCUN contenu de fichier — uniquement
 * l'URL de référence vers Cloudinary.
 *
 * Returns: { url, nom, docId }
 */
async function ibeUploadDocument(uid, file, onProgress) {
    const ext = file.name.split('.').pop().toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico'];
    // Using 'auto' for PDFs and images often results in better public access headers
    const resourceType = (imageExts.includes(ext) || ext === 'pdf') ? 'auto' : 'raw';
    const apiUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

    // 1. Upload physique vers Cloudinary
    const cloudinaryResult = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();

        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', `ibe-documents/${uid}`);

        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const safeName = Date.now() + '_' + nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');
        formData.append('public_id', safeName);

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable && onProgress) {
                onProgress(Math.round((e.loaded / e.total) * 100));
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    resolve({ url: data.secure_url, publicId: data.public_id });
                } catch (e) {
                    reject(new Error('Réponse Cloudinary invalide.'));
                }
            } else {
                let msg = 'Erreur upload Cloudinary.';
                try { msg = JSON.parse(xhr.responseText).error?.message || msg; } catch (_) { }
                console.error('Cloudinary upload error:', xhr.status, xhr.responseText);
                reject(new Error(msg));
            }
        });

        xhr.addEventListener('error', () => reject(new Error('Erreur réseau.')));
        xhr.addEventListener('timeout', () => reject(new Error('Timeout — fichier trop volumineux ?')));
        xhr.timeout = 120000;
        xhr.open('POST', apiUrl);
        xhr.send(formData);
    });

    // 2. Enregistrement des métadonnées UNIQUEMENT dans Firestore
    //    Aucun contenu de fichier — juste le pointeur vers Cloudinary
    const meta = {
        nom: file.name,
        type: ext.toUpperCase(),
        taille: file.size < 1024 * 1024
            ? Math.round(file.size / 1024) + ' Ko'
            : (file.size / 1024 / 1024).toFixed(1) + ' Mo',
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        url: cloudinaryResult.url,
        publicId: cloudinaryResult.publicId,
        uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('documents').doc(uid).collection('files').add(meta);
    return { url: cloudinaryResult.url, nom: file.name, docId: docRef.id };
}

// ── Listeners temps réel des documents ───────────────────────
/**
 * Écoute en temps réel les documents d'un client depuis la sous-collection.
 * Le callback reçoit un tableau de { docId, nom, type, taille, date, url }
 */
function ibeListenDocuments(uid, callback) {
    return db.collection('documents').doc(uid).collection('files')
        .orderBy('uploadedAt', 'desc')
        .onSnapshot(snap => {
            const docs = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
            callback(docs);
        });
}

/**
 * Récupération unique des documents d'un client.
 */
async function ibeGetDocuments(uid) {
    const snap = await db.collection('documents').doc(uid).collection('files')
        .orderBy('uploadedAt', 'desc').get();
    return snap.docs.map(d => ({ docId: d.id, ...d.data() }));
}

/**
 * Supprime la référence d'un document de Firestore.
 * Le fichier Cloudinary reste (suppression Cloudinary nécessite l'API secret côté serveur).
 */
async function ibeDeleteDocument(uid, docId) {
    return db.collection('documents').doc(uid).collection('files').doc(docId).delete();
}

// ── Fix URL Cloudinary pour visualisation ────────────────────
/**
 * Nettoie une URL Cloudinary pour l'affichage inline :
 * 1. Retire fl_attachment (force le téléchargement au lieu de l'affichage)
 * 2. Convertit /image/upload/ → /raw/upload/ pour les non-images
 *    afin que Cloudinary serve le bon Content-Type (application/pdf, etc.)
 *
 * NOTE: fl_inline N'est PAS utilisé — il cause HTTP 400 sur les ressources raw.
 * Le navigateur ouvre les PDFs nativement via Content-Type: application/pdf.
 */
function cloudinaryFixUrl(url, filename) {
    if (!url) return '';
    let fixed = url
        .replace('/upload/fl_attachment/', '/upload/')
        .replace('/upload/fl_inline/', '/upload/');
    const ext = ((filename || url).split('.').pop().split('?')[0] || '').toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico'];
    if (ext && !imageExts.includes(ext)) {
        fixed = fixed.replace('/image/upload/', '/raw/upload/');
    }
    return fixed;
}

// ── Helpers Auth ─────────────────────────────────────────────

async function ibeLogin(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
}

async function ibeLogout() {
    return auth.signOut();
}

function ibeOnAuthChanged(callback) {
    return auth.onAuthStateChanged(callback);
}

// ── Helpers Firestore (utilisateurs & projets) ───────────────

async function ibeGetProfile(uid) {
    const snap = await db.collection('users').doc(uid).get();
    return snap.exists ? snap.data() : null;
}

async function ibeGetProject(uid) {
    const snap = await db.collection('projects').doc(uid).get();
    return snap.exists ? snap.data() : null;
}

function ibeListenMessages(uid, callback) {
    return db.collection('messages').doc(uid)
        .collection('thread')
        .orderBy('ts')
        .onSnapshot(snap => {
            const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(msgs);
        });
}

async function ibeSendMessage(uid, text, senderName, isAdmin) {
    return db.collection('messages').doc(uid)
        .collection('thread')
        .add({
            de: senderName,
            texte: text,
            moi: !isAdmin,
            isAdmin: !!isAdmin,
            ts: firebase.firestore.FieldValue.serverTimestamp(),
            heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        });
}

// ── Admin helpers ────────────────────────────────────────────

async function ibeIsAdmin(uid) {
    const user = auth.currentUser;
    if (user && user.email === 'admin@ibe-construction.com') return true;
    const snap = await db.collection('admins').doc(uid).get();
    return snap.exists;
}

async function ibeGetAllClients() {
    const snap = await db.collection('users').get();
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

async function ibeGetAllProjects() {
    const snap = await db.collection('projects').get();
    const projects = {};
    snap.docs.forEach(d => projects[d.id] = d.data());
    return projects;
}

async function ibeUpdateProject(uid, data) {
    return db.collection('projects').doc(uid).set(data, { merge: true });
}

async function ibeCreateClient(email, password, profileData, projectData) {
    const { uid } = profileData;
    await db.collection('users').doc(uid).set(profileData);
    await db.collection('projects').doc(uid).set(projectData);
}
