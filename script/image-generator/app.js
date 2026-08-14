// Générateur d'images de puces et d'apparats — remplace les scripts GIMP.
// Rendu canvas 2D suréchantillonné 4×, export PNG via File System Access API.

const STORAGE_KEY = 'lw-image-generator'

const ART_OFF = { glow: 0, shine: 0, vignette: 0, rimLight: 0, innerLine: false }
const RELIEF_OFF = { reliefOn: false, bevel: 22, relief: 55, specular: 45 }
const CLASSIC_OFF = { classicOn: false, haloWidth: 5, bgPale: 52, customHalo: true, blackFrame: 0, cropToContent: true, cornerCut: 0, cutBothCorners: true, pompCutInverted: true, pompGlyphScale: 65, pompBorderWidth: 6 }
const PRESETS = {
	// Les puces actuelles du jeu, dérondies et déglacées : la recette du script
	// GIMP avec radius 0 et plus aucun reflet. Réglages validés par Pierre.
	// Ne PAS activer `outlineOn` ici : le cerne noir est obtenu par dilatation
	// du masque et avale les détails fins (points du bandage, jugulaire du
	// casque) à 100 px.
	classique: { radius: 0, bgTint: 0, bgGradient: 0, borderWidth: 5, borderAlpha: 100, borderBlack: false, glyphScale: 70, shadowOn: false, shadowOffset: 4, shadowAlpha: 45, strip: false, cornerBadge: false, outlineOn: false, outlineWidth: 3, duotone: 25, bgOn: true,
		glow: 0, shine: 0, vignette: 50, rimLight: 0, innerLine: false,
		reliefOn: false, bevel: 31, relief: 55, specular: 45,
		classicOn: true, haloWidth: 5, bgPale: 90, customHalo: true, blackFrame: 2, cropToContent: true, cornerCut: 0, cutBothCorners: true, pompCutInverted: true, pompGlyphScale: 65, pompBorderWidth: 6 },
	relief: { radius: 2, bgTint: 16, bgGradient: 10, borderWidth: 3.5, borderAlpha: 100, borderBlack: true, glyphScale: 76, shadowOn: true, shadowOffset: 2.5, shadowAlpha: 35, strip: false, cornerBadge: false, outlineOn: true, outlineWidth: 2, duotone: 30, bgOn: true,
		glow: 28, shine: 8, vignette: 18, rimLight: 0, innerLine: false,
		reliefOn: true, bevel: 22, relief: 55, specular: 45 , ...CLASSIC_OFF },
	// Comme les images d'armes et de composants : l'objet seul, détouré, sans
	// fond — c'est le slot du site qui fournit le cadre.
	detoure: { radius: 0, bgTint: 0, bgGradient: 0, borderWidth: 0, borderAlpha: 0, borderBlack: true, glyphScale: 88, shadowOn: false, shadowOffset: 2.5, shadowAlpha: 35, strip: false, cornerBadge: false, outlineOn: true, outlineWidth: 2.5, duotone: 30, bgOn: false,
		glow: 0, shine: 0, vignette: 0, rimLight: 0, innerLine: false,
		reliefOn: true, bevel: 24, relief: 60, specular: 50 , ...CLASSIC_OFF },
	illustre: { radius: 2, bgTint: 22, bgGradient: 14, borderWidth: 3.5, borderAlpha: 100, borderBlack: true, glyphScale: 70, shadowOn: false, shadowOffset: 3, shadowAlpha: 45, strip: false, cornerBadge: false, outlineOn: false, outlineWidth: 3, duotone: 30, bgOn: true,
		glow: 55, shine: 13, vignette: 22, rimLight: 55, innerLine: true, ...RELIEF_OFF, ...CLASSIC_OFF },
	'ligne-claire': { radius: 2, bgTint: 13, bgGradient: 0, borderWidth: 3.5, borderAlpha: 100, borderBlack: true, glyphScale: 70, shadowOn: true, shadowOffset: 3, shadowAlpha: 45, strip: true,  cornerBadge: false, outlineOn: false, outlineWidth: 3, duotone: 15, bgOn: true, ...ART_OFF, ...RELIEF_OFF, ...CLASSIC_OFF },
	pixel:    { radius: 2, bgTint: 13, bgGradient: 0, borderWidth: 1.5, borderAlpha: 90, borderBlack: false, glyphScale: 68, shadowOn: true,  shadowOffset: 3, shadowAlpha: 45, strip: true,  cornerBadge: false, outlineOn: false, outlineWidth: 3, duotone: 0, bgOn: true, ...ART_OFF, ...RELIEF_OFF, ...CLASSIC_OFF },
	plat:     { radius: 2, bgTint: 12, bgGradient: 0, borderWidth: 1.5, borderAlpha: 90, borderBlack: false, glyphScale: 70, shadowOn: false, shadowOffset: 3, shadowAlpha: 45, strip: false, cornerBadge: false, outlineOn: false, outlineWidth: 3, duotone: 0, bgOn: true, ...ART_OFF, ...RELIEF_OFF, ...CLASSIC_OFF },
	encadre:  { radius: 0, bgTint: 8,  bgGradient: 0, borderWidth: 3,   borderAlpha: 100, borderBlack: false, glyphScale: 66, shadowOn: true, shadowOffset: 2.5, shadowAlpha: 40, strip: false, cornerBadge: true, outlineOn: false, outlineWidth: 3, duotone: 0, bgOn: true, ...ART_OFF, ...RELIEF_OFF, ...CLASSIC_OFF },
	immersif: { radius: 4, bgTint: 24, bgGradient: 10, borderWidth: 0,  borderAlpha: 0,  borderBlack: false, glyphScale: 72, shadowOn: true,  shadowOffset: 3.5, shadowAlpha: 55, strip: false, cornerBadge: false, outlineOn: false, outlineWidth: 3, duotone: 0, bgOn: true, ...ART_OFF, ...RELIEF_OFF, ...CLASSIC_OFF },
}

const CONFIG_VERSION = 6

const state = {
	params: { ...PRESETS.classique },
	preset: 'classique',
	palette: JSON.parse(JSON.stringify(CATEGORIES)),
	overrides: {},   // nom de puce → catégorie corrigée à la main
	theme: 'dark',
}

const items = []      // { name, kind: 'chip'|'pomp', type, guess, img, bbox, canvas, label }
let labels = {}       // nom → libellé FR
let renderQueued = false

