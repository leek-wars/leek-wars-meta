#!/usr/bin/env python3
"""Reconstruction simplifiee de sun_spear en formes geometriques."""
import math

CX, CY = 662.0, 108.0          # centre du soleil
SW = 6                         # epaisseur du contour noir
GOLD_L, GOLD, GOLD_D, GOLD_P = '#fad348', '#fab21b', '#f3890c', '#faea99'
SILV_W, SILV, SILV_M, SILV_D = '#f7f6f6', '#e8e7e7', '#c1c0bf', '#9c9b99'
BRN_L, BRN, BRN_D = '#b4620e', '#853d06', '#4a2405'


def f(v):
    return ('%.1f' % v).rstrip('0').rstrip('.')


def poly(pts, close=True):
    return 'M ' + ' L '.join('%s,%s' % (f(x), f(y)) for x, y in pts) + (' Z' if close else '')


# ---------------------------------------------------------------- soleil
# sommets et creux releves sur le dessin (angle en degres, 0 = haut ; rayon)
STAR = [(0, 105), (20, 54), (40, 88), (52, 58), (62, 72), (76, 59), (90, 97), (104, 59),
        (118, 72), (128, 59), (140, 87), (160, 52), (180, 106), (204, 53), (220, 89),
        (234, 58), (242, 72), (252, 62), (270, 97), (288, 62), (298, 72), (308, 58),
        (322, 89), (338, 56)]


def pol(ang, r):
    t = math.radians(ang)
    return (CX + r * math.sin(t), CY - r * math.cos(t))


star = poly([pol(a, r) for a, r in STAR])
tips = [pol(*STAR[k]) for k in range(0, 24, 2)]
valleys = [pol(*STAR[k]) for k in range(1, 24, 2)]
facets = []                                        # moitie eclairee de chaque branche
for k in range(12):
    a, b = valleys[(k - 1) % 12], valleys[k]
    lit = min(a, b, key=lambda p: (p[0], p[1]))    # celle qui regarde vers le haut a gauche
    mid = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
    facets.append(poly([tips[k], lit, mid]))

# ---------------------------------------------------------------- lame
blade = poly([(690, 77), (956, 78), (986, 62), (1012, 72), (1064, 81),
              (1311, 110), (1064, 139), (1012, 148), (986, 158), (956, 142), (690, 140.5)])
core_top = [(690, 88), (952, 91), (986, 81), (1010, 86), (1060, 93), (1232, 110)]
core_bot = [(1060, 124), (1010, 132), (986, 136), (952, 127), (690, 129)]
core = poly(core_top + core_bot)
core_low = poly([(690, 108.5), (1232, 110)] + core_bot)
edge_low = poly([(694, 137), (956, 138.5), (986, 154), (1012, 144), (1064, 135.5),
                 (1290, 110)], close=False)
ridge_low = poly([(700, 132), (952, 130), (986, 139), (1010, 135), (1060, 127)], close=False)
ridge = poly([(700, 87), (950, 90), (986, 80.5), (1010, 85.5), (1060, 92)], close=False)

GLYPHS = ['m0,-11 l0,22', 'm-5,-11 l0,22 m0,-11 l10,0', 'm-6,-10 l6,20 l6,-20',
          'm-5,11 l5,-22 l5,22', 'm5,-11 l-10,0 l0,22 l10,0',
          'm-5,-11 l10,0 l-10,11 l10,11', 'm0,-11 l0,22 m-6,-16 l12,0',
          'm-5,-11 l0,22 m0,-22 l10,11 l-10,11']
runes, i = [], 0
for row, dy in ((0, -9), (1, 9)):
    x = 748.0 + row * 9
    i += 3
    while x < 1005:
        runes.append((x, 108 + dy + (x - 750) * 0.012, 0.42 - (x - 750) / 3500.0, GLYPHS[(i * 3) % 8]))
        x += 15 + 2 * (i % 4)
        i += 1

# ---------------------------------------------------------------- montage
s = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1311 217" width="1311" height="217">',
     '<title>Lance du Soleil</title>',
     '<g fill="none" stroke="#000" stroke-width="%d" stroke-linejoin="round" stroke-linecap="round">' % SW]
w = s.append

w('\n  <!-- hampe -->')
w('  <path fill="%s" d="%s"/>' % (SILV, poly([(239, 92.5), (551, 92), (551, 121), (239, 120.5)])))
w('  <path stroke="%s" stroke-width="4" d="M 245,97 L 549,96.5"/>' % SILV_M)
w('  <path stroke="%s" stroke-width="6" d="M 245,103 L 549,102.5"/>' % SILV_W)
w('  <path stroke="%s" stroke-width="7" d="M 245,115 L 549,114.5"/>' % SILV_D)
w('  <path fill="%s" d="%s"/>' % (GOLD, poly([(383, 87.5), (401, 87.5), (401, 125.5), (383, 125.5)])))
w('  <path stroke="%s" stroke-width="4" d="M 386,94 L 398,94"/>' % GOLD_P)
w('  <path stroke="%s" stroke-width="7" d="M 386,119 L 398,119"/>' % GOLD_D)

