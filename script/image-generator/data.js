// Données du générateur d'images de puces et d'apparats.
// Remplace l'ancien script GIMP (meta/script/leekwars_chips.py + leekwars_apparats.py).

// Catégories : mêmes familles que l'ancien script, couleurs re-projetées sur la
// palette du redesign v3 (client-develop/src/redesign/tokens.scss).
// `dark` = accent sur thème sombre, `light` = accent sur thème clair.
const CATEGORIES = {
	attack:        { label: 'Attaque',      dark: '#FF5040', light: '#C2382A' }, // --red
	life_damage:   { label: 'Vie',          dark: '#FF3D7F', light: '#C32265' }, // --magenta
	heal:          { label: 'Soin',         dark: '#7CFF6B', light: '#1F8A3B' }, // --green
	shield:        { label: 'Protection',   dark: '#FFB23A', light: '#C77A0E' }, // --amber
	boost:         { label: 'Amélioration', dark: '#6C8CFF', light: '#2F55C8' },
	summon:        { label: 'Invocation',   dark: '#5CE0FF', light: '#1A7AA0' }, // --cyan
	damage_return: { label: 'Renvoi',       dark: '#3FB4FF', light: '#176FA8' },
	shackle:       { label: 'Entrave',      dark: '#A06BFF', light: '#6C3BD1' },
	poison:        { label: 'Poison',       dark: '#E44DFF', light: '#9C27C8' },
	nova:          { label: 'Nova',         dark: '#3DF5B0', light: '#0E8A5F' },
	other:         { label: 'Tactique',     dark: '#A8B4A4', light: '#7A8676' }, // --ink-2
	// Les apparats gardent leur identité historique : fond BLEU, glyphe DORÉ —
	// polarité inverse des puces (fond clair, glyphe sombre). Un `scheme`
	// remplace donc le jeu de couleurs dérivé de l'accent. Valeurs reprises
	// telles quelles de meta/script/leekwars_apparats.py.
	pomp: {
		label: 'Apparat', dark: '#FFD23A', light: '#B88A0E',
		scheme: {
			bg: '#1B7DFF',      // blue
			bgDeep: '#1400B4',  // dark_blue
			ink: '#FFDC50',     // yellow
			ink2: '#FA5A26',    // orange
		},
	},
}

// Fonds de tuile (jetons --bg-input du redesign).
const BASE = {
	dark: '#0A0E10',
	light: '#FFFCF0',
}