// ---------------------------------------------------------------------------
// Couleurs

function hexToRgb(hex) {
	const n = parseInt(hex.slice(1), 16)
	return [n >> 16 & 255, n >> 8 & 255, n & 255]
}
function rgbToHex([r, g, b]) {
	return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
}
function mix(hexA, hexB, t) {
	const a = hexToRgb(hexA), b = hexToRgb(hexB)
	return rgbToHex([0, 1, 2].map(i => a[i] + (b[i] - a[i]) * t))
}
function alpha(hex, a) {
	const [r, g, b] = hexToRgb(hex)
	return `rgba(${r},${g},${b},${a})`
}

// Les deux fonctions du script GIMP historique (leekwars_chips.py), reprises à
// l'identique : elles définissent le rendu des puces actuelles du jeu.
// `dark` multiplie la luminosité en RGB ; `light` désature et éclaircit en HSV.
function darkColor(hex, d) {
	return rgbToHex(hexToRgb(hex).map(v => v * d / 100))
}
function lightColor(hex, l) {
	const [r, g, b] = hexToRgb(hex).map(v => v / 255)
	const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min
	let h = 0
	if (delta) {
		if (max === r) h = ((g - b) / delta) % 6
		else if (max === g) h = (b - r) / delta + 2
		else h = (r - g) / delta + 4
	}
	h /= 6
	if (h < 0) h += 1
	const s = max === 0 ? 0 : delta / max
	const v = max
	const s2 = s * (l / 100)
	const v2 = v + (1 - v) * (l / 100)
	const i = Math.floor(h * 6), f = h * 6 - i
	const p = v2 * (1 - s2), q = v2 * (1 - f * s2), t = v2 * (1 - (1 - f) * s2)
	const table = [[v2, t, p], [q, v2, p], [p, v2, t], [p, q, v2], [t, p, v2], [v2, p, q]]
	return rgbToHex(table[i % 6].map(c => c * 255))
}

// ---------------------------------------------------------------------------
// Chargement des sources

function loadImage(url) {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.onload = () => resolve(img)
		img.onerror = () => reject(new Error('Image introuvable : ' + url))
		img.src = url
	})
}

// SVG d'apparat sans PNG noir : on retire le template badge et les restes
// hérités, puis on force un fill noir opaque sur ce qui reste.
async function loadPompSvgGlyph(pomp) {
	const text = await fetch(PATHS.pompSvg + pomp.svg).then(r => r.text())
	const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
	for (const id of [...POMP_TEMPLATE_IDS, ...(pomp.leftovers || [])]) {
		doc.getElementById(id)?.remove()
	}
	for (const el of doc.querySelectorAll('path, rect, circle, ellipse')) {
		el.style.fill = '#000'
		el.style.fillOpacity = '1'
		el.style.stroke = 'none'
	}
	const blob = new Blob([new XMLSerializer().serializeToString(doc)], { type: 'image/svg+xml' })
	const url = URL.createObjectURL(blob)
	try {
		return await loadImage(url)
	} finally {
		URL.revokeObjectURL(url)
	}
}

// Boîte englobante de l'alpha, pour recadrer le glyphe quel que soit le
// padding de la source. Calculée sur une version réduite pour rester rapide.
function alphaBBox(img) {
	const M = 300
	const scale = Math.min(1, M / Math.max(img.width, img.height))
	const w = Math.max(1, Math.round(img.width * scale)), h = Math.max(1, Math.round(img.height * scale))
	const c = document.createElement('canvas')
	c.width = w; c.height = h
	const ctx = c.getContext('2d', { willReadFrequently: true })
	ctx.drawImage(img, 0, 0, w, h)
	const data = ctx.getImageData(0, 0, w, h).data
	let x0 = w, y0 = h, x1 = 0, y1 = 0
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			if (data[(y * w + x) * 4 + 3] > 8) {
				if (x < x0) x0 = x
				if (x > x1) x1 = x
				if (y < y0) y0 = y
				if (y > y1) y1 = y
			}
		}
	}
	if (x1 < x0) return { x: 0, y: 0, w: img.width, h: img.height }
	return {
		x: x0 / scale, y: y0 / scale,
		w: (x1 - x0 + 1) / scale, h: (y1 - y0 + 1) / scale,
	}
}

// ---------------------------------------------------------------------------
// Rendu

function typeOf(item) {
	return state.overrides[item.name] || item.type
}

// Zone du fichier source à dessiner. Par défaut on recadre sur le contenu
// (bounding-box alpha), ce qui normalise la taille de tous les glyphes.
// `cropToContent: false` reprend le canevas entier, marge comprise : c'est ce
// que faisait l'ancien script GIMP, d'où des icônes plus petites quand leur
// source avait du vide autour (motivation, adrenaline, rage : 200×200 dans un
// canevas de 250×250).
function sourceRect(item) {
	// Les apparats sont TOUJOURS recadrés : leurs sources n'ont aucune
	// convention de canevas commune (hold_weapon 149×149, metal 2000×2000, et
	// happy/angry sont extraits de SVG à la volée), donc garder les marges
	// donnerait des tailles incohérentes.
	if (item.kind === 'pomp') return item.bbox
	if (state.params.cropToContent === false) {
		return { x: 0, y: 0, w: item.img.width, h: item.img.height }
	}
	return item.bbox
}

// Glyphe recadré, recoloré par l'alpha, ajusté en "contain" dans un carré.
// `duotone` > 0 : dégradé vertical vers une teinte assombrie (modelé façon
// images d'altérations).
function tintedGlyph(item, color, box, duotone = 0) {
	const c = document.createElement('canvas')
	c.width = c.height = Math.ceil(box)
	const ctx = c.getContext('2d')
	const b = sourceRect(item)
	const scale = Math.min(box / b.w, box / b.h)
	const dw = b.w * scale, dh = b.h * scale
	ctx.imageSmoothingQuality = 'high'
	ctx.drawImage(item.img, b.x, b.y, b.w, b.h, (box - dw) / 2, (box - dh) / 2, dw, dh)
	ctx.globalCompositeOperation = 'source-in'
	if (duotone > 0) {
		const g = ctx.createLinearGradient(0, 0, 0, box)
		g.addColorStop(0, mix(color, '#FFFFFF', duotone * 0.45 / 100))
		g.addColorStop(1, mix(color, '#000000', duotone / 100))
		ctx.fillStyle = g
	} else {
		ctx.fillStyle = color
	}
	ctx.fillRect(0, 0, box, box)
	return c
}

