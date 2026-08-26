# Prompts IA pour explorer le style des puces

Objectif : générer des planches d'essais, choisir un style, puis le reproduire
dans le générateur (`app.js`) en HTML/CSS/canvas.

Les prompts sont en anglais (meilleurs résultats sur tous les modèles). Les
couleurs viennent de `client-develop/src/redesign/tokens.scss`.

**Astuce déterminante** : garder **le même sujet dans toutes les cases**, sinon
on compare des dessins, pas des styles. Et demander **zéro texte** : les modèles
d'image écrivent mal, les libellés parasitent la lecture.

---

## Prompt H — redessiner les 3 visages TP (motivation, adrénaline, rage)

Ces trois puces de PT partagent un concept fort : **un bloc noir carré qui
remplit toute la case**, dont tous les traits sont des **découpes blanches**
dans la masse — jamais des formes posées par-dessus. Le but est de garder
exactement ce concept, mais mieux dessiné.

**Joindre `lw-tp-faces-reference.png`** (dans ce dossier) : les trois icônes
actuelles, dans l'ordre motivation / adrénaline / rage.

```
The attached image shows three existing icons from my game, Leek Wars:
determination, adrenaline and rage. They are three angry faces that share one
strong idea. Redraw all three, keeping that idea exactly, but drawn better.

THE IDEA, which must be preserved:
- Each face is ONE SOLID BLACK SQUARE that fills its whole cell, edge to edge,
  with sharp 90-degree corners. The square IS the head. It is never a head
  drawn inside a square, and never a rounded or organic silhouette.
- Every feature — brows, eyes, nose, mouth, teeth — is a PURE WHITE CUT-OUT
  carved into that black square. Nothing is drawn on top, nothing is outlined,
  there are no grey tones and no floating shapes outside the square.
- The features are bold angular wedges and slabs, geometric and confident,
  never thin lines and never soft curves.

HOW MANY SHAPES — aim for the middle, avoid both extremes:
- Roughly 4 to 7 white cut-outs per face. Not 3, which looks empty and
  unfinished. Not 12, which looks slick and over-rendered.
- Each cut-out is a big chunky wedge, slab or blade. Nothing hair-thin.
- FORBIDDEN: pupils, irises, wrinkles, frown lines, cheek creases, ear shapes,
  shading facets, hatching, gradients, outlines.
- The eyes are angular slits or wedges with NO pupil inside.

THE TEETH — this is what usually goes wrong:
- On the snarling face, the mouth is ONE big white opening. The fangs are NOT
  white shapes: they are BLACK triangles biting INTO that white opening from
  its top edge and its bottom edge, so the black of the square shows through.
  Think of the fangs as notches cut back out of the mouth hole.
- Do not draw teeth as a row of separate white rectangles or bars. That reads
  as a machine grille, not a snarl.

THE FEEL:
- Blunt, graphic and a little crude, like a rubber stamp or a linocut — but
  still confident and expressive. Do not make it slick, polished, cinematic or
  comic-book realistic, and do not make it so bare that it looks like a smiley.
- Refine the placement and the angles, not the level of detail: good balance
  between brows and mouth, generous empty black space.
- Keep all three visibly siblings: same square, same drawing language, same
  weight of cut-outs, so they sit together in an inventory.

THE THREE FACES, left to right, escalating:
1. DETERMINATION — two angled eye wedges under two brow wedges, and one plain
   horizontal bar for a firmly set mouth. Calm, controlled, focused.
2. ADRENALINE — the same face wound up: brows driven harder down toward the
   nose, eyes narrowed into sharper blades, a small angular nose wedge, and a
   tense downturned mouth. Alert and strained.
3. RAGE — feral. Heavy angry brows, furious slit eyes, a short angular muzzle
   wedge, and a wide open snarling mouth whose black fang notches bite in from
   above and below. The most extreme of the three.

LAYOUT: one row of three equal square cells on a pure white background, with a
wide white gutter between them so each can be cropped out on its own. No text,
no labels, no numbers, no frames, no cell borders.

Each face must stay instantly readable when shrunk to 64 pixels.
```

