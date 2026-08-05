/**
 * Générateur de Cover Meetup FrenchProduit
 * Formulaire web → Génération image → Email
 */

// CONFIGURATION
// ============================================

var CONFIG = {
  // Service de conversion HTML→Image (choisir une option)
  IMAGE_SERVICE: 'CLOUDFUNCTION', // Options: 'HCTI', 'CLOUDFUNCTION'

  // API Keys (à configurer dans Properties)
  HCTI_USER_ID: PropertiesService.getScriptProperties().getProperty('HCTI_USER_ID'),
  HCTI_API_KEY: PropertiesService.getScriptProperties().getProperty('HCTI_API_KEY'),

  // Cloud Function URL (si utilisé)
  CLOUD_FUNCTION_URL: PropertiesService.getScriptProperties().getProperty('CLOUD_FUNCTION_URL'),

  // Email settings
  EMAIL_FROM_NAME: 'FrenchProduit Cover Generator'
};

// ============================================
// ============================================
// PREVIEW FUNCTION (EXPOSED - MUST BE AT TOP LEVEL)
// ============================================

/**
 * Génère un aperçu HTML rapide sans conversion base64
 * Fonction exposée pour être appelée depuis le client
 */
function generatePreviewHTML(data) {
  try {
    var startTime = new Date().getTime();
    Logger.log('🔥 === DÉBUT generatePreviewHTML ===');
    Logger.log('👁️ Fonction generatePreviewHTML appelée côté serveur');
    Logger.log('📥 Données reçues du client:');
    Logger.log('  - Type de data: ' + typeof data);
    Logger.log('  - Data est null?: ' + (data === null));
    Logger.log('  - Data est undefined?: ' + (data === undefined));

    if (!data) {
      Logger.log('❌ ERREUR: Aucune donnée reçue');
      throw new Error('Aucune donnée reçue du client');
    }

    Logger.log('  - Titre: ' + (data.title || 'MANQUANT'));
    Logger.log('  - Speakers: ' + (data.speakers ? data.speakers.length : 'MANQUANT'));
    Logger.log('  - Chapter: ' + (data.chapter || 'MANQUANT'));
    Logger.log('  - Subtitle: ' + (data.subtitle || 'VIDE'));
    Logger.log('  - Subtitle JSON: ' + JSON.stringify(data.subtitle));
    Logger.log('  - Subtitle type: ' + typeof data.subtitle);

    // Créer une copie pour ne pas modifier l'original
    Logger.log('📋 Création d\'une copie des données...');
    var dataCopy;
    try {
      dataCopy = JSON.parse(JSON.stringify(data));
      Logger.log('✅ Copie des données créée');
      Logger.log('  🔍 Subtitle après copie: ' + JSON.stringify(dataCopy.subtitle));
    } catch (e) {
      Logger.log('❌ Erreur lors de la copie des données: ' + e.message);
      throw new Error('Impossible de copier les données: ' + e.message);
    }

    // IMPORTANT: Garder les URLs Drive pour la preview (pas de conversion base64)
    Logger.log('📸 Conservation des URLs Drive pour aperçu rapide');

    for (var i = 0; i < (dataCopy.speakers || []).length; i++) {
      var speaker = dataCopy.speakers[i];
      Logger.log('  - Speaker ' + (i + 1) + ': ' + (speaker.name || 'SANS NOM'));
      if (speaker.photo) {
        Logger.log('    Photo: ' + speaker.photo.substring(0, 50) + '...');
      } else {
        Logger.log('    Photo: MANQUANTE');
      }
    }

    // Générer le HTML avec les URLs Drive directes
    Logger.log('🎨 Génération du template HTML...');
    var template, htmlContent;

    try {
      var templateFile = getTemplateFileName(dataCopy);
      Logger.log('  - Chargement du fichier ' + templateFile + '...');
      template = HtmlService.createTemplateFromFile(templateFile);
      Logger.log('  ✅ Template chargé avec succès');

      Logger.log('  - Attribution des données au template...');
      Logger.log('  🔍 AVANT attribution - Inspection des données:');
      Logger.log('    - Title: ' + dataCopy.title);
      Logger.log('    - Subtitle: ' + dataCopy.subtitle);
      Logger.log('    - Subtitle length: ' + (dataCopy.subtitle ? dataCopy.subtitle.length : 0));
      Logger.log('    - Subtitle contient \\n: ' + (dataCopy.subtitle ? dataCopy.subtitle.indexOf('\\n') > -1 : false));
      Logger.log('    - Subtitle JSON: ' + JSON.stringify(dataCopy.subtitle));

      // LIMITE DE SÉCURITÉ: Tronquer les subtitles trop longs
      var MAX_SUBTITLE_LENGTH = 100;
      if (dataCopy.subtitle && dataCopy.subtitle.length > MAX_SUBTITLE_LENGTH) {
        Logger.log('  ⚠️ Subtitle trop long (' + dataCopy.subtitle.length + ' caractères), troncature à ' + MAX_SUBTITLE_LENGTH);
        dataCopy.subtitle = dataCopy.subtitle.substring(0, MAX_SUBTITLE_LENGTH) + '...';
        Logger.log('  ✂️ Subtitle tronqué: ' + dataCopy.subtitle);
      }

      // SANITIZE subtitle: remplacer les \n par <br> pour éviter les problèmes d'échappement
      if (dataCopy.subtitle) {
        var originalSubtitle = dataCopy.subtitle;
        dataCopy.subtitle = dataCopy.subtitle.replace(/\\n/g, '<br>');
        Logger.log('  🔧 Subtitle sanitized:');
        Logger.log('    - AVANT: ' + JSON.stringify(originalSubtitle));
        Logger.log('    - APRÈS: ' + JSON.stringify(dataCopy.subtitle));
      }

      template.data = dataCopy;
      Logger.log('  ✅ Données attribuées au template');

      Logger.log('  - Évaluation du template...');
      Logger.log('  🔍 Tentative d\'évaluation avec subtitle: ' + JSON.stringify(dataCopy.subtitle));
      htmlContent = template.evaluate().getContent();
      Logger.log('  ✅ Template évalué, HTML généré (' + htmlContent.length + ' caractères)');

    } catch (e) {
      Logger.log('❌ Erreur lors de la génération du template:');
      Logger.log('  - Message: ' + e.message);
      Logger.log('  - Stack: ' + e.stack);
      Logger.log('  🔍 Données au moment de l\'erreur:');
      Logger.log('    - Title: ' + dataCopy.title);
      Logger.log('    - Subtitle: ' + JSON.stringify(dataCopy.subtitle));
      Logger.log('    - Chapter: ' + dataCopy.chapter);
      throw new Error('Erreur template: ' + e.message);
    }

    var totalTime = ((new Date().getTime() - startTime) / 1000).toFixed(2);
    Logger.log('⚡ PREVIEW généré avec succès en: ' + totalTime + 's');
    Logger.log('📄 HTML généré (début): ' + htmlContent.substring(0, 200) + '...');
    Logger.log('🔥 === FIN generatePreviewHTML SUCCESS ===');

    return htmlContent;

  } catch (error) {
    Logger.log('💥 === ERREUR DANS generatePreviewHTML ===');
    Logger.log('❌ Erreur: ' + error.message);
    Logger.log('📍 Stack: ' + error.stack);
    Logger.log('🔥 === FIN generatePreviewHTML ERROR ===');

    // Notification immédiate de l'erreur par email
    sendErrorNotification(error, 'generatePreviewHTML - Preview failed');

    // Re-lancer l'erreur pour qu'elle soit transmise au client
    throw error;
  }
}