// --- Relief : volume calculé depuis la silhouette -------------------------
// Les icônes sources sont des aplats noirs. Pour leur donner du volume, on
// calcule la distance de chaque pixel au bord de la forme (chamfer deux
// passes), on en déduit une hauteur en dôme, puis une normale, et on éclaire
// en Lambert + spéculaire. C'est ce qui rapproche le rendu des images
// d'altérations (volumes 3D cernés de noir).
const reliefCache = new Map()
function clearReliefCache() { reliefCache.clear() }

function reliefGlyph(item, accent, box, P) {
	const size = Math.max(2, Math.ceil(box))
	const key = [item.name, size, accent, P.bevel, P.relief, P.specular, P.cropToContent].join('|')
	const hit = reliefCache.get(key)
	if (hit) return hit

	const c = document.createElement('canvas')
	c.width = c.height = size
	const ctx = c.getContext('2d', { willReadFrequently: true })
	const b = sourceRect(item)
	const scale = Math.min(size / b.w, size / b.h)
	const dw = b.w * scale, dh = b.h * scale
	ctx.imageSmoothingQuality = 'high'
	ctx.drawImage(item.img, b.x, b.y, b.w, b.h, (size - dw) / 2, (size - dh) / 2, dw, dh)

	const img = ctx.getImageData(0, 0, size, size)
	const data = img.data
	const n = size * size
	const INF = 1e9
	const dist = new Float32Array(n)
	for (let i = 0; i < n; i++) dist[i] = data[i * 4 + 3] > 127 ? INF : 0

	const D = 1, Q = Math.SQRT2
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const i = y * size + x
			if (dist[i] === 0) continue
			let d = dist[i]
			if (x > 0) d = Math.min(d, dist[i - 1] + D)
			if (y > 0) d = Math.min(d, dist[i - size] + D)
			if (x > 0 && y > 0) d = Math.min(d, dist[i - size - 1] + Q)
			if (x < size - 1 && y > 0) d = Math.min(d, dist[i - size + 1] + Q)
			dist[i] = d
		}
	}
	for (let y = size - 1; y >= 0; y--) {
		for (let x = size - 1; x >= 0; x--) {
			const i = y * size + x
			if (dist[i] === 0) continue
			let d = dist[i]
			if (x < size - 1) d = Math.min(d, dist[i + 1] + D)
			if (y < size - 1) d = Math.min(d, dist[i + size] + D)
			if (x < size - 1 && y < size - 1) d = Math.min(d, dist[i + size + 1] + Q)
			if (x > 0 && y < size - 1) d = Math.min(d, dist[i + size - 1] + Q)
			dist[i] = d
		}
	}

	// Hauteur en dôme : monte vite au bord puis s'aplatit au centre.
	const R = Math.max(1.5, P.bevel / 100 * size * 0.5)
	const H = new Float32Array(n)
	for (let i = 0; i < n; i++) H[i] = Math.sin(Math.min(1, dist[i] / R) * Math.PI / 2)

	// Éclairage haut-gauche, comme les rendus d'items.
	const [lx, ly, lz] = [-0.55, -0.62, 0.56]
	const ln = Math.hypot(lx, ly, lz)
	const L = [lx / ln, ly / ln, lz / ln]
	const strength = Math.max(0.05, P.relief / 100) * 2.2
	const ks = P.specular / 100
	const [ar, ag, ab] = hexToRgb(accent)

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const i = y * size + x
			if (data[i * 4 + 3] === 0) continue
			const xm = x > 0 ? i - 1 : i, xp = x < size - 1 ? i + 1 : i
			const ym = y > 0 ? i - size : i, yp = y < size - 1 ? i + size : i
			// Normale : pente du champ de hauteur, amplifiée par `strength`.
			let nx = (H[xm] - H[xp]) * strength * size / 100
			let ny = (H[ym] - H[yp]) * strength * size / 100
			const nz = 1
			const nl = Math.hypot(nx, ny, nz)
			nx /= nl; ny /= nl
			const diff = Math.max(0, nx * L[0] + ny * L[1] + (nz / nl) * L[2])
			// Spéculaire Blinn-Phong, vue de face.
			const hz = L[2] + 1
			const hn = Math.hypot(L[0], L[1], hz)
			const spec = Math.pow(Math.max(0, nx * L[0] / hn + ny * L[1] / hn + (nz / nl) * hz / hn), 22) * ks
			const lit = 0.42 + 0.78 * diff
			data[i * 4]     = Math.min(255, ar * lit + 255 * spec)
			data[i * 4 + 1] = Math.min(255, ag * lit + 255 * spec)
			data[i * 4 + 2] = Math.min(255, ab * lit + 255 * spec)
		}
	}
	ctx.putImageData(img, 0, 0)
	if (reliefCache.size > 600) reliefCache.clear()
	reliefCache.set(key, c)
	return c
}

// Glyphe recadré, rempli d'un dégradé vertical entre deux couleurs.
function gradientGlyph(item, box, top, bottom) {
	const c = document.createElement('canvas')
	c.width = c.height = Math.ceil(box)
	const ctx = c.getContext('2d')
	const b = sourceRect(item)
	const scale = Math.min(box / b.w, box / b.h)
	const dw = b.w * scale, dh = b.h * scale
	ctx.imageSmoothingQuality = 'high'
	ctx.drawImage(item.img, b.x, b.y, b.w, b.h, (box - dw) / 2, (box - dh) / 2, dw, dh)
	ctx.globalCompositeOperation = 'source-in'
	const g = ctx.createLinearGradient(0, 0, 0, box)
	g.addColorStop(0, top)
	g.addColorStop(1, bottom)
	ctx.fillStyle = g
	ctx.fillRect(0, 0, box, box)
	return c
}

