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
- Le partage des designs utilise Web Share API avec le vrai fichier original (sans conversion) et les détails du projet, si le navigateur permet le partage de fichiers. Le client doit choisir WhatsApp puis le contact +212617571113 et confirmer l’envoi. Sans support natif, des étapes expliquent comment télécharger l’original, ouvrir la conversation puis joindre le fichier manuellement. Un lien wa.me seul ne peut pas envoyer une pièce jointe. Instagram ouvre le profil pour un envoi manuel.
- Aucun paiement en ligne. Les commandes sont confirmées directement par l’équipe sur WhatsApp. Le catalogue est publié dans GitHub par l’espace admin.

Les tâches cloud sont isolées : utiliser le checkout existant, sans créer de worktree.

## Publication GitHub Pages

La version compilée est dans `docs/`. Dans GitHub : Settings → Pages → Deploy from a branch → main → /docs → Save. URL attendue après publication : https://redahasnaouy-stack.github.io/TAMNI/ .

Après une modification, reconstruire avec `npm run build` et actualiser le contenu de `docs/` depuis `dist/` avant de publier. Les chemins relatifs permettent également un hébergement Netlify.

## Espace admin

Ouvrir `#admin` depuis le lien du pied de page (sur GitHub Pages : https://redahasnaouy-stack.github.io/TAMNI/#admin). L’accès utilise un jeton personnel GitHub fine-grained limité au dépôt TAMNI, avec la permission Contents: Read and write. Aucun jeton n’est inclus dans le code, envoyé au chat ou conservé dans localStorage/sessionStorage : il reste en mémoire jusqu’à la fermeture/recharge de la page. Ne pas utiliser un jeton ayant accès à d’autres dépôts.

Modifier les champs puis cliquer « Enregistrer et publier » : une seule action valide le formulaire et publie directement. En cas d’échec, le formulaire conserve les changements et affiche la cause. Une suppression reste à confirmer par « Publier les modifications ». L’application crée un commit atomique mettant à jour `public/catalog.json` et `docs/catalog.json`, sans reconstruire l’application. GitHub Pages doit rester configuré sur main /docs et peut prendre quelques minutes pour republier. Le catalogue public est chargé à chaque visite. Les conflits avec une modification parallèle sont bloqués, sans push forcé. Les saisies non publiées restent en mémoire et seront perdues après fermeture. Une sauvegarde réussie est confirmée seulement après la mise à jour de la branche GitHub ; le déploiement Pages prend ensuite quelques minutes.

Photos admin : JPG/PNG/WEBP jusqu’à 450 Ko, intégrées au catalogue. Taille totale du catalogue limitée à 900 Ko (utiliser des photos compressées). Masquer conserve le produit mais le retire du magasin ; supprimer exige une confirmation puis une publication. Le panier recalcule les prix depuis le catalogue courant.

Les tests admin simulent l’API GitHub : accès refusé, édition, ajout de photo, suppression, publication atomique et conflit concurrent. Une publication réelle depuis le navigateur nécessite le jeton du propriétaire et n’a pas été effectuée avec un jeton utilisateur pendant le développement.

## Hero

Le hero cinématographique (CSS, sans vidéo ni dépendance externe) est dans `src/CinematicHero.jsx` et `src/cinematic.css`. Il utilise une photo du catalogue en arrière-plan et respecte prefers-reduced-motion. Le logo original fourni dans logo.zip est conservé sans retouche dans `public/brand/tamni-logo.jpeg`. Il apparaît dans l’en-tête, le hero, le pied de page, l’administration et comme favicon.

Le logo de la barre supérieure utilise `public/brand/tamni-logo-transparent.png` (version à fond transparent). Le hero et les autres emplacements gardent le JPEG original.

Les requêtes admin GitHub désactivent le cache. En cas d’avancement concurrent de la branche, une nouvelle tentative est faite uniquement après relecture du catalogue au nouveau commit ; les modifications externes du catalogue restent protégées. Les erreurs GitHub 422 affichent leur cause réelle et ne sont plus toutes classées comme conflit.

## Livraison, paiement et coordonnées de commande

Le paiement se fait en espèces à la livraison, selon l’instruction du propriétaire. Les frais et délais, non fournis, sont confirmés par WhatsApp selon la ville. Informations affichées dans la section livraison et dans le panier.

Avant d’ouvrir WhatsApp pour confirmer un achat du catalogue, le panier exige uniquement le nom, le téléphone et la ville. Les champs vides, noms/villes composés d’espaces et numéros invalides bloquent l’ouverture. Les numéros marocains locaux et internationaux sont acceptés. Le bouton de commande rapide d’une fiche passe aussi par le panier et ce formulaire. Les coordonnées et le récapitulatif complet sont inclus dans le message WhatsApp. Aucune persistance de ces coordonnées dans localStorage, sessionStorage ou GitHub. Le formulaire de design personnalisé reste une prise de contact séparée.

La confirmation WhatsApp utilise un format court : un bloc par produit (nom, taille, couleur, quantité et broderie éventuelle), un sous-total et le paiement, puis les coordonnées du client en dernier. Aucun récapitulatif de variantes ou de quantités en double.

La réussite de navigator.share signifie uniquement que le fichier est remis à l’interface de partage, jamais une confirmation de livraison WhatsApp. Annulation et erreurs conservent le fichier dans le formulaire. Les tests vérifient les octets originaux et le nom/type du File partagé, le téléchargement de secours et l’annulation ; l’envoi réel dans l’application WhatsApp ne peut pas être automatisé dans Chromium cloud.
