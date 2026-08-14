# Générateur d'images de puces & apparats

Remplace les scripts GIMP (`meta/script/leekwars_chips.py` et `leekwars_apparats.py`)
par un outil HTML/JS : rendu canvas aligné sur le redesign v3, thèmes sombre **et**
clair, export PNG en lot.

## Lancer

```sh
./serve.sh          # sert la racine leek-wars sur http://localhost:8123
```

puis ouvrir <http://localhost:8123/meta/script/image-generator/>.

Il faut servir depuis la **racine `leek-wars/`** (le script s'en charge) : l'outil lit
les icônes noires dans `meta/image/chip/png/` et `meta/image/pomp/`, et les libellés
français dans `client/src/lang/fr/`.

## Utilisation

- **Préréglages** puis curseurs (fond, bordure, ombre dure, liseré) ; tout est
  prévisualisé en direct, la config persiste en localStorage.
- **Palette** : un accent par catégorie × deux thèmes, éditable.
- Clic sur une tuile : aperçu 320 px dans les deux thèmes, correction de la
  catégorie (les puces marquées `?` sont absentes de l'ancienne table GIMP),
  téléchargement unitaire.
- **Exporter…** : choisir un dossier (Chromium requis) ; écrit `<nom>.png`,
  en sous-dossiers `dark/` et `light/` si les deux thèmes sont cochés.

## Halo coloré par caractéristique

Les puces tactiques grises ont un reflet bleu, les puces de force un reflet
orange : le halo autour du glyphe ne suit pas la couleur de la tuile mais la
caractéristique concernée. C'est la table `custom_colors` de l'ancien script,
reportée dans `data.js` (`CUSTOM_HALO`, 31 puces).

## Essai en cours

**118 puces** régénérées dans `client-develop/public/image/chip/`, anciennes
sauvegardées dans `client-develop/public/image/chip/old/` (115 fichiers).
Restaurer : `cp old/*.png .` depuis ce dossier.

Les 14 icônes noires qui manquaient ont été générées par IA en août 2026
(recette dans `PROMPTS.md`, « Prompt G »), binarisées en masques alpha et
ajoutées à `meta/image/chip/png/`. `MISSING_SOURCES` est désormais vide.

## Sources

- Puces : `meta/image/chip/png/*.png` (glyphes noirs, alpha = forme).
- Apparats : `meta/image/pomp/black/*.png` ; pour `happy` et `angry` (pas de PNG
  noir), le glyphe est extrait du SVG en retirant le template badge
  (ids dans `data.js` : `POMP_TEMPLATE_IDS` + restes hérités par fichier).
- 14 puces en jeu n'ont **pas de source noire** et ne sont pas régénérables
  (liste dans `data.js` : `MISSING_SOURCES`, affichée dans l'outil).
