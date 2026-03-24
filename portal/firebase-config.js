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
  measurementId: "G-07ZHF4XGK0",
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

const CLOUDINARY_CLOUD_NAME = "dvko6pc6f";
const CLOUDINARY_UPLOAD_PRESET = "ibe-docs";

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
async function ibeUploadDocument(uid, file, onProgress, category = null) {
  const ext = file.name.split(".").pop().toLowerCase();
  // NEW: Forcer les PDF en 'raw' pour éviter les erreurs de distribution 401
  // Cloudinary restreint souvent l'affichage des PDF en tant qu'images (resource_type: image)
  const resourceType = ext === "pdf" ? "raw" : "auto";
  const apiUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
  const cloudinaryResult = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", `ibe-documents/${uid}`);

    const nameWithoutExt =
      file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    const safeName =
      Date.now() + "_" + nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, "_");
    formData.append("public_id", safeName);
    // On retire 'access_mode' pour éviter que Cloudinary demande une signature (401) sur un preset unsigned

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({ url: data.secure_url, publicId: data.public_id });
        } catch (e) {
          reject(new Error("Réponse Cloudinary invalide."));
        }
      } else {
        let msg = "Erreur upload Cloudinary.";
        try {
          msg = JSON.parse(xhr.responseText).error?.message || msg;
        } catch (_) {}
        console.error("Cloudinary upload error:", xhr.status, xhr.responseText);
        reject(new Error(msg));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Erreur réseau.")));
    xhr.addEventListener("timeout", () =>
      reject(new Error("Timeout — fichier trop volumineux ?")),
    );
    xhr.timeout = 120000;
    xhr.open("POST", apiUrl);
    xhr.send(formData);
  });

  // 2. Enregistrement des métadonnées UNIQUEMENT dans Firestore
  //    Aucun contenu de fichier — juste le pointeur vers Cloudinary
  const meta = {
    nom: file.name,
    type: ext.toUpperCase(),
    taille:
      file.size < 1024 * 1024
        ? Math.round(file.size / 1024) + " Ko"
        : (file.size / 1024 / 1024).toFixed(1) + " Mo",
    date: new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    url: cloudinaryResult.url,
    publicId: cloudinaryResult.publicId,
    uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  if (category) {
    meta.category = category;
  }

  const docRef = await db
    .collection("documents")
    .doc(uid)
    .collection("files")
    .add(meta);
  return { url: cloudinaryResult.url, nom: file.name, docId: docRef.id };
}

// ── Listeners temps réel des documents ───────────────────────
/**
 * Écoute en temps réel les documents d'un client depuis la sous-collection.
 * Le callback reçoit un tableau de { docId, nom, type, taille, date, url }
 */
function ibeListenDocuments(uid, callback) {
  return db
    .collection("documents")
    .doc(uid)
    .collection("files")
    .orderBy("uploadedAt", "desc")
    .onSnapshot((snap) => {
      const docs = snap.docs.map((d) => ({ docId: d.id, ...d.data() }));
      callback(docs);
    });
}

/**
 * Récupération unique des documents d'un client.
 */
async function ibeGetDocuments(uid) {
  const snap = await db
    .collection("documents")
    .doc(uid)
    .collection("files")
    .orderBy("uploadedAt", "desc")
    .get();
  return snap.docs.map((d) => ({ docId: d.id, ...d.data() }));
}

/**
 * Supprime la référence d'un document de Firestore.
 * Le fichier Cloudinary reste (suppression Cloudinary nécessite l'API secret côté serveur).
 */
