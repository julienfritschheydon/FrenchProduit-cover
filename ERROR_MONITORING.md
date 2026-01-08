# Configuration Monitoring Erreurs - Cover Generator

## 📧 Configuration Email Admin

1. **Configurer l'email admin** dans les Script Properties :
   ```
   - Allez dans : File → Project Properties → Script Properties
   - Ajoutez : ADMIN_EMAIL = votre@email.com
   ```

2. **Configurer la Sheet d'erreurs** (optionnel, auto-créée) :
   ```
   - La sheet sera créée automatiquement lors de la première erreur
   - ID sauvegardé dans : ERROR_SHEET_ID
   ```

## 🔍 Méthodes de détection d'erreurs

### 1. **Console Navigateur (Temps réel)**
- Ouvrir les DevTools (F12)
- Onglet Console
- Chercher les messages avec emojis :
  - 🔥 Début/Fin des opérations
  - 💥 Erreurs critiques
  - ❌ Erreurs détaillées
  - ✅ Succès

### 2. **Logs Apps Script**
- Menu de gauche : `Executions`
- Cliquer sur une exécution pour voir les logs
- Filtres disponibles : Succès/Échec

### 3. **Emails d'alerte immédiate**
- Sujet : `🚨 Erreur Cover Generator: [message]`
- Contenu : Contexte, message, stack trace, date
- Envoyé automatiquement à l'admin

### 4. **Google Sheets Tracking**
- Sheet : `Cover Generator - Erreurs`
- Colonnes : Date/Heure, Contexte, Message, Stack, Données, Utilisateur
- Auto-créée et partagée avec l'admin

## 🚨 Types d'erreurs surveillées

### Erreurs Template (comme "print is not defined")
- **Contexte** : `generatePreviewHTML - Preview failed`
- **Detection** : Immédiate (preview)
- **Impact** : Empêche la prévisualisation

### Erreurs Conversion HTML→Image
- **Contexte** : `convertHTMLToImage` ou `convertWithCloudFunction`
- **Detection** : Lors de la génération finale
- **Impact** : Empêche la création de l'image

### Erreurs Validation
- **Contexte** : `validateFormData`
- **Detection** : Avant traitement
- **Impact** : Bloque le traitement

### Erreurs Email
- **Contexte** : `sendCoverEmail`
- **Detection** : En fin de processus
- **Impact** : Cover générée mais non envoyée

## 📊 Dashboard de monitoring

### Créer un dashboard simple :
```javascript
// Dans une nouvelle fonction testDashboard()
function getErrorStats() {
  var sheet = getOrCreateErrorSheet();
  var data = sheet.getDataRange().getValues();
  
  // Statistiques des 7 derniers jours
  var sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  var recentErrors = data.filter(row => {
    if (row[0] === 'Date/Heure') return false;
    var errorDate = new Date(row[0]);
    return errorDate > sevenDaysAgo;
  });
  
  return {
    totalErrors: recentErrors.length,
    byContext: getErrorsByContext(recentErrors),
    byDay: getErrorsByDay(recentErrors)
  };
}
```

## ⚡ Actions recommandées

### Quand une erreur survient :

1. **Vérifier la console** pour l'erreur immédiate
2. **Consulter les logs Apps Script** pour le contexte complet
3. **Vérifier l'email d'alerte** pour les détails
4. **Analyser la Sheet d'erreurs** pour les tendances
5. **Identifier la cause racine** avec les données utilisateur

### Prévention :

1. **Tests réguliers** avec `testPreviewHTML()`
2. **Monitoring des quotas** Apps Script
3. **Validation des dépendances** (Cloud Function, HCTI)
4. **Surveillance des performances** (temps de réponse)

## 🛠️ Maintenance

### Mensuel :
- Vider les logs anciens (> 90 jours)
- Vérifier les quotas Apps Script
- Tester les services externes

### Trimestriel :
- Analyse des tendances d'erreurs
- Optimisation des performances
- Mise à jour des dépendances
