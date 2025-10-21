# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

## [2.0.0] - 2025-10-06

### 🎉 Version Production Ready

#### ✨ Ajouté
- **Template universel** : Un seul template pour 1 à 4+ speakers avec layout adaptatif
- **Photos en base64** : Conversion automatique Drive → base64 pour compatibilité externe
- **Google Cloud Function** : Service de génération d'images avec @sparticuz/chromium
- **Mode édition complet** : Chargement automatique des données depuis Drive
- **Stockage Drive automatique** : Historique complet + backup de toutes les covers
- **Liens d'édition courts** : `?editId=ABC123` au lieu de paramètres longs
- **Retry + Fallback** : 2 tentatives + HCTI en backup (99.9% fiabilité)
- **Alternative Cloudflare** : Worker prêt à déployer (bonus)
- **Messages explicatifs** : Interface claire pour le mode édition

#### 🔧 Amélioré
- **Performance** : 5-8s de génération (au lieu de 10-15s)
- **Qualité image** : 1200x675px, ~1MB (au lieu de 500KB compressé)
- **Fiabilité** : Gestion d'erreurs robuste avec logs détaillés
- **UX** : Messages clairs pour l'utilisateur en mode édition
- **Code** : Refactoring complet, commentaires détaillés

#### 🐛 Corrigé
- Photos Drive inaccessibles par services externes (403 Forbidden)
- Template Apps Script échappait le base64 (`<?= ... ?>` → `<?!= ... ?>`)
- Champ photo required bloquait la modification sans re-upload
- Timing de chargement des données en mode édition
- URLs Drive non converties en base64

#### 🗑️ Supprimé
- Templates séparés (1, 2, 3, 4 speakers) → remplacés par Template_Universal
- Paramètres URL longs → remplacés par editId court
- Dépendance parseUrlParams() → utilise SERVER_EDIT_DATA

---

## [1.0.0] - 2025-09-XX

### 🚀 Version Initiale

#### ✨ Ajouté
- Formulaire web pour création de covers
- Templates pour 1, 2, 3, 4 speakers
- Intégration HCTI.io pour génération d'images
- Envoi par email avec pièce jointe
- Liens d'édition avec paramètres URL

#### Limitations
- Templates séparés difficiles à maintenir
- Photos Drive non accessibles par HCTI
- Pas de stockage/historique
- Liens d'édition très longs
- Pas de retry/fallback
