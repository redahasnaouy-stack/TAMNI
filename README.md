# TAMNI — Wear your story

Boutique streetwear React + Vite, en français, adaptée aux mobiles. Catalogue crème et terracotta en trois colonnes sur ordinateur (deux sur mobile), favoris, choix de taille/couleur dans la fiche produit uniquement, panier persistant et confirmation WhatsApp, personnalisation avec aperçu de fichier.

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

- Catalogue et prix : `public/catalog.json` ; contacts et messages : `src/catalog.js` ; photos : `public/products/`.
- WhatsApp : +212 617 571 113 ; Instagram : @tamni_streetwear.
- Les cinq photos JPEG originales fournies par le propriétaire sont utilisées sans retouche dans le catalogue et la bannière.
- Le panier conserve les choix sur cet appareil. Les demandes de broderie et leur supplément sont soumis à confirmation. Les couleurs et tailles sont des souhaits, sans recoloration des photos originales.
- Prix initiaux demandés par le propriétaire : T-shirt 90 DH, Darwish 120 DH, Angel 110 DH, hoodie Palestine 120 DH et Anime 115 DH. Les prix excluent la livraison et les suppléments de personnalisation. Les tailles et couleurs se gèrent dans le catalogue, sans gestion quantitative du stock.
- Les fichiers personnalisés restent dans le navigateur. Le lien WhatsApp transmet les détails et le nom du fichier ; le client doit joindre le fichier manuellement à la conversation. Instagram ouvre le profil pour un envoi manuel.
- Aucun paiement en ligne. Les commandes sont confirmées directement par l’équipe sur WhatsApp. Le catalogue est publié dans GitHub par l’espace admin.

Les tâches cloud sont isolées : utiliser le checkout existant, sans créer de worktree.

## Publication GitHub Pages

La version compilée est dans `docs/`. Dans GitHub : Settings → Pages → Deploy from a branch → main → /docs → Save. URL attendue après publication : https://redahasnaouy-stack.github.io/TAMNI/ .

Après une modification, reconstruire avec `npm run build` et actualiser le contenu de `docs/` depuis `dist/` avant de publier. Les chemins relatifs permettent également un hébergement Netlify.

## Espace admin

Ouvrir `#admin` depuis le lien du pied de page (sur GitHub Pages : https://redahasnaouy-stack.github.io/TAMNI/#admin). L’accès utilise un jeton personnel GitHub fine-grained limité au dépôt TAMNI, avec la permission Contents: Read and write. Aucun jeton n’est inclus dans le code, envoyé au chat ou conservé dans localStorage/sessionStorage : il reste en mémoire jusqu’à la fermeture/recharge de la page. Ne pas utiliser un jeton ayant accès à d’autres dépôts.

Modifier les champs et enregistrer le brouillon, puis cliquer « Publier les modifications ». L’application crée un commit atomique mettant à jour `public/catalog.json` et `docs/catalog.json`, sans reconstruire l’application. GitHub Pages doit rester configuré sur main /docs et peut prendre quelques minutes pour republier. Le catalogue public est chargé à chaque visite. Les conflits avec une modification parallèle sont bloqués, sans push forcé. Les modifications non publiées restent uniquement en mémoire et seront perdues après fermeture.

Photos admin : JPG/PNG/WEBP jusqu’à 450 Ko, intégrées au catalogue. Taille totale du catalogue limitée à 900 Ko (utiliser des photos compressées). Masquer conserve le produit mais le retire du magasin ; supprimer exige une confirmation puis une publication. Le panier recalcule les prix depuis le catalogue courant.

Les tests admin simulent l’API GitHub : accès refusé, édition, ajout de photo, suppression, publication atomique et conflit concurrent. Une publication réelle depuis le navigateur nécessite le jeton du propriétaire et n’a pas été effectuée avec un jeton utilisateur pendant le développement.

## Hero

Le hero cinématographique (CSS, sans vidéo ni dépendance externe) est dans `src/CinematicHero.jsx` et `src/cinematic.css`. Il utilise une photo du catalogue en arrière-plan et respecte prefers-reduced-motion. Le logo original vu dans le chat n’a pas encore été fourni comme fichier accessible : la marque reste affichée sous forme typographique en attendant le fichier PNG/JPEG/SVG ou ZIP.
