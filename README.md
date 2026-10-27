# TAMNI — Wear your story

Boutique streetwear React + Vite, en arabe, français et anglais, adaptée aux mobiles. Catalogue luxe en noir charbon, ivoire et champagne en trois colonnes sur ordinateur (deux sur mobile), favoris, choix de taille/couleur sous chaque produit, panier persistant et confirmation WhatsApp en deux étapes, personnalisation avec aperçu de fichier.

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
- Le panier conserve les choix sur cet appareil. Les demandes de broderie peuvent être précisées à l’équipe. Les couleurs et tailles sont des souhaits, sans recoloration des photos originales.
- Prix initiaux demandés par le propriétaire : T-shirt 90 DH, Darwish 120 DH, Angel 110 DH, hoodie Palestine 120 DH et Anime 115 DH. Les prix affichés sont finaux et comprennent la livraison, sans ligne de frais séparée. Les tailles et couleurs se gèrent dans le catalogue, sans gestion quantitative du stock.
- Le formulaire de design enregistre d’abord le fichier original et le client dans le store privé Netlify Blobs, puis ouvre directement WhatsApp TAMNI avec les choix et la référence TD. Le client confirme l’envoi du message sans joindre à nouveau le fichier. Aucune WhatsApp API et aucun lien public vers le fichier.
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

Le paiement se fait en espèces à la livraison, selon l’instruction du propriétaire. Les prix catalogue sont les montants finaux à payer, livraison comprise ; aucune mention ni saisie de frais de livraison ne figure sur le site, les messages WhatsApp ou les tickets. Les nouvelles commandes ne peuvent pas recevoir de frais supplémentaires via l’API. Les montants des commandes historiques restent conservés.

Avant d’ouvrir WhatsApp pour confirmer un achat du catalogue, le panier exige uniquement le nom, le téléphone et la ville. Les champs vides, noms/villes composés d’espaces et numéros invalides bloquent l’ouverture. Les numéros marocains locaux et internationaux sont acceptés. Ajouter un produit ne déclenche aucune fenêtre ni formulaire : le client poursuit son shopping. Il ouvre ensuite sa liste dans le panier et choisit « Confirmer la commande » pour afficher les trois champs. Les coordonnées et le récapitulatif complet sont inclus dans le message WhatsApp. Aucune persistance de ces coordonnées dans localStorage, sessionStorage ou GitHub. Le formulaire de design personnalisé reste une prise de contact séparée.

La confirmation WhatsApp utilise un format court : un bloc par produit (nom, taille, couleur, quantité et broderie éventuelle), un total final et le paiement, puis les coordonnées du client en dernier. Aucun récapitulatif de variantes ou de quantités en double.

La sélection du fichier seule ne constitue pas un envoi. Le formulaire exige nom, téléphone et ville. Après validation et sauvegarde privée, le client confirme son message dans WhatsApp. En cas d’échec de sauvegarde, le formulaire conserve ses valeurs et bloque le message ; réessayer ne crée pas de doublon.

## Thème TAMNI Maison

Le thème global est défini dans `src/luxury.css`, chargé après les styles historiques. Les variables de couleur (charbon, ivoire, champagne) y sont centralisées ; `src/dashboard-studio.css` définit un espace admin distinct en papier clair, bleu nuit et laiton, chargé après les styles historiques. Le site Decanteassil demandé comme référence n’était pas accessible depuis l’environnement ; une comparaison visuelle reste à faire avec une capture fournie par le propriétaire. Le hero conserve le logo argenté original et le catalogue conserve les photos originales sans recadrage. Styles coordonnés pour les fiches, le panier, les formulaires, le partage de design et l’administration.

## Netlify

Importer le dépôt GitHub `redahasnaouy-stack/TAMNI` dans Netlify, branche `main`. `netlify.toml` configure Node 24, `npm run build` et le dossier publié `dist`. Aucun secret supplémentaire n’est requis pour construire le site.

Préférer l’intégration GitHub à un dépôt manuel de ZIP : les publications depuis l’administration créent un commit GitHub et déclenchent ainsi un nouveau déploiement Netlify. L’administration reste accessible via `/#admin` et utilise le même jeton GitHub. Attendre le déploiement avant de vérifier le catalogue côté public. Le fichier `catalog.json` n’est pas mis en cache ; les assets de build versionnés sont mis en cache durablement. Le branchement initial au compte Netlify est à effectuer par le propriétaire dans Netlify.

## Dashboard d’administration

Après connexion, l’administration affiche un dashboard RTL arabe inspiré des captures fournies, avec le thème charbon, ivoire et champagne de la boutique. Le menu Produits conserve l’édition GitHub avec recherche et filtre de visibilité. Le menu latéral est repliable sur mobile.