// Silhouette dilatée d'un glyphe, remplie d'un dégradé vertical — le « contour
// du dessin » de l'ancien script (selection_grow + blend).
// `colors` : 2 teintes = dégradé vertical (cas courant). 3+ = dégradé CONIQUE
// autour du centre : c'est ainsi qu'est fait le halo du prisme d'origine, le
// spectre tourne autour du glyphe (vert en haut, cyan à gauche, magenta en bas).
function dilatedGlyph(glyph, grow, colors) {
	const size = glyph.width + 2 * grow
	const c = document.createElement('canvas')
	c.width = c.height = Math.ceil(size)
	const ctx = c.getContext('2d')
	for (const [radius, steps] of [[grow, 28], [grow * 0.55, 14]]) {
		for (let i = 0; i < steps; i++) {
			const a = i / steps * 2 * Math.PI
			ctx.drawImage(glyph, grow + Math.cos(a) * radius, grow + Math.sin(a) * radius)
		}
	}
	ctx.drawImage(glyph, grow, grow)
	ctx.globalCompositeOperation = 'source-in'
	const conic = colors.length > 2
	const g = conic
		? ctx.createConicGradient(-Math.PI / 2, size / 2, size / 2)  // départ en haut
		: ctx.createLinearGradient(0, 0, 0, size)
	if (conic) {
		colors.forEach((color, i) => g.addColorStop(i / colors.length, color))
		g.addColorStop(1, colors[0])                                  // boucle fermée
	} else {
		colors.forEach((color, i) => g.addColorStop(i / (colors.length - 1), color))
	}
	ctx.fillStyle = g
	ctx.fillRect(0, 0, size, size)
	return c
}

// Reflet diagonal traversant la tuile.
function drawShine(ctx, S, u, P) {
	if (!(P.shine > 0)) return
	ctx.save()
	tileShape(ctx, 0, 0, S, S, P.radius * u,
		P.classicOn ? (P.cornerCut || 0) * u : 0, P.cutBothCorners !== false)
	ctx.clip()
	const g = ctx.createLinearGradient(0, 0, S, S)
	const a = P.shine / 100
	g.addColorStop(0.20, 'rgba(255,255,255,0)')
	g.addColorStop(0.25, `rgba(255,255,255,${a})`)
	g.addColorStop(0.42, `rgba(255,255,255,${a * 0.35})`)
	g.addColorStop(0.47, 'rgba(255,255,255,0)')
	ctx.fillStyle = g
	ctx.fillRect(0, 0, S, S)
	ctx.restore()
}

// Rendu « puce classique » : la recette du script GIMP, mais à angles droits et
// avec un reflet discret. Fond pastel clair, glyphe sombre, bordure épaisse —
// l'inverse de la polarité des autres préréglages.
function renderClassic(ctx, item, S, u, cat, P) {
	const accent = cat.dark
	// Une catégorie peut fournir un `scheme` explicite au lieu de dériver ses
	// couleurs de l'accent : c'est le cas des apparats (fond bleu, glyphe doré,
	// donc polarité inverse des puces).
	const sch = cat.scheme
	const fw = (P.blackFrame || 0) * u      // cadre noir extérieur
	// Bordure propre aux apparats : la leur est plus large que celle des puces.
	const bWidth = item.kind === 'pomp' ? (P.pompBorderWidth || P.borderWidth) : P.borderWidth
	const bw = fw + bWidth * u              // + bordure colorée
	const r = P.radius * u
	const cut = (P.cornerCut || 0) * u
	const both = P.cutBothCorners !== false
	// Les apparats coupent les coins opposés à ceux des puces : même famille
	// visuelle, mais on distingue les deux d'un coup d'œil.
	const inv = item.kind === 'pomp' ? P.pompCutInverted !== false : false

	// Cadre noir sur tout le pourtour de l'image
	if (fw > 0) {
		tileShape(ctx, 0, 0, S, S, r, cut, both, inv)
		ctx.fillStyle = '#000000'
		ctx.fill()
	}

	tileShape(ctx, fw, fw, S - 2 * fw, S - 2 * fw, Math.max(0, r - fw),
		cut - fw * CUT_INSET_RATIO, both, inv)
	let g = ctx.createLinearGradient(0, 0, 0, S)
	g.addColorStop(0, sch ? sch.ink : darkColor(accent, 30))
	g.addColorStop(1, sch ? sch.ink2 : darkColor(accent, 50))
	ctx.fillStyle = g
	ctx.fill()

	tileShape(ctx, bw, bw, S - 2 * bw, S - 2 * bw, Math.max(0, r - bw),
		cut - bw * CUT_INSET_RATIO, both, inv)
	g = ctx.createLinearGradient(0, 0, 0, S)
	g.addColorStop(0, sch ? sch.bg : lightColor(accent, P.bgPale))
	g.addColorStop(1, sch ? sch.bgDeep : lightColor(accent, P.bgPale * 0.3))
	ctx.fillStyle = g
	ctx.fill()

	// Les apparats ont leur propre échelle : leurs glyphes sont détourés au
	// plus juste (faces, plaques) et remplissaient trop la tuile à l'échelle
	// des puces.
	const scale = item.kind === 'pomp' ? (P.pompGlyphScale || P.glyphScale) : P.glyphScale
	// `item.scale` : correction par item. Les visages (happy/angry) sont
	// extraits des SVG sans aucune marge, ils remplissent donc bien plus la
	// tuile que les autres apparats à échelle égale.
	const box = scale * (item.scale || 1) / 100 * S
	const gx = (S - box) / 2, gy = (S - box) / 2
	// Dégradé du glyphe : `duotone` en règle l'écart autour d'une luminosité
	// moyenne de 30. À 25 on retrouve exactement le 40 → 20 du script GIMP.
	const spread = (P.duotone || 0) * 0.4
	const glyph = P.reliefOn
		? reliefGlyph(item, sch ? sch.ink : darkColor(accent, 55), box, P)
		: sch
			? gradientGlyph(item, box, sch.ink, sch.ink2)
			: gradientGlyph(item, box, darkColor(accent, 30 + spread), darkColor(accent, 30 - spread))
	const outline = P.outlineOn ? P.outlineWidth * u : 0

	// Empilement : halo clair au plus loin, puis cerne noir, puis le glyphe.
	// Découpé sur la forme intérieure, sinon le halo déborderait dans les
	// coins coupés, qui doivent rester transparents.
	ctx.save()
	tileShape(ctx, bw, bw, S - 2 * bw, S - 2 * bw, Math.max(0, r - bw),
		cut - bw * CUT_INSET_RATIO, both, inv)
	ctx.clip()
	if (P.haloWidth > 0) {
		const grow = P.haloWidth * u + outline
		// Le bas du halo prend la couleur de caractéristique quand la puce en a
		// une : c'est le reflet bleu des tactiques grises, orange des protéines.
		const custom = P.customHalo === false ? null : CUSTOM_HALO[item.name]
		let colors
		if (sch) {
			colors = [sch.bgDeep, sch.bgDeep]  // cerne sombre autour du glyphe doré
		} else if (Array.isArray(custom)) {
			colors = custom.map(c => lightColor(c, 78))          // arc-en-ciel (prisme)
		} else if (custom) {
			colors = [lightColor(accent, 20), lightColor(custom, 60)]
		} else {
			colors = [lightColor(accent, 20), lightColor(accent, 55)]
		}
		const halo = dilatedGlyph(glyph, grow, colors)
		ctx.drawImage(halo, gx - grow, gy - grow)
	}
	if (outline > 0) {
		const black = dilatedGlyph(glyph, outline, ['#000000', '#000000'])
		ctx.drawImage(black, gx - outline, gy - outline)
	}
	ctx.drawImage(glyph, gx, gy)
	ctx.restore()

	// Vignettage, à l'intérieur de la bordure
	if (P.vignette > 0) {
		const g2 = ctx.createRadialGradient(S / 2, S / 2, S * 0.42, S / 2, S / 2, S * 0.75)
		g2.addColorStop(0, 'rgba(0,0,0,0)')
		g2.addColorStop(1, `rgba(0,0,0,${P.vignette / 100 * 0.35})`)
		tileShape(ctx, bw, bw, S - 2 * bw, S - 2 * bw, Math.max(0, r - bw),
			cut - bw * CUT_INSET_RATIO, both, inv)
		ctx.fillStyle = g2
		ctx.fill()
	}
}

