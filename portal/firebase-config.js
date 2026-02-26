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
// ── Helper Cloudinary Upload ──────────────────────────────────

const CLOUDINARY_CLOUD_NAME = 'dvko6pc6f';
const CLOUDINARY_UPLOAD_PRESET = 'ibe-docs';

/**
 * Upload a file to Cloudinary (free, no Firebase Storage needed).
 * Returns { url, nom } — same interface as the old Firebase version.
 */
async function ibeUploadDocument(uid, file, onProgress) {
    // Use 'raw' for documents (PDF, DWG, etc.) so Cloudinary serves them
    // with the correct MIME type (application/pdf, etc.).
    // 'auto/upload' stores everything under image/upload which breaks PDF viewers.
    const ext = file.name.split('.').pop().toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico'];
    const resourceType = imageExts.includes(ext) ? 'auto' : 'raw';
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

    return new Promise((resolve, reject) => {
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
                const pct = Math.round((e.loaded / e.total) * 100);
                onProgress(pct);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    resolve({
                        url: data.secure_url,
                        nom: file.name
                    });
                } catch (e) {
                    reject(new Error('Réponse Cloudinary invalide.'));
                }
            } else {
                let msg = 'Erreur upload Cloudinary.';
                try {
                    const err = JSON.parse(xhr.responseText);
                    msg = err.error?.message || msg;
                } catch (_) { }
                console.error('❌ Cloudinary upload error:', xhr.status, xhr.responseText);
                reject(new Error(msg));
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('Erreur réseau — vérifiez votre connexion.'));
        });

        xhr.addEventListener('timeout', () => {
            reject(new Error('Timeout — le fichier est peut-être trop volumineux.'));
        });

        xhr.timeout = 120000;
        xhr.open('POST', url);
        xhr.send(formData);
    });
}

/**
 * Fix Cloudinary URLs for inline viewing:
 * 1. Strip fl_attachment (forces download, breaks viewers)
 * 2. Convert /image/upload/ → /raw/upload/ for non-image files
 *    so Cloudinary serves the correct MIME type (application/pdf, etc.)
 *
 * NOTE: fl_inline is NOT used — it causes HTTP 400 on raw/upload resources
 * because Cloudinary transformations are not supported on raw files.
 * The browser opens PDFs natively via Content-Type: application/pdf.
 */
function cloudinaryFixUrl(url, filename) {
    if (!url) return '';
    // Strip fl_attachment flag (forces download instead of inline)
    let fixed = url.replace('/upload/fl_attachment/', '/upload/');
    // Also strip fl_inline if it was accidentally added before
    fixed = fixed.replace('/upload/fl_inline/', '/upload/');
    // Determine if non-image (PDF, DWG, DOCX, etc.)
    const ext = ((filename || url).split('.').pop().split('?')[0] || '').toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico'];
    if (ext && !imageExts.includes(ext)) {
        // Convert image/upload → raw/upload for correct MIME type
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

// ── Helpers Firestore ────────────────────────────────────────

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
            moi: !isAdmin,   // "moi" = côté client
            isAdmin: !!isAdmin,
            ts: firebase.firestore.FieldValue.serverTimestamp(),
            heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        });
}

// ── Admin helpers ────────────────────────────────────────────

async function ibeIsAdmin(uid) {
    // 1. Check if current user email matches the specific admin email
    const user = auth.currentUser;
    if (user && user.email === 'admin@ibe-construction.com') return true;

    // 2. Fallback to Firestore check
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
    // Créer le compte Auth via Admin SDK n'est pas possible côté client.
    // On utilise une Cloud Function ou on crée manuellement via la console Firebase.
    // → Cette fonction sert à créer le profil Firestore pour un UID existant.
    const { uid } = profileData;
    await db.collection('users').doc(uid).set(profileData);
    await db.collection('projects').doc(uid).set(projectData);
}
