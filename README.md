# Dragonland — dragonland.fr

Refonte du site du restaurant Dragonland (Torcy, Bay 1).
React 19 + Vite, quadrilingue (FR / EN / 繁體 / 简体), déployé sur GitHub Pages.

## Dev

```bash
npm install
npm run dev
```

## Déploiement

Push sur `main` → GitHub Actions build + deploy Pages.
⚠️ Ne jamais utiliser "Re-run jobs" : toujours pousser un commit frais.

Settings → Pages → Source : **GitHub Actions**.

## Domaine custom (à faire avant mise en prod)

1. Vérifier où est enregistré `dragonland.fr` (probablement lié à l'abonnement OKO → transférer chez OVH **avant** résiliation).
2. Ajouter le fichier `public/CNAME` contenant `dragonland.fr`.
3. DNS : 4 enregistrements A vers les IP GitHub Pages + CNAME `www`.
4. Settings → Pages → Custom domain + Enforce HTTPS.

## TODO

- [ ] Remplacer `--red` dans `src/styles.css` par le rouge exact du logo
- [ ] Liens exacts TableMi et Uber Eats dans `src/App.jsx` (`RESTAURANT`)
- [ ] Étape 1 : design system complet (typo, hero, photos)
- [ ] Étape 2 : page Accueil (avis Google, accès, photos)
- [ ] Étape 3 : carte (`menu.json`, catégorie par catégorie)
- [ ] Open Graph image + SEO final
