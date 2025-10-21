# Google Cloud Function - Setup pour génération d'images illimitée et gratuite

## ✅ État actuel (6 octobre 2025)

**Cloud Function déployée et opérationnelle !**

- **Nom**: `generate-cover`
- **Project ID**: `frenchproduit-covergenerator`
- **Region**: `europe-west1`
- **URL**: `https://generate-cover-696388262371.europe-west1.run.app`
- **Runtime**: Node.js 18
- **Mémoire**: 1 GB
- **Timeout**: 60 secondes
- **Statut**: ✅ Déployé et en attente de requêtes

**Configuration Apps Script** :
```
CLOUD_FUNCTION_URL = https://generate-cover-696388262371.europe-west1.run.app
IMAGE_SERVICE = CLOUDFUNCTION
```

---

## Pourquoi Google Cloud Function?

### Comparaison des solutions

| Solution | Coût | Limite | Qualité | Complexité |
|----------|------|--------|---------|------------|
| **HCTI.io** | Gratuit | **50 images/mois** ⚠️ | Excellente | Simple ✅ |
| **Google Cloud** | Gratuit* | **2M requêtes/mois** | Excellente | Moyenne |
| **Google Slides** | Gratuit | Illimité | Moyenne | Complexe |

*Google Cloud: 2M invocations gratuites/mois + 400,000 GB-secondes

### Verdict
Pour **50+ meetups/an**, Google Cloud Function est la meilleure solution:
- ✅ Gratuit et illimité (dans les limites généreuses)
- ✅ Qualité professionnelle (Puppeteer)
- ✅ Contrôle total sur le rendu
- ⚠️ Setup initial plus technique (mais one-time)

## Architecture

```
Apps Script → Cloud Function (Puppeteer) → Image PNG → Apps Script → Email
```

## Setup étape par étape

### 1. Prérequis

- Compte Google Cloud (gratuit)
- Node.js installé localement (pour développement)
- gcloud CLI installé (optionnel mais recommandé)

### 2. Créer le projet Google Cloud

1. Allez sur https://console.cloud.google.com
2. Créez un nouveau projet: **"FrenchProduit-CoverGenerator"**
3. Notez le **Project ID** (ex: `frenchproduit-cover-123456`)

### 3. Activer les APIs nécessaires

Dans la console Google Cloud:
1. API & Services → Enable APIs and Services
2. Activez:
   - **Cloud Functions API**
   - **Cloud Build API**
   - **Cloud Run API** (utilisé par Cloud Functions)

### 4. Créer la Cloud Function

#### A. Structure du projet

Créez un dossier local `cover-generator-function/` avec:

```
cover-generator-function/
├── index.js          # Code de la fonction
├── package.json      # Dépendances
└── .gcloudignore     # Fichiers à ignorer
```

#### B. package.json

```json
{
  "name": "cover-generator",
  "version": "1.0.0",
  "description": "HTML to Image converter using Puppeteer",
  "main": "index.js",
  "engines": {
    "node": "18"
  },
  "dependencies": {
    "@google-cloud/functions-framework": "^3.3.0",
    "puppeteer": "^21.0.0"
  }
}
```

#### C. index.js

```javascript
const functions = require('@google-cloud/functions-framework');
const puppeteer = require('puppeteer');

functions.http('generateCover', async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Vérifier la méthode
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { html, width = 1200, height = 675 } = req.body;

    if (!html) {
      res.status(400).json({ error: 'HTML content is required' });
      return;
    }

    console.log('Starting browser...');
    
    // Lancer Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Définir la taille de la page
    await page.setViewport({ width, height });

    console.log('Loading HTML...');
    
    // Charger le HTML
    await page.setContent(html, {
      waitUntil: ['networkidle0', 'load'],
      timeout: 30000
    });

    // Attendre que les fonts soient chargées
    await page.evaluateHandle('document.fonts.ready');

    console.log('Taking screenshot...');
    
    // Prendre le screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
      omitBackground: false
    });

    await browser.close();

    console.log('Screenshot generated successfully');

    // Retourner l'image
    res.set('Content-Type', 'image/png');
    res.set('Content-Length', screenshot.length);
    res.status(200).send(screenshot);

  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ 
      error: 'Failed to generate image',
      message: error.message 
    });
  }
});
```

#### D. .gcloudignore

```
node_modules/
.git/
.gitignore
```

### 5. Déployer la fonction

#### Option A: Via Console Web

1. Allez sur Cloud Functions dans la console
2. Cliquez "Create Function"
3. Configuration:
   - **Name**: `generate-cover`
   - **Region**: `europe-west1` (ou proche de vous)
   - **Trigger**: HTTP
   - **Authentication**: Allow unauthenticated invocations ⚠️
   - **Runtime**: Node.js 18
   - **Memory**: 1 GB (Puppeteer a besoin de RAM)
   - **Timeout**: 60 seconds
4. Copiez le code de `index.js` et `package.json`
5. Entry point: `generateCover`
6. Deploy

#### Option B: Via gcloud CLI (Recommandé)

```bash
# Se connecter
gcloud auth login

# Définir le projet
gcloud config set project frenchproduit-cover-123456

# Déployer
gcloud functions deploy generate-cover \
  --gen2 \
  --runtime=nodejs18 \
  --region=europe-west1 \
  --source=. \
  --entry-point=generateCover \
  --trigger-http \
  --allow-unauthenticated \
  --memory=1GB \
  --timeout=60s
```

### 6. Obtenir l'URL de la fonction

✅ **URL actuelle déployée** :
```
https://generate-cover-696388262371.europe-west1.run.app
```

### 7. Configuration dans Apps Script

✅ **Déjà configuré** dans **Project Settings → Script Properties** :

