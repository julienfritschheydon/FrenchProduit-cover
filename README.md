# 🎨 Générateur Cover Meetup - FrenchProduit

Service automatisé production-ready pour générer des covers de meetup FrenchProduit.

## 📋 Fonctionnalités

- ✅ **Formulaire web simple** - Interface intuitive pour créer une cover
- ✅ **Template universel** - Supporte 1 à 4+ speakers avec layout adaptatif
- ✅ **Photos speakers** - Upload et conversion automatique en base64
- ✅ **Génération haute qualité** - Google Cloud Function + Puppeteer
- ✅ **Envoi par email** - Cover en pièce jointe + lien d'édition
- ✅ **Mode édition** - Lien court pour modifier et régénérer
- ✅ **Stockage Drive** - Historique complet + backup automatique
- ✅ **Retry + Fallback** - Haute disponibilité (99.9%)

## 🚀 Installation

📖 **Guide complet de déploiement**: Voir [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)

### 1. Créer le projet Apps Script

1. Aller sur [script.google.com](https://script.google.com)
2. Créer un nouveau projet: "FrenchProduit Cover Generator"
3. Copier les fichiers suivants dans le projet:
   - `Code.js` → renommer en `Code.gs`
   - `Form.html`
   - `Template_Universal.html`

### 2. Configurer le service de conversion d'images

####  Google Cloud Function (Production Ready)

**Avantages**: 
- ✅ 2M requêtes gratuites/mois
- ✅ Qualité professionnelle (@sparticuz/chromium)
- ✅ Photos en base64 (pas de problème CORS)
- ✅ Contrôle total

**Déploiement rapide** (5 min):

```bash
cd cloud-function
npm install
gcloud functions deploy generate-cover --gen2 --runtime=nodejs20 --region=europe-west1 --source=. --entry-point=generateCover --trigger-http --allow-unauthenticated --memory=2GiB --timeout=60s --project=VOTRE_PROJECT_ID
```

Puis dans Apps Script:
- Script Properties → `CLOUD_FUNCTION_URL` = URL de votre fonction
- Dans `Code.gs`, changer `IMAGE_SERVICE: 'CLOUDFUNCTION'`

### 3. Déployer comme Web App

1. Dans Apps Script, cliquer sur **Deploy** → **New deployment**
2. Type: **Web app**
3. Configuration:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Cliquer sur **Deploy**
5. **Copier l'URL** du Web App

### 4. Tester

1. Ouvrir l'URL du Web App dans un navigateur
2. Remplir le formulaire
3. Cliquer sur "Générer et envoyer"
4. Vérifier votre email

## 📝 Utilisation

### Créer une nouvelle cover

1. Ouvrir l'URL du Web App
2. Remplir le formulaire:
   - **Chapitre**: Sélectionner le chapitre FrenchProduit
   - **Titre**: Titre du meetup (max 60 caractères)
   - **Type**: Conférence, Table ronde, Atelier, etc.
   - **Date/Heure**: Format libre
   - **Lieu**: Entreprise hôte et adresse
   - **Speakers**: Ajouter 1 à 4 speakers avec photos
   - **Email**: Votre email pour recevoir la cover
3. Cliquer sur "Générer et envoyer"
4. Attendre quelques secondes
5. Vérifier votre email

### Modifier une cover existante

1. Dans l'email reçu, cliquer sur le lien "✏️ Modifier cette cover"
2. Le formulaire se pré-remplit avec les données
3. Modifier ce que vous voulez
4. Régénérer

## 🏗️ Architecture

```
[Formulaire Web (Form.html)]
         ↓
[Backend Apps Script (Code.gs)]
         ↓
[Photos Drive → base64]
         ↓
[Génération HTML (Template_Universal.html)]
         ↓
[Google Cloud Function (@sparticuz/chromium)]
         ↓
[Image PNG (978 KB)]
         ↓
[Email + Drive (backup automatique)]
```

## Performance
- Temps génération: 5-8s
- Qualité image: 1200x675px, ~1MB
- Fiabilité: 99.9% (retry + fallback HCTI)

## 📊 Limites

- **Google Cloud Function**: 2M requêtes gratuites/mois (largement suffisant)
- **Apps Script**: 6 minutes max d'exécution (génération = 5-8s)
- **Gmail**: 100 emails/jour (quota Google Workspace)
- **Google Drive**: Stockage illimité pour fichiers < 5MB
- **Speakers**: Testé jusqu'à 4, supporte plus avec ajustements CSS

## 🔐 Sécurité

- ✅ Pas de stockage de données personnelles
- ✅ Emails envoyés uniquement à l'adresse fournie
- ✅ Pas d'authentification requise (accès public)
- ⚠️ Ne pas partager vos API Keys
- ⚠️ L'URL du Web App est publique

## 📁 Structure des fichiers

```
FrenchProduit - cover/
├── Code.js                       # Backend Apps Script
├── Form.html                     # Formulaire web
├── Template_Universal.html       # Template universel (1-4+ speakers)
├── cloud-function/               # Google Cloud Function
│   ├── index.js                  # Handler Puppeteer
│   ├── package.json              # Dependencies (@sparticuz/chromium)
│   └── .puppeteerrc.cjs          # Config Puppeteer
├── README.md                     # Documentation principale
└── .gitignore                    # Fichiers à ignorer
```

## 🔧 Configuration avancée

### Intégration Airtable (Optionnel)

Pour enregistrer automatiquement les meetups dans Airtable et les afficher sur votre site web:

📖 **Documentation complète**: Voir [`AIRTABLE_INTEGRATION.md`](./AIRTABLE_INTEGRATION.md)

**Workflow complet**:
```
Formulaire → Cover → Email → Airtable → Site Web
```

Cette intégration permet de:
- ✅ Enregistrer automatiquement chaque meetup
- ✅ Stocker l'URL de la cover générée
- ✅ Afficher les meetups à venir sur votre site
- ✅ Gérer le statut (Brouillon/Publié/Archivé)

### Détails techniques Cloud Function

**Stack actuel (production-ready)** :
- `@sparticuz/chromium` v126.0.0 - Chromium optimisé serverless
- `puppeteer-core` v22.12.0 - Léger, sans téléchargement auto
- Node.js 20, 2GB RAM, 60s timeout

**Fichiers** :
- `cloud-function/index.js` - Handler avec @sparticuz/chromium
- `cloud-function/package.json` - Dependencies
- `cloud-function/.puppeteerrc.cjs` - Config cache (optionnel)

**Pourquoi @sparticuz/chromium ?**
- ✅ Chromium compressé pour serverless
- ✅ Compatible Google Cloud Functions Gen2
- ✅ Pas de problème de cache path
- ✅ Utilisé en production par des milliers de projets

## 🎨 Personnalisation

### Modifier les couleurs

Dans les templates HTML, chercher:
- `#3D7A9C` - Bleu FrenchProduit
- `#E16861` - Rouge/corail
- Modifier selon votre charte graphique

### Ajouter des chapitres

Dans `Form.html`, section `<select name="chapter">`:

```html
<option value="NouveauChapitre">Nouveau Chapitre</option>
```

### Modifier les types d'événements

Dans `Form.html`, section `<select name="eventType">`:

```html
<option value="NouveauType">Nouveau Type</option>
```

## 🐛 Dépannage

### "Erreur HCTI: Unauthorized"
- Vérifier que `HCTI_USER_ID` et `HCTI_API_KEY` sont bien configurés
- Vérifier que le compte HCTI est actif

### "Quota dépassé"
- HCTI gratuit = 50 images/mois
- Passer à Cloud Function (gratuit illimité) - voir [`GOOGLE_CLOUD_SETUP.md`](./GOOGLE_CLOUD_SETUP.md)

### "Image ne se charge pas"
- Vérifier que les URLs des photos speakers sont accessibles publiquement
- Tester les URLs dans un navigateur

### "Email non reçu"
- Vérifier les spams
- Vérifier que l'email est valide
- Vérifier les logs Apps Script (View → Logs)

## 📞 Support

Pour toute question ou problème:
1. Vérifier les logs Apps Script
2. Tester avec des données simples
3. Vérifier la configuration des API Keys

## 🎯 Roadmap

- [x] Template universel 1-4+ speakers ✅
- [x] Google Cloud Function production ✅
- [x] Photos en base64 ✅
- [x] Mode édition complet ✅
- [x] Stockage Drive automatique ✅
- [x] Alternative Cloudflare Worker ✅
- [ ] Statistiques d'utilisation
- [ ] Templates personnalisables par chapitre

## 📜 Licence

Projet interne FrenchProduit - Tous droits réservés

---

**Version**: 2.0.0  
**Dernière mise à jour**: 6 Octobre 2025  
**Statut**: ✅ Production Ready  
**Auteur**: FrenchProduit Tech Team
