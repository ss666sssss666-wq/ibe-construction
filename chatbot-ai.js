// ==========================================
// CHATBOT INTELLIGENT - IBE Construction
// Assistant Virtuel avec Base de Connaissances
// ==========================================

class IBEChatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.isTyping = false;
    this.knowledgeBase = this.buildKnowledgeBase();
    this.init();
  }

  // ==========================================
  // NORMALISATION & MATCHING INTELLIGENT
  // ==========================================

  /**
   * Normalise le texte : minuscules, supprime accents, ponctuation, espaces multiples
   * Cela permet de matcher même avec des fautes de frappe courantes
   */
  normalize(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // supprime accents
      .replace(/[^a-z0-9\s]/g, " ")   // supprime ponctuation
      .replace(/\s+/g, " ")           // espaces multiples -> un seul
      .trim();
  }

  /**
   * Distance de Levenshtein simplifiée entre deux mots
   * Retourne le nombre minimum d'éditions pour transformer a en b
   */
  levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // suppression
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  /**
   * Vérifie si un mot du message est similaire à un mot-clé (tolérance aux fautes)
   * Seuil : 2 caractères d'écart max pour les mots de 5+ lettres, 1 pour les courts
   */
  fuzzyMatch(word, keyword) {
    if (keyword.length <= 3) return word === keyword;
    const threshold = keyword.length <= 5 ? 1 : 2;
    return this.levenshtein(word, keyword) <= threshold;
  }

  /**
   * Vérifie si le texte contient un mot-clé, même avec des fautes
   */
  containsFuzzy(normalizedText, keyword) {
    const normalizedKeyword = this.normalize(keyword);

    // D'abord vérifier l'inclusion exacte (plus rapide)
    if (normalizedText.includes(normalizedKeyword)) return true;

    // Sinon vérifier mot par mot avec tolérance
    const words = normalizedText.split(" ");
    const keywordWords = normalizedKeyword.split(" ");

    // Pour les mots-clés multi-mots, vérifier chaque mot
    if (keywordWords.length === 1) {
      return words.some((w) => this.fuzzyMatch(w, normalizedKeyword));
    }

    // Pour les expressions, vérifier si tous les mots-clés sont présents (fuzzy)
    return keywordWords.every((kw) =>
      words.some((w) => this.fuzzyMatch(w, kw))
    );
  }

  // ==========================================
  // BASE DE CONNAISSANCES COMPLÈTE
  // ==========================================

  buildKnowledgeBase() {
    return [
      // ==========================================
      // SALUTATIONS & POLITESSE
      // ==========================================
      {
        id: "greeting",
        keywords: [
          "bonjour", "bonsoir", "salut", "hello", "hi", "hey",
          "salam", "marhaba", "coucou", "bjr", "bsr", "yo"
        ],
        responses: [
          "Bonjour ! 👋 Bienvenue chez **IBE Construction**.\n\nComment puis-je vous aider aujourd'hui ?",
          "Bonjour ! 👋 Ravi de vous accueillir sur le site d'**IBE Construction**.\n\nQue puis-je faire pour vous ?",
          "Bienvenue ! 👋 Je suis l'assistant d'**IBE Construction**.\n\nN'hésitez pas à me poser vos questions !"
        ],
      },
      {
        id: "goodbye",
        keywords: [
          "au revoir", "bye", "a bientot", "bonne journee",
          "bonne soiree", "merci au revoir", "a plus", "ciao"
        ],
        responses: [
          "Au revoir ! 👋 N'hésitez pas à revenir si vous avez d'autres questions.\n\nBonne journée ! 🏗️",
          "Merci de votre visite ! À bientôt chez **IBE Construction** 👋\n\nBonne continuation !",
        ],
      },
      {
        id: "thanks",
        keywords: [
          "merci", "thanks", "thank you", "choukran", "shukran",
          "cool", "super", "parfait", "genial", "excellent", "top", "ok merci"
        ],
        responses: [
          "Avec plaisir ! 😊 N'hésitez pas si vous avez d'autres questions.",
          "Je vous en prie ! 😊 Je suis là pour vous aider.\n\nAutre chose à savoir ?",
        ],
      },
      {
        id: "how_are_you",
        keywords: [
          "comment allez vous", "ca va", "comment vas tu",
          "comment tu vas", "quoi de neuf", "la forme"
        ],
        responses: [
          "Tout va bien, merci ! 😊 Je suis prêt à répondre à vos questions sur **IBE Construction**.\n\nQue souhaitez-vous savoir ?",
        ],
      },

      // ==========================================
      // SERVICES GÉNÉRAUX
      // ==========================================
      {
        id: "services_general",
        keywords: [
          "service", "services", "activite", "activites", "faites",
          "proposez", "offre", "offres", "prestation", "prestations",
          "expertise", "competence", "competences", "domaine",
          "que faites vous", "quoi vous faites", "vous faites quoi",
          "c est quoi ibe", "c quoi ibe", "presentez vous",
          "qui etes vous", "presentation"
        ],
        responses: [
          "IBE Construction propose **3 pôles d'expertise** complémentaires :\n\n🏗️ **Bureau d'Études Structure**\n→ Conception BIM/Revit, calculs béton armé & charpente métallique\n\n🏢 **Réalisation & Gros Œuvre**\n→ Gestion de chantier, coordination OPC, du terrassement aux finitions\n\n❄️ **Génie Climatique & Fluides**\n→ Systèmes CVC/HVAC, plomberie, modélisation Plant 3D\n\nQuel pôle vous intéresse ?",
        ],
      },

      // ==========================================
      // BUREAU D'ÉTUDES STRUCTURE (Détail)
      // ==========================================
      {
        id: "service_structure",
        keywords: [
          "bureau etude", "bureau etudes", "structure", "structurel",
          "conception", "beton", "beton arme", "charpente",
          "charpente metallique", "metallique", "acier",
          "calcul", "calculs", "dimensionnement",
          "ingenierie", "ingenieur structure"
        ],
        responses: [
          "🏗️ **Bureau d'Études Structure** — Notre cœur de métier :\n\n• **Conception structurelle** en BIM natif (Revit Structure)\n• **Calculs avancés** avec Robot Structural Analysis\n• **Béton armé** : fondations, poteaux, poutres, dalles\n• **Charpente métallique** : hangars, mezzanines, plateformes\n• **Plans d'exécution** et notes de calcul conformes\n• **Modélisation Advance Steel** pour structures acier\n\nNous travaillons sur des projets de toutes tailles. Souhaitez-vous un devis ?",
        ],
      },

      // ==========================================
      // RÉALISATION & GROS ŒUVRE (Détail)
      // ==========================================
      {
        id: "service_realisation",
        keywords: [
          "realisation", "gros oeuvre", "chantier", "construction",
          "construire", "batir", "batiment", "travaux",
          "terrassement", "fondation", "fondations", "maconnerie",
          "execution", "opc", "coordination", "maitre oeuvre",
          "maitrise oeuvre", "suivi chantier", "gestion chantier"
        ],
        responses: [
          "🏢 **Réalisation & Gros Œuvre** — Du plan au bâtiment :\n\n• **Terrassement** et préparation du terrain\n• **Fondations** superficielles et profondes\n• **Gros œuvre** : structure béton armé complète\n• **Coordination OPC** rigoureuse\n• **Contrôle qualité** à chaque étape\n• **Suivi de chantier** avec rapports réguliers\n\nVous avez un projet de construction en tête ? Contactez-nous pour en discuter !",
        ],
      },

      // ==========================================
      // GÉNIE CLIMATIQUE & FLUIDES (Détail)
      // ==========================================
      {
        id: "service_climatique",
        keywords: [
          "climatique", "climatisation", "chauffage", "ventilation",
          "cvc", "hvac", "fluide", "fluides", "plomberie",
          "thermique", "thermiques", "tuyauterie", "industriel",
          "reseau", "reseaux", "plant 3d", "revit mep",
          "mep", "froid", "chaud", "temperature", "isolation"
        ],
        responses: [
          "❄️ **Génie Climatique & Fluides** — Confort et performance :\n\n• **Systèmes CVC/HVAC** : climatisation, chauffage, ventilation\n• **Plomberie** résidentielle et industrielle\n• **Réseaux industriels** : tuyauterie, fluides process\n• **Modélisation 3D** avec Plant 3D et Revit MEP\n• **Calculs thermiques** et bilans énergétiques\n• **Isolation** et optimisation énergétique\n\nBesoin d'une étude pour votre bâtiment ?",
        ],
      },

      // ==========================================
      // BIM & TECHNOLOGIE
      // ==========================================
      {
        id: "bim",
        keywords: [
          "bim", "revit", "robot", "advance steel", "autocad",
          "maquette numerique", "maquette 3d", "modelisation",
          "logiciel", "logiciels", "technologie", "tech",
          "numerique", "digital", "3d", "plan", "plans"
        ],
        responses: [
          "💻 **Notre approche 100% BIM** nous distingue :\n\n• **Revit Structure** — Modélisation architecturale et structurelle\n• **Robot Structural Analysis** — Calculs et dimensionnement\n• **Advance Steel** — Détails charpente métallique\n• **Revit MEP** — Modélisation fluides\n• **Plant 3D** — Réseaux industriels\n• **AutoCAD** — Plans 2D et détails\n\n✅ Le BIM réduit de **90% les aléas** de chantier grâce à la détection des conflits en amont.\n\nVous souhaitez en savoir plus sur notre processus BIM ?",
        ],
      },

      // ==========================================
      // AVANTAGES IBE
      // ==========================================
      {
        id: "advantages",
        keywords: [
          "avantage", "avantages", "pourquoi vous", "pourquoi ibe",
          "difference", "concurrent", "concurrence", "mieux",
          "meilleur", "unique", "fort", "force", "forces",
          "point fort", "atout", "atouts", "valeur ajoutee"
        ],
        responses: [
          "🏆 **Pourquoi choisir IBE Construction ?**\n\n⚡ **Réactivité** : Réponse sous 24-48h (vs 1-2 semaines ailleurs)\n👥 **1 équipe intégrée** : Pas besoin de 3+ entreprises différentes\n💻 **100% BIM natif** : Moins d'erreurs, moins de surprises\n🎯 **Contact direct** avec les ingénieurs, pas de commercial intermédiaire\n💰 **1 seule marge** au lieu de 3 marges cumulées\n📉 **-90% d'aléas** grâce à la modélisation 3D\n\nRésultat : **Moins cher, plus rapide, plus fiable.**",
        ],
      },

      // ==========================================
      // DEVIS & PRIX
      // ==========================================
      {
        id: "quote",
        keywords: [
          "devis", "prix", "cout", "tarif", "tarifs", "combien",
          "estimation", "estimer", "budget", "facturation",
          "facture", "paiement", "payer", "cher", "gratuit",
          "calculer", "calculateur", "calculatrice",
          "combien ca coute", "quel prix", "c est combien"
        ],
        responses: [
          "💰 **Estimation & Devis** :\n\nNos tarifs dépendent de plusieurs facteurs :\n• Type de projet (résidentiel / industriel / médical)\n• Surface et complexité\n• Services demandés\n\n📊 **Utilisez notre Calculateur de Coûts** directement sur le site pour une estimation instantanée !\n\nPour un **devis détaillé et gratuit**, contactez-nous :\n📞 **+212 663-176838**\n📧 **ibe@ibe-construction.com**",
        ],
      },

      // ==========================================
      // CONTACT
      // ==========================================
      {
        id: "contact",
        keywords: [
          "contact", "contacter", "joindre", "appeler",
          "telephone", "tel", "numero", "mail", "email",
          "ecrire", "envoyer message", "comment contacter",
          "coordonnees", "coordonnee"
        ],
        responses: [
          "📇 **Nos coordonnées** :\n\n📞 **Téléphone** : +212 663-176838\n📧 **Email** : ibe@ibe-construction.com\n📍 **Adresse** : 69 boulevard Hassan II, Mohammedia 28800\n📸 **Instagram** : @ibe.construction\n\n🕐 **Horaires** : Lundi — Vendredi, 9h à 18h\n\nVous pouvez aussi utiliser le **formulaire de contact** en bas de cette page !",
        ],
      },

      // ==========================================
      // LOCALISATION & ADRESSE
      // ==========================================
      {
        id: "location",
        keywords: [
          "adresse", "localisation", "ou etes vous", "ou se trouve",
          "emplacement", "lieu", "ville", "mohammedia", "morocco",
          "maroc", "comment venir", "itineraire", "gps",
          "ou vous etes", "situee", "situe"
        ],
        responses: [
          "📍 **Notre localisation** :\n\n**IBE Construction**\n69, Boulevard Hassan II\nMohammedia 28800, Maroc\n\n🚗 Facilement accessible depuis Casablanca (~25 min) et Rabat (~45 min).\n\nN'hésitez pas à nous appeler au **+212 663-176838** pour plus de détails !",
        ],
      },

      // ==========================================
      // HORAIRES
      // ==========================================
      {
        id: "hours",
        keywords: [
          "horaire", "horaires", "heure", "heures",
          "ouvert", "ouverture", "ferme", "fermeture",
          "disponible", "disponibilite", "quand",
          "samedi", "dimanche", "week end", "weekend"
        ],
        responses: [
          "🕐 **Nos horaires d'ouverture** :\n\n📅 **Lundi — Vendredi** : 9h00 à 18h00\n📅 **Samedi — Dimanche** : Fermé\n\nVous pouvez toujours nous envoyer un email à **ibe@ibe-construction.com**, nous répondons sous 24-48h ! 📧",
        ],
      },

      // ==========================================
      // PROJETS RÉALISÉS
      // ==========================================
      {
        id: "projects",
        keywords: [
          "projet", "projets", "reference", "references",
          "realisation", "realisations", "portfolio",
          "exemples", "exemple", "precedent", "avant",
          "travaux realises", "deja fait", "experience"
        ],
        responses: [
          "📁 **Nos réalisations** — Des projets variés et exigeants :\n\n🏭 **Industriel**\n→ Plateformes logistiques 15 000+ m², hangars métalliques, usines\n\n🏠 **Résidentiel**\n→ Immeubles, résidences, villas haut standing, structures béton armé\n\n🏥 **Médical**\n→ Hôpitaux, cliniques, infrastructures de santé\n\n🏢 **Tertiaire**\n→ Bureaux, espaces commerciaux\n\nVous pouvez explorer nos projets détaillés dans la section **'Projets'** du site !",
        ],
      },

      // ==========================================
      // TYPES DE PROJETS
      // ==========================================
      {
        id: "residential",
        keywords: [
          "residentiel", "maison", "villa", "appartement",
          "immeuble", "habitation", "logement", "habitat",
          "r+2", "r+3", "r+4", "r+5", "etage", "etages"
        ],
        responses: [
          "🏠 **Projets Résidentiels** — Notre expertise :\n\n• **Villas** et maisons individuelles\n• **Immeubles** résidentiels (R+2 à R+10+)\n• **Résidences** de standing\n• Études structure béton armé\n• Conception complète intérieure/extérieure\n\nVous avez un projet résidentiel ? Parlez-nous de votre vision ! 📞 **+212 663-176838**",
        ],
      },
      {
        id: "industrial",
        keywords: [
          "industriel", "usine", "hangar", "entrepot", "plateforme",
          "logistique", "atelier", "depot", "stockage", "magasin",
          "batiment industriel"
        ],
        responses: [
          "🏭 **Projets Industriels** — Notre spécialité :\n\n• **Hangars métalliques** grande portée\n• **Plateformes logistiques** 15 000+ m²\n• **Usines** et ateliers de production\n• **Entrepôts** et centres de stockage\n• Charpente métallique et fondations spéciales\n\nVous avez un projet industriel ? Contactez-nous au **+212 663-176838** !",
        ],
      },
      {
        id: "medical",
        keywords: [
          "medical", "hopital", "clinique", "sante", "hospitalier",
          "cabinet", "laboratoire", "labo", "pharmacie"
        ],
        responses: [
          "🏥 **Projets Médicaux** — Un savoir-faire spécifique :\n\n• **Hôpitaux** et centres hospitaliers\n• **Cliniques** et polycliniques\n• **Cabinets médicaux** et laboratoires\n• Conformité aux normes sanitaires strictes\n• Systèmes CVC/HVAC adaptés au médical\n\nLe secteur médical requiert une expertise pointue que nous maîtrisons. Contactez-nous !",
        ],
      },

      // ==========================================
      // PROCESSUS & DÉROULEMENT
      // ==========================================
      {
        id: "process",
        keywords: [
          "processus", "comment ca marche", "deroulement",
          "etape", "etapes", "procedure", "demarche",
          "comment faire", "commencer", "debuter",
          "lancer un projet", "demarrer"
        ],
        responses: [
          "📋 **Comment travailler avec IBE ?** — C'est simple :\n\n**1️⃣ Contact initial**\n→ Appelez-nous ou envoyez votre besoin par email\n\n**2️⃣ Étude de faisabilité**\n→ Analyse de votre projet sous 24-48h\n\n**3️⃣ Proposition technique & financière**\n→ Devis détaillé avec planning prévisionnel\n\n**4️⃣ Conception BIM**\n→ Modélisation 3D et plans d'exécution\n\n**5️⃣ Réalisation**\n→ Suivi de chantier rigoureux jusqu'à la livraison\n\nPrêt à démarrer ? 📞 **+212 663-176838**",
        ],
      },

      // ==========================================
      // DÉLAIS
      // ==========================================
      {
        id: "delays",
        keywords: [
          "delai", "delais", "duree", "temps", "combien de temps",
          "long", "rapide", "vite", "urgent", "urgence",
          "livraison", "livrer", "quand"
        ],
        responses: [
          "⏱️ **Nos délais** :\n\n• **Réponse initiale** : 24 à 48h\n• **Étude & devis** : 3 à 7 jours selon complexité\n• **Conception BIM** : 2 à 6 semaines selon le projet\n• **Réalisation** : Variable selon la taille du projet\n\n⚡ Notre réactivité est l'un de nos points forts !\n\nVous avez un projet urgent ? Appelez-nous directement au **+212 663-176838**.",
        ],
      },

      // ==========================================
      // GARANTIE & QUALITÉ
      // ==========================================
      {
        id: "quality",
        keywords: [
          "garantie", "qualite", "norme", "normes", "certification",
          "securite", "assurance", "fiable", "fiabilite",
          "conforme", "conformite", "controle", "suivi"
        ],
        responses: [
          "✅ **Qualité & Garanties** :\n\n• **Conformité** aux normes marocaines et internationales\n• **Contrôle qualité** rigoureux à chaque étape\n• **Modélisation BIM** qui élimine 90% des erreurs\n• **Rapports de chantier** réguliers et transparents\n• **Équipe qualifiée** d'ingénieurs expérimentés\n\nLa qualité est notre priorité absolue. Des questions spécifiques ?",
        ],
      },

      // ==========================================
      // RECRUTEMENT & EMPLOI
      // ==========================================
      {
        id: "jobs",
        keywords: [
          "recrutement", "emploi", "travail", "travailler",
          "embauche", "stage", "stagiaire", "candidature",
          "cv", "poste", "job", "carriere", "rejoindre",
          "postuler", "offre emploi", "recrute", "recrutez"
        ],
        responses: [
          "💼 **Carrières chez IBE Construction** :\n\nNous sommes toujours à la recherche de talents motivés !\n\n📧 Envoyez votre CV et lettre de motivation à :\n**ibe@ibe-construction.com**\n\nMentionnez le poste souhaité ou vos compétences principales.\n\nNous revenons vers vous rapidement !",
        ],
      },

      // ==========================================
      // WHATSAPP
      // ==========================================
      {
        id: "whatsapp",
        keywords: [
          "whatsapp", "watsapp", "whatssap", "watssap", "wa",
          "message whatsapp", "numero whatsapp"
        ],
        responses: [
          "📱 **WhatsApp** :\n\nVous pouvez nous contacter directement sur WhatsApp au :\n📞 **+212 663-176838**\n\nOu utilisez le **bouton WhatsApp** en bas à droite de cette page pour un accès rapide ! 💬",
        ],
      },

      // ==========================================
      // INSTAGRAM / RÉSEAUX SOCIAUX
      // ==========================================
      {
        id: "social_media",
        keywords: [
          "instagram", "insta", "reseaux sociaux", "reseau social",
          "facebook", "linkedin", "page", "suivre",
          "photo", "photos", "galerie"
        ],
        responses: [
          "📸 **Suivez-nous sur les réseaux** :\n\n📸 **Instagram** : @ibe.construction\n→ Photos de chantier, projets en cours, coulisses de l'équipe\n\nAbonnez-vous pour suivre nos dernières réalisations en temps réel ! 🏗️",
        ],
      },

      // ==========================================
      // ZONE D'INTERVENTION
      // ==========================================
      {
        id: "coverage",
        keywords: [
          "zone", "region", "intervenez", "intervention",
          "casablanca", "rabat", "casa", "tanger", "fes", "marrakech",
          "agadir", "oujda", "kenitra", "meknes",
          "tout le maroc", "partout", "ou intervenez vous"
        ],
        responses: [
          "🗺️ **Notre zone d'intervention** :\n\nBasés à **Mohammedia**, nous intervenons sur :\n\n• 🏙️ **Grand Casablanca — Mohammedia**\n• 🏛️ **Rabat — Kénitra**\n• Et sur **tout le territoire marocain** pour les projets d'envergure\n\nOù se situe votre projet ? Parlez-nous en ! 📞 **+212 663-176838**",
        ],
      },

      // ==========================================
      // RENDEZ-VOUS & VISITE
      // ==========================================
      {
        id: "appointment",
        keywords: [
          "rendez vous", "rdv", "rencontrer", "visite",
          "venir", "passer", "voir", "reunion", "meeting",
          "prendre rdv", "disponible quand"
        ],
        responses: [
          "📅 **Prendre rendez-vous** :\n\nNous serions ravis de vous rencontrer !\n\n📞 Appelez le **+212 663-176838** pour fixer un créneau\n📧 Ou écrivez à **ibe@ibe-construction.com**\n\n📍 Nos bureaux : 69 boulevard Hassan II, Mohammedia\n🕐 Lundi — Vendredi, 9h — 18h\n\nÀ bientôt !",
        ],
      },

      // ==========================================
      // AIDE / CHATBOT
      // ==========================================
      {
        id: "help",
        keywords: [
          "aide", "aider", "help", "info", "information",
          "informations", "renseignement", "renseignements",
          "question", "questions", "savoir", "comprendre",
          "expliquer", "explication"
        ],
        responses: [
          "ℹ️ **Je peux vous renseigner sur** :\n\n🏗️ **Services** — Nos 3 pôles d'expertise\n💰 **Devis** — Estimation et tarification\n📁 **Projets** — Nos réalisations\n📇 **Contact** — Coordonnées et horaires\n💻 **BIM** — Notre technologie\n🏆 **Avantages** — Pourquoi choisir IBE\n📋 **Processus** — Comment travailler avec nous\n\nPosez-moi votre question ! 😊",
        ],
      },

      // ==========================================
      // RÉNOVATION
      // ==========================================
      {
        id: "renovation",
        keywords: [
          "renovation", "renover", "rehabiliter", "rehabilitation",
          "transformer", "transformation", "agrandir", "agrandissement",
          "extension", "amenagement", "amenager", "retaper"
        ],
        responses: [
          "🔨 **Rénovation & Réhabilitation** :\n\nOui, nous intervenons aussi en rénovation !\n\n• Extension et surélévation de bâtiments existants\n• Renforcement structurel\n• Réhabilitation complète\n• Mise aux normes\n\nChaque projet de rénovation nécessite une étude spécifique. Contactez-nous pour en discuter !\n📞 **+212 663-176838**",
        ],
      },

      // ==========================================
      // PISCINE & AMÉNAGEMENT
      // ==========================================
      {
        id: "pool",
        keywords: [
          "piscine", "jardin", "amenagement exterieur",
          "terrasse", "cloture", "mur", "portail"
        ],
        responses: [
          "🏊 **Aménagements extérieurs** :\n\nNous pouvons intégrer dans votre projet :\n• Piscines (structure béton)\n• Terrasses et espaces extérieurs\n• Murs de soutènement et clôtures\n\nCes éléments sont généralement intégrés à un projet global. Parlez-nous de votre vision !\n📞 **+212 663-176838**",
        ],
      },

      // ==========================================
      // TERRAIN & PERMIS
      // ==========================================
      {
        id: "permits",
        keywords: [
          "permis", "permis de construire", "autorisation",
          "terrain", "foncier", "plan", "architecte",
          "urbanisme", "commune", "legal", "papier", "papiers",
          "dossier", "administratif"
        ],
        responses: [
          "📄 **Permis & Autorisations** :\n\nNous pouvons vous accompagner dans la partie technique du dossier :\n• **Plans techniques** et notes de calcul\n• **Études de structure** requises pour le permis\n• Coordination avec votre **architecte**\n\n⚠️ Le permis de construire est délivré par la commune. Nous fournissons les documents techniques nécessaires.\n\nBesoin d'aide ? Appelez le **+212 663-176838**.",
        ],
      },
    ];
  }

  // ==========================================
  // MOTEUR DE RECHERCHE DE RÉPONSE
  // ==========================================

  getLocalResponse(message) {
    const normalizedMessage = this.normalize(message);

    // Si le message est très court (1-2 caractères), demander plus de détails
    if (normalizedMessage.length < 3) {
      return "Pourriez-vous préciser votre question ? 😊\n\nJe peux vous renseigner sur nos **services**, **devis**, **projets**, **contact** et bien plus !";
    }

    let bestMatch = null;
    let bestScore = 0;

    for (const intent of this.knowledgeBase) {
      let score = 0;

      for (const keyword of intent.keywords) {
        if (this.containsFuzzy(normalizedMessage, keyword)) {
          // Score basé sur la longueur du mot-clé (des mots-clés plus longs = plus spécifiques = meilleur score)
          const keywordScore = keyword.length;
          score += keywordScore;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = intent;
      }
    }

    // Si on a trouvé un match avec un score minimum
    if (bestMatch && bestScore >= 3) {
      const responses = bestMatch.responses;
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Réponse par défaut si rien ne matche
    return "Merci pour votre message ! 🏗️\n\nJe n'ai pas trouvé de réponse exacte, mais je peux vous aider sur :\n• 🏗️ Nos **services**\n• 💰 **Devis** et estimation\n• 📁 Nos **projets** réalisés\n• 📇 **Contact** et coordonnées\n\nOu contactez-nous directement :\n📞 **+212 663-176838**\n📧 **ibe@ibe-construction.com**";
  }

  // ==========================================
  // UI & INTERACTION
  // ==========================================

  init() {
    this.createChatWidget();
    this.attachEventListeners();
  }

  createChatWidget() {
    const chatHTML = `
            <div id="ibe-chatbot" class="ibe-chatbot">
                <div class="chatbot-button" id="chatbot-toggle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        <line x1="9" y1="10" x2="15" y2="10"></line>
                        <line x1="9" y1="14" x2="13" y2="14"></line>
                    </svg>
                    <span class="chatbot-badge">1</span>
                </div>

                <div class="chatbot-window" id="chatbot-window">
                    <div class="chatbot-header">
                        <div class="chatbot-header-content">
                            <div class="chatbot-avatar">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                                </svg>
                            </div>
                            <div class="chatbot-header-text">
                                <h3>Assistant IBE</h3>
                                <span class="chatbot-status">🟢 En ligne</span>
                            </div>
                        </div>
                        <button class="chatbot-close" id="chatbot-close">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div class="chatbot-messages" id="chatbot-messages">
                        <!-- Messages will be inserted here -->
                    </div>

                    <div class="chatbot-quick-replies" id="quick-replies">
                        <button class="quick-reply" data-message="Quels sont vos services ?">🏗️ Services</button>
                        <button class="quick-reply" data-message="Je veux un devis">💰 Devis</button>
                        <button class="quick-reply" data-message="Comment vous contacter ?">📞 Contact</button>
                        <button class="quick-reply" data-message="Vos projets réalisés">📁 Projets</button>
                    </div>

                    <div class="chatbot-input-area">
                        <input 
                            type="text" 
                            id="chatbot-input" 
                            placeholder="Posez votre question..."
                            autocomplete="off"
                        />
                        <button id="chatbot-send">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", chatHTML);
  }

  attachEventListeners() {
    const toggleBtn = document.getElementById("chatbot-toggle");
    const closeBtn = document.getElementById("chatbot-close");
    const sendBtn = document.getElementById("chatbot-send");
    const input = document.getElementById("chatbot-input");
    const quickReplies = document.querySelectorAll(".quick-reply");

    toggleBtn.addEventListener("click", () => this.toggleChat());
    closeBtn.addEventListener("click", () => this.toggleChat());
    sendBtn.addEventListener("click", () => this.sendMessage());
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !this.isTyping) this.sendMessage();
    });

    quickReplies.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const message = e.target.getAttribute("data-message");
        this.sendMessage(message);
      });
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const window = document.getElementById("chatbot-window");
    const button = document.getElementById("chatbot-toggle");

    if (this.isOpen) {
      window.classList.add("active");
      button.classList.add("active");

      // Send greeting if first time
      if (this.messages.length === 0) {
        this.addBotMessage(
          "Bonjour ! 👋 Je suis l'assistant d'**IBE Construction**.\n\nComment puis-je vous aider aujourd'hui ?",
        );
      }
    } else {
      window.classList.remove("active");
      button.classList.remove("active");
    }
  }

  async sendMessage(text = null) {
    const input = document.getElementById("chatbot-input");
    const message = text || input.value.trim();

    if (!message || this.isTyping) return;

    this.addUserMessage(message);
    input.value = "";

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Simulate a short "thinking" delay
      await new Promise((resolve) =>
        setTimeout(resolve, 500 + Math.random() * 500),
      );

      const response = this.getLocalResponse(message);
      this.hideTypingIndicator();
      this.addBotMessage(response);
    } catch (error) {
      this.hideTypingIndicator();
      console.error("Chatbot Error:", error);
      this.addBotMessage(
        "Désolé, une erreur s'est produite. 😔\n\nContactez-nous directement :\n📞 +212 663-176838\n📧 ibe@ibe-construction.com",
      );
    }
  }

  showTypingIndicator() {
    this.isTyping = true;
    const messagesContainer = document.getElementById("chatbot-messages");
    const typingDiv = document.createElement("div");
    typingDiv.className =
      "chatbot-message bot-message typing-indicator-wrapper";
    typingDiv.id = "typing-indicator";
    typingDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTypingIndicator() {
    this.isTyping = false;
    const indicator = document.getElementById("typing-indicator");
    if (indicator) indicator.remove();
  }

  addUserMessage(text) {
    this.messages.push({ type: "user", text, timestamp: new Date() });
    this.renderMessage("user", text);
  }

  addBotMessage(text) {
    this.messages.push({ type: "bot", text, timestamp: new Date() });
    this.renderMessage("bot", text);
  }

  renderMessage(type, text) {
    const messagesContainer = document.getElementById("chatbot-messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `chatbot-message ${type}-message`;

    // Convert line breaks to HTML
    const formattedText = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");

    messageDiv.innerHTML = `
            <div class="message-content">${formattedText}</div>
            <div class="message-time">${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
        `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// Initialize chatbot when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new IBEChatbot();
});