```
CLOUD_FUNCTION_URL = https://generate-cover-696388262371.europe-west1.run.app
```

Dans `Code.js`, changez:

```javascript
const CONFIG = {
  IMAGE_SERVICE: 'CLOUDFUNCTION', // ← Changer ici
  // ...
};
```

### 8. Tester la fonction

#### Test direct avec curl

```bash
curl -X POST https://generate-cover-696388262371.europe-west1.run.app \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><body style=\"width:1200px;height:675px;background:#3D7A9C;display:flex;align-items:center;justify-content:center;color:white;font-size:48px;font-family:Arial\"><h1>Test Cover</h1></body></html>",
    "width": 1200,
    "height": 675
  }' \
  --output test.png
```

#### Test depuis Apps Script

```javascript
function testCloudFunction() {
  const html = '<html><body style="width:1200px;height:675px;background:#3D7A9C;display:flex;align-items:center;justify-content:center;color:white;font-size:48px;font-family:Arial"><h1>Test Cover</h1></body></html>';
  
  const imageBlob = convertWithCloudFunction(html);
  
  // Envoyer par email pour vérifier
  GmailApp.sendEmail(
    'votre@email.com',
    'Test Cloud Function',
    'Image en pièce jointe',
    { attachments: [imageBlob] }
  );
}
```

## Coûts et limites

### Free Tier Google Cloud (permanent)

- **2 millions** d'invocations/mois
- **400,000 GB-secondes** de compute time
- **200,000 GHz-secondes** de CPU time
- **5 GB** de trafic sortant/mois

### Estimation pour FrenchProduit

Si vous générez **100 covers/mois**:
- Invocations: 100 (bien en dessous de 2M)
- Compute: ~100 secondes × 1GB = 100 GB-secondes (bien en dessous de 400K)
- Trafic: ~100 × 500KB = 50MB (bien en dessous de 5GB)

**Coût estimé: 0€** ✅

Même avec **1000 covers/mois**, vous restez dans le free tier!

## Sécurité

### Option 1: Fonction publique (actuelle)
- ✅ Simple
- ⚠️ N'importe qui peut appeler la fonction
- Risque: Abus si l'URL est découverte

### Option 2: Fonction avec authentification (recommandé)

#### A. Créer un Service Account

```bash
gcloud iam service-accounts create cover-generator-sa \
  --display-name="Cover Generator Service Account"

# Donner les permissions
gcloud functions add-invoker-policy-binding generate-cover \
  --region=europe-west1 \
  --member="serviceAccount:cover-generator-sa@PROJECT_ID.iam.gserviceaccount.com"

# Créer une clé
gcloud iam service-accounts keys create key.json \
  --iam-account=cover-generator-sa@PROJECT_ID.iam.gserviceaccount.com
```

#### B. Modifier le déploiement

```bash
gcloud functions deploy generate-cover \
  --gen2 \
  --runtime=nodejs18 \
  --region=europe-west1 \
  --source=. \
  --entry-point=generateCover \
  --trigger-http \
  --no-allow-unauthenticated \  # ← Changé ici
  --memory=1GB \
  --timeout=60s
```

#### C. Modifier Code.js pour utiliser l'authentification

```javascript
function convertWithCloudFunction(htmlContent) {
  if (!CONFIG.CLOUD_FUNCTION_URL) {
    throw new Error('Cloud Function URL non configurée');
  }
  
  // Obtenir un token d'authentification
  const token = ScriptApp.getIdentityToken();
  
  const response = UrlFetchApp.fetch(CONFIG.CLOUD_FUNCTION_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    payload: JSON.stringify({
      html: htmlContent,
      width: 1200,
      height: 675
    }),
    muteHttpExceptions: true
  });
  
  if (response.getResponseCode() !== 200) {
    throw new Error('Erreur Cloud Function: ' + response.getContentText());
  }
  
  return response.getBlob().setName('cover-meetup.png');
}
```

## Monitoring

### Voir les logs

```bash
gcloud functions logs read generate-cover --region=europe-west1 --limit=50
```

Ou dans la console: Cloud Functions → generate-cover → Logs

### Métriques

Dans la console Cloud Functions, vous pouvez voir:
- Nombre d'invocations
- Temps d'exécution moyen
- Erreurs
- Utilisation mémoire

## Troubleshooting

### Erreur: "Memory limit exceeded"
**Solution**: Augmenter la mémoire à 2GB

```bash
gcloud functions deploy generate-cover --memory=2GB ...
```

### Erreur: "Timeout"
**Solution**: Augmenter le timeout

```bash
gcloud functions deploy generate-cover --timeout=120s ...
```

### Erreur: "Could not load font"
**Solution**: Les Google Fonts sont chargées via le HTML. Vérifier que le HTML contient:

```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700&display=swap" rel="stylesheet">
```

### Images ne s'affichent pas
**Solution**: Utiliser des images en base64 ou des URLs absolues avec CORS

## ✅ Migration depuis HCTI (TERMINÉE)

1. ✅ Cloud Function déployée
2. ⏳ Tester avec `testFullGeneration()`
3. ✅ `IMAGE_SERVICE` changé en 'CLOUDFUNCTION'
4. ⏳ Tester la génération complète
5. ✅ HCTI gardé comme backup

## Conclusion

**Avantages Cloud Function:**
- ✅ Gratuit et illimité (dans les limites généreuses)
- ✅ Qualité professionnelle
- ✅ Contrôle total
- ✅ Pas de dépendance externe

**Inconvénients:**
- ⚠️ Setup initial plus technique
- ⚠️ Cold start (~2-3 secondes la première fois)

**Recommandation**: Utilisez Cloud Function pour la production, c'est un investissement one-time qui vous libère des limites HCTI.