Intégration ensuite : découper chaque case, puis appliquer la recette de la
section « Intégration » plus bas (luminance → alpha, bbox sur l'alpha seuillée,
cadrage 250×250). Attention, les sources actuelles de ces trois-là ont une marge
(200×200 dans un canevas de 250×250), ce qui les rend plus petites que les
autres puces en jeu ; la recette produit un canevas rempli, donc elles
retrouveront la taille commune.

---

## Prompt G — les 14 icônes noires manquantes (GPT / Gemini)

Le besoin le plus concret : 14 puces en jeu n'ont pas d'icône noire source et ne
sont donc pas régénérables. Ce prompt sert à les fabriquer.

**Joindre `lw-black-glyph-reference.png`** (dans ce dossier) : 12 icônes noires
réelles, c'est ce qui cale le style bien mieux que des adjectifs.

Version **4 icônes par génération** (4 tours suffisent pour les 14). Remplacer
les 4 lignes de sujets par un des lots plus bas.

```
The attached image shows 12 existing icons from my game, Leek Wars. Produce a
sheet of FOUR new icons in exactly the same style.

LAYOUT: a 2x2 grid on a pure white background, four equal square cells with a
wide white gutter between them so each icon can be cropped out on its own. Each
icon is centred in its cell and fills about 90% of it. The four icons must be
clearly separated, never touching or overlapping.

STYLE, non-negotiable, identical for all four:
- A single flat SOLID BLACK silhouette on a pure white background.
- No outline, no stroke, no gradient, no shading, no grey, no colour, no
  texture, no drop shadow, no background elements, no text, no frame, no cell
  borders, no numbering.
- Interior details are rendered as PURE WHITE CUT-OUTS inside the black shape
  (like the eyes of the skull and the dots on the plaster in the reference),
  never as thin outlines.
- Bold, chunky, confident shapes. Thin lines and fine detail disappear at small
  size, so avoid them entirely.
- All four must look like they were drawn by the same hand, with the same
  visual weight. High resolution.
- Each silhouette must stay instantly recognisable when shrunk to 64 pixels.

THE FOUR ICONS, one per cell:
1. <sujet>
2. <sujet>
3. <sujet>
4. <sujet>
```

### Les 4 lots

**Lot 1 — attaques**
```
1. a compact ball of fire with trailing flames, seen from the side
2. a heavy storm cloud with a thick lightning bolt striking down from it
3. a crackling orb of plasma with jagged energy arcs bursting out of it
4. a medieval trebuchet siege engine with its throwing arm raised, side view
```

**Lot 2 — ninja**
```
1. a single four-pointed ninja throwing star, seen flat
2. a large eight-pointed ninja throwing star with a hollow centre, seen flat
3. a ninja smoke bomb: a round bomb with a lit fuse and thick billowing smoke
4. a dagger driven downward through a skull
```

**Lot 3 — ultimes**
```
1. a mushroom cloud explosion rising over cracked ground
2. a closed eye opening, with short rays radiating outward like an awakening
3. a shield with a halo above it and a pair of spread angel wings behind
4. an angry face with furrowed brows and two puffs of steam bursting from its temples
```

**Lot 4 — les deux dernières** (garder le format 2×2, laisser 2 cases vides ou
demander un 1×2)
```
1. a heavy press squeezing a block flat between two thick plates
2. a battery cracked open with lightning bolts bursting out of it
```

### Variante une par une (meilleure qualité si un lot rate)

