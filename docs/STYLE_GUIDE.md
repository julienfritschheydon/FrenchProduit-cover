# Guide de style et comportement des intervenants

## Comportement par défaut

### Mode création (nouveau formulaire)
- **UN SEUL speaker** est ajouté automatiquement au chargement
- L'utilisateur peut ajouter jusqu'à 3 speakers supplémentaires (max 4 total)
- Le bouton "Ajouter un speaker" permet d'ajouter des speakers supplémentaires

### Mode édition
- Les speakers existants sont chargés depuis l'URL
- Aucun speaker par défaut n'est ajouté
- Si aucun speaker dans l'URL, un speaker par défaut est ajouté

## Boutons des intervenants

### Bouton d'ajout d'intervenant
- **Sélecteur**: `#addSpeakerBtn`
- **Texte**: "+ Ajouter un speaker"
- **Couleur de fond**: `#E16861` (rouge français)
- **Couleur du texte**: Blanc
- **Bordure**: Aucune
- **Arrondis**: 8px
- **Espacement interne**: 12px 24px
- **Maximum**: 4 speakers

### Bouton de suppression d'intervenant
- **Sélecteur**: `.btn-remove-speaker`
- **Icône**: ✕
- **Texte**: "Supprimer"
- **Couleur de fond**: `#ff4444` (rouge vif)
- **Couleur du texte**: Blanc
- **Bordure**: Aucune
- **Arrondis**: 5px
- **Espacement interne**: 6px 12px
- **Visible**: Uniquement à partir du 2ème speaker

## Structure HTML des intervenants

### Conteneur principal
- **Sélecteur**: `#speakersContainer`
- Contient tous les éléments `.speaker-item`

### Élément intervenant
- **Classe**: `.speaker-item` (IMPORTANT: ne pas confondre avec `.speaker-container`)
- Structure:
  ```html
  <div class="speaker-item" data-speaker-id="1">
    <div class="speaker-header">...</div>
    <div class="form-group"><!-- Nom --></div>
    <div class="form-group"><!-- Titre --></div>
    <div class="form-group"><!-- Photo --></div>
  </div>
  ```

## Points critiques à ne pas modifier

### ⚠️ Classe des intervenants
- **TOUJOURS utiliser** `.speaker-item` (pas `.speaker-container`)
- Cette classe est utilisée pour:
  - Le style CSS
  - La détection JavaScript (`querySelectorAll('.speaker-item')`)
  - La vérification de présence des champs

### ⚠️ Champs obligatoires
Chaque intervenant DOIT avoir:
1. Un champ nom: `speaker_${id}_name`
2. Un champ photo: `speaker_${id}_photo`
3. Un champ photo data (hidden): `speaker_${id}_photo_data`

## Bonnes pratiques

1. **Classes CSS**: Toujours utiliser les classes dédiées (`.speaker-item`, `.speaker-header`, etc.)
2. **Styles inline**: Ne pas modifier directement les styles inline
3. **Vérification**: Tester l'ajout/suppression d'intervenants après toute modification
4. **Documentation**: Documenter tout nouveau style dans ce guide
5. **Cohérence**: Utiliser les mêmes sélecteurs en CSS et JavaScript