async function ibeDeleteDocument(uid, docId) {
  return db
    .collection("documents")
    .doc(uid)
    .collection("files")
    .doc(docId)
    .delete();
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
function cloudinaryFixUrl(url, filename, forceDownload = false) {
  if (!url) return "";
  let fixed = url
    .replace("/upload/fl_attachment/", "/upload/")
    .replace("/upload/fl_inline/", "/upload/");

  const ext = (
    (filename || url).split(".").pop().split("?")[0] || ""
  ).toLowerCase();
  const imageExts = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "svg",
    "bmp",
    "tiff",
    "ico",
  ];
  // PDF retiré de la liste des images — il doit être traité comme raw

  // Si c'est un PDF ou un autre fichier binaire → /raw/upload/
  if (ext === "pdf" || (ext && !imageExts.includes(ext))) {
    fixed = fixed.replace("/image/upload/", "/raw/upload/");
    // PAS de fl_attachment pour les ressources raw (ça cause 401)
    // Le navigateur téléchargera automatiquement les fichiers raw
  } else {
    // Vraies images
    fixed = fixed.replace("/raw/upload/", "/image/upload/");
    // fl_attachment uniquement pour les images (si téléchargement demandé)
    if (forceDownload) {
      fixed = fixed.replace("/upload/", "/upload/fl_attachment/");
    }
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
  const snap = await db.collection("users").doc(uid).get();
  return snap.exists ? snap.data() : null;
}

async function ibeGetProject(uid) {
  const snap = await db.collection("projects").doc(uid).get();
  return snap.exists ? snap.data() : null;
}

function ibeListenMessages(uid, callback) {
  return db
    .collection("messages")
    .doc(uid)
    .collection("thread")
    .orderBy("ts")
    .onSnapshot((snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(msgs);
    });
}

async function ibeSendMessage(uid, text, senderName, isAdmin) {
  return db
    .collection("messages")
    .doc(uid)
    .collection("thread")
    .add({
      de: senderName,
      texte: text,
      moi: !isAdmin,
      isAdmin: !!isAdmin,
      ts: firebase.firestore.FieldValue.serverTimestamp(),
      heure: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
}

// ── Admin helpers ────────────────────────────────────────────

async function ibeIsAdmin(uid) {
  const user = auth.currentUser;
  if (user && user.email === "admin@ibe-construction.com") return true;
  const snap = await db.collection("admins").doc(uid).get();
  return snap.exists;
}

async function ibeGetAllClients() {
  const snap = await db.collection("users").get();
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

async function ibeGetAllProjects() {
  const snap = await db.collection("projects").get();
  const projects = {};
  snap.docs.forEach((d) => (projects[d.id] = d.data()));
  return projects;
}

async function ibeUpdateProject(uid, data) {
  return db.collection("projects").doc(uid).set(data, { merge: true });
}

async function ibeCreateClient(email, password, profileData, projectData) {
  const { uid } = profileData;
  await db.collection("users").doc(uid).set(profileData);
  await db.collection("projects").doc(uid).set(projectData);
}

// ── Historique des Modifications (Audit Log) ─────────────────

/**
 * Enregistre une action dans le journal d'activité.
 * Collection Firestore : activity_log
 */
async function ibeLogActivity(action, details, clientUid = null) {
  const user = auth.currentUser;
  return db.collection("activity_log").add({
    action,
    details,
    clientUid: clientUid || null,
    adminEmail: user ? user.email : "système",
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    heure: new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    date: new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  });
}

/**
 * Récupère le journal d'activité, trié par date décroissante.
 * @param {number} limit — nombre max d'entrées (défaut 50)
 */
async function ibeGetActivityLog(limit = 50) {
  const snap = await db
    .collection("activity_log")
    .orderBy("timestamp", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Gestion des Sous-Traitants ───────────────────────────────

async function ibeAddSubcontractor(data) {
  data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  return db.collection("subcontractors").add(data);
}

async function ibeGetSubcontractors() {
  const snap = await db
    .collection("subcontractors")
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function ibeUpdateSubcontractor(id, data) {
  return db.collection("subcontractors").doc(id).update(data);
}

async function ibeDeleteSubcontractor(id) {
  return db.collection("subcontractors").doc(id).delete();
}

// ── Gestion des Factures ─────────────────────────────────────

async function ibeAddInvoice(uid, data) {
  data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  return db.collection("invoices").doc(uid).collection("items").add(data);
}

function ibeListenInvoices(uid, callback) {
  return db
    .collection("invoices")
    .doc(uid)
    .collection("items")
    .orderBy("createdAt", "desc")
    .onSnapshot((snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(items);
    });
}

async function ibeGetInvoices(uid) {
  const snap = await db
    .collection("invoices")
    .doc(uid)
    .collection("items")
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function ibeUpdateInvoice(uid, invoiceId, data) {
  return db
    .collection("invoices")
    .doc(uid)
    .collection("items")
    .doc(invoiceId)
    .update(data);
}

async function ibeDeleteInvoice(uid, invoiceId) {
  return db
    .collection("invoices")
    .doc(uid)
    .collection("items")
    .doc(invoiceId)
    .delete();
}

async function ibeGetAllInvoices() {
  const usersSnap = await db.collection("users").get();
  const allInv = [];
  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const userName = userDoc.data().nom || uid;
    const snap = await db.collection("invoices").doc(uid).collection("items").get();
    snap.docs.forEach((d) => allInv.push({ id: d.id, clientUid: uid, clientName: userName, ...d.data() }));
  }
  return allInv.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

// ── Suivi Budget ─────────────────────────────────────────────

async function ibeGetBudget(uid) {
  const snap = await db.collection("budgets").doc(uid).get();
  return snap.exists ? snap.data() : null;
}

async function ibeUpdateBudget(uid, data) {
  return db.collection("budgets").doc(uid).set(data, { merge: true });
}

async function ibeGetAllBudgets() {
  const snap = await db.collection("budgets").get();
  const all = {};
  snap.docs.forEach(d => all[d.id] = d.data());
  return all;
}

// ── Calculateur de Plus-Values ────────────────────────────────

async function ibeAddPlusValue(uid, data) {
  data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  return db.collection("plus_values").doc(uid).collection("items").add(data);
}

async function ibeGetPlusValues(uid) {
  const snap = await db
    .collection("plus_values")
    .doc(uid)
    .collection("items")
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function ibeDeletePlusValue(uid, pvId) {
  return db
    .collection("plus_values")
    .doc(uid)
    .collection("items")
    .doc(pvId)
    .delete();
}

async function ibeUpdatePlusValue(uid, pvId, data) {
  return db
    .collection("plus_values")
    .doc(uid)
    .collection("items")
    .doc(pvId)
    .update(data);
}

async function ibeGetAllPlusValues() {
  const usersSnap = await db.collection("users").get();
  const allPV = [];
  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const userName = userDoc.data().nom || uid;
    const snap = await db.collection("plus_values").doc(uid).collection("items").get();
    snap.docs.forEach((d) => allPV.push({ id: d.id, clientUid: uid, clientName: userName, ...d.data() }));
  }
  return allPV.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

// ── Notifications In-App ─────────────────────────────────────

async function ibeAddNotification(uid, data) {
  data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  data.read = false;
  data.date = new Date().toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
  });
  data.heure = new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit", minute: "2-digit",
  });
  return db.collection("notifications").doc(uid).collection("items").add(data);
}

function ibeListenNotifications(uid, callback) {
  return db.collection("notifications").doc(uid).collection("items")
    .orderBy("createdAt", "desc").limit(30)
    .onSnapshot((snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
}

async function ibeMarkNotificationRead(uid, notifId) {
  return db.collection("notifications").doc(uid).collection("items").doc(notifId).update({ read: true });
}

async function ibeMarkAllNotificationsRead(uid) {
  const snap = await db.collection("notifications").doc(uid).collection("items").where("read", "==", false).get();
  const batch = db.batch();
  snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
  return batch.commit();
}

// ── Feedback Satisfaction (Étoiles) ──────────────────────────

async function ibeSubmitFeedback(uid, data) {
  data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  data.date = new Date().toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
  });
  return db.collection("feedbacks").doc(uid).collection("items").add(data);
}

async function ibeGetFeedbacks(uid) {
  const snap = await db.collection("feedbacks").doc(uid).collection("items")
    .orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Rapports d'Inspection ────────────────────────────────────

async function ibeAddInspection(uid, data) {
  data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  data.date = new Date().toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
  });
  return db.collection("inspections").doc(uid).collection("items").add(data);
}

async function ibeGetInspections(uid) {
  const snap = await db.collection("inspections").doc(uid).collection("items")
    .orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function ibeUpdateInspection(uid, inspId, data) {
  return db.collection("inspections").doc(uid).collection("items").doc(inspId).update(data);
}

async function ibeGetAllInspections() {
  const usersSnap = await db.collection("users").get();
  const allInsps = [];
  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const userName = userDoc.data().nom || uid;
    const snap = await db.collection("inspections").doc(uid).collection("items")
      .orderBy("createdAt", "desc").get();
    snap.docs.forEach((d) => allInsps.push({ id: d.id, clientUid: uid, clientName: userName, ...d.data() }));
  }
  return allInsps.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

// ── Appels d'Offres (Tenders) ────────────────────────────────

async function ibeAddTender(data) {
  data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  data.status = data.status || "open";
  return db.collection("tenders").add(data);
}

async function ibeGetTenders() {
  const snap = await db.collection("tenders").orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function ibeUpdateTender(id, data) {
  return db.collection("tenders").doc(id).update(data);
}

async function ibeDeleteTender(id) {
  return db.collection("tenders").doc(id).delete();
}

async function ibeAddTenderOffer(tenderId, data) {
  data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  return db.collection("tenders").doc(tenderId).collection("offers").add(data);
}

async function ibeGetTenderOffers(tenderId) {
  const snap = await db.collection("tenders").doc(tenderId).collection("offers")
    .orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function ibeDeleteTenderOffer(tenderId, offerId) {
  return db.collection("tenders").doc(tenderId).collection("offers").doc(offerId).delete();
}

// ── RFI (Demandes d'Information) ─────────────────────────────

async function ibeAddRFI(uid, data) {
  data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  data.status = data.status || "open";
  data.date = new Date().toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
  });
  return db.collection("rfis").doc(uid).collection("items").add(data);
}

async function ibeGetRFIs(uid) {
  const snap = await db.collection("rfis").doc(uid).collection("items")
    .orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function ibeGetAllRFIs() {
  const usersSnap = await db.collection("users").get();
  const allRFIs = [];
  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const userName = userDoc.data().nom || uid;
    const snap = await db.collection("rfis").doc(uid).collection("items")
      .orderBy("createdAt", "desc").get();
    snap.docs.forEach((d) => allRFIs.push({ id: d.id, clientUid: uid, clientName: userName, ...d.data() }));
  }
  return allRFIs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

async function ibeUpdateRFI(uid, rfiId, data) {
  return db.collection("rfis").doc(uid).collection("items").doc(rfiId).update(data);
}

async function ibeDeleteRFI(uid, rfiId) {
  return db.collection("rfis").doc(uid).collection("items").doc(rfiId).delete();
}

// ── Observations de Chantier ─────────────────────────────────

async function ibeAddObservation(uid, data) {
  data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  data.status = data.status || "open";
  data.date = new Date().toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
  });
  return db.collection("observations").doc(uid).collection("items").add(data);
}

async function ibeGetObservations(uid) {
  const snap = await db.collection("observations").doc(uid).collection("items")
    .orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function ibeGetAllObservations() {
  const usersSnap = await db.collection("users").get();
  const allObs = [];
  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const userName = userDoc.data().nom || uid;
    const snap = await db.collection("observations").doc(uid).collection("items")
      .orderBy("createdAt", "desc").get();
    snap.docs.forEach((d) => allObs.push({ id: d.id, clientUid: uid, clientName: userName, ...d.data() }));
  }
  return allObs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

async function ibeUpdateObservation(uid, obsId, data) {
  return db.collection("observations").doc(uid).collection("items").doc(obsId).update(data);
}

async function ibeDeleteObservation(uid, obsId) {
  return db.collection("observations").doc(uid).collection("items").doc(obsId).delete();
}

// ── Journal de Chantier (Daily Logs) ─────────────────────────

async function ibeAddDailyLog(uid, data) {
  data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  data.date = data.date || new Date().toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
  });
  return db.collection("daily_logs").doc(uid).collection("items").add(data);
}

async function ibeGetDailyLogs(uid) {
  const snap = await db.collection("daily_logs").doc(uid).collection("items")
    .orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function ibeGetAllDailyLogs() {
  const usersSnap = await db.collection("users").get();
  const allLogs = [];
  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const userName = userDoc.data().nom || uid;
    const snap = await db.collection("daily_logs").doc(uid).collection("items")
      .orderBy("createdAt", "desc").get();
    snap.docs.forEach((d) => allLogs.push({ id: d.id, clientUid: uid, clientName: userName, ...d.data() }));
  }
  return allLogs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

async function ibeUpdateDailyLog(uid, logId, data) {
  return db.collection("daily_logs").doc(uid).collection("items").doc(logId).update(data);
}

async function ibeDeleteDailyLog(uid, logId) {
  return db.collection("daily_logs").doc(uid).collection("items").doc(logId).delete();
}

// ── Ordres de Changement (Change Events) ─────────────────────

async function ibeAddChangeEvent(uid, data) {
  data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  data.status = data.status || "pending";
  data.date = new Date().toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
  });
  return db.collection("change_events").doc(uid).collection("items").add(data);
}

async function ibeGetChangeEvents(uid) {
  const snap = await db.collection("change_events").doc(uid).collection("items")
    .orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function ibeGetAllChangeEvents() {
  const usersSnap = await db.collection("users").get();
  const allCEs = [];
  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const userName = userDoc.data().nom || uid;
    const snap = await db.collection("change_events").doc(uid).collection("items")
      .orderBy("createdAt", "desc").get();
    snap.docs.forEach((d) => allCEs.push({ id: d.id, clientUid: uid, clientName: userName, ...d.data() }));
  }
  return allCEs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

async function ibeUpdateChangeEvent(uid, ceId, data) {
  return db.collection("change_events").doc(uid).collection("items").doc(ceId).update(data);
}

async function ibeDeleteChangeEvent(uid, ceId) {
  return db.collection("change_events").doc(uid).collection("items").doc(ceId).delete();
}