```
The attached image shows 12 existing icons from my game, Leek Wars. Produce ONE
new icon in exactly the same style.

STYLE, non-negotiable:
- A single flat SOLID BLACK silhouette on a pure white background.
- No outline, no stroke, no gradient, no shading, no grey, no colour, no
  texture, no drop shadow, no background elements, no text, no frame.
- Interior details are rendered as PURE WHITE CUT-OUTS inside the black shape
  (like the eyes of the skull and the dots on the plaster in the reference),
  never as thin outlines.
- Bold, chunky, confident shapes. Thin lines and fine detail disappear at small
  size, so avoid them entirely.
- Centred on a square canvas, filling roughly 90% of it, with a small even
  margin. High resolution.
- The silhouette must stay instantly recognisable when shrunk to 64 pixels.

SUBJECT: <une ligne de la liste ci-dessous>
```

Les 14 sujets en un seul tableau, écrits d'après l'effet réel de chaque puce
(`ChipTemplateRegistry.class.php`) — pratique pour découper les planches et
nommer les fichiers :

| puce | ligne SUBJECT |
|---|---|
| `fire_ball` | a compact ball of fire with trailing flames, seen from the side |
| `thunder` | a heavy storm cloud with a thick lightning bolt striking down from it |
| `plasma` | a crackling orb of plasma with jagged energy arcs bursting out of it |
| `trebuchet` | a medieval trebuchet siege engine with its throwing arm raised, side view |
| `shuriken` | a single four-pointed ninja throwing star, seen flat |
| `shuriken_star` | a large eight-pointed ninja throwing star with a hollow centre, seen flat |
| `kemuridama` | a ninja smoke bomb: a round bomb with a lit fuse and thick billowing smoke puffs |
| `kill` | a dagger driven downward through a skull |
| `apocalypse` | a mushroom cloud explosion rising over cracked ground |
| `awakening` | a closed eye opening, with short rays radiating outward like an awakening |
| `divine_protection` | a shield with a halo above it and a pair of spread angel wings behind |
| `exasperation` | an angry face with furrowed brows and two puffs of steam bursting from its temples |
| `compaction` | a heavy press squeezing a block flat between two thick plates |
| `overload` | a battery cracked open with lightning bolts bursting out of it |

### Intégration une fois l'image obtenue

Enregistrer l'image, puis la binariser et la détourer (le générateur ne lit que
l'alpha, donc le blanc doit devenir transparent) :

Deux pièges vécus :
- **Ne pas seuiller en noir et blanc** : passer la luminance en ALPHA garde
  l'antialiasing des bords, un `-threshold` donne des contours en escalier.
- **Ne pas se fier à `-trim`** : les restes du trait séparateur des planches
  sont quasi transparents mais pas tout à fait, et `-trim` (même avec `-fuzz`)
  les conserve — la marge parasite qui en résulte se voit directement en jeu,
  puisque le générateur en mode « recadrer sur le contenu » désactivé met à
  l'échelle le canevas entier. Calculer la boîte englobante sur l'alpha
  **seuillée**, puis découper dessus.

```sh
CELL=cellule_decoupee.png     # une case de la planche, marges de la grille retirées
NOM=fire_ball

# 1. luminance -> alpha, sur fond noir
convert "$CELL" -colorspace Gray -negate /tmp/mask.png
convert -size "$(identify -format '%wx%h' "$CELL")" xc:black /tmp/mask.png \
        -alpha Off -compose CopyOpacity -composite /tmp/full.png

# 2. boîte englobante de l'alpha seuillée, puis cadrage en 250x250
BBOX=$(convert /tmp/full.png -alpha extract -threshold 20% -format %@ info:)
convert /tmp/full.png -crop "$BBOX" +repage \
        -resize 250x250 -background none -gravity center -extent 250x250 \
        ../../image/chip/png/$NOM.png

# 3. contrôle : une des deux dimensions doit valoir 250
convert ../../image/chip/png/$NOM.png \
        -alpha extract -threshold 20% -format '%@\n' info:
```

Puis retirer le nom de `MISSING_SOURCES` dans `data.js` et régénérer.

---

## Prompt 0 — AVEC IMAGE DE RÉFÉRENCE (à essayer en premier)

Trois planches en texte pur ont donné « sympa mais hors sujet ». La cause est
simple : le modèle ne connaît pas Leek Wars, et décrire un style avec des mots
le ramène toujours à sa moyenne (RPG mobile, acier brossé, ou aplats ternes).