// Choix du fichier template HTML selon data.template
function getTemplateFileName(data) {
  return (data && data.template === 'luma') ? 'Template_Luma' : 'Template_Universal';
}

// WEB APP ENTRY POINT
// ============================================

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Form');

  // Si editId est fourni, charger les données depuis Drive
  if (e.parameter && e.parameter.editId) {
    try {
      Logger.log('📂 Chargement cover depuis Drive: ' + e.parameter.editId);
      var file = DriveApp.getFileById(e.parameter.editId);
      var jsonContent = file.getBlob().getDataAsString();
      template.editData = JSON.parse(jsonContent);
      template.isEdit = true;
      Logger.log('✅ Données chargées avec succès');
    } catch (error) {
      Logger.log('❌ Erreur chargement: ' + error.message);
      // Si erreur, formulaire vide
      template.editData = {};
      template.isEdit = false;
    }
  } else {
    // Nouveau formulaire
    template.editData = {};
    template.isEdit = false;
  }

  var output = template.evaluate();
  output.setTitle('Générateur Cover Meetup - FrenchProduit');
  output.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  return output;
}

// ============================================
// MAIN GENERATION FUNCTION
// ============================================

function generateAndEmailCover(formData) {
  var dataFileId = null;
  try {
    Logger.log('=== GÉNÉRATION COVER ===');
    Logger.log('📋 Titre: ' + formData.title);
    Logger.log('📝 Sous-titre: ' + (formData.subtitle || '(vide)'));
    Logger.log('📍 Chapter: ' + formData.chapter);
    Logger.log('👥 Speakers: ' + (formData.speakers ? formData.speakers.length : 0));

    // 1. Valider les données
    validateFormData(formData);

    // 2. Convertir les photos base64 en URLs Drive
    formData = convertPhotosToUrls(formData);

    // 3. Sauvegarder les données dans Drive (historique + lien court)
    // IMPORTANT: Sauvegarder AVANT conversion pour avoir le lien en cas d'erreur
    var dataFile = saveFormDataToDrive(formData);
    dataFileId = dataFile.getId();
    Logger.log('✅ Données sauvegardées: ' + dataFile.getName() + ' (ID: ' + dataFileId + ')');

    // 4. Générer HTML avec template approprié
    var htmlContent = generateCoverHTML(formData);

    // 5. Convertir en image
    var imageBlob = convertHTMLToImage(htmlContent);

    // 6. Créer lien d'édition court
    var editLink = createEditLinkFromFileId(dataFileId);

    // 7. Envoyer email
    sendCoverEmail(formData, imageBlob, editLink);

    Logger.log('✅ Cover générée et envoyée avec succès!');
    return {
      success: true,
      message: 'Cover générée et envoyée par email!',
      editLink: editLink,
      coverId: dataFileId
    };

  } catch (error) {
    Logger.log('❌ ERREUR génération cover: ' + error.message);
    Logger.log('📍 Stack: ' + error.stack);

    // Notification d'erreur enrichie avec toutes les données
    sendErrorNotification(error, 'generateAndEmailCover - Generation failed', {
      formData: formData,
      dataFileId: dataFileId
    });

    return {
      success: false,
      message: 'Erreur: ' + error.message
    };
  }
}

// ============================================
// PHOTO CONVERSION
// ============================================

function convertPhotosToUrls(formData) {
  Logger.log('=== CONVERSION PHOTOS ===');
  Logger.log('Nombre de speakers: ' + formData.speakers.length);

  var folder = getOrCreateFolder();
  Logger.log('Dossier Drive: ' + folder.getName() + ' (ID: ' + folder.getId() + ')');

  for (var i = 0; i < formData.speakers.length; i++) {
    var speaker = formData.speakers[i];
    Logger.log('Speaker ' + (i + 1) + ': ' + speaker.name);
    Logger.log('  🔍 Photo input type: ' + typeof speaker.photo);
    Logger.log('  🔍 Photo length: ' + (speaker.photo ? speaker.photo.length : 0));

    // Si c'est déjà une URL Drive valide, la garder telle quelle (évite doublons)
    if (speaker.photo && speaker.photo.indexOf('drive.google.com/uc?export=view&id=') > -1) {
      Logger.log('  ✅ URL Drive déjà valide, conservation');
      continue;
    }

    // Convertir si c'est du base64
    var needsConversion = false;
    var blob = null;

    if (speaker.photo && speaker.photo.indexOf('data:image') === 0) {
      Logger.log('  → Photo base64 détectée');
      needsConversion = true;
      blob = base64ToBlob(speaker.photo);

    } else if (speaker.photo && (speaker.photo.indexOf('drive.google.com') > -1 || speaker.photo.indexOf('drive.usercontent.google.com') > -1)) {
      Logger.log('  → URL Google Drive non-normalisée détectée, normalisation');
      needsConversion = true;
      try {
        var response = UrlFetchApp.fetch(speaker.photo);
        blob = response.getBlob();
      } catch (error) {
        Logger.log('  ⚠️ Erreur téléchargement, conservation URL: ' + error.message);
        needsConversion = false;
      }
    }

    if (needsConversion && blob) {
      try {
        // Déterminer l'extension selon le type MIME
        var extension = blob.getContentType() === 'image/png' ? '.png' : '.jpg';
        Logger.log('  → Type: ' + blob.getContentType() + ', extension: ' + extension);

        Logger.log('  → Blob final, taille: ' + (blob.getBytes().length / 1024).toFixed(2) + ' KB');

        var fileName = 'speaker_' + new Date().getTime() + '_' + i + extension;
        Logger.log('  → Nom du fichier: ' + fileName);

        var file = folder.createFile(blob.setName(fileName));
        Logger.log('  → Fichier créé sur Drive, ID: ' + file.getId());

        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        Logger.log('  → Permissions définies');

        speaker.photo = 'https://drive.google.com/uc?export=view&id=' + file.getId();
        Logger.log('  → URL générée: ' + speaker.photo);

        // TEST: Vérifier que l'URL est accessible
        try {
          var testResponse = UrlFetchApp.fetch(speaker.photo);
          Logger.log('  ✅ URL accessible, taille: ' + (testResponse.getBlob().getBytes().length / 1024).toFixed(2) + ' KB');
        } catch (testError) {
          Logger.log('  ❌ URL NON accessible: ' + testError.message);
        }

      } catch (error) {
        Logger.log('  ❌ ERREUR lors de l\'upload: ' + error.message);
        Logger.log('  ❌ Stack: ' + error.stack);
        throw error;
      }
    } else if (speaker.photo) {
      Logger.log('  → URL existante conservée: ' + speaker.photo.substring(0, 50) + '...');
    } else {
      Logger.log('  ⚠️ Aucune photo fournie');
    }
  }

  // Logo sponsor (même logique que les photos speakers, sur un champ unique)
  if (formData.sponsorLogo && formData.sponsorLogo.indexOf('data:image') === 0) {
    Logger.log('Logo sponsor: photo base64 détectée');
    try {
      var sponsorBlob = base64ToBlob(formData.sponsorLogo);
      var sponsorExtension = sponsorBlob.getContentType() === 'image/png' ? '.png' : '.jpg';
      var sponsorFileName = 'sponsor_' + new Date().getTime() + sponsorExtension;
      var sponsorFile = folder.createFile(sponsorBlob.setName(sponsorFileName));
      sponsorFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      formData.sponsorLogo = 'https://drive.google.com/uc?export=view&id=' + sponsorFile.getId();
      Logger.log('  → URL générée: ' + formData.sponsorLogo);
    } catch (error) {
      Logger.log('  ❌ ERREUR lors de l\'upload du logo sponsor: ' + error.message);
      throw error;
    }
  }

  Logger.log('=== FIN CONVERSION PHOTOS ===');
  return formData;
}

