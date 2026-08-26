#!/usr/bin/env python3
"""Vectorisation par couches de couleur : quantification -> masques -> potrace.

usage: vectorize.py <src.png> <N couleurs> <sortie.svg> [facteur de suréchantillonnage]
"""
import subprocess, sys, re, os
import numpy as np
from PIL import Image
from scipy import ndimage
from scipy.cluster.vq import kmeans2

SRC = sys.argv[1]
N = int(sys.argv[2])
OUT = sys.argv[3]
F = int(sys.argv[4]) if len(sys.argv) > 4 else 1
TMP = '/tmp/vec/work'
os.makedirs(TMP, exist_ok=True)

im = Image.open(SRC).convert('RGBA')
W, H = im.size

# --- palette calculee sur l'image d'origine (pas sur les pixels d'anti-aliasing) ---
a0 = np.array(im).astype(np.int16)
op = a0[a0[..., 3] > 200][:, :3].astype(np.float64)
strip = Image.fromarray(op.astype(np.uint8).reshape(1, -1, 3))
pal = np.array(strip.quantize(colors=N, method=Image.MEDIANCUT)
               .getpalette()[:N * 3], dtype=np.float64).reshape(N, 3)
centroids, _ = kmeans2(op, pal, iter=30, minit='matrix')

# --- suréchantillonnage : potrace a plus de matiere pour lisser les courbes ---
if F > 1:
    im = im.resize((W * F, H * F), Image.BICUBIC)
a = np.array(im).astype(np.int16)
HH, WW = a.shape[:2]
solid = a[..., 3] > 128
rgb = a[..., :3].astype(np.float64)

def assign(mask, cent):
    flat = rgb[mask]
    d2 = ((flat ** 2).sum(1)[:, None] - 2 * flat @ cent.T + (cent ** 2).sum(1)[None, :])
    return d2.argmin(1)


labels = np.full((HH, WW), -1, dtype=np.int32)
if os.environ.get('CRISP', '0') == '1':
    # les pixels d'anti-aliasing (fort gradient) ne servent ni a la palette ni au
    # tracage : ils sont rattachés a la region pleine la plus proche, ce qui donne
    # des frontieres nettes et supprime les liseres intermediaires
    lumimg = rgb @ np.array([0.299, 0.587, 0.114])
    grad = (ndimage.maximum_filter(lumimg, 3) - ndimage.minimum_filter(lumimg, 3))
    core = solid & (grad < float(os.environ.get('GRAD', '18')))
    core &= ndimage.binary_erosion(solid, struct_pre := np.ones((3, 3), bool))
    op2 = rgb[core]
    strip2 = Image.fromarray(op2.astype(np.uint8).reshape(1, -1, 3))
    pal2 = np.array(strip2.quantize(colors=N, method=Image.MEDIANCUT)
                    .getpalette()[:N * 3], dtype=np.float64).reshape(N, 3)
    centroids, _ = kmeans2(op2, pal2, iter=30, minit='matrix')
    labels[core] = assign(core, centroids)
    todo = solid & ~core
    _, (iy, ix) = ndimage.distance_transform_edt(~core, return_indices=True)
    labels[todo] = labels[iy[todo], ix[todo]]
else:
    labels[solid] = assign(solid, centroids)
used = np.unique(labels[solid])
centroids = centroids[used]
remap = np.full(N, 0, dtype=np.int32)
remap[used] = np.arange(len(used))
labels = np.where(solid, remap[np.clip(labels, 0, N - 1)], -1)
K = len(centroids)
lum = centroids @ np.array([0.299, 0.587, 0.114])
dark_lbl = lum < 70

# --- filtre majoritaire 3x3 : enleve le grain sans toucher aux traits sombres ---
if os.environ.get('MAJ', '1') == '1':
    scores = np.stack([ndimage.uniform_filter((labels == k).astype(np.float32), 3)
                       for k in range(K)])
    maj = scores.argmax(0)
    keep = solid & ~dark_lbl[np.clip(labels, 0, K - 1)] & ~dark_lbl[maj]
    labels = np.where(keep, maj, labels)
    labels[~solid] = -1

areas = np.array([(labels == k).sum() for k in range(K)])
# ordre de dessin : grandes zones d'abord, traits sombres (contours) en dernier
order = (sorted([k for k in range(K) if not dark_lbl[k]], key=lambda k: -areas[k])
         + sorted([k for k in range(K) if dark_lbl[k]], key=lambda k: -areas[k]))

struct = np.ones((3, 3), bool)


def trace(mask, name, turd):
    arr = np.where(mask, 0, 255).astype(np.uint8)
    pbm, svg = f'{TMP}/{name}.pbm', f'{TMP}/{name}.svg'
    Image.fromarray(arr).convert('1').save(pbm)
    subprocess.run(['potrace', pbm, '-s', '-o', svg, '-t', str(turd), '-a', '1.0',
                    '-O', os.environ.get('OPT', '0.4'), '-u', os.environ.get('UNIT', '10'),
                    '-z', 'majority'], check=True)
    txt = open(svg).read()
    ds = re.findall(r'<path d="(.*?)"', txt, re.S)
    tr = re.search(r'<g transform="([^"]+)"', txt)
    return ds, (tr.group(1) if tr else None)


paths, transform = [], None
for i, k in enumerate(order):
    m = labels == k
    if m.sum() < 3 * F * F:
        continue
    if not dark_lbl[k]:          # les couches claires debordent d'1px (anti-fissures)
        m = ndimage.binary_dilation(m, struct)
    m &= solid
    ds, tr = trace(m, f'L{i:02d}', max(2, 2 * F * F))
    transform = transform or tr
    if ds:
        col = '#%02x%02x%02x' % tuple(np.clip(np.round(centroids[k]), 0, 255).astype(int))
        paths.append((col, ' '.join(d.strip() for d in ds)))

scale = f'scale({1.0 / F:.6g}) ' if F > 1 else ''
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">',
       f'<g transform="{scale}{transform}" stroke="none">']
for col, d in paths:
    svg.append(f'<path fill="{col}" d="{d}"/>')
svg += ['</g></svg>']
open(OUT, 'w').write('\n'.join(svg))
print(f'{len(paths)} couches, {os.path.getsize(OUT)/1024:.0f} Ko -> {OUT}')
