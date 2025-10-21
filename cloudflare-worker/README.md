# Cover Generator - Cloudflare Worker

Alternative à Google Cloud Function utilisant Cloudflare Browser Rendering.

## ✅ Avantages

- **Gratuit** : Inclus dans le plan Workers gratuit
- **Rapide** : Edge network mondial
- **Simple** : Pas de configuration Puppeteer
- **Fiable** : Browser intégré par Cloudflare

## 🚀 Déploiement

### 1. Installer Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Se connecter à Cloudflare

```bash
wrangler login
```

### 3. Activer Browser Rendering

Dans le dashboard Cloudflare :
1. Allez dans **Workers & Pages**
2. Activez **Browser Rendering** (gratuit)

### 4. Déployer

```bash
cd cloudflare-worker
npm install
npm run deploy
```

### 5. Tester

```bash
curl -X POST https://cover-generator.YOUR-SUBDOMAIN.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Test</h1>","width":1200,"height":675}' \
  --output test.png
```

## 📝 Configuration dans Apps Script

Changez l'URL dans Script Properties :

```
CLOUDFLARE_WORKER_URL = https://cover-generator.YOUR-SUBDOMAIN.workers.dev
```

Puis dans Code.js :

```javascript
var CONFIG = {
  IMAGE_SERVICE: 'CLOUDFLARE',
  CLOUDFLARE_WORKER_URL: PropertiesService.getScriptProperties().getProperty('CLOUDFLARE_WORKER_URL'),
  // ...
};
```

## 🔗 Documentation

- [Cloudflare Browser Rendering](https://developers.cloudflare.com/browser-rendering/)
- [Workers Documentation](https://developers.cloudflare.com/workers/)