// Puce → catégorie. Reprise de la table de leekwars_chips.py ;
// `guess: true` = puce absente de l'ancienne table, classement à confirmer.
const CHIPS = [
	{ name: 'shock', type: 'attack' },
	{ name: 'pebble', type: 'attack' },
	{ name: 'spark', type: 'attack' },
	{ name: 'ice', type: 'attack' },
	{ name: 'rock', type: 'attack' },
	{ name: 'flash', type: 'attack' },
	{ name: 'flame', type: 'attack' },
	{ name: 'stalactite', type: 'attack' },
	{ name: 'lightning', type: 'attack' },
	{ name: 'rockfall', type: 'attack' },
	{ name: 'iceberg', type: 'attack' },
	{ name: 'meteorite', type: 'attack' },
	{ name: 'devil_strike', type: 'attack' },
	{ name: 'burning', type: 'attack' },
	// Icônes noires créées en août 2026 (générées par IA depuis PROMPTS.md).
	{ name: 'plasma', type: 'attack' },
	{ name: 'fire_ball', type: 'attack' },
	{ name: 'thunder', type: 'attack' },
	{ name: 'trebuchet', type: 'attack' },
	{ name: 'shuriken', type: 'attack' },
	{ name: 'kill', type: 'attack' },
	{ name: 'apocalypse', type: 'attack' },

	{ name: 'punishment', type: 'life_damage' },
	{ name: 'hemorrhage', type: 'life_damage' },        // ADD_STATE insoignable : état qui touche la vie, comme divine_protection (invincible) est classée protection

	{ name: 'helmet', type: 'shield' },
	{ name: 'wall', type: 'shield' },
	{ name: 'shield', type: 'shield' },
	{ name: 'rampart', type: 'shield' },
	{ name: 'fortress', type: 'shield' },
	{ name: 'carapace', type: 'shield' },
	{ name: 'armor', type: 'shield' },
	{ name: 'dome', type: 'shield' },
	{ name: 'divine_protection', type: 'shield' },   // ADD_STATE invincible

	{ name: 'bandage', type: 'heal' },
	{ name: 'cure', type: 'heal' },
	{ name: 'drip', type: 'heal' },
	{ name: 'vaccine', type: 'heal' },
	{ name: 'loam', type: 'heal' },
	{ name: 'regeneration', type: 'heal' },
	{ name: 'remission', type: 'heal' },
	{ name: 'fertilizer', type: 'heal' },
	{ name: 'resurrection', type: 'heal' },
	{ name: 'armoring', type: 'heal' },
	{ name: 'vampirization', type: 'heal' },
	{ name: 'elevation', type: 'heal' },
	{ name: 'therapy', type: 'heal' },
	{ name: 'serum', type: 'heal' },
	{ name: 'awakening', type: 'heal' },              // RESURRECT

	{ name: 'stretching', type: 'boost' },
	{ name: 'protein', type: 'boost' },
	{ name: 'leather_boots', type: 'boost' },
	{ name: 'steroid', type: 'boost' },
	{ name: 'warm_up', type: 'boost' },
	{ name: 'winged_boots', type: 'boost' },
	{ name: 'whip', type: 'boost' },
	{ name: 'reflexes', type: 'boost' },
	{ name: 'doping', type: 'boost' },
	{ name: 'acceleration', type: 'boost' },
	{ name: 'seven_league_boots', type: 'boost' },
	{ name: 'rage', type: 'boost' },
	{ name: 'adrenaline', type: 'boost' },
	{ name: 'solidification', type: 'boost' },
	{ name: 'motivation', type: 'boost' },
	{ name: 'ferocity', type: 'boost' },
	{ name: 'bark', type: 'boost' },
	{ name: 'collar', type: 'boost' },
	{ name: 'covetousness', type: 'boost' },
	{ name: 'precipitation', type: 'boost' },
	{ name: 'knowledge', type: 'boost' },
	{ name: 'wizardry', type: 'boost' },
	{ name: 'prism', type: 'boost', guess: true },
	{ name: 'maturation', type: 'boost' },            // v2.50 : mûrit une invocation alliée (+vie max, +puissance)

	{ name: 'puny_bulb', type: 'summon' },
	{ name: 'rocky_bulb', type: 'summon' },
	{ name: 'iced_bulb', type: 'summon' },
	{ name: 'healer_bulb', type: 'summon' },
	{ name: 'fire_bulb', type: 'summon' },
	{ name: 'lightning_bulb', type: 'summon' },
	{ name: 'metallic_bulb', type: 'summon' },
	{ name: 'wizard_bulb', type: 'summon' },
	{ name: 'tactician_bulb', type: 'summon' },
	{ name: 'savant_bulb', type: 'summon' },
	{ name: 'corn', type: 'summon' },
	{ name: 'chilli_pepper', type: 'summon' },
	{ name: 'prototaxites', type: 'summon' },         // v2.50 : ex-« Cactus », invocation obstacle enracinée

	{ name: 'thorn', type: 'damage_return' },
	{ name: 'mirror', type: 'damage_return' },
	{ name: 'bramble', type: 'damage_return' },

	{ name: 'ball_and_chain', type: 'shackle' },
	{ name: 'slow_down', type: 'shackle' },
	{ name: 'soporific', type: 'shackle' },
	{ name: 'tranquilizer', type: 'shackle' },
	{ name: 'fracture', type: 'shackle' },
	{ name: 'crushing', type: 'shackle' },
	{ name: 'brainwashing', type: 'shackle' },
	{ name: 'exasperation', type: 'shackle' },        // TOTAL_DEBUFF + vulnérabilité
	{ name: 'compaction', type: 'shackle', guess: true },

	{ name: 'toxin', type: 'poison' },
	{ name: 'venom', type: 'poison' },
	{ name: 'plague', type: 'poison' },
	{ name: 'covid', type: 'poison' },
	{ name: 'arsenic', type: 'poison' },
	{ name: 'corruption', type: 'poison', guess: true },
	{ name: 'superinfection', type: 'poison' },       // v2.50 : convertit les poisons de la cible en dégâts immédiats
	// v2.50 — puces des plantes (Éveil) : Piment = piquant / capsaicin, Maïs = sugar / popcorn
	{ name: 'piquant', type: 'attack' },
	{ name: 'capsaicin', type: 'attack' },
	{ name: 'sugar', type: 'heal' },
	{ name: 'popcorn', type: 'heal' },

	{ name: 'alteration', type: 'nova' },
	{ name: 'mutation', type: 'nova' },
	{ name: 'transmutation', type: 'nova' },
	{ name: 'desintegration', type: 'nova' },
	{ name: 'density', type: 'nova', guess: true },

	{ name: 'liberation', type: 'other' },
	{ name: 'teleportation', type: 'other' },
	{ name: 'inversion', type: 'other' },
	{ name: 'antidote', type: 'other' },
	{ name: 'jump', type: 'other' },
	{ name: 'grapple', type: 'other' },
	{ name: 'repotting', type: 'other' },
	{ name: 'boxing_glove', type: 'other' },
	{ name: 'manumission', type: 'other' },
	{ name: 'maintenance', type: 'other', guess: true },
	{ name: 'kemuridama', type: 'other' },            // effet TELEPORT
	{ name: 'overload', type: 'boost', guess: true },
]

// Halo coloré par caractéristique — table `custom_colors` du script GIMP.
// C'est ce qui donne leur reflet bleu aux puces tactiques grises et leur reflet
// orange aux puces d'amélioration : le halo autour du glyphe ne suit pas la
// couleur de la tuile mais la caractéristique concernée.
const STAT_COLORS = {
	force: '#C73D00',
	tp: '#FF9517',
	agility: '#0789F7',
	resistance: '#FF7800',
	wisdom: '#5EBF00',
	mp: '#00A700',
	magic: '#8A0078',
	shackle: '#9600FF',
	tactic: '#3F80FF',
	free: '#FF3232',
}

