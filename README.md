# TAMNI — Wear your story

Boutique streetwear React + Vite, en français, adaptée aux mobiles. Catalogue, favoris, sélection de taille/couleur/quantité, commande WhatsApp et personnalisation avec aperçu de fichier.

## Développement

```sh
cd /workspace/TAMNI
npm ci
npm run dev -- --port 5173
```

`npm run build` produit `dist/`, déployable sur un hébergement statique. `npm run preview -- --port 4173` permet de vérifier cette version.

## Validation

`npm test` exécute les tests fonctionnels Playwright. Chromium système est utilisé à `/usr/bin/chromium` dans cet environnement. Adapter `playwright.config.js` au navigateur de la machine si nécessaire.

## Catalogue et commandes

- Catalogue : `src/catalog.js` ; photos : `public/products/`.
- WhatsApp : +212 617 571 113 ; Instagram : @tamni_streetwear.
- Les cinq photos JPEG originales fournies par le propriétaire sont utilisées sans retouche dans le catalogue et la bannière.
- Aucun prix ni stock réel n'a été fourni. Les tailles et couleurs sont donc des préférences à confirmer, pas un inventaire garanti. Ajouter les disponibilités réelles avant la mise en vente définitive.
- Les fichiers personnalisés restent dans le navigateur. Le lien WhatsApp transmet les détails et le nom du fichier ; le client doit joindre le fichier manuellement à la conversation. Instagram ouvre le profil pour un envoi manuel.
- Aucune base de données, aucun paiement ni téléversement serveur n'est configuré. Les commandes sont confirmées directement par l'équipe.

Les tâches cloud sont isolées : utiliser le checkout existant, sans créer de worktree.

## Publication GitHub Pages

La version compilée est dans `docs/`. Dans GitHub : Settings → Pages → Deploy from a branch → main → /docs → Save. URL attendue après publication : https://redahasnaouy-stack.github.io/TAMNI/ .

Après une modification, reconstruire avec `npm run build` et actualiser le contenu de `docs/` depuis `dist/` avant de publier. Les chemins relatifs permettent également un hébergement Netlify.