Sur Netlify, `netlify/functions/tamni-api.mjs` enregistre les commandes et les visites dans le store privé Netlify Blobs `tamni-private-management`. Aucun nom, téléphone ou ville client ne va dans le dépôt public. Le panier enregistre les choix avant d’ouvrir WhatsApp et ajoute une référence courte au message ; une commande enregistrée ne prouve pas que le message a été envoyé ni que la vente est confirmée. En cas d’indisponibilité du backend, WhatsApp reste utilisable avec un avertissement, et l’équipe peut saisir la commande manuellement. Les variantes et les prix sont validés côté serveur depuis le catalogue du déploiement ; les changements de prix nécessitent donc la fin du déploiement Netlify.

- Commandes : recherche, filtres, confirmation, paiement, expédition, détail, impression, saisie manuelle et export CSV.
- Statistiques : période, valeurs maximale/moyenne/minimale des commandes, ventes réellement marquées payées (hors commandes annulées), courbes et sessions/pages par appareil. Aucun historique WhatsApp antérieur n’est importé. Les sessions sont comptées par jour et par onglet, sans IP ni identifiant de session brut dans le store.
- Clients : regroupement des commandes par téléphone et recherche.
- Compte et équipe : identité GitHub vérifiée côté serveur. Le propriétaire `redahasnaouy-stack` peut autoriser un compte GitHub en lecture seule ou en gestion des commandes. Aucune invitation externe n’est envoyée. Modifier les produits nécessite toujours les permissions GitHub du dépôt. Chaque requête privée vérifie le jeton GitHub, sans le conserver. Les modifications concurrentes de commandes utilisent les révisions du stockage et renvoient un conflit plutôt que d’écraser un changement.

Netlify injecte automatiquement le contexte Blobs dans les Functions modernes. Aucun secret Blobs n’est à ajouter au navigateur. Publier depuis GitHub via Netlify (ou Trigger deploy si nécessaire), puis vérifier `/.netlify/functions/tamni-api?resource=health` : la réponse attendue est `{"ready":true}`. Un ZIP statique ou GitHub Pages seul ne déploie pas ces fonctions ; seuls le catalogue et la commande WhatsApp de secours y fonctionnent. Les données privées restent attachées au site Netlify et ne sont pas incluses dans les archives de build. Ne pas exporter le CSV de clients vers le dépôt public.

Validation : `npm run test:server` vérifie authentification, contrôle des prix et variantes, idempotence, conflits, rôles et comptage de visites avec un stockage simulé ; `npm test` teste les parcours navigateur et les API simulées. Aucun vrai client ni jeton utilisateur n’a été utilisé dans ces tests.

## Carte colis compacte

Le bouton « طباعة بطاقة الطرد · 10 × 6 سم » dans le détail d’une commande imprime uniquement une carte horizontale blanche et noire de 100 × 60 mm, avec cadre arrondi, en-tête TAMNI, QR ouvrant le site public (sans données client), avec nom/téléphone/ville, référence, produits et variantes, quantités et montant final à encaisser. Le montant restant d’une commande payée est zéro ; aucune ligne de frais supplémentaires n’est imprimée. Aucun champ de formulaire ni navigation n’est imprimé. Une commande très longue peut utiliser plusieurs cartes plutôt que tronquer ses articles.

Dans le dialogue d’impression, utiliser le papier 100 × 60 mm, l’échelle 100 % et désactiver les en-têtes/pieds de page du navigateur. Sur imprimante A4, la carte peut être imprimée à taille réelle puis découpée ; le format physique dépend des papiers acceptés par l’imprimante. La prévisualisation est disponible avant impression. Les tests PDF utilisent aussi `pdfinfo` et `pdftotext` de Poppler pour contrôler la taille, le nombre de pages et le contenu.

## Choix des catalogues

Le hero affiche « تامني » et un seul bouton « SHOP NOW », qui ouvre `?view=catalogues` dans le même onglet. Les cartes de catégories ne figurent plus sur l’accueil. Les cartes initiales s’affichent dans l’ordre SHOP ALL, T-SHIRTS, HOODIES ; les catégories ajoutées depuis l’administration restent disponibles. Chaque carte ouvre son catalogue dans le même onglet (`?tab=all`, `?tab=tshirts`, `?tab=hoodies`). Une grande barre horizontale de catégories reste sous l’en-tête pendant le défilement du catalogue. Le retour du navigateur restaure le filtre précédent. La carte promotionnelle « Ton idée. Notre prochain print. » est supprimée.

## Gestion des catégories

Dans `/#admin` → **الفئات**, ajouter une catégorie ou modifier son nom, sa description et sa photo, puis « Enregistrer et publier la catégorie ». Les identifiants restent stables : renommer une catégorie conserve ses produits et ses liens. Le catalogue complet peut être renommé et recevoir sa propre image, mais ne constitue pas une catégorie attribuable à un produit.

La fiche produit propose les catégories publiées : sélectionner la nouvelle catégorie pour y ranger une pièce. Les cartes de la boutique, titres des catalogues, filtres et graphique de répartition utilisent ces données. Sans image personnalisée, une photo des produits sert de couverture (ou un emplacement TAMNI pour une catégorie vide). Les catalogues s’ouvrent dans le même onglet.