**Joindre `lw-style-reference.png`** (dans ce dossier) : trois rangées d'assets
réels du jeu — altérations, armes, puces actuelles. Une image de référence pèse
plus lourd que n'importe quelle liste d'adjectifs.

Ce que la référence montre, et qui est LE langage visuel du jeu : contour noir
épais partout, volumes isométriques, couleurs saturées avec un éclairage simple,
et un reflet diagonal sur les puces. **Rien de plat** — c'est l'erreur des
planches précédentes.

```
The attached image shows the existing art of my game, Leek Wars.
TOP ROW: component icons — isometric 3D objects, thick black outline, saturated
colours, simple top-left lighting, no frame around them.
MIDDLE ROW: weapons — same outline and shading language, side view.
BOTTOM ROW: the ability icons I want to REPLACE — rounded tile, gradient
background, glossy diagonal highlight, dark silhouette.

Design a contact sheet of 12 NEW ability icons that clearly belong to the SAME
FAMILY as the top two rows: same thick black outline weight, same colour
saturation, same simple directional lighting, same confident volume. Modernise
the bottom row without abandoning the family. No text, no labels.

Use the same subject in all 12 cells — a flame — so only the treatment varies.
Explore how the tile itself is handled: icon fully detoured with no tile at all;
icon overflowing and breaking out of its tile; tile as a flat colour field; tile
as an isometric integrated-circuit component seen in 3/4 view with the flame
etched on its top face; tile with a single hard offset shadow; tile with a
notched corner; and so on. In every cell the icon must FILL the frame
generously — never a small glyph floating in a large empty box.

Palette: near-black #0B0F0B, warm cream #F2EEDF, acid green #7CFF6B and a
saturated red #FF5040 for the flame. Corners square, radius 0 to 2px.
Every icon must stay readable at 64 pixels.
```

Piste que la référence rend évidente : en français, « puce » désigne aussi le
composant électronique, et les altérations SONT des composants isométriques
(processeurs, condensateurs, dissipateurs). Une puce dessinée comme un circuit
intégré vu en 3/4, avec le glyphe gravé sur sa face supérieure, serait
parfaitement raccord avec l'art existant.

---

## Bloc STYLE MAISON — à coller en tête de n'importe quel prompt

Sans ce bloc, les modèles partent en RPG médiéval-fantastique : acier brossé,
rivets, écussons, médaillons, biseaux dorés. **La liste d'interdits pèse plus
lourd que la liste d'envies** — ne pas la raccourcir.

```
HOUSE STYLE — every cell must obey this, without exception:

FLAT AND GRAPHIC. Every shape is a hard-edged solid colour. No photorealism, no
3D rendering, no material simulation.

SQUARE CORNERS. 90-degree corners, corner radius 0, at most 2px. Nothing
rounded, nothing soft, nothing pill-shaped.

DEPTH COMES FROM THE LINE, NEVER FROM BLUR. Allowed: hard solid offset shadows
(4px right, 4px down, perfectly sharp, no feathering). Forbidden: gaussian blur,
soft drop shadows, ambient occlusion, glossy highlights, bevels, embossing.

THIN PRECISE LINES. Borders are 1.5px hairlines, occasionally 3px. Never chunky
carved frames.

LOCKED PALETTE. Only: near-black #0B0F0B and #0A0E10, warm cream #F2EEDF and
#FFFCF0, acid green #7CFF6B, and the icon's own accent colour. Strictly NO grey
steel, NO silver, NO chrome, NO brushed metal, NO gold, NO bronze, NO
blue-purple gamer gradients.

MOTIFS come from two places only: a retro computer terminal (4px dashes with 4px
gaps, corner tick marks and L-brackets, thin scanlines, monospace dot grids,
crop marks) and plants (leek leaves, sprouts, seeds, roots) drawn as flat
silhouettes.

ABSOLUTELY FORBIDDEN: heraldry, shields, crests, medallions, rivets, screws,
bolts, metal plates, wood grain, stone, leather, fantasy RPG ornament, Art
Nouveau flourishes, glow bloom, lens flare.
```