// Recolore un canvas existant par son alpha.
function tintCanvas(src, color) {
	const c = document.createElement('canvas')
	c.width = src.width
	c.height = src.height
	const ctx = c.getContext('2d')
	ctx.drawImage(src, 0, 0)
	ctx.globalCompositeOperation = 'source-in'
	ctx.fillStyle = color
	ctx.fillRect(0, 0, c.width, c.height)
	return c
}

// Glyphe final : remplissage accent (modelé éventuel) + contour noir
// « ligne claire » obtenu en tamponnant le masque noir en couronne
// (dilatation). Les découpes intérieures du glyphe deviennent des lignes
// noires, comme sur les images d'armes et de composants.
function composedGlyph(item, accent, box, outline, duotone, P) {
	const inner = Math.max(1, box - 2 * outline)
	const fill = P && P.reliefOn
		? reliefGlyph(item, accent, inner, P)
		: tintedGlyph(item, accent, inner, duotone)
	const c = document.createElement('canvas')
	c.width = c.height = Math.ceil(box)
	const ctx = c.getContext('2d')
	const m = (box - inner) / 2
	if (outline > 0) {
		const black = tintCanvas(fill, '#000000')
		for (const [radius, steps] of [[outline, 24], [outline * 0.55, 12]]) {
			for (let i = 0; i < steps; i++) {
				const a = i / steps * 2 * Math.PI
				ctx.drawImage(black, m + Math.cos(a) * radius, m + Math.sin(a) * radius)
			}
		}
	}
	ctx.drawImage(fill, m, m)
	return c
}

// Forme de la tuile : rectangle dont les coins haut-gauche et bas-droit sont
// coupés à 45°. `cut` = longueur du côté coupé, en pixels.
// Pour une forme insérée de `d`, la coupe raccourcit de d·(2 − √2) : c'est ce
// qui garde les diagonales parallèles entre le cadre noir, la bordure et le fond.
const CUT_INSET_RATIO = 2 - Math.SQRT2

// `inverted` : coupe haut-droit + bas-gauche au lieu de haut-gauche + bas-droit.
function cutRectPath(ctx, x, y, w, h, cut, bothCorners, inverted) {
	const c = Math.max(0, Math.min(cut, Math.min(w, h) / 2))
	ctx.beginPath()
	if (inverted) {
		ctx.moveTo(x, y)
		ctx.lineTo(x + w - c, y)
		ctx.lineTo(x + w, y + c)
		ctx.lineTo(x + w, y + h)
		if (bothCorners) {
			ctx.lineTo(x + c, y + h)
			ctx.lineTo(x, y + h - c)
		} else {
			ctx.lineTo(x, y + h)
		}
	} else {
		ctx.moveTo(x + c, y)
		ctx.lineTo(x + w, y)
		if (bothCorners) {
			ctx.lineTo(x + w, y + h - c)
			ctx.lineTo(x + w - c, y + h)
		} else {
			ctx.lineTo(x + w, y + h)
		}
		ctx.lineTo(x, y + h)
		ctx.lineTo(x, y + c)
	}
	ctx.closePath()
}

// Chemin de tuile : coins coupés si demandé, sinon rectangle (arrondi ou non).
function tileShape(ctx, x, y, w, h, r, cut, bothCorners, inverted) {
	if (cut > 0) cutRectPath(ctx, x, y, w, h, cut, bothCorners, inverted)
	else roundRectPath(ctx, x, y, w, h, r)
}

function roundRectPath(ctx, x, y, w, h, r) {
	ctx.beginPath()
	if (ctx.roundRect) {
		ctx.roundRect(x, y, w, h, r)
	} else {
		ctx.rect(x, y, w, h)
	}
}