function getOrCreateFolder(folderName) {
  // Si pas de nom fourni, utiliser le dossier photos par défaut
  if (!folderName) {
    folderName = 'FrenchProduit_Covers_Photos';
  }

  var folders = DriveApp.getFoldersByName(folderName);

  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder(folderName);
  }
}

function saveFormDataToDrive(formData) {
  var folder = getOrCreateFolder('FrenchProduit_Covers_Data');

  // Nom de fichier lisible avec timestamp et chapitre
  var timestamp = Utilities.formatDate(new Date(), 'GMT+1', 'yyyy-MM-dd_HHmmss');
  var safeName = formData.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  var fileName = 'cover_' + timestamp + '_' + formData.chapter + '_' + safeName + '.json';

  // Sauvegarder en JSON formaté (lisible)
  var file = folder.createFile(
    fileName,
    JSON.stringify(formData, null, 2),
    MimeType.PLAIN_TEXT
  );

  Logger.log('💾 Sauvegarde: ' + fileName + ' (ID: ' + file.getId() + ')');
  return file;
}

function base64ToBlob(base64Data) {
  var parts = base64Data.split(',');
  var contentType = parts[0].split(':')[1].split(';')[0];
  var byteString = Utilities.base64Decode(parts[1]);
  return Utilities.newBlob(byteString, contentType);
}

// ============================================
// HTML GENERATION
// ============================================

// Cache global pour éviter de retélécharger les mêmes photos
var photoCache = {};