---

## Prompt A — planche de 16 styles (le principal)

```
Design exploration contact sheet for video game ability icons.

LAYOUT: a clean 4x4 grid of 16 square cells on a neutral mid-grey background,
generous even gutters between cells. Every cell shows THE SAME subject so that
only the visual STYLE differs from cell to cell. Absolutely no text, no labels,
no numbers, no watermarks, no UI chrome.

SUBJECT (identical in all 16 cells): a bold stylised flame glyph, simple enough
to read as a silhouette at very small size.

CONTEXT: icons for "chips" (combat abilities) in Leek Wars, a browser game where
players program battle leeks. Aesthetic: retro terminal meets vegetal, graphic
and sharp, never soft, never corporate, never cute-3D-mobile-game.

COLOR: near-black background #0A0E10 in every cell, with one saturated accent
colour: warm red #FF5040. Keep the palette tight: accent, black, and at most one
lighter tint of the accent.

THE 16 TREATMENTS must be genuinely different from each other:
flat single-colour silhouette; vertical duotone gradient; thick black outline
"ligne claire" with volumetric shading; glossy enamel badge with a specular
highlight; brushed embossed metal; isometric extruded 3D block; neon outline
with soft glow; sticker with a hard offset shadow; engraved intaglio carved into
the surface; frosted translucent glass; layered paper cut-out with depth;
16-bit pixel art; woodcut screenprint with visible grain; halftone dot shading;
technical blueprint wireframe; iridescent holographic foil.

RENDERING: vector-clean crisp edges, high contrast, simple directional light
from the top-left, no photorealism, no background clutter, no blurry drop
shadows. Each icon must stay perfectly legible at 64 pixels.
```

Midjourney : ajouter `--ar 1:1 --style raw --v 7`.

---

## Prompt B — le style retenu décliné sur les 9 familles

À lancer une fois le style choisi (remplacer la description entre crochets).

```
A single row of 9 square game ability icons, same visual style across all nine,
on a near-black #0A0E10 background. No text, no labels.

STYLE: [décrire ici le style retenu de la planche A, ex. "thick black outline
with volumetric shading and a top-left specular highlight"].

The nine icons, each in its own accent colour:
1. lightning bolt, red #FF5040
2. droplet, magenta #FF3D7F
3. medical cross, green #7CFF6B
4. shield, amber #FFB23A
5. upward arrow, blue #6C8CFF
6. seed bulb, cyan #5CE0FF
7. mirror shard, light blue #3FB4FF
8. chain link, violet #A06BFF
9. skull, purple #E44DFF

Vector-clean, crisp, high contrast, legible at 64 pixels.
```

But : vérifier que la palette tient sur les 9 familles, pas seulement en rouge.

---

## Prompt C — le même style en clair et en sombre

```
Two rows of the same 6 game ability icons, identical style and shapes in both
rows, only the theme changes. No text.

TOP ROW: dark theme, background #0A0E10, vivid accent colours
(#FF5040, #7CFF6B, #FFB23A, #5CE0FF, #A06BFF, #FFD23A).
BOTTOM ROW: light theme, warm cream background #FFFCF0, deeper accent colours
(#C2382A, #146128, #C77A0E, #1A7AA0, #6C3BD1, #B88A0E).

STYLE: [style retenu]. Crisp vector edges, legible at 64 pixels.
```

C'est le test qui casse le plus de styles : les effets lumineux (néon, halo)
tiennent mal sur fond crème.

---

## Prompt D — LE CADRE ET LA DÉCORATION (le principal, prêt à coller)

C'est l'axe qui compte : le contenant, le liseré, les ornements de coin. Le bloc
STYLE MAISON est **déjà inclus ci-dessous** — copier le bloc en entier, d'un
seul tenant, rien à assembler.