// Dessine une tuile dans `canvas` à la taille `outSize` (rendu interne 4×).
function renderInto(canvas, item, theme, outSize) {
	const P = state.params
	const S = outSize * 4
	const u = S / 100                       // unité : 1/100 de tuile
	const cat = state.palette[typeOf(item)] || state.palette.other
	const accent = theme === 'dark' ? cat.dark : cat.light
	const base = BASE[theme]

	const off = document.createElement('canvas')
	off.width = off.height = S
	const ctx = off.getContext('2d')

	// Puce classique : tuile autonome, donc identique dans les deux thèmes
	// (c'est déjà le cas des images du jeu aujourd'hui).
	if (P.classicOn) {
		renderClassic(ctx, item, S, u, cat, P)
		drawShine(ctx, S, u, P)
		canvas.width = canvas.height = outSize
		const done = canvas.getContext('2d')
		done.imageSmoothingQuality = 'high'
		done.clearRect(0, 0, outSize, outSize)
		done.drawImage(off, 0, 0, outSize, outSize)
		return
	}

	// Fond teinté (plat ou dégradé diagonal)
	if (P.bgOn) {
		roundRectPath(ctx, 0, 0, S, S, P.radius * u)
		if (P.bgGradient > 0) {
			const g = ctx.createLinearGradient(0, 0, S, S)
			g.addColorStop(0, mix(base, accent, (P.bgTint + P.bgGradient) / 100))
			g.addColorStop(1, mix(base, accent, Math.max(0, P.bgTint - P.bgGradient) / 100))
			ctx.fillStyle = g
		} else {
			ctx.fillStyle = mix(base, accent, P.bgTint / 100)
		}
		ctx.fill()
	}

	// Liseré pointillé bas (signature du redesign : repeating-linear-gradient)
	if (P.bgOn && P.strip) {
		ctx.fillStyle = accent
		const h = 3 * u, y = S - 7 * u - h, inset = 10 * u, dash = 6 * u, gap = 4 * u
		const n = Math.floor((S - 2 * inset + gap) / (dash + gap))
		let x = (S - (n * dash + (n - 1) * gap)) / 2
		for (let i = 0; i < n; i++, x += dash + gap) {
			ctx.fillRect(x, y, dash, h)
		}
	}

	// Carré de coin (rappel de la pastille de niveau des slots)
	if (P.bgOn && P.cornerBadge) {
		const b = 12 * u, m = 7 * u
		ctx.fillStyle = accent
		ctx.fillRect(S - m - b, S - m - b, b, b)
	}

	// Vignettage : coins assombris, concentre la lumière au centre
	// (plus discret en clair pour ne pas salir le fond crème)
	if (P.bgOn && P.vignette > 0) {
		const g = ctx.createRadialGradient(S / 2, S / 2, S * 0.42, S / 2, S / 2, S * 0.75)
		g.addColorStop(0, 'rgba(0,0,0,0)')
		g.addColorStop(1, `rgba(0,0,0,${P.vignette / 100 * (theme === 'dark' ? 0.4 : 0.22)})`)
		roundRectPath(ctx, 0, 0, S, S, P.radius * u)
		ctx.fillStyle = g
		ctx.fill()
	}

	const box = P.glyphScale / 100 * S
	const gx = (S - box) / 2, gy = (S - box) / 2
	const outline = P.outlineOn ? P.outlineWidth * u : 0
	const glyph = composedGlyph(item, accent, box, outline, P.duotone || 0, P)

	// Halo lumineux : silhouette floutée derrière le glyphe.
	// Toujours l'accent VIF (variante sombre) : l'accent profond du thème
	// clair flouté sur crème donne une auréole boueuse.
	if (P.glow > 0) {
		const silhouette = tintCanvas(glyph, cat.dark)
		ctx.save()
		ctx.filter = `blur(${9 * u}px)`
		ctx.globalAlpha = Math.min(1, P.glow / 100)
		ctx.drawImage(silhouette, gx, gy)
		ctx.filter = `blur(${3.5 * u}px)`
		ctx.globalAlpha = P.glow / 100 * 0.5
		ctx.drawImage(silhouette, gx, gy)
		ctx.restore()
	}

	// Ombre dure puis glyphe (contour noir compris dans la taille)
	if (P.shadowOn) {
		ctx.globalAlpha = P.shadowAlpha / 100
		ctx.drawImage(tintCanvas(glyph, mix(accent, '#000000', 0.6)), gx + P.shadowOffset * u, gy + P.shadowOffset * u)
		ctx.globalAlpha = 1
	}
	ctx.drawImage(glyph, gx, gy)

	// Éclat de bord : liseré clair sur les arêtes haut-gauche du glyphe
	if (P.rimLight > 0) {
		const rim = document.createElement('canvas')
		rim.width = rim.height = glyph.width
		const rctx = rim.getContext('2d')
		rctx.drawImage(glyph, 0, 0)
		rctx.globalCompositeOperation = 'destination-out'
		rctx.drawImage(glyph, 2.2 * u, 2.2 * u)
		rctx.globalCompositeOperation = 'source-in'
		rctx.fillStyle = mix(accent, '#FFFFFF', 0.65)
		rctx.fillRect(0, 0, rim.width, rim.height)
		ctx.globalAlpha = P.rimLight / 100
		ctx.drawImage(rim, gx, gy)
		ctx.globalAlpha = 1
	}

	// Reflet diagonal, par-dessus le glyphe (comme l'ancien « reflet » GIMP)
	if (P.bgOn) drawShine(ctx, S, u, P)

	// Bordure par-dessus, dans le trait (noire « ligne claire » ou accent)
	if (P.bgOn && P.borderWidth > 0 && P.borderAlpha > 0) {
		const bw = P.borderWidth * u
		ctx.strokeStyle = alpha(P.borderBlack ? '#000000' : accent, P.borderAlpha / 100)
		ctx.lineWidth = bw
		roundRectPath(ctx, bw / 2, bw / 2, S - bw, S - bw, Math.max(0, P.radius * u - bw / 2))
		ctx.stroke()
	}

	// Liseré intérieur clair, juste sous la bordure
	if (P.bgOn && P.innerLine) {
		const lw = 1.3 * u
		const inset = P.borderWidth * u + lw / 2
		ctx.strokeStyle = alpha(mix(accent, '#FFFFFF', 0.35), 0.8)
		ctx.lineWidth = lw
		roundRectPath(ctx, inset, inset, S - 2 * inset, S - 2 * inset, Math.max(0, P.radius * u - inset))
		ctx.stroke()
	}

	canvas.width = canvas.height = outSize
	const out = canvas.getContext('2d')
	out.imageSmoothingQuality = 'high'
	out.clearRect(0, 0, outSize, outSize)
	out.drawImage(off, 0, 0, outSize, outSize)
}

function renderAll() {
	if (renderQueued) return
	renderQueued = true
	requestAnimationFrame(() => {
		renderQueued = false
		for (const item of items) {
			if (item.img && item.canvas) renderInto(item.canvas, item, state.theme, 100)
		}
		renderContext()
	})
}