function generateCoverHTML(data) {
  var startTime = new Date().getTime();
  Logger.log('🎨 Génération HTML...');
  Logger.log('  - Titre: ' + data.title);
  Logger.log('  - Sous-titre: ' + (data.subtitle || '(vide)'));
  Logger.log('  - Speakers: ' + data.speakers.length);

  // Créer une copie profonde pour ne pas modifier l'original
  var dataCopy = JSON.parse(JSON.stringify(data));

  // ÉTAPE 1: Convertir les URLs Drive en base64 EN PARALLÈLE (OPTIMISATION MAJEURE)
  Logger.log('📸 Conversion des photos Drive en base64 (parallèle)...');
  var conversionStart = new Date().getTime();

  // Préparer toutes les requêtes en parallèle
  var requests = [];
  var speakerIndexes = [];

  for (var i = 0; i < dataCopy.speakers.length; i++) {
    var speaker = dataCopy.speakers[i];

    if (speaker.photo && speaker.photo.indexOf('drive.google.com') > -1) {
      // Vérifier le cache d'abord
      if (photoCache[speaker.photo]) {
        Logger.log('  - Speaker ' + (i + 1) + ': Photo en cache ⚡');
        speaker.photo = photoCache[speaker.photo];
        continue;
      }

      requests.push({
        url: speaker.photo,
        method: 'get',
        muteHttpExceptions: true
      });
      speakerIndexes.push(i);
    }
  }

  // Exécuter toutes les requêtes EN PARALLÈLE (gain énorme !)
  if (requests.length > 0) {
    Logger.log('  🚀 Téléchargement de ' + requests.length + ' photos en parallèle...');
    var responses = UrlFetchApp.fetchAll(requests);

    for (var i = 0; i < responses.length; i++) {
      var speakerIndex = speakerIndexes[i];
      var speaker = dataCopy.speakers[speakerIndex];
      var originalUrl = speaker.photo;

      try {
        var imageBlob = responses[i].getBlob();

        // Compression JPEG optimisée (réduit la taille de 50%)
        if (imageBlob.getContentType().indexOf('image') > -1) {
          // Pas besoin de redimensionner ici, déjà fait à l'upload
          var base64Image = Utilities.base64Encode(imageBlob.getBytes());
          var mimeType = imageBlob.getContentType();
          var dataUrl = 'data:' + mimeType + ';base64,' + base64Image;

          // Mettre en cache
          photoCache[originalUrl] = dataUrl;
          speaker.photo = dataUrl;

          Logger.log('  ✅ Speaker ' + (speakerIndex + 1) + ': ' + (dataUrl.length / 1024).toFixed(2) + ' KB');
        }
      } catch (error) {
        Logger.log('  ❌ Speaker ' + (speakerIndex + 1) + ': Erreur - ' + error.message);
      }
    }
  }

  // Logo sponsor : même conversion Drive → base64
  if (dataCopy.sponsorLogo && dataCopy.sponsorLogo.indexOf('drive.google.com') > -1) {
    if (photoCache[dataCopy.sponsorLogo]) {
      Logger.log('  - Logo sponsor: en cache ⚡');
      dataCopy.sponsorLogo = photoCache[dataCopy.sponsorLogo];
    } else {
      try {
        var sponsorResponse = UrlFetchApp.fetch(dataCopy.sponsorLogo, { muteHttpExceptions: true });
        var sponsorBlob = sponsorResponse.getBlob();
        if (sponsorBlob.getContentType().indexOf('image') > -1) {
          var sponsorBase64 = Utilities.base64Encode(sponsorBlob.getBytes());
          var sponsorDataUrl = 'data:' + sponsorBlob.getContentType() + ';base64,' + sponsorBase64;
          photoCache[dataCopy.sponsorLogo] = sponsorDataUrl;
          dataCopy.sponsorLogo = sponsorDataUrl;
          Logger.log('  ✅ Logo sponsor converti');
        }
      } catch (error) {
        Logger.log('  ❌ Logo sponsor: Erreur - ' + error.message);
      }
    }
  }

  var conversionTime = ((new Date().getTime() - conversionStart) / 1000).toFixed(2);
  Logger.log('  ⏱️ Conversion photos: ' + conversionTime + 's');

  // ÉTAPE 2: Générer le HTML avec les images en base64
  var templateStart = new Date().getTime();
  var template = HtmlService.createTemplateFromFile(getTemplateFileName(dataCopy));
  template.data = dataCopy;

  var htmlContent = template.evaluate().getContent();
  var templateTime = ((new Date().getTime() - templateStart) / 1000).toFixed(2);
  Logger.log('✅ HTML généré: ' + (htmlContent.length / 1024).toFixed(2) + ' KB (' + templateTime + 's)');

  // DEBUG: Sauvegarder le HTML pour inspection (DESACTIVÉ en production pour gagner du temps)
  // Activer uniquement si nécessaire pour debug
  var enableDebug = false;
  if (enableDebug) {
    try {
      var debugFolder = getOrCreateFolder('FrenchProduit_Debug');
      var htmlFile = debugFolder.createFile(
        'debug_html_' + new Date().getTime() + '.html',
        htmlContent,
        MimeType.HTML
      );
      Logger.log('  🔍 HTML sauvegardé pour debug: ' + htmlFile.getUrl());
    } catch (e) {
      Logger.log('  ⚠️ Impossible de sauvegarder HTML debug: ' + e.message);
    }
  }

  // ÉTAPE 3: Vérifier que les images sont bien en base64
  var base64Count = (htmlContent.match(/src="data:image/g) || []).length;
  var driveUrlCount = (htmlContent.match(/src="https:\/\/drive\.google\.com/g) || []).length;

  // Chercher aussi avec quotes simples
  var base64CountSingle = (htmlContent.match(/src='data:image/g) || []).length;

  Logger.log('  📊 Images base64 (double quotes): ' + base64Count);
  Logger.log('  📊 Images base64 (single quotes): ' + base64CountSingle);
  Logger.log('  📊 URLs Drive restantes: ' + driveUrlCount);

  // Extraire un échantillon de src pour voir ce qu'il y a
  var srcMatches = htmlContent.match(/src=["'][^"']{0,100}/g);
  if (srcMatches && srcMatches.length > 0) {
    Logger.log('  🔍 Échantillon des src trouvés:');
    srcMatches.slice(0, 3).forEach(function (src) {
      Logger.log('    - ' + src.substring(0, 80) + '...');
    });
  }

  if (driveUrlCount > 0) {
    Logger.log('  ⚠️ WARNING: Des URLs Drive subsistent (risque 403)');
  }

  var totalTime = ((new Date().getTime() - startTime) / 1000).toFixed(2);
  Logger.log('⏱️ TOTAL generateCoverHTML: ' + totalTime + 's');

  return htmlContent;
}


// ============================================
// IMAGE CONVERSION
// ============================================

function convertHTMLToImage(htmlContent) {
  var maxRetries = 2;
  var lastError;

  for (var attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      Logger.log('Tentative ' + attempt + '/' + maxRetries + ' - Service: ' + CONFIG.IMAGE_SERVICE);

      if (CONFIG.IMAGE_SERVICE === 'HCTI') {
        return convertWithHCTI(htmlContent);
      } else if (CONFIG.IMAGE_SERVICE === 'CLOUDFUNCTION') {
        return convertWithCloudFunction(htmlContent);
      } else {
        throw new Error('Service de conversion non configuré');
      }

    } catch (error) {
      lastError = error;
      Logger.log('⚠️ Tentative ' + attempt + ' échouée: ' + error.message);

      // Si Cloud Function échoue au dernier essai, fallback vers HCTI (désactivé en dev)
      // if (attempt === maxRetries && CONFIG.IMAGE_SERVICE === 'CLOUDFUNCTION') {
      //   Logger.log('🔄 Fallback automatique vers HCTI');
      //   try {
      //     return convertWithHCTI(htmlContent);
      //   } catch (hctiError) {
      //     Logger.log('❌ HCTI a aussi échoué: ' + hctiError.message);
      //     throw new Error('Tous les services ont échoué. Cloud Function: ' + error.message + ', HCTI: ' + hctiError.message);
      //   }
      // }

      // Attendre 2 secondes avant de réessayer
      if (attempt < maxRetries) {
        Utilities.sleep(2000);
      }
    }
  }

  throw lastError;
}

// Option 1: HCTI.io (gratuit 50 images/mois)
function convertWithHCTI(htmlContent) {
  if (!CONFIG.HCTI_USER_ID || !CONFIG.HCTI_API_KEY) {
    throw new Error('API Keys HCTI non configurées. Utilisez: File → Project Properties → Script Properties');
  }

  var response = UrlFetchApp.fetch('https://hcti.io/v1/image', {
    method: 'post',
    headers: {
      'Authorization': 'Basic ' + Utilities.base64Encode(CONFIG.HCTI_USER_ID + ':' + CONFIG.HCTI_API_KEY)
    },
    payload: {
      html: htmlContent,
      google_fonts: 'Poppins:200,300,400,500,600,700',
      viewport_width: '1200',
      viewport_height: '675'
    },
    muteHttpExceptions: true
  });

  var result = JSON.parse(response.getContentText());

  if (response.getResponseCode() !== 200) {
    throw new Error('Erreur HCTI: ' + result.error);
  }

  // Télécharger l'image
  var imageUrl = result.url;
  var imageBlob = UrlFetchApp.fetch(imageUrl).getBlob();

  return imageBlob.setName('cover-meetup.png');
}

// Option 2: Cloud Function avec Puppeteer
function convertWithCloudFunction(htmlContent) {
  if (!CONFIG.CLOUD_FUNCTION_URL) {
    throw new Error('Cloud Function URL non configurée');
  }

  Logger.log('📡 Appel Cloud Function: ' + CONFIG.CLOUD_FUNCTION_URL);
  Logger.log('📏 Taille HTML: ' + (htmlContent.length / 1024).toFixed(2) + ' KB');

  var startTime = new Date().getTime();

  var response = UrlFetchApp.fetch(CONFIG.CLOUD_FUNCTION_URL, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      html: htmlContent,
      width: 1200,
      height: 675
    }),
    muteHttpExceptions: true
  });

  var duration = ((new Date().getTime() - startTime) / 1000).toFixed(2);
  Logger.log('⏱️ Durée Cloud Function: ' + duration + 's');
  Logger.log('📊 Code HTTP: ' + response.getResponseCode());

  if (response.getResponseCode() !== 200) {
    Logger.log('❌ Erreur Cloud Function: ' + response.getContentText());
    throw new Error('Erreur Cloud Function: ' + response.getContentText());
  }

  // Récupérer l'image directement
  var imageBlob = response.getBlob().setName('cover-meetup.png');
  var imageSizeKB = (imageBlob.getBytes().length / 1024).toFixed(2);
  Logger.log('✅ Image reçue: ' + imageSizeKB + ' KB');
  Logger.log('  - Content Type: ' + imageBlob.getContentType());
  Logger.log('  - Nom: ' + imageBlob.getName());

  // Vérifier que l'image n'est pas vide
  if (imageBlob.getBytes().length < 1000) {
    Logger.log('⚠️ WARNING: Image très petite (' + imageSizeKB + ' KB), probablement corrompue!');
  }

  return imageBlob;
}

// ============================================
// EMAIL SENDING
// ============================================

function sendCoverEmail(formData, imageBlob, editLink) {
  var subject = 'Cover Meetup: ' + formData.title;

  var htmlBody =
    '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>' +
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
    '<h2 style="color: #3D7A9C;">Votre cover est prete!</h2>' +
    '<p>Bonjour,</p>' +
    '<p>Voici la cover generee pour le meetup <strong>' + formData.title + '</strong>.</p>' +
    '<div style="margin: 30px 0;">' +
    '<img src="cid:cover" style="max-width: 100%; border: 2px solid #E16861; border-radius: 8px;">' +
    '</div>' +
    '<div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">' +
    '<h3 style="margin-top: 0; color: #3D7A9C;">Besoin de modifier?</h3>' +
    '<p>Cliquez sur le lien ci-dessous pour modifier et regenerer la cover:</p>' +
    '<a href="' + editLink + '" style="display: inline-block; background: #E16861; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">' +
    'Modifier cette cover' +
    '</a>' +
    '</div>' +
    '<p style="color: #999; font-size: 11px; margin-top: 30px;">' +
    'Généré par FrenchProduit Cover Generator' +
    '</p>' +
    '</div>';

  var plainBody =
    'Votre cover est prête!\n\n' +
    'Meetup: ' + formData.title + '\n' +
    'Date: ' + formData.date + '\n' +
    'Heure: ' + formData.time + '\n\n' +
    'Modifier cette cover: ' + editLink + '\n\n' +
    'L\'image est en pièce jointe.';

  GmailApp.sendEmail(
    formData.email,
    subject,
    plainBody,
    {
      htmlBody: htmlBody,
      attachments: [imageBlob],
      inlineImages: {
        cover: imageBlob
      },
      name: CONFIG.EMAIL_FROM_NAME
    }
  );
}

// ============================================
// ERROR NOTIFICATION
// ============================================

function sendErrorNotification(error, context, additionalData) {
  try {
    var adminEmail = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL');
    if (!adminEmail) {
      Logger.log('⚠️ ADMIN_EMAIL non configuré - pas de notification email');
      return;
    }

    // Construire les détails supplémentaires
    var detailsHtml = '';
    var jsonLink = '';

    if (additionalData && additionalData.formData) {
      var fd = additionalData.formData;
      detailsHtml =
        '<h3 style="color: #3D7A9C; margin-top: 20px;">📋 Données du formulaire</h3>' +
        '<ul style="background: #f8f9fa; padding: 15px 15px 15px 35px; border-radius: 8px;">' +
        '<li><strong>Titre:</strong> ' + (fd.title || 'N/A') + '</li>' +
        '<li><strong>Sous-titre:</strong> ' + (fd.subtitle || '(vide)') + '</li>' +
        '<li><strong>Chapter:</strong> ' + (fd.chapter || 'N/A') + '</li>' +
        '<li><strong>Date:</strong> ' + (fd.date || 'N/A') + '</li>' +
        '<li><strong>Heure:</strong> ' + (fd.time || 'N/A') + '</li>' +
        '<li><strong>Type:</strong> ' + (fd.eventType || 'N/A') + '</li>' +
        '<li><strong>Hôte:</strong> ' + (fd.hostName || 'N/A') + '</li>' +
        '<li><strong>Adresse:</strong> ' + (fd.address || 'N/A') + '</li>' +
        '<li><strong>Email:</strong> ' + (fd.email || 'N/A') + '</li>' +
        '<li><strong>Speakers:</strong> ' + (fd.speakers ? fd.speakers.length : 0) + '</li>' +
        '</ul>';
    }

    if (additionalData && additionalData.dataFileId) {
      var fileUrl = 'https://drive.google.com/file/d/' + additionalData.dataFileId + '/view';
      jsonLink =
        '<h3 style="color: #3D7A9C; margin-top: 20px;">📂 Fichier JSON généré</h3>' +
        '<p style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #3D7A9C;">' +
        '<a href="' + fileUrl + '" style="color: #1976d2; font-weight: bold; text-decoration: none;">📄 Voir le fichier JSON sur Drive</a><br>' +
        '<span style="font-size: 12px; color: #666; margin-top: 5px; display: inline-block;">ID: ' + additionalData.dataFileId + '</span>' +
        '</p>';
    }

    var subject = '🚨 Erreur Cover Generator: ' + error.message;
    var htmlBody =
      '<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 700px;">' +
      '<h2 style="color: #f44336; border-bottom: 3px solid #f44336; padding-bottom: 10px;">🚨 Erreur détectée</h2>' +
      '<p style="background: #ffebee; padding: 15px; border-radius: 8px; border-left: 4px solid #f44336;">' +
      '<strong>Contexte:</strong> ' + (context || 'Non spécifié') + '<br>' +
      '<strong>Message:</strong> ' + error.message + '<br>' +
      '<strong>Date:</strong> ' + new Date().toLocaleString('fr-FR') +
      '</p>' +
      detailsHtml +
      jsonLink +
      '<details style="margin-top: 20px;">' +
      '<summary style="cursor: pointer; font-weight: bold; color: #666;">🔍 Stack Trace</summary>' +
      '<pre style="background: #f5f5f5; padding: 15px; margin-top: 10px; font-size: 11px; overflow-x: auto; border-radius: 4px;">' +
      (error.stack || 'Pas de stack trace') + '</pre>' +
      '</details>' +
      '</div>';

    GmailApp.sendEmail(adminEmail, subject, '', {
      htmlBody: htmlBody
    });

    Logger.log('📧 Email d\'erreur envoyé à: ' + adminEmail);
  } catch (emailError) {
    Logger.log('❌ Impossible d\'envoyer l\'email d\'erreur: ' + emailError.message);
  }
}

// ============================================
// UTILITIES
// ============================================

function validateFormData(data) {
  var required = ['title', 'date', 'time', 'eventType', 'hostName', 'address', 'email', 'chapter'];

  for (var i = 0; i < required.length; i++) {
    var field = required[i];
    if (!data[field]) {
      throw new Error('Le champ "' + field + '" est requis');
    }
  }

  // Valider email (accepte + et sous-domaines)
  var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(data.email)) {
    throw new Error('Email invalide. Format attendu: exemple@domaine.com');
  }

  // Valider speakers
  if (!data.speakers || data.speakers.length === 0) {
    throw new Error('Au moins un speaker est requis');
  }

  // Valider que speakers est un array (pas un string JSON)
  if (typeof data.speakers === 'string') {
    try {
      data.speakers = JSON.parse(data.speakers);
    } catch (e) {
      throw new Error('Format speakers invalide');
    }
  }
}

function createEditLinkFromFileId(fileId) {
  var webAppUrl = ScriptApp.getService().getUrl();
  return webAppUrl + '?editId=' + fileId;
}

// ============================================
// TEST FUNCTIONS
// ============================================

/**
 * Test de prévisualisation HTML
 * Génère le HTML et le sauvegarde dans Drive pour visualisation
 */
function testPreviewHTML() {
  try {
    Logger.log('========================================');
    Logger.log('=== PREVIEW HTML ===');
    Logger.log('========================================');

    // Données de test avec l'URL finale
    var testData = {
      title: 'Test Cover Preview',
      email: 'test@example.com',
      chapter: 'Paris',
      date: '01/01/25',
      time: 'à partir de 18h00',
      eventType: 'Conférence',
      hostName: 'Test Host',
      address: 'Test Address',
      speakers: [
        {
          name: 'Pierre Slite',
          title: 'Product Manager',
          photo: 'https://drive.google.com/uc?export=view&id=1HwwxKrLGTRIZTuy128ZJeyW7ZjhXW-vI'
        }
      ]
    };

    Logger.log('\n[TEST 1] Génération HTML');
    var htmlContent = generateCoverHTML(testData);
    Logger.log('✅ HTML généré (' + htmlContent.length + ' caractères)');

    Logger.log('\n[TEST 2] Sauvegarde dans Drive');
    var folder = getOrCreateFolder();
    var fileName = 'preview_cover_' + new Date().getTime() + '.html';
    var htmlFile = folder.createFile(fileName, htmlContent, MimeType.HTML);
    htmlFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    Logger.log('✅ Fichier HTML créé');
    Logger.log('Nom: ' + htmlFile.getName());
    Logger.log('ID: ' + htmlFile.getId());

    var previewUrl = 'https://drive.google.com/file/d/' + htmlFile.getId() + '/view';
    Logger.log('\n👉 OUVREZ CETTE URL POUR VOIR LA PREVIEW:');
    Logger.log(previewUrl);

    Logger.log('\n📋 Ou copiez le HTML ci-dessous dans un fichier .html local:');
    Logger.log('--- DÉBUT HTML ---');
    Logger.log(htmlContent.substring(0, 500) + '...');
    Logger.log('--- (HTML tronqué, voir fichier Drive pour le contenu complet) ---');

    Logger.log('\n========================================');

    return {
      htmlContent: htmlContent,
      previewUrl: previewUrl,
      fileId: htmlFile.getId()
    };

  } catch (error) {
    Logger.log('❌ Erreur: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    throw error;
  }
}

/**
 * Test du système de monitoring des erreurs
 * Vérifie que la notification email fonctionne
 */
function testErrorMonitoring() {
  try {
    Logger.log('========================================');
    Logger.log('=== TEST MONITORING ERREURS ===');
    Logger.log('========================================');

    // Créer une erreur de test
    var testError = new Error('Ceci est une erreur de test pour vérifier le monitoring');
    testError.stack = 'Test stack trace\n  at testErrorMonitoring (Code.js:XXX)\n  at (Code.js:XXX)';

    var testContext = 'TEST - Monitoring System Check';

    Logger.log('📧 Test notification email...');
    sendErrorNotification(testError, testContext);

    Logger.log('✅ Test monitoring terminé');
    Logger.log('📋 Vérifiez votre email (si ADMIN_EMAIL configuré)');
    Logger.log('========================================');

    return {
      success: true,
      message: 'Test monitoring effectué. Vérifiez votre email.'
    };

  } catch (error) {
    Logger.log('❌ Erreur lors du test monitoring: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Vérifie la configuration du monitoring
 */
function checkMonitoringConfig() {
  var config = {
    adminEmail: PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL'),
    cloudFunctionUrl: PropertiesService.getScriptProperties().getProperty('CLOUD_FUNCTION_URL'),
    hctiUserId: PropertiesService.getScriptProperties().getProperty('HCTI_USER_ID'),
    hctiApiKey: PropertiesService.getScriptProperties().getProperty('HCTI_API_KEY')
  };

  Logger.log('=== CONFIGURATION MONITORING ===');
  Logger.log('📧 ADMIN_EMAIL: ' + (config.adminEmail || '❌ NON CONFIGURÉ'));
  Logger.log('🔗 CLOUD_FUNCTION_URL: ' + (config.cloudFunctionUrl || '❌ NON CONFIGURÉ'));
  Logger.log('🖼️ HCTI_USER_ID: ' + (config.hctiUserId || '❌ NON CONFIGURÉ'));
  Logger.log('🔑 HCTI_API_KEY: ' + (config.hctiApiKey ? '✅ CONFIGURÉ' : '❌ NON CONFIGURÉ'));
  Logger.log('========================================');

  return config;
}

/**
 * Test complet : Génération HTML → Conversion en image
 * Teste le service configuré (HCTI ou Cloud Function)
 */
function testFullGeneration() {
  try {
    Logger.log('========================================');
    Logger.log('=== TEST GÉNÉRATION COMPLÈTE ===');
    Logger.log('========================================');

    // Données de test
    var testData = {
      title: 'Meetup FrenchProduit Paris',
      email: 'test@example.com',
      chapter: 'Paris',
      date: '15/01/25',
      time: 'à partir de 18h30',
      eventType: 'Conférence',
      hostName: 'WeWork',
      address: '33 rue Lafayette, 75009 Paris',
      speakers: [
        {
          name: 'Pierre Slite',
          title: 'Product Manager @ Slite',
          photo: 'https://drive.google.com/uc?export=view&id=1HwwxKrLGTRIZTuy128ZJeyW7ZjhXW-vI'
        }
      ]
    };

    Logger.log('\n[TEST 1] Génération HTML');
    var htmlContent = generateCoverHTML(testData);
    Logger.log('✅ HTML généré (' + htmlContent.length + ' caractères)');

    Logger.log('\n[TEST 2] Conversion HTML → Image');
    Logger.log('Service configuré: ' + CONFIG.IMAGE_SERVICE);

    // Utiliser la fonction générique qui gère tous les services
    var imageBlob = convertHTMLToImage(htmlContent);
    Logger.log('✅ Image générée');
    Logger.log('Taille: ' + (imageBlob.getBytes().length / 1024).toFixed(2) + ' KB');
    Logger.log('Type: ' + imageBlob.getContentType());

    // Sauvegarder l'image dans Drive pour vérification
    var folder = getOrCreateFolder();
    var fileName = 'test_cover_' + new Date().getTime() + '.png';
    var file = folder.createFile(imageBlob.setName(fileName));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    Logger.log('\n✅ Image sauvegardée dans Drive:');
    Logger.log('✅ Tests terminés');

  } catch (error) {
    Logger.log('\n❌ Erreur globale: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    throw error;
  }
}

/**
 * Test spécifique pour identifier la limite réelle du sous-titre
 * Teste différentes longueurs pour comprendre où ça casse
 */
function testSubtitleLimits() {
  try {
    Logger.log('========================================');
    Logger.log('=== TEST LIMITES SOUS-TITRE ===');
    Logger.log('========================================');

    // Données de base pour les tests
    var baseData = {
      title: 'Test Subtitle Limits',
      email: 'test@example.com',
      chapter: 'Paris',
      date: '15/01/25',
      time: 'à partir de 18h30',
      eventType: 'Conférence',
      hostName: 'Test Host',
      address: 'Test Address',
      speakers: [
        {
          name: 'Test Speaker',
          title: 'Test Title',
          photo: 'https://drive.google.com/uc?export=view&id=1HwwxKrLGTRIZTuy128ZJeyW7ZjhXW-vI'
        }
      ]
    };

    // Différents sous-titres à tester
    var testCases = [
      {
        length: 50,
        subtitle: 'Court sous-titre de test pour validation (50c)'
      },
      {
        length: 100,
        subtitle: 'Structuration du brief, architecture, qualité, testabilité et maintenabilité...\\nExplorons une 12345'
      },
      {
        length: 101,
        subtitle: 'Structuration du brief, architecture, qualité, testabilité et maintenabilité...\\nExplorons une 123456'
      },
      {
        length: 110,
        subtitle: 'Structuration du brief, architecture, qualité, testabilité et maintenabilité...\\nExplorons une application 12345'
      },
      {
        length: 120,
        subtitle: 'Structuration du brief, architecture, qualité, testabilité et maintenabilité...\\nExplorons une application moderne 12345'
      }
    ];

    var results = [];

    for (var i = 0; i < testCases.length; i++) {
      var testCase = testCases[i];
      var actualLength = testCase.subtitle.length;

      Logger.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      Logger.log('TEST ' + (i + 1) + '/' + testCases.length + ': Sous-titre de ' + actualLength + ' caractères');
      Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      Logger.log('Contenu: "' + testCase.subtitle.substring(0, 80) + '..."');

      var testData = JSON.parse(JSON.stringify(baseData));
      testData.subtitle = testCase.subtitle;

      var result = {
        length: actualLength,
        htmlGeneration: 'PENDING',
        htmlSize: 0,
        previewGeneration: 'PENDING',
        imageConversion: 'PENDING',
        imageSize: 0,
        error: null
      };

      try {
        // ÉTAPE 1: Génération HTML
        Logger.log('\n[1/3] Génération HTML...');
        var htmlContent = generateCoverHTML(testData);
        result.htmlGeneration = 'SUCCESS';
        result.htmlSize = htmlContent.length;
        Logger.log('  ✅ HTML généré: ' + (htmlContent.length / 1024).toFixed(2) + ' KB');

        // ÉTAPE 2: Preview HTML (sauvegarde dans Drive)
        Logger.log('\n[2/3] Génération Preview HTML...');
        var folder = getOrCreateFolder('FrenchProduit_Subtitle_Tests');
        var htmlFileName = 'test_subtitle_' + actualLength + 'c_' + new Date().getTime() + '.html';
        var htmlFile = folder.createFile(htmlFileName, htmlContent, MimeType.HTML);
        htmlFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        result.previewGeneration = 'SUCCESS';
        var previewUrl = 'https://drive.google.com/file/d/' + htmlFile.getId() + '/view';
        Logger.log('  ✅ Preview HTML: ' + previewUrl);

        // ÉTAPE 3: Conversion en image
        Logger.log('\n[3/3] Conversion HTML → Image...');
        var imageBlob = convertHTMLToImage(htmlContent);
        result.imageConversion = 'SUCCESS';
        result.imageSize = imageBlob.getBytes().length;
        Logger.log('  ✅ Image générée: ' + (imageBlob.getBytes().length / 1024).toFixed(2) + ' KB');

        // Sauvegarder l'image
        var imageFileName = 'test_subtitle_' + actualLength + 'c_' + new Date().getTime() + '.png';
        var imageFile = folder.createFile(imageBlob.setName(imageFileName));
        imageFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        var imageUrl = 'https://drive.google.com/file/d/' + imageFile.getId() + '/view';
        Logger.log('  ✅ Image sauvegardée: ' + imageUrl);

        Logger.log('\n✅ TEST RÉUSSI pour ' + actualLength + ' caractères');

      } catch (error) {
        result.error = error.message;
        Logger.log('\n❌ ÉCHEC à l\'étape: ' +
          (result.htmlGeneration === 'PENDING' ? 'Génération HTML' :
            result.previewGeneration === 'PENDING' ? 'Preview HTML' :
              'Conversion Image'));
        Logger.log('❌ Erreur: ' + error.message);
        Logger.log('❌ Stack: ' + error.stack);
      }

      results.push(result);

      // Pause entre les tests pour éviter les rate limits
      if (i < testCases.length - 1) {
        Logger.log('\n⏳ Pause 3s avant le prochain test...');
        Utilities.sleep(3000);
      }
    }

    // RÉSUMÉ FINAL
    Logger.log('\n\n');
    Logger.log('╔════════════════════════════════════════════════════════════╗');
    Logger.log('║           RÉSUMÉ DES TESTS DE SOUS-TITRE                  ║');
    Logger.log('╚════════════════════════════════════════════════════════════╝');
    Logger.log('');
    Logger.log('Longueur | HTML Gen | Preview | Image Conv | Résultat');
    Logger.log('─────────┼──────────┼─────────┼────────────┼──────────');

    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      var status = r.imageConversion === 'SUCCESS' ? '✅ OK' : '❌ FAIL';
      Logger.log(
        padRight(r.length + 'c', 9) + '│ ' +
        padRight(r.htmlGeneration === 'SUCCESS' ? '✅' : '❌', 9) + '│ ' +
        padRight(r.previewGeneration === 'SUCCESS' ? '✅' : '❌', 8) + '│ ' +
        padRight(r.imageConversion === 'SUCCESS' ? '✅' : '❌', 11) + '│ ' +
        status
      );
      if (r.error) {
        Logger.log('         └─ Erreur: ' + r.error);
      }
    }

    Logger.log('');
    Logger.log('════════════════════════════════════════════════════════════');

    // Déterminer la limite exacte
    var maxWorkingLength = 0;
    for (var i = 0; i < results.length; i++) {
      if (results[i].imageConversion === 'SUCCESS') {
        maxWorkingLength = Math.max(maxWorkingLength, results[i].length);
      }
    }

    Logger.log('');
    Logger.log('📊 CONCLUSION:');
    Logger.log('   Limite maximale fonctionnelle: ' + maxWorkingLength + ' caractères');
    Logger.log('');
    Logger.log('========================================');

    return {
      success: true,
      results: results,
      maxWorkingLength: maxWorkingLength
    };

  } catch (error) {
    Logger.log('\n❌ Erreur globale du test: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

// Fonction helper pour le padding
function padRight(str, length) {
  str = String(str);
  while (str.length < length) {
    str += ' ';
  }
  return str;
}

/**
 * Test spécifique pour la fonction generatePreviewHTML
 * Teste si la preview échoue à certaines longueurs
 */
function testPreviewLimits() {
  try {
    Logger.log('========================================');
    Logger.log('=== TEST LIMITES PREVIEW HTML ===');
    Logger.log('========================================');

    // Données de base pour les tests
    var baseData = {
      title: 'Test Preview Limits',
      email: 'test@example.com',
      chapter: 'Paris',
      date: '15/01/25',
      time: 'à partir de 18h30',
      eventType: 'Conférence',
      hostName: 'Test Host',
      address: 'Test Address',
      speakers: [
        {
          name: 'Test Speaker',
          title: 'Test Title',
          photo: 'https://drive.google.com/uc?export=view&id=1HwwxKrLGTRIZTuy128ZJeyW7ZjhXW-vI'
        }
      ]
    };

    // Différents sous-titres à tester
    var testCases = [
      {
        name: '50 caractères',
        subtitle: 'Court sous-titre de test pour validation (50c)'
      },
      {
        name: '95 caractères',
        subtitle: 'Structuration du brief, architecture, qualité, testabilité et maintenabilité...\\nExplorons'
      },
      {
        name: '100 caractères',
        subtitle: 'Structuration du brief, architecture, qualité, testabilité et maintenabilité...\\nExplorons une 12345'
      },
      {
        name: '101 caractères',
        subtitle: 'Structuration du brief, architecture, qualité, testabilité et maintenabilité...\\nExplorons une 123456'
      },
      {
        name: '110 caractères',
        subtitle: 'Structuration du brief, architecture, qualité, testabilité et maintenabilité...\\nExplorons une application 12345'
      },
      {
        name: '120 caractères',
        subtitle: 'Structuration du brief, architecture, qualité, testabilité et maintenabilité...\\nExplorons une application moderne 12345'
      },
      {
        name: '130 caractères (dépasse limite)',
        subtitle: 'Structuration du brief, architecture, qualité, testabilité et maintenabilité...\\nExplorons une application moderne et performante 12345'
      }
    ];

    var results = [];

    for (var i = 0; i < testCases.length; i++) {
      var testCase = testCases[i];
      var actualLength = testCase.subtitle.length;

      Logger.log('\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      Logger.log('TEST ' + (i + 1) + '/' + testCases.length + ': ' + testCase.name);
      Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      Logger.log('Longueur réelle: ' + actualLength + ' caractères');
      Logger.log('Contenu: "' + testCase.subtitle.substring(0, 80) + '..."');

      var testData = JSON.parse(JSON.stringify(baseData));
      testData.subtitle = testCase.subtitle;

      var result = {
        name: testCase.name,
        length: actualLength,
        previewGeneration: 'PENDING',
        htmlSize: 0,
        wasTruncated: false,
        error: null
      };

      try {
        // Appeler generatePreviewHTML
        Logger.log('\\n[TEST] Appel de generatePreviewHTML...');
        var htmlContent = generatePreviewHTML(testData);

        result.previewGeneration = 'SUCCESS';
        result.htmlSize = htmlContent.length;

        // Vérifier si le subtitle a été tronqué
        if (actualLength > 120) {
          result.wasTruncated = true;
          Logger.log('  ⚠️ Subtitle tronqué (dépassait 120 caractères)');
        }

        Logger.log('  ✅ Preview HTML générée: ' + (htmlContent.length / 1024).toFixed(2) + ' KB');

        // Sauvegarder pour inspection
        var folder = getOrCreateFolder('FrenchProduit_Preview_Tests');
        var htmlFileName = 'preview_' + actualLength + 'c_' + new Date().getTime() + '.html';
        var htmlFile = folder.createFile(htmlFileName, htmlContent, MimeType.HTML);
        htmlFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        var previewUrl = 'https://drive.google.com/file/d/' + htmlFile.getId() + '/view';
        Logger.log('  📄 Preview sauvegardée: ' + previewUrl);

        Logger.log('\\n✅ TEST RÉUSSI pour ' + testCase.name);

      } catch (error) {
        result.previewGeneration = 'FAILED';
        result.error = error.message;
        Logger.log('\\n❌ ÉCHEC de la preview');
        Logger.log('❌ Erreur: ' + error.message);
        Logger.log('❌ Stack: ' + error.stack);
      }

      results.push(result);

      // Pause entre les tests
      if (i < testCases.length - 1) {
        Logger.log('\\n⏳ Pause 2s avant le prochain test...');
        Utilities.sleep(2000);
      }
    }

    // RÉSUMÉ FINAL
    Logger.log('\\n\\n');
    Logger.log('╔════════════════════════════════════════════════════════════╗');
    Logger.log('║         RÉSUMÉ DES TESTS DE PREVIEW HTML                  ║');
    Logger.log('╚════════════════════════════════════════════════════════════╝');
    Logger.log('');
    Logger.log('Test                      | Longueur | Preview | Tronqué | Résultat');
    Logger.log('──────────────────────────┼──────────┼─────────┼─────────┼──────────');

    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      var status = r.previewGeneration === 'SUCCESS' ? '✅ OK' : '❌ FAIL';
      var truncated = r.wasTruncated ? '✂️ Oui' : 'Non';
      Logger.log(
        padRight(r.name, 26) + '│ ' +
        padRight(r.length + 'c', 9) + '│ ' +
        padRight(r.previewGeneration === 'SUCCESS' ? '✅' : '❌', 8) + '│ ' +
        padRight(truncated, 8) + '│ ' +
        status
      );
      if (r.error) {
        Logger.log('                          └─ Erreur: ' + r.error);
      }
    }

    Logger.log('');
    Logger.log('════════════════════════════════════════════════════════════');

    // Déterminer la limite exacte
    var maxWorkingLength = 0;
    var firstFailureLength = null;

    for (var i = 0; i < results.length; i++) {
      if (results[i].previewGeneration === 'SUCCESS') {
        maxWorkingLength = Math.max(maxWorkingLength, results[i].length);
      } else if (firstFailureLength === null) {
        firstFailureLength = results[i].length;
      }
    }

    Logger.log('');
    Logger.log('📊 CONCLUSION:');
    if (firstFailureLength !== null) {
      Logger.log('   ❌ Premier échec à: ' + firstFailureLength + ' caractères');
      Logger.log('   ✅ Limite maximale fonctionnelle: ' + maxWorkingLength + ' caractères');
    } else {
      Logger.log('   ✅ Tous les tests ont réussi');
      Logger.log('   ✅ Limite maximale testée: ' + maxWorkingLength + ' caractères');
    }
    Logger.log('');
    Logger.log('========================================');

    return {
      success: true,
      results: results,
      maxWorkingLength: maxWorkingLength,
      firstFailureLength: firstFailureLength
    };

  } catch (error) {
    Logger.log('\\n❌ Erreur globale du test: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

