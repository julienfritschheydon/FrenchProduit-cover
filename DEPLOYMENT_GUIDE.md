# 🚀 Guide de Déploiement - FrenchProduit Cover Generator

## Étape 6: Partager avec l'équipe (1 min)

### URL à partager

```
https://script.google.com/macros/s/VOTRE_ID/exec
```

### Message type pour l'équipe

```
🎨 Générateur de Cover Meetup FrenchProduit

Pour créer une cover de meetup:
1. Ouvrir ce lien: [URL]
2. Remplir le formulaire
3. Cliquer "Générer et envoyer"
4. Vérifier votre email

La cover sera envoyée par email avec un lien pour la modifier si besoin.

Chapitres disponibles:
- GrandSud
- Nantes-Bretagne
- Nord
- Paris
- Rennes
- Rhône-Alpes
- SudOuest
- SudOuest Toulouse
- Tours

⚠️ Limite: 50 covers/mois (plan gratuit HCTI)
```

---

## Troubleshooting

### "Erreur HCTI: Unauthorized"

**Cause**: Credentials mal configurés

**Solution**:
1. Vérifier Script Properties
2. Vérifier qu'il n'y a pas d'espaces avant/après les valeurs
3. Re-sauvegarder les properties

### "Quota exceeded"

**Cause**: Dépassement des 50 images/mois

**Solutions**:
1. Attendre le mois prochain
2. Migrer vers Google Cloud Function (voir `GOOGLE_CLOUD_SETUP.md`)
3. Upgrader HCTI (payant)

### "Email non reçu"

**Causes possibles**:
- Email dans les spams
- Email invalide
- Quota Gmail dépassé (100 emails/jour)

**Solution**:
1. Vérifier les spams
2. Vérifier les logs Apps Script: **View** → **Executions**

### "Image ne se charge pas"

**Cause**: URL de photo speaker invalide

**Solution**:
- Utiliser des URLs publiques
- Tester l'URL dans un navigateur
- Utiliser des services comme:
  - `https://i.pravatar.cc/300?img=X` (avatars de test)
  - LinkedIn photos (URL directe)
  - Photos hébergées sur Drive (avec partage public)

---

## Maintenance

### Vérifier l'utilisation HCTI

1. Aller sur https://htmlcsstoimage.com/dashboard
2. Vérifier le quota utilisé
3. Si proche de 50, prévenir l'équipe ou migrer vers Cloud Function

### Mettre à jour le code

1. Modifier les fichiers localement
2. Copier dans Apps Script
3. **Deploy** → **Manage deployments**
4. Cliquer sur ✏️ à côté de la version active
5. **Version**: New version
6. **Deploy**

⚠️ L'URL reste la même, pas besoin de la re-partager

### Ajouter un chapitre

1. Ouvrir `Form.html`
2. Ajouter une ligne dans le `<select name="chapter">`:
   ```html
   <option value="NouveauChapitre">Nouveau Chapitre</option>
   ```
3. Sauvegarder et redéployer

---

## Prochaines étapes

Une fois le service stable:

1. **Migrer vers Google Cloud Function** (si > 50 covers/mois)
   - Voir `GOOGLE_CLOUD_SETUP.md`
   - Gratuit et illimité

2. **Intégrer Airtable** (pour affichage sur site web)
   - Voir `AIRTABLE_INTEGRATION.md`
   - Enregistrement automatique des meetups

3. **Personnaliser les templates**
   - Modifier les couleurs
   - Adapter les layouts
   - Ajouter des éléments

---

## Support

**Logs Apps Script**: View → Executions
**Dashboard HCTI**: https://htmlcsstoimage.com/dashboard
**Documentation**: Voir les autres fichiers .md du projet

---

**Date de déploiement**: 6 octobre 2025
**Version**: 1.0.0
**Service d'images**: HCTI.io (50 images/mois)
