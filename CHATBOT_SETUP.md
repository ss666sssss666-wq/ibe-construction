# 🤖 Configuration du Chatbot IA avec Google Gemini API

## ✅ Pourquoi Gemini API ?

- **100% GRATUIT** pour votre usage
- **1500 requêtes/jour** (largement suffisant)
- **Très intelligent** (même technologie que Google Bard)
- **Multilingue** : Français, Anglais, Arabe
- **Pas de carte bancaire requise**

---

## 🚀 Configuration en 3 Étapes (5 minutes)

### Étape 1 : Obtenir votre clé API gratuite

1. **Allez sur** : https://makersuite.google.com/app/apikey
2. **Connectez-vous** avec votre compte Google
3. Cliquez sur **"Create API Key"**
4. Sélectionnez **"Create API key in new project"**
5. **Copiez** la clé qui apparaît (format : `AIzaSy...`)

⚠️ **IMPORTANT** : Gardez cette clé secrète et ne la partagez jamais publiquement !

---

### Étape 2 : Configurer le chatbot

1. Ouvrez le fichier **`chatbot-ai.js`** dans votre éditeur de code
2. Cherchez la ligne **12** :
   ```javascript
   this.apiKey = 'YOUR_GEMINI_API_KEY_HERE';
   ```
3. Remplacez `YOUR_GEMINI_API_KEY_HERE` par votre vraie clé API :
   ```javascript
   this.apiKey = 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
   ```
4. **Sauvegardez** le fichier

---

### Étape 3 : Tester le chatbot

1. Ouvrez votre site (local ou en ligne)
2. Cliquez sur le bouton **"IA"** en bas à gauche
3. Posez une question comme :
   - "Quels sont vos services ?"
   - "Je veux un devis pour une villa"
   - "Où êtes-vous situés ?"

✅ **Le chatbot devrait répondre intelligemment !**

---

## 🎯 Fonctionnalités du Chatbot IA

### Ce qu'il sait faire :

✅ **Répondre aux questions** sur vos services (BIM, structure, fluides)
✅ **Expliquer vos avantages** vs concurrents
✅ **Donner vos coordonnées** (téléphone, email, adresse)
✅ **Parler de vos projets** (industriel, résidentiel, médical)
✅ **Orienter vers le calculateur** pour les devis
✅ **Répondre en FR/EN/AR** selon la langue du site

### Ce qu'il NE fait PAS :

❌ Donner des prix précis (il redirige vers le calculateur)
❌ Prendre des rendez-vous (il donne vos coordonnées)
❌ Inventer des informations (il reste factuel)

---

## 📊 Limites Gratuites

| Métrique | Limite Gratuite | Votre Usage Estimé |
|----------|-----------------|-------------------|
| Requêtes/jour | 1500 | ~300 (20%) |
| Requêtes/minute | 15 | ~2-3 |
| Tokens/jour | 1M | ~50K (5%) |

**Conclusion** : Vous êtes **largement en dessous** des limites ! 🎉

---

## 🔒 Sécurité de la Clé API

### ⚠️ IMPORTANT : Protection de votre clé

Votre clé API est actuellement **visible dans le code JavaScript**. Pour un site en production, voici les bonnes pratiques :

#### Option 1 : Variables d'environnement (Recommandé)

Si vous utilisez Vercel/Netlify :

1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez :
   - Name: `GEMINI_API_KEY`
   - Value: `AIzaSy...`
3. Créez un fichier `api/chat.js` (serverless function)
4. Appelez cette fonction depuis le chatbot

#### Option 2 : Restrictions de clé API

1. Allez sur https://console.cloud.google.com/apis/credentials
2. Cliquez sur votre clé API
3. Dans **"Application restrictions"** :
   - Sélectionnez **"HTTP referrers"**
   - Ajoutez : `https://www.ibe-construction.com/*`
4. Dans **"API restrictions"** :
   - Sélectionnez **"Restrict key"**
   - Choisissez uniquement **"Generative Language API"**

Cela empêche l'utilisation de votre clé sur d'autres sites.

---

## 🎨 Personnalisation du Chatbot

### Modifier le message de bienvenue

Dans `chatbot-ai.js`, ligne ~235 :
```javascript
this.addBotMessage("Bonjour ! 👋 Je suis l'assistant IA d'IBE Construction.\n\nComment puis-je vous aider aujourd'hui ?");
```

### Modifier les boutons de réponse rapide

Dans `chatbot-ai.js`, ligne ~95 :
```html
<button class="quick-reply" data-message="Quels sont vos services ?">🏗️ Services</button>
<button class="quick-reply" data-message="Je veux un devis">💰 Devis</button>
```

### Changer les couleurs

Dans `chatbot.css` :
- Bronze : `#cc9461`
- Bleu : `#1a2f4b`

---

## 🐛 Dépannage

### Le chatbot ne répond pas ?

1. **Vérifiez la console** (F12 dans le navigateur)
2. **Erreur 400** : Clé API invalide
   - Vérifiez que vous avez bien copié la clé complète
   - Pas d'espaces avant/après
3. **Erreur 403** : API non activée
   - Allez sur https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
   - Cliquez sur **"Enable"**
4. **Erreur 429** : Quota dépassé
   - Attendez 1 minute (limite de 15 req/min)

### Le chatbot affiche "API non configurée" ?

Vous n'avez pas encore remplacé `YOUR_GEMINI_API_KEY_HERE` par votre vraie clé.

### Le design est cassé sur mobile ?

Videz le cache de votre navigateur (Ctrl+Shift+R)

---

## 📈 Analytics & Monitoring

### Suivre l'utilisation de votre API

1. Allez sur https://console.cloud.google.com/apis/dashboard
2. Sélectionnez **"Generative Language API"**
3. Consultez :
   - Nombre de requêtes
   - Taux d'erreur
   - Latence moyenne

### Améliorer les réponses

Modifiez le **System Prompt** dans `chatbot-ai.js` (ligne ~25) pour :
- Ajouter plus d'informations sur vos services
- Changer le ton (plus formel/informel)
- Ajouter des cas d'usage spécifiques

---

## 🚀 Déploiement

### En local (test)
```bash
python -m http.server 8000
# Ouvrez http://localhost:8000
```

### Sur Vercel (production)
```bash
vercel --prod
```

Le chatbot fonctionnera automatiquement sur votre site en ligne !

---

## 💡 Conseils d'Optimisation

1. **Réponses rapides** : Le chatbot répond en ~1-2 secondes
2. **Coût** : 100% gratuit jusqu'à 1500 req/jour
3. **Performance** : Pas d'impact sur la vitesse du site
4. **SEO** : Le chatbot n'affecte pas votre référencement

---

## 📞 Support

Si vous avez des problèmes :

1. **Documentation Gemini** : https://ai.google.dev/docs
2. **Console Google Cloud** : https://console.cloud.google.com
3. **Vérifiez les logs** dans la console du navigateur (F12)

---

## ✨ Prochaines Améliorations Possibles

- [ ] Enregistrer l'historique des conversations
- [ ] Envoyer les leads par email automatiquement
- [ ] Support vocal (Speech-to-Text)
- [ ] Intégration avec votre CRM
- [ ] Analytics avancés (taux de conversion)

---

**Créé pour IBE Construction** 🏗️  
**Propulsé par Google Gemini AI** 🤖