// Échantillon "en contexte" : 24 puces sur 3 lignes de 8, toutes les
// catégories représentées, sur les deux thèmes.
const CONTEXT_SAMPLE = [
	'flame', 'meteorite', 'punishment', 'cure', 'bandage', 'shield', 'armor', 'doping',
	'protein', 'winged_boots', 'puny_bulb', 'wizard_bulb', 'mirror', 'bramble', 'fracture', 'ball_and_chain',
	'toxin', 'plague', 'mutation', 'alteration', 'teleportation', 'antidote', 'prism', 'hold_weapon',
]
function renderContext() {
	for (const board of document.querySelectorAll('.context-board')) {
		const theme = board.dataset.ctx
		for (const slot of board.querySelectorAll('.ctx-slot')) {
			const item = items.find(i => i.name === slot.dataset.name)
			if (item && item.img) renderInto(slot.firstChild, item, theme, 100)
		}
	}
}

// ---------------------------------------------------------------------------
// Construction de l'interface

function buildContextBoards() {
	for (const board of document.querySelectorAll('.context-board')) {
		for (const name of CONTEXT_SAMPLE) {
			const slot = document.createElement('div')
			slot.className = 'ctx-slot'
			slot.dataset.name = name
			slot.appendChild(document.createElement('canvas'))
			board.appendChild(slot)
		}
	}
}

function buildTile(item) {
	const tile = document.createElement('div')
	tile.className = 'tile' + (item.guess ? ' guess' : '')
	tile.title = item.name + (item.guess ? ' — catégorie à confirmer' : '')
	const canvas = document.createElement('canvas')
	const name = document.createElement('div')
	name.className = 'name'
	name.textContent = labels[item.name] || item.name
	tile.append(canvas, name)
	tile.addEventListener('click', () => openDetail(item))
	item.canvas = canvas
	item.nameEl = name
	return tile
}

function buildSections() {
	const container = document.getElementById('sections')
	for (const [key, cat] of Object.entries(CATEGORIES)) {
		if (key === 'pomp') continue
		const chips = items.filter(i => i.kind === 'chip' && typeOf(i) === key)
		const section = document.createElement('section')
		section.className = 'panel'
		section.dataset.type = key
		const head = document.createElement('div')
		head.className = 'section-head'
		head.innerHTML = `<span class="swatch"></span><h2>${cat.label}</h2><span class="count">${chips.length}</span>`
		const grid = document.createElement('div')
		grid.className = 'grid'
		for (const chip of chips) grid.appendChild(buildTile(chip))
		section.append(head, grid)
		container.appendChild(section)
	}
	const pompGrid = document.getElementById('pomp-grid')
	for (const pomp of items.filter(i => i.kind === 'pomp')) {
		pompGrid.appendChild(buildTile(pomp))
	}
	updateSwatches()
}

function updateSwatches() {
	for (const section of document.querySelectorAll('#sections .panel')) {
		const cat = state.palette[section.dataset.type]
		section.querySelector('.swatch').style.background = state.theme === 'dark' ? cat.dark : cat.light
	}
}

// Les sections sont reconstruites quand une catégorie change (override).
function rebuildSections() {
	document.getElementById('sections').innerHTML = ''
	document.getElementById('pomp-grid').innerHTML = ''
	buildSections()
	renderAll()
}

function buildPalette() {
	const container = document.getElementById('palette')
	container.innerHTML = ''
	for (const [key, cat] of Object.entries(state.palette)) {
		const row = document.createElement('div')
		row.className = 'palette-row'
		const label = document.createElement('span')
		label.textContent = CATEGORIES[key].label
		const dark = document.createElement('input')
		dark.type = 'color'
		dark.value = cat.dark
		dark.title = 'Accent thème sombre'
		const light = document.createElement('input')
		light.type = 'color'
		light.value = cat.light
		light.title = 'Accent thème clair'
		dark.addEventListener('input', () => { cat.dark = dark.value; save(); renderAll(); updateSwatches() })
		light.addEventListener('input', () => { cat.light = light.value; save(); renderAll(); updateSwatches() })
		row.append(label, dark, light)
		container.appendChild(row)
	}
}

const PERCENT_KEYS = new Set(['bgTint', 'bgGradient', 'borderAlpha', 'glyphScale', 'shadowAlpha', 'duotone', 'glow', 'shine', 'vignette', 'rimLight', 'bevel', 'relief', 'specular', 'bgPale', 'duotone', 'pompGlyphScale'])
function bindControls() {
	for (const key of Object.keys(PRESETS.pixel)) {
		const input = document.getElementById('p-' + key)
		if (!input) continue
		if (input.type === 'checkbox') {
			input.checked = state.params[key]
			input.addEventListener('input', () => { state.params[key] = input.checked; save(); renderAll() })
		} else {
			input.value = state.params[key]
			const output = input.parentElement.querySelector('output')
			const show = () => { if (output) output.textContent = input.value + (PERCENT_KEYS.has(key) ? '%' : '') }
			show()
			input.addEventListener('input', () => { state.params[key] = parseFloat(input.value); show(); save(); renderAll() })
		}
	}
	const preset = document.getElementById('preset')
	preset.value = state.preset
	preset.addEventListener('change', e => {
		state.preset = e.target.value
		state.params = { ...PRESETS[e.target.value] }
		save()
		bindControls()
		renderAll()
	})
}

// ---------------------------------------------------------------------------
// Dialogue de détail

let detailItem = null
function openDetail(item) {
	detailItem = item
	const dialog = document.getElementById('detail')
	document.getElementById('detail-title').textContent = (labels[item.name] || item.name) + ' (' + item.name + ')'
	renderInto(document.getElementById('detail-dark'), item, 'dark', 320)
	renderInto(document.getElementById('detail-light'), item, 'light', 320)
	const select = document.getElementById('detail-type')
	select.innerHTML = ''
	for (const [key, cat] of Object.entries(CATEGORIES)) {
		if (key === 'pomp' && item.kind !== 'pomp') continue
		const option = document.createElement('option')
		option.value = key
		option.textContent = cat.label
		select.appendChild(option)
	}
	select.value = typeOf(item)
	select.disabled = item.kind === 'pomp'
	document.getElementById('detail-guess').textContent = item.guess ? 'Catégorie devinée (absente de l\'ancien script)' : ''
	dialog.showModal()
}