Les catégories sont enregistrées séparément dans `public/categories.json` et `docs/categories.json`, en un commit atomique GitHub. Chaque fichier dispose de sa vérification de révision ; un conflit conserve le formulaire, sans écraser une modification externe. Les changements de catégories ne réécrivent pas les produits. La boutique recharge les deux fichiers sans cache après déploiement Netlify. Limites : 30 catégories, photos JPG/PNG/WEBP de 450 Ko maximum, fichier total de 900 Ko maximum ; les photos téléversées sont publiques comme celles des produits. Aucune donnée privée de commande n’y est stockée.

## Langues et achat sans interruption

Le sélecteur AR / FR / EN de l’en-tête traduit les libellés publics, les couleurs, le panier, la validation, le formulaire personnalisé et les messages WhatsApp. Le choix persiste sur cet appareil ; l’arabe applique `lang="ar"`, `dir="rtl"`. Les valeurs envoyées au serveur (identifiants, couleurs, tailles et quantités) restent canoniques. Le titre de la page et sa description suivent la langue. Les noms propres et textes personnalisés fournis par le propriétaire ne sont pas traduits automatiquement : les formulaires d’administration des produits et catégories proposent des champs العربية / English pour fournir leurs traductions exactes ; les textes d’origine restent le repli. Les copies des cinq modèles initiaux sont localisées dans `src/productCopy.js`. L’administration conserve son interface de gestion arabe/français.

Les tailles, couleurs et quantités disponibles figurent sous chaque produit. Ajouter au panier affiche seulement une notification et met à jour le compteur. Ouvrir le panier permet de relire les choix ; « Confirmer la commande » affiche ensuite nom, téléphone, ville. La dernière action enregistre le récapitulatif privé et ouvre WhatsApp. Les coordonnées client ne sont pas conservées dans localStorage/sessionStorage. Les prix restent finaux, sans frais ajoutés.

Le titre arabe « تامني » du hero utilise Aref Ruqaa Bold, hébergée localement (`src/assets/fonts/`), pour une écriture arabe de style manuscrit. `src/hero-lettering.css` ajoute un relief 3D doré en CSS, sans remplacer le texte par une image. Le lecteur d’écran annonce le titre une seule fois. La police est distribuée sous SIL Open Font License, jointe dans `public/fonts/ArefRuqaa-OFL.txt`.

## Nouveautés sur l’accueil

Le menu d’administration **جديدنا** permet d’ajouter une nouveauté ou de mettre en avant un produit existant. L’action ouvre la fiche produit avec « Afficher dans Nos nouveautés sur l’accueil » déjà cochée. Le propriétaire renseigne photo, nom, prix, variantes et éventuellement traductions, choisit un ordre de 1 à 99 puis publie. Décocher l’option retire uniquement la mise en avant ; le produit reste au catalogue. Masquer le produit le retire aussi des nouveautés publiques. Les changements sont enregistrés dans le catalogue via le même commit atomique et les mêmes contrôles de conflit.

Les produits choisis apparaissent juste sous le hero, dans des cartes compactes de taille uniforme, adaptées aux mobiles et aux trois langues. Les photos originales sont conservées. Les options taille/couleur/quantité et l’ajout au panier restent disponibles directement sur les nouveautés, sans ouvrir le formulaire client. Les liens mènent à la catégorie et à la pièce précise. Aucune nouveauté n’est sélectionnée automatiquement à la place du propriétaire ; le bloc apparaît dès qu’un produit actif est marqué comme nouveauté.

Les demandes de design se trouvent dans Administration → طلبات التصاميم : recherche, coordonnées, choix, aperçu de l’image, téléchargement original, suivi de statut et lien WhatsApp client. La photo est dans le dashboard uniquement ; elle n’est pas automatiquement jointe au message WhatsApp.

### Stockage des designs personnalisés

`server/designs.mjs` expose `resource=designs` via la Function existante. POST public de même origine : JPG, PNG, WEBP ou PDF, signature contrôlée, 2 MiB maximum pour rester sous les limites de requête Netlify après encodage base64. UUID par tentative, répétition idempotente, validation des coordonnées/variantes et limite de 20 demandes par IP hachée/jour lorsque Netlify fournit son en-tête IP. Le fichier conserve ses octets ; le nom de téléchargement est normalisé. Les fichiers et métadonnées sont dans des préfixes privés distincts du store `tamni-private-management`. Aucun fichier ni donnée client n’est ajouté à GitHub ou à un lien public.

GET liste/fichier et PATCH statut nécessitent l’identité GitHub autorisée ; les lecteurs ne peuvent pas modifier. Les téléchargements sont authentifiés, non mis en cache et présentés en pièces jointes ; les aperçus utilisent des URL Blob locales révoquées à la fermeture. Les changements de statut utilisent une révision. La sauvegarde ne prouve pas l’envoi du message WhatsApp. Si une fenêtre est bloquée, le reçu fournit un lien explicite pour ouvrir la conversation. Aucun nouveau secret ni abonnement WhatsApp n’est requis ; un déploiement complet des Functions Netlify est nécessaire. Les données restent conservées dans le store privé : définir une politique de conservation adaptée avec le propriétaire.