```
A design exploration contact sheet of 20 square game inventory tiles, laid out
in a 5x4 grid on a neutral mid-grey background with even gutters. No text, no
labels, no numbers, no watermarks.

CRITICAL: the icon inside every tile is EXACTLY THE SAME — the same simple red
#FF5040 flame glyph, same shape, same size, centred, unchanged in all 20 cells.
Do NOT redesign, restyle or recolour the flame. What changes from cell to cell
is ONLY the FRAME, BORDER, PLATE and DECORATION around it. All 20 frames must be
visibly different from one another; never repeat the same frame twice, and never
leave a cell as a bare icon on a plain square.

CONTEXT: inventory tiles for "chips" in Leek Wars, a browser game about
programming battle leeks. A chip is both a magic ability and, visually, a
microchip — so circuitry, contact pads and solder traces are on-theme. Overall
aesthetic: retro terminal meets vegetal, sharp and graphic, zero rounded
softness, no corporate mobile-game gloss.

HOUSE STYLE — every cell must obey this, without exception:

FLAT AND GRAPHIC. Every shape is a hard-edged solid colour. No photorealism, no
3D rendering, no material simulation.

SQUARE CORNERS. 90-degree corners, corner radius 0, at most 2px. Nothing
rounded, nothing soft, nothing pill-shaped.

DEPTH COMES FROM THE LINE, NEVER FROM BLUR. Allowed: hard solid offset shadows
(4px right, 4px down, perfectly sharp, no feathering). Forbidden: gaussian blur,
soft drop shadows, ambient occlusion, glossy highlights, bevels, embossing.

THIN PRECISE LINES. Borders are 1.5px hairlines, occasionally 3px. Never chunky
carved frames.

LOCKED PALETTE. Only: near-black #0B0F0B and #0A0E10, warm cream #F2EEDF and
#FFFCF0, acid green #7CFF6B, and the icon's own accent colour. Strictly NO grey
steel, NO silver, NO chrome, NO brushed metal, NO gold, NO bronze, NO
blue-purple gamer gradients.

MOTIFS come from two places only: a retro computer terminal (4px dashes with 4px
gaps, corner tick marks and L-brackets, thin scanlines, monospace dot grids,
crop marks) and plants (leek leaves, sprouts, seeds, roots) drawn as flat
silhouettes.

ABSOLUTELY FORBIDDEN: heraldry, shields, crests, medallions, rivets, screws,
bolts, metal plates, wood grain, stone, leather, fantasy RPG ornament, Art
Nouveau flourishes, glow bloom, lens flare.

THE 20 FRAMES to explore, all within that house style:
a single 1.5px hairline square; a hairline square plus a hard 4px offset shadow
in the accent colour; two concentric hairlines with a 4px gap; a dashed border
of 4px dashes and 4px gaps; four L-shaped corner brackets and nothing else;
short tick marks at the middle of each edge, like a ruler; a single 3px accent
rule along the top edge only; a dotted strip along the bottom edge; a 45-degree
notch cutting the top-right corner; a small solid filled square tab in the
top-right corner; a frame drawn as a grid of small square dots; an inset second
frame floating 6px inside the first; a field of 1px horizontal scanlines behind
the icon; flat integrated-circuit contact pads drawn as plain rectangles along
the edges in the accent colour; right-angle circuit traces drawn as 1.5px lines
running from the icon to the edges; two flat leek-leaf silhouettes flanking the
bottom corners; a row of flat seed shapes along the bottom edge; two identical
squares stacked with a hard 4px offset; a small crop-mark cross at each corner;
a solid 4px accent bar running the full height of the left edge.

BACKGROUND INSIDE THE TILE, vary it as part of the decoration: sometimes flat
near-black #0A0E10, sometimes a dark tint of the accent, sometimes a fine
monospace dot grid, sometimes flat cream #FFFCF0.

THEMES: render the first 10 tiles on near-black backgrounds and the last 10 on
warm cream #F2EEDF backgrounds, so both themes are tested on one sheet.

Every tile must stay readable at 64 pixels.
```