function bindDetail() {
	const dialog = document.getElementById('detail')
	document.getElementById('detail-close').addEventListener('click', () => dialog.close())
	document.getElementById('detail-type').addEventListener('change', e => {
		state.overrides[detailItem.name] = e.target.value
		if (e.target.value === detailItem.type) delete state.overrides[detailItem.name]
		save()
		rebuildSections()
		renderInto(document.getElementById('detail-dark'), detailItem, 'dark', 320)
		renderInto(document.getElementById('detail-light'), detailItem, 'light', 320)
	})
	for (const theme of ['dark', 'light']) {
		document.getElementById('detail-dl-' + theme).addEventListener('click', () => {
			const canvas = document.createElement('canvas')
			renderInto(canvas, detailItem, theme, parseInt(document.getElementById('export-size').value))
			canvas.toBlob(blob => {
				const a = document.createElement('a')
				a.href = URL.createObjectURL(blob)
				a.download = detailItem.name + '.png'
				a.click()
				URL.revokeObjectURL(a.href)
			})
		})
	}
}

// ---------------------------------------------------------------------------
// Export

async function exportItems(kind) {
	if (!window.showDirectoryPicker) {
		alert('Export : navigateur Chromium requis (File System Access API).')
		return
	}
	const size = parseInt(document.getElementById('export-size').value)
	const themesChoice = document.getElementById('export-themes').value
	const themes = themesChoice === 'both' ? ['dark', 'light'] : [themesChoice]
	let dir
	try {
		dir = await window.showDirectoryPicker({ mode: 'readwrite' })
	} catch {
		return // annulé
	}
	const status = document.getElementById('status')
	const list = items.filter(i => i.kind === kind && i.img)
	let done = 0
	for (const theme of themes) {
		const target = themes.length > 1 ? await dir.getDirectoryHandle(theme, { create: true }) : dir
		for (const item of list) {
			const canvas = document.createElement('canvas')
			renderInto(canvas, item, theme, size)
			const blob = await new Promise(r => canvas.toBlob(r, 'image/png'))
			const file = await target.getFileHandle(item.name + '.png', { create: true })
			const writable = await file.createWritable()
			await writable.write(blob)
			await writable.close()
			status.textContent = `Export ${++done}/${list.length * themes.length}`
		}
	}
	status.textContent = `✓ ${done} PNG exportés (${size}×${size})`
}

// ---------------------------------------------------------------------------
// Persistance & init

function save() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify({
		version: CONFIG_VERSION, preset: state.preset,
		params: state.params, palette: state.palette, overrides: state.overrides, theme: state.theme,
	}))
}
function restore() {
	try {
		const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
		if (!saved) return
		// Config d'une version précédente : on garde palette/overrides mais on
		// repart des paramètres par défaut (nouveaux réglages ajoutés depuis).
		if (saved.version === CONFIG_VERSION) {
			Object.assign(state.params, saved.params)
			state.preset = saved.preset || state.preset
		}
		for (const key of Object.keys(state.palette)) {
			if (saved.palette?.[key]) Object.assign(state.palette[key], saved.palette[key])
		}
		state.overrides = saved.overrides || {}
		state.theme = saved.theme || 'dark'
	} catch { /* config corrompue : on repart des défauts */ }
}

function applyTheme() {
	document.documentElement.dataset.theme = state.theme
	document.getElementById('theme-toggle').textContent = state.theme === 'dark' ? '☾ Sombre' : '☀ Clair'
	updateSwatches()
}

async function init() {
	restore()
	applyTheme()

	for (const chip of CHIPS) {
		items.push({ ...chip, kind: 'chip' })
	}
	for (const pomp of POMPS) {
		items.push({ name: pomp.name, type: 'pomp', kind: 'pomp', black: pomp.black, svg: pomp.svg, leftovers: pomp.leftovers, scale: pomp.scale })
	}

	document.getElementById('missing-list').textContent = MISSING_SOURCES.join(', ')
	buildContextBoards()
	buildSections()
	buildPalette()
	bindControls()
	bindDetail()

	document.getElementById('theme-toggle').addEventListener('click', () => {
		state.theme = state.theme === 'dark' ? 'light' : 'dark'
		save()
		applyTheme()
		renderAll()
	})
	document.getElementById('palette-reset').addEventListener('click', () => {
		state.palette = JSON.parse(JSON.stringify(CATEGORIES))
		save()
		buildPalette()
		updateSwatches()
		renderAll()
	})
	document.getElementById('config-reset').addEventListener('click', () => {
		localStorage.removeItem(STORAGE_KEY)
		location.reload()
	})
	document.getElementById('config-copy').addEventListener('click', () => {
		navigator.clipboard.writeText(JSON.stringify({ params: state.params, palette: state.palette, overrides: state.overrides }, null, '\t'))
		document.getElementById('status').textContent = 'Config copiée'
	})
	document.getElementById('export-chips').addEventListener('click', () => exportItems('chip'))
	document.getElementById('export-pomps').addEventListener('click', () => exportItems('pomp'))

	// Libellés français (optionnels : nécessite d'être servi depuis la racine leek-wars)
	try {
		const [chipLang, pompLang] = await Promise.all([
			fetch(PATHS.chipLang).then(r => r.json()),
			fetch(PATHS.pompLang).then(r => r.json()),
		])
		labels = { ...chipLang, ...pompLang }
		for (const item of items) {
			if (item.nameEl && labels[item.name]) item.nameEl.textContent = labels[item.name]
		}
	} catch { /* libellés indisponibles, on garde les noms techniques */ }

	// Chargement des sources puis rendu au fil de l'eau
	const status = document.getElementById('status')
	let loaded = 0
	await Promise.all(items.map(async item => {
		try {
			if (item.kind === 'chip') {
				item.img = await loadImage(PATHS.chipIcons + item.name + '.png')
			} else if (item.black) {
				item.img = await loadImage(PATHS.pompBlack + item.name + '.png')
			} else {
				item.img = await loadPompSvgGlyph(item)
			}
			item.bbox = alphaBBox(item.img)
			renderInto(item.canvas, item, state.theme, 100)
			status.textContent = `Sources ${++loaded}/${items.length}`
		} catch (e) {
			console.error(e)
			item.nameEl.textContent = '✗ ' + item.name
		}
	}))
	status.textContent = `${loaded}/${items.length} sources chargées`
	renderContext()
}

init()