w('\n  <!-- poignee de cuir -->')
w('  <path fill="%s" d="%s"/>' % (BRN, poly([(46, 91), (182, 91), (182, 121), (46, 121)])))
w('  <path stroke="%s" stroke-width="9" d="M 52,101 L 178,101"/>' % BRN_L)
w('  <path stroke="%s" stroke-width="6" d="M 52,117 L 178,117"/>' % BRN_D)
for k in range(9):
    gx = 60 + k * 14.5
    w('  <path stroke="%s" stroke-width="3.5" d="M %s,92 Q %s,106 %s,120"/>' % (BRN_D, f(gx), f(gx + 5), f(gx)))

w('\n  <!-- pommeau -->')
w('  <circle fill="%s" cx="26" cy="106" r="26.5"/>' % SILV)
w('  <path fill="%s" stroke="none" d="M 3,119 A 26.5,26.5 0 0 0 49,119 A 34,34 0 0 1 3,119 Z"/>' % SILV_M)
w('  <path fill="%s" stroke="none" transform="translate(26,106)" '
  'd="M -11,-21 Q -4,-4 -21,-11 L -21,11 Q -4,4 -11,21 L 11,21 Q 4,4 21,11 '
  'L 21,-11 Q 4,-4 11,-21 Z"/>' % SILV_M)
w('  <path fill="%s" d="%s"/>' % (GOLD, poly([(42, 95), (53, 95), (53, 117), (42, 117)])))

w('\n  <!-- bague -->')
w('  <path fill="%s" d="%s"/>' % (SILV, poly([(184, 93), (191, 85.5), (210, 85.5), (216, 93),
                                              (216, 119), (210, 126.5), (191, 126.5), (184, 119)])))
w('  <path stroke="%s" stroke-width="5" d="M 194,93 L 207,93"/>' % SILV_W)
w('  <path stroke="%s" stroke-width="6" d="M 194,119 L 207,119"/>' % SILV_M)
w('  <path fill="%s" d="%s"/>' % (GOLD, poly([(217, 89), (238, 89), (238, 124), (217, 124)])))
w('  <path stroke="%s" stroke-width="4" d="M 221,96 L 234,96"/>' % GOLD_P)
w('  <path stroke="%s" stroke-width="7" d="M 221,117 L 234,117"/>' % GOLD_D)

w('\n  <!-- soleil : etoile a 8 branches -->')
w('  <path fill="%s" d="%s"/>' % (GOLD, star))
for p in facets:
    w('  <path fill="%s" stroke="none" d="%s"/>' % (GOLD_L, p))

w('\n  <!-- garde -->')
w('  <path fill="%s" d="%s"/>' % (GOLD, poly([(547, 106.5), (564, 86), (580, 88), (584, 106.5),
                                              (580, 125), (564, 127)])))
w('  <path fill="%s" stroke="none" d="%s"/>' % (GOLD, poly([(547, 106.5), (564, 127), (580, 125), (584, 106.5)])))

w('\n  <!-- lame -->')
w('  <path fill="%s" d="%s"/>' % (GOLD, blade))
w('  <path stroke="%s" stroke-width="3" d="%s"/>' % (GOLD_D, edge_low))
w('  <path fill="%s" stroke="%s" stroke-width="1.5" d="%s"/>' % (SILV_W, SILV_D, core))
w('  <path fill="%s" stroke="none" d="%s"/>' % (SILV, core_low))
w('  <path stroke="%s" stroke-width="2" d="%s"/>' % (GOLD_P, ridge))
w('  <path stroke="%s" stroke-width="2.5" d="%s"/>' % (GOLD_L, ridge_low))
w('  <g stroke="%s" stroke-width="3" fill="none">' % '#c8c7c6')
for gx, gy, h, g in runes:
    w('    <path transform="translate(%s,%s) scale(1,%s)" d="%s"/>' % (f(gx), f(gy), f(round(h, 2)), g))
w('  </g>')

w('\n  <!-- coeur du soleil -->')
w('  <circle fill="%s" cx="662" cy="107.5" r="43" stroke-width="2.5"/>' % GOLD)
w('  <path fill="%s" stroke="none" d="M 619,107.5 A 43,43 0 0 0 705,107.5 A 60,60 0 0 1 619,107.5 Z"/>' % '#f0a418')
w('  <circle fill="%s" cx="662" cy="107" r="28" stroke-width="2.5"/>' % GOLD)
w('  <path fill="%s" stroke="none" d="M 634,107 A 28,28 0 0 0 690,107 A 40,40 0 0 1 634,107 Z"/>' % GOLD_D)
w('  <ellipse fill="%s" stroke="none" cx="657" cy="94" rx="14" ry="7.5"/>' % GOLD_L)

w('</g>')
w('</svg>')
open('/home/pierre/svg-tmp/sun_spear_simple.svg', 'w').write('\n'.join(s) + '\n')
print('ok')