const CUSTOM_HALO = {
	// TP
	adrenaline: STAT_COLORS.tp,
	motivation: STAT_COLORS.tp,
	rage: STAT_COLORS.tp,
	covetousness: STAT_COLORS.tp,
	whip: STAT_COLORS.tp,
	// Force
	protein: STAT_COLORS.force,
	doping: STAT_COLORS.force,
	steroid: STAT_COLORS.force,
	ferocity: STAT_COLORS.force,
	// PM
	leather_boots: STAT_COLORS.mp,
	winged_boots: STAT_COLORS.mp,
	seven_league_boots: STAT_COLORS.mp,
	precipitation: STAT_COLORS.mp,
	acceleration: STAT_COLORS.mp,
	// Résistance
	solidification: STAT_COLORS.resistance,
	bark: STAT_COLORS.resistance,
	// Agilité
	stretching: STAT_COLORS.agility,
	reflexes: STAT_COLORS.agility,
	warm_up: STAT_COLORS.agility,
	jump: STAT_COLORS.agility,
	// Sagesse
	collar: STAT_COLORS.wisdom,
	knowledge: STAT_COLORS.wisdom,
	antidote: STAT_COLORS.wisdom,
	// Magie
	wizardry: STAT_COLORS.magic,
	// Tactiques
	teleportation: STAT_COLORS.tactic,
	inversion: STAT_COLORS.tactic,
	repotting: STAT_COLORS.tactic,
	grapple: STAT_COLORS.tactic,
	boxing_glove: STAT_COLORS.tactic,
	liberation: STAT_COLORS.free,
	manumission: STAT_COLORS.shackle,
	// Un tableau = halo arc-en-ciel CONIQUE, qui tourne autour du glyphe en
	// partant du haut. Le prisme décompose la lumière : spectre complet, dans
	// l'ordre de l'image d'origine (vert en haut, pêche à droite, magenta en
	// bas, cyan à gauche).
	prism: ['#7CFF6B', '#D4FF3A', '#FFB23A', '#FF5040', '#FF3D7F', '#E44DFF', '#6C8CFF', '#5CE0FF'],
}

// Apparats (pomps). Ceux sans PNG noir sont extraits de leur SVG :
// on retire les formes du template badge et les restes des SVG dont ils dérivent.
const POMP_TEMPLATE_IDS = ['path16009', 'path19276', 'rect6743', 'rect12537', 'path18676']
const POMPS = [
	{ name: 'hold_weapon', black: true },
	{ name: 'ai_lines', black: true },
	{ name: 'leek_title', black: true },
	{ name: 'farmer_title', black: true },
	{ name: 'golden_title', black: true },
	{ name: 'metal', black: true },
	// `scale` : les visages sont détourés au plus juste dans leur SVG, sans la
	// marge que gardent les autres apparats — sans correction ils débordent.
	{ name: 'happy', svg: 'smile.svg', leftovers: ['path23926'], scale: 0.85 },
	{ name: 'angry', svg: 'angry.svg', leftovers: ['path23926', 'path3912'], scale: 0.85 },
]

// Puces en jeu (image couleur dans client/) dont l'icône noire n'existe pas
// dans meta/image/chip/png/ : non régénérables tant que la source manque.
// Les 13 qui manquaient ont été créées en août 2026 par IA (voir PROMPTS.md,
// « Prompt G ») puis converties en masques alpha. Plus aucune source manquante.
const MISSING_SOURCES = []

// Fichiers de `client/public/image/chip/` qui NE SONT PAS des icônes de puce et
// ne doivent jamais être régénérés en tuile :
//   shuriken_star.png — texture de PROJECTILE du lecteur de combat
//   (component/player/game/texture.ts, projectile volant de la puce Shuriken).
const NOT_CHIPS = ['shuriken_star']

// Puces déclarées ici mais PAS SORTIES dans le jeu : elles n'ont aucune image
// dans client/public/image/chip/. Ne jamais les exporter — les deux dépôts
// (meta et le client) sont PUBLICS, et publier leur image révélerait du contenu
// non annoncé. `corruption` est absente du registry. Un export en lot recrée
// ces images sans prévenir. `corn`, `chilli_pepper`, `hemorrhage`, `maturation`,
// `superinfection` et `prototaxites` sortent en 2.50 et ont été retirées d'ici.
const UNRELEASED = ['corruption']

const PATHS = {
	chipIcons: '/meta/image/chip/png/',
	pompBlack: '/meta/image/pomp/black/',
	pompSvg: '/meta/image/pomp/',
	currentChips: '/client/public/image/chip/',
	currentPomps: '/client/public/image/pomp/',
	chipLang: '/client/src/lang/fr/chip.json',
	pompLang: '/client/src/lang/fr/pomp.json',
}
