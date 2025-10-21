# Intégration Airtable - Documentation

## Vue d'ensemble

Cette intégration permet d'enregistrer automatiquement les meetups générés dans Airtable pour affichage sur le site web.

## Workflow

```
Formulaire → Génération Cover → Email → Airtable → Site Web
```

## Configuration requise

### 1. Informations Airtable nécessaires

#### A. Base Airtable
- **Base ID**: Trouvable dans l'URL de votre base
  - Format: `https://airtable.com/appXXXXXXXXXXXXXX/...`
  - L'ID commence par `app...`

#### B. Table
- **Nom de la table**: Ex: `Meetups`, `Events`, etc.

#### C. Personal Access Token
1. Allez sur https://airtable.com/create/tokens
2. Créez un nouveau token avec les permissions:
   - `data.records:write` (pour créer des enregistrements)
   - `data.records:read` (optionnel, pour vérifier)
   - `schema.bases:read` (pour lire la structure)
3. Sélectionnez votre base dans les scopes
4. Copiez le token (commence par `pat...`)

### 2. Structure de la table Airtable

Créez les champs suivants dans votre table Airtable:

| Nom du champ | Type | Description |
|--------------|------|-------------|
| `Titre` | Single line text | Titre du meetup |
| `Chapitre` | Single select | Rennes, Paris, Lyon, etc. |
| `Date` | Date | Date de l'événement |
| `Heure` | Single line text | Heure de début |
| `Type` | Single select | Conférence, Table ronde, etc. |
| `Sous-titre` | Long text | Description optionnelle |
| `Lieu_Nom` | Single line text | Nom de l'entreprise hôte |
| `Lieu_Adresse` | Long text | Adresse complète |
| `Speakers` | Long text | Liste des speakers (JSON ou texte) |
| `Cover_URL` | URL | Lien vers l'image générée |
| `Statut` | Single select | Brouillon, Publié, Archivé |
| `Date_Creation` | Date | Date de création automatique |
| `Email_Contact` | Email | Email de la personne qui a créé |

**Options Single Select à créer:**

**Chapitre:**
- Rennes
- Paris
- Lyon
- Nantes
- Grand Sud

**Type:**
- Conférence
- Table ronde
- Atelier
- Networking
- Workshop

**Statut:**
- Brouillon
- Publié
- Archivé

### 3. Configuration dans Apps Script

Dans **Project Settings → Script Properties**, ajoutez:

```
AIRTABLE_TOKEN = pat_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
AIRTABLE_BASE_ID = appXXXXXXXXXXXXXXXX
AIRTABLE_TABLE_NAME = Meetups
```

## Implémentation

### Fonction à ajouter dans Code.js

```javascript
// ============================================
// AIRTABLE INTEGRATION
// ============================================

function saveToAirtable(formData, coverUrl) {
  const token = PropertiesService.getScriptProperties().getProperty('AIRTABLE_TOKEN');
  const baseId = PropertiesService.getScriptProperties().getProperty('AIRTABLE_BASE_ID');
  const tableName = PropertiesService.getScriptProperties().getProperty('AIRTABLE_TABLE_NAME');
  
  if (!token || !baseId || !tableName) {
    Logger.log('⚠️ Airtable non configuré - enregistrement ignoré');
    return null;
  }
  
  try {
    // Formater les speakers pour Airtable
    const speakersText = formData.speakers.map(s => 
      `${s.name}${s.title ? ' - ' + s.title : ''}`
    ).join('\n');
    
    // Créer l'enregistrement
    const record = {
      fields: {
        'Titre': formData.title,
        'Chapitre': formData.chapter,
        'Date': formData.date,
        'Heure': formData.time,
        'Type': formData.eventType,
        'Sous-titre': formData.subtitle || '',
        'Lieu_Nom': formData.hostName,
        'Lieu_Adresse': formData.address,
        'Speakers': speakersText,
        'Cover_URL': coverUrl,
        'Statut': 'Brouillon',
        'Date_Creation': new Date().toISOString(),
        'Email_Contact': formData.email
      }
    };
    
    // Appel API Airtable
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
    
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(record),
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      const result = JSON.parse(response.getContentText());
      Logger.log('✅ Meetup enregistré dans Airtable: ' + result.id);
      return result.id;
    } else {
      Logger.log('❌ Erreur Airtable: ' + response.getContentText());
      return null;
    }
    
  } catch (error) {
    Logger.log('❌ Erreur saveToAirtable: ' + error.toString());
    return null;
  }
}
```

### Modifier la fonction generateAndEmailCover

Après l'envoi de l'email, ajouter:

```javascript
// 6. Enregistrer dans Airtable (optionnel)
const airtableId = saveToAirtable(formData, imageUrl);
if (airtableId) {
  Logger.log('Enregistré dans Airtable avec ID: ' + airtableId);
}
```

## Stockage de l'image

### Option A: URL temporaire HCTI
- L'URL HCTI est valide pendant 30 jours
- Gratuit mais temporaire
- Suffisant pour affichage immédiat

### Option B: Google Drive (Recommandé)
Uploader l'image sur Drive et obtenir une URL permanente:

```javascript
function uploadToDrive(imageBlob, formData) {
  const folder = DriveApp.getFolderById('VOTRE_FOLDER_ID'); // Créer un dossier "Covers Meetup"
  const fileName = `cover-${formData.chapter}-${new Date().getTime()}.png`;
  const file = folder.createFile(imageBlob.setName(fileName));
  
  // Rendre public
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return file.getDownloadUrl();
}
```

## Utilisation sur le site web

### Récupération des meetups depuis Airtable

```javascript
// Exemple avec fetch API
const AIRTABLE_TOKEN = 'pat_XXXXX';
const BASE_ID = 'appXXXXX';
const TABLE_NAME = 'Meetups';

async function getMeetups() {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=AND({Statut}='Publié',IS_AFTER({Date},TODAY()))&sort[0][field]=Date&sort[0][direction]=asc`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`
    }
  });
  
  const data = await response.json();
  return data.records;
}
```

## Activation de l'intégration

1. **Phase 1 - Test du service de base**
   - Tester sans Airtable
   - Vérifier génération + email

2. **Phase 2 - Configuration Airtable**
   - Créer la table avec les champs
   - Obtenir le token
   - Configurer les Script Properties

3. **Phase 3 - Activation**
   - Décommenter l'appel `saveToAirtable()`
   - Tester avec un meetup
   - Vérifier dans Airtable

4. **Phase 4 - Site web**
   - Intégrer l'API Airtable sur le site
   - Afficher les meetups à venir

## Sécurité

⚠️ **Important:**
- Ne jamais exposer le token Airtable côté client
- Utiliser Apps Script comme proxy si nécessaire
- Limiter les permissions du token au strict nécessaire

## Questions fréquentes

**Q: Que se passe-t-il si Airtable est en panne?**
R: Le service continue de fonctionner, seul l'enregistrement Airtable est ignoré.

**Q: Peut-on modifier un meetup après création?**
R: Oui, via l'interface Airtable directement, ou en ajoutant une fonction d'update.

**Q: Comment gérer les doublons?**
R: Ajouter une vérification avant création basée sur Titre + Date.
