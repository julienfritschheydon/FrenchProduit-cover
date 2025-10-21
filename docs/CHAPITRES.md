# 📍 Chapitres FrenchProduit

Liste complète des chapitres disponibles dans le générateur de cover.

## Chapitres actifs (9)

| Nom | Code | Région |
|-----|------|--------|
| **GrandSud** | `GrandSud` | Sud de la France |
| **Nantes-Bretagne** | `Nantes-Bretagne` | Ouest |
| **Nord** | `Nord` | Nord de la France |
| **Paris** | `Paris` | Île-de-France |
| **Rennes** | `Rennes` | Bretagne |
| **Rhône-Alpes** | `Rhône-Alpes` | Sud-Est |
| **SudOuest** | `SudOuest` | Sud-Ouest |
| **SudOuest Toulouse** | `SudOuest Toulouse` | Toulouse |
| **Tours** | `Tours` | Centre-Val de Loire |

## Ajouter un nouveau chapitre

### Dans le formulaire (Form.html)

Ajouter une ligne dans le `<select name="chapter">`:

```html
<option value="NouveauChapitre">Nouveau Chapitre</option>
```

**Important**: Respecter l'ordre alphabétique pour faciliter la sélection.

### Dans Airtable (si intégration active)

1. Aller dans la table Airtable
2. Ouvrir le champ "Chapitre"
3. Ajouter une nouvelle option dans le Single Select
4. Utiliser exactement le même nom que dans le formulaire

## Conventions de nommage

- **Pas d'espaces** dans les codes (sauf "SudOuest Toulouse" pour raisons historiques)
- **CamelCase** pour les noms composés (ex: GrandSud, SudOuest)
- **Tirets** pour les régions composées (ex: Nantes-Bretagne, Rhône-Alpes)
- **Accents autorisés** (ex: Rhône-Alpes)

## Historique

**Date de création**: 6 octobre 2025
**Dernière mise à jour**: 6 octobre 2025
**Nombre de chapitres**: 9
