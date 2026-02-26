/**
 * IBE Construction — Initialisation Firebase
 * Crée les comptes admin et client test dans Firebase Auth + Firestore
 *
 * Usage:
 *   node portal/setup-firebase.js
 *
 * Prérequis:
 *   npm install firebase-admin
 *   Télécharger la clé de service depuis Console Firebase > Paramètres > Comptes de service
 *   Placer le fichier serviceAccountKey.json dans portal/
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// ─────────────────────────────────────────────
// Vérification de la clé de service
// ─────────────────────────────────────────────
const keyPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
    console.error('\n❌ Clé de service manquante !');
    console.error('');
    console.error('  1. Allez sur https://console.firebase.google.com/project/ibe-construction-portal/settings/serviceaccounts/adminsdk');
    console.error('  2. Cliquez sur "Générer une nouvelle clé privée"');
    console.error('  3. Sauvegardez le fichier sous le nom:');
    console.error('     portal/serviceAccountKey.json');
    console.error('');
    process.exit(1);
}

// Initialiser Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

// ─────────────────────────────────────────────
// Données des comptes
// ─────────────────────────────────────────────
const ADMIN_EMAIL = 'admin@ibe-construction.com';
const ADMIN_PASSWORD = 'IBEAdmin2025!';
const ADMIN_NAME = 'IBE Administration';

const CLIENT_EMAIL = 'client.test@gmail.com';
const CLIENT_PASSWORD = 'Client2025!';
const CLIENT_NAME = 'Mohammed Alami';  // client test

// ─────────────────────────────────────────────
// Fonctions helpers
// ─────────────────────────────────────────────
async function createOrGetUser(email, password, displayName) {
    try {
        const user = await auth.getUserByEmail(email);
        console.log(`  ↩️  Utilisateur existant: ${email} (uid: ${user.uid})`);
        return user;
    } catch (e) {
        if (e.code === 'auth/user-not-found') {
            const user = await auth.createUser({ email, password, displayName });
            console.log(`  ✅ Créé: ${email} (uid: ${user.uid})`);
            return user;
        }
        throw e;
    }
}

// ─────────────────────────────────────────────
// Script principal
// ─────────────────────────────────────────────
async function main() {
    console.log('\n🔥 IBE Construction — Initialisation Firebase\n');

    // ── 1. Compte Admin ──────────────────────
    console.log('📌 Création du compte ADMIN...');
    const adminUser = await createOrGetUser(ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME);

    // Doc Firestore admins/{uid}
    await db.collection('admins').doc(adminUser.uid).set({
        email: ADMIN_EMAIL,
        nom: ADMIN_NAME,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`  📄 Document admins/${adminUser.uid} → OK`);

    // ── 2. Compte Client Test ────────────────
    console.log('\n📌 Création du compte CLIENT test...');
    const clientUser = await createOrGetUser(CLIENT_EMAIL, CLIENT_PASSWORD, CLIENT_NAME);

    // Doc Firestore users/{uid}
    await db.collection('users').doc(clientUser.uid).set({
        uid: clientUser.uid,
        nom: CLIENT_NAME,
        email: CLIENT_EMAIL,
        telephone: '+212 661 234 567',
        ville: 'Casablanca',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`  📄 Document users/${clientUser.uid} → OK`);

    // Doc Firestore projects/{uid}
    await db.collection('projects').doc(clientUser.uid).set({
        uid: clientUser.uid,
        titre: 'Villa Résidentielle – Casablanca',
        type: 'Résidentiel',
        adresse: 'Lotissement Al Fath, Casablanca',
        dateDebut: '2025-03-01',
        dateFin: '2025-09-30',
        avancement: 45,
        etapes: [
            { nom: 'Études & Permis', done: true, date: '2025-03-01' },
            { nom: 'Fondations', done: true, date: '2025-04-15' },
            { nom: 'Gros œuvre', done: false, date: '2025-06-30' },
            { nom: 'Seconds œuvres', done: false, date: '2025-08-15' },
            { nom: 'Finitions', done: false, date: '2025-09-30' }
        ],
        visiteProchaineDate: '2025-03-05',
        visiteProchainHeure: '10h00',
        visiteProchaineAdresse: 'Lotissement Al Fath, Casablanca',
        manager: {
            nom: 'Karim Mansouri',
            role: 'Chef de Projet IBE',
            telephone: '+212 663 176 838'
        },
        documents: [
            { nom: 'Permis de construire', type: 'PDF', date: '2025-03-01', url: '#' },
            { nom: 'Plan d\'exécution RDC', type: 'PDF', date: '2025-04-10', url: '#' },
            { nom: 'Devis détaillé', type: 'XLS', date: '2025-02-28', url: '#' }
        ]
    }, { merge: true });
    console.log(`  📄 Document projects/${clientUser.uid} → OK`);

    // ── 3. Résumé ────────────────────────────
    console.log('\n' + '─'.repeat(50));
    console.log('✅ Initialisation terminée avec succès !\n');
    console.log('  🔑 ADMIN');
    console.log(`     Email    : ${ADMIN_EMAIL}`);
    console.log(`     Password : ${ADMIN_PASSWORD}`);
    console.log(`     URL      : http://localhost:57637/portal/admin-login.html\n`);
    console.log('  👤 CLIENT TEST');
    console.log(`     Email    : ${CLIENT_EMAIL}`);
    console.log(`     Password : ${CLIENT_PASSWORD}`);
    console.log(`     URL      : http://localhost:57637/portal/login.html`);
    console.log('─'.repeat(50) + '\n');

    process.exit(0);
}

main().catch(err => {
    console.error('\n❌ Erreur:', err.message);
    process.exit(1);
});