## Prompt E — l'escalade de rareté

Le cadre est le meilleur endroit pour coder la rareté (les couleurs sont celles
de `global.scss`, `.rarity-border-*`). Très utile côté game design.

```
A single row of 6 square game inventory tiles, same icon in all six: an
identical red #FF5040 flame, unchanged. No text.

Only the frame changes, escalating in richness from tier 0 to tier 5, so that
rarity is instantly readable at a glance:
tier 0, grey #444444, the plainest possible frame;
tier 1, green #00aa00;
tier 2, blue #0090ff;
tier 3, purple #c21aff;
tier 4, gold #f8ac00;
tier 5, red #ff0000, the most ornate.

Each step adds visible decoration: thicker border, then an inner hairline, then
corner ornaments, then a decorative plate, then an outer glow and radiating
detail. The progression must feel like one coherent family, not six unrelated
designs. Background #0A0E10, sharp geometry, legible at 64 pixels.
```

## Prompt F — le cadre retenu sur plusieurs icônes

Une fois un cadre choisi, vérifier qu'il tient avec des glyphes de silhouettes
très différentes (une flamme remplit la case, une seringue est fine et diagonale).

```
A single row of 6 square game inventory tiles sharing ONE identical frame design:
[décrire le cadre retenu]. Only the icon inside changes: flame, syringe, shield,
chain link, skull, seed bulb — each in its own accent colour (#FF5040, #7CFF6B,
#FFB23A, #A06BFF, #E44DFF, #5CE0FF). The frame must stay strictly identical in
all six cells. No text. Sharp vector edges, legible at 64 pixels.
```

---

## Conseils pratiques

- **Partir d'une vraie icône** : la plupart des modèles acceptent une image de
  référence. Fournir un PNG de `meta/image/chip/png/` (silhouette noire) donne
  des proportions justes et un sujet reconnaissable.
- **Une planche = un axe.** Style, palette, cadre : mélanger les trois dans un
  seul prompt donne 16 cases incomparables.
- **Figer explicitement ce qui ne doit pas bouger.** Livré à lui-même, un modèle
  redessine l'icône et oublie le cadre. Écrire en majuscules que le glyphe est
  identique partout, et interdire les cases en double : la première planche
  d'essai a rendu 8 fois la même silhouette plate sur 28 cases.
- **Interdire vaut mieux que suggérer.** Sans liste d'interdits, la planche de
  cadres est revenue en acier brossé, rivets, écusson et médaillon — l'esthétique
  RPG mobile par défaut de ces modèles, à l'opposé du redesign. D'où le bloc
  STYLE MAISON ci-dessus, à coller systématiquement.
- **Mais ne pas sur-interdire.** Corollaire vécu : à force d'exiger plat, traits
  fins et zéro profondeur, la 3ᵉ planche a rendu des carrés vides à liseré vert,
  corrects et sans intérêt. Le jeu n'est PAS plat — ses armes et ses altérations
  ont du volume et un contour noir épais. Garder le relief, ne bannir que le
  faux luxe (métal, biseaux, ornement fantasy).
- **La composition compte plus que le cadre.** Une petite icône flottant au
  milieu d'une grande case décorée sera toujours fade. Exiger que le glyphe
  REMPLISSE la case, et autoriser qu'il déborde de son cadre.
- **Refuser le texte** explicitement à chaque fois, sinon les modèles collent
  des libellés illisibles qui faussent la lecture des cases.
- **Juger en petit** : réduire la planche à 25 % avant de choisir. Un style
  superbe en 512 px peut être illisible dans un slot de 64 px.
- **Ensuite** : m'envoyer la case retenue (capture ou description) et je la
  reproduis dans le générateur — le moteur sait déjà faire aplat, duotone,
  contour noir, relief éclairé, halo, reflet et vignettage ; le reste
  (halftone, hachures, iso, verre) s'ajoute au cas par cas.
