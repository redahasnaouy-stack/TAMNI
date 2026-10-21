# TAMNI — Wear your story

Boutique streetwear React + Vite, en français, adaptée aux mobiles. Catalogue luxe en noir charbon, ivoire et champagne en trois colonnes sur ordinateur (deux sur mobile), favoris, choix de taille/couleur dans la fiche produit uniquement, panier persistant et confirmation WhatsApp, personnalisation avec aperçu de fichier.

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

Le formulaire de design affiche la légende exacte (support, taille, couleur et détails) et permet de la copier. Elle est transmise avec le fichier dans Web Share. Si WhatsApp ne reprend pas le texte automatiquement, le client peut le coller dans la légende avant l’envoi ; le comportement de l’application cible ne peut pas être garanti par le site.

## Thème TAMNI Maison

Le thème global est défini dans `src/luxury.css`, chargé après les styles historiques. Les variables de couleur (charbon, ivoire, champagne) y sont centralisées ; `src/dashboard-maison.css` décline cette identité dans le dashboard. Le hero conserve le logo argenté original et le catalogue conserve les photos originales sans recadrage. Styles coordonnés pour les fiches, le panier, les formulaires, le partage de design et l’administration.

## Netlify

Importer le dépôt GitHub `redahasnaouy-stack/TAMNI` dans Netlify, branche `main`. `netlify.toml` configure Node 24, `npm run build` et le dossier publié `dist`. Aucun secret supplémentaire n’est requis pour construire le site.

Préférer l’intégration GitHub à un dépôt manuel de ZIP : les publications depuis l’administration créent un commit GitHub et déclenchent ainsi un nouveau déploiement Netlify. L’administration reste accessible via `/#admin` et utilise le même jeton GitHub. Attendre le déploiement avant de vérifier le catalogue côté public. Le fichier `catalog.json` n’est pas mis en cache ; les assets de build versionnés sont mis en cache durablement. Le branchement initial au compte Netlify est à effectuer par le propriétaire dans Netlify.

## Dashboard d’administration

Après connexion, l’administration affiche un dashboard RTL arabe inspiré des captures fournies, avec le thème charbon, ivoire et champagne de la boutique. Le menu Produits conserve l’édition GitHub avec recherche et filtre de visibilité. Le menu latéral est repliable sur mobile.

Sur Netlify, `netlify/functions/tamni-api.mjs` enregistre les commandes et les visites dans le store privé Netlify Blobs `tamni-private-management`. Aucun nom, téléphone ou ville client ne va dans le dépôt public. Le panier enregistre les choix avant d’ouvrir WhatsApp et ajoute une référence courte au message ; une commande enregistrée ne prouve pas que le message a été envoyé ni que la vente est confirmée. En cas d’indisponibilité du backend, WhatsApp reste utilisable avec un avertissement, et l’équipe peut saisir la commande manuellement. Les variantes et les prix sont validés côté serveur depuis le catalogue du déploiement ; les changements de prix nécessitent donc la fin du déploiement Netlify.

- Commandes : recherche, filtres, confirmation, paiement, expédition, détail, frais de livraison, impression, saisie manuelle et export CSV.
- Statistiques : période, valeurs maximale/moyenne/minimale des commandes, ventes réellement marquées payées (hors commandes annulées), courbes et sessions/pages par appareil. Aucun historique WhatsApp antérieur n’est importé. Les sessions sont comptées par jour et par onglet, sans IP ni identifiant de session brut dans le store.
- Clients : regroupement des commandes par téléphone et recherche.
- Compte et équipe : identité GitHub vérifiée côté serveur. Le propriétaire `redahasnaouy-stack` peut autoriser un compte GitHub en lecture seule ou en gestion des commandes. Aucune invitation externe n’est envoyée. Modifier les produits nécessite toujours les permissions GitHub du dépôt. Chaque requête privée vérifie le jeton GitHub, sans le conserver. Les modifications concurrentes de commandes utilisent les révisions du stockage et renvoient un conflit plutôt que d’écraser un changement.

Netlify injecte automatiquement le contexte Blobs dans les Functions modernes. Aucun secret Blobs n’est à ajouter au navigateur. Publier depuis GitHub via Netlify (ou Trigger deploy si nécessaire), puis vérifier `/.netlify/functions/tamni-api?resource=health` : la réponse attendue est `{"ready":true}`. Un ZIP statique ou GitHub Pages seul ne déploie pas ces fonctions ; seuls le catalogue et la commande WhatsApp de secours y fonctionnent. Les données privées restent attachées au site Netlify et ne sont pas incluses dans les archives de build. Ne pas exporter le CSV de clients vers le dépôt public.

Validation : `npm run test:server` vérifie authentification, contrôle des prix et variantes, idempotence, conflits, rôles et comptage de visites avec un stockage simulé ; `npm test` teste les parcours navigateur et les API simulées. Aucun vrai client ni jeton utilisateur n’a été utilisé dans ces tests.

## Carte colis compacte

Le bouton « طباعة بطاقة الطرد · 10 × 15 سم » dans le détail d’une commande imprime uniquement une carte blanche et noire de 100 × 150 mm, avec nom/téléphone/ville, référence, produits et variantes, quantités, livraison et montant à encaisser. Le montant restant d’une commande payée est zéro ; les frais non confirmés sont signalés. Aucun champ de formulaire ni navigation n’est imprimé. Une commande très longue peut utiliser plusieurs cartes plutôt que tronquer ses articles.

Dans le dialogue d’impression, utiliser le papier 100 × 150 mm, l’échelle 100 % et désactiver les en-têtes/pieds de page du navigateur. Sur imprimante A4, la carte peut être imprimée à taille réelle puis découpée ; le format physique dépend des papiers acceptés par l’imprimante. La prévisualisation est disponible avant impression. Les tests PDF utilisent aussi `pdfinfo` et `pdftotext` de Poppler pour contrôler la taille, le nombre de pages et le contenu.
