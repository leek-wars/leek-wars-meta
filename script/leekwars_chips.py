#!/usr/bin/env python

from gimpfu import *
from os import listdir
from os.path import isfile, join
import colorsys

def execute():

	black_folder = "/home/pierre/dev/leek-wars/meta/image/chip/png/"
	output_folder = "/home/pierre/dev/leek-wars/client/public/image/chip/big/"
	output_small_folder = "/home/pierre/dev/leek-wars/client/public/image/chip/"
	glyph_folder = "/home/pierre/dev/leek-wars/client/public/image/chip/glyph/"

	colors = {
		'attack': [(255, 50, 0), (255, 0, 0)],
		'shield': [(255, 140, 0), (255, 127, 0)],
		'heal': [(150, 255, 0), (110, 255, 0)],
		'boost': [(0, 100, 255), (0, 30, 255)],
		'summon': [(0, 200, 255), (0, 255, 255)],
		'shackle': [(150, 0, 255), (127, 0, 255)],
		'damage_return': [(0, 100, 255), (0, 160, 255)],
		'poison': [(200, 0, 255), (255, 0, 255)],
		'other': [(170, 170, 170), (170, 170, 170)]
	}
	other_color = [(255, 255, 255), (0, 0, 0)]

	chips = {
		'attack': ['shock', 'pebble', 'spark', 'ice', 'rock', 'flash', 'flame', 'stalactite',
				   'lightning', 'rockfall', 'iceberg', 'meteorite', 'devil_strike', 'burning'],
		'shield': ['helmet', 'wall', 'shield', 'rampart', 'fortress', 'carapace', 'armor'],
		'heal':   ['bandage', 'cure', 'drip', 'vaccine', 'loam', 'regeneration', 'remission',
				   'fertilizer', 'resurrection', 'armoring', 'elevation'],
		'boost':  ['stretching', 'protein', 'leather_boots', 'steroid', 'warm_up', 'winged_boots',
				   'whip', 'reflexes', 'doping', 'acceleration', 'seven_league_boots', 'rage',
				   'adrenaline', 'solidification', 'motivation', 'ferocity', 'dressage', 'bark',
				   'collar', 'knowledge', 'wizardry'],
		'summon': ['puny_bulb', 'rocky_bulb', 'iced_bulb', 'healer_bulb', 'fire_bulb',
				   'lightning_bulb', 'metallic_bulb'],
		'damage_return' : ['thorn', 'mirror'],
		'shackle': ['ball_and_chain', 'slow_down', 'soporific', 'tranquilizer', 'fracture'],
		'poison': ['toxin', 'venom', 'plague', 'covid'],
		'other': ['liberation', 'teleportation', 'inversion', 'antidote']
	}
	# force_color = (133, 41, 0)
	force_color = (199, 61, 0)
	tp_color = (255, 149, 23)
	agi_color = (7, 137, 247)
	resi_color = (255, 120, 0)
	wisdom_color = (94, 191, 0)
	mp_color = (0, 167, 0)
	poison_color = (138, 0, 120)
	custom_colors = {
		# TP
		'adrenaline': tp_color,
		'motivation': tp_color,
		'rage': tp_color,
		'covetousness': tp_color,
		'whip': tp_color,
		# Force
		'protein': force_color,
		'doping': force_color,
		'steroid': force_color,
		'ferocity': force_color,
		# MP
		'leather_boots': mp_color,
		'winged_boots': mp_color,
		'seven_league_boots': mp_color,
		'precipitation': mp_color,
		'acceleration': mp_color,
		# Resi
		'solidification': resi_color,
		'bark': resi_color,
		# Agi
		'stretching': agi_color,
		'reflexes': agi_color,
		'warm_up': agi_color,
		# Wisdom
		'collar': wisdom_color,
		'knowledge': wisdom_color,
		# Magic
		'wizardry': poison_color,
		# special
		'antidote': wisdom_color,
		'teleportation': (63, 128, 255),
		'jump': agi_color,
		'liberation': (255, 50, 50),
		'inversion': (63, 128, 255),
	}

	files = [f for f in listdir(black_folder) if isfile(join(black_folder, f))]
	print(files)

	for (i, file) in enumerate(files):

		chip = file[:-4]
		image = pdb.file_png_load(black_folder + file, black_folder + file)

		pdb.gimp_image_scale_full(image, 250, 250, INTERPOLATION_CUBIC)

		drawable = pdb.gimp_image_get_active_drawable(image)

		calque1 = pdb.gimp_layer_new(image, 280, 280, RGBA_IMAGE, "Inner shadow", 100, NORMAL_MODE)
		calque2 = pdb.gimp_layer_new(image, 320, 320, RGBA_IMAGE, "Inner shadow", 100, NORMAL_MODE)
		calque3 = pdb.gimp_layer_new(image, 320, 320, RGBA_IMAGE, "Inner shadow", 100, NORMAL_MODE)
		calque4 = pdb.gimp_layer_new(image, 320, 320, RGBA_IMAGE, "Inner shadow", 100, NORMAL_MODE)

		color = None
		for type in chips:
			if chip in chips[type]:
				color = colors[type]
		if color is None:
			continue

		print "Color: " + str(color)

		pdb.plug_in_vinvert(image, drawable)

		pdb.gimp_image_add_layer(image, calque1, 3)
		pdb.gimp_image_add_layer(image, calque2, 4)
		pdb.gimp_image_add_layer(image, calque3, 1)
		pdb.gimp_image_add_layer(image, calque4, 0)

		pdb.gimp_image_resize_to_layers(image)

		# Bordure
		pdb.gimp_context_set_background(dark_color(color[0], 50))
		pdb.gimp_context_set_foreground(dark_color(color[1], 30))
		pdb.gimp_image_select_round_rectangle(image, CHANNEL_OP_REPLACE, 0, 0, 320, 320, 45, 45)
		pdb.gimp_edit_blend(calque2, FG_BG_RGB_MODE, NORMAL_MODE, GRADIENT_LINEAR, 100, 0, 0, TRUE, TRUE, 3, 0.2, TRUE, 0, 0, 0, 280)

		# Background
		pdb.gimp_context_set_background(light_color(color[0], 15))
		pdb.gimp_context_set_foreground(light_color(color[1], 50))
		pdb.gimp_image_select_round_rectangle(image, CHANNEL_OP_REPLACE, 0, 0, 280, 280, 30, 30)
		pdb.gimp_edit_blend(calque1, FG_BG_RGB_MODE, NORMAL_MODE, GRADIENT_LINEAR, 100, 0, 0, TRUE, TRUE, 3, 0.2, TRUE, 0, 0, 0, 280)

		pdb.gimp_layer_translate(drawable, 35, 35)
		pdb.gimp_layer_translate(calque1, 20, 20)

		# Contour du dessin
		# ct_color_1 = light_color(custom_colors[chip], 20) if chip in custom_colors else light_color(color[0], 20)
		ct_color_1 = light_color(color[0], 20)
		ct_color_2 = light_color(custom_colors[chip], 60) if chip in custom_colors else light_color(color[1], 55)
		pdb.gimp_selection_layer_alpha(drawable)
		pdb.gimp_selection_grow(image, 15)
		pdb.gimp_context_set_foreground(ct_color_1)
		pdb.gimp_context_set_background(ct_color_2)
		pdb.gimp_edit_blend(calque3, FG_BG_RGB_MODE, NORMAL_MODE, GRADIENT_LINEAR, 100, 0, 0, FALSE, TRUE, 3, 0.2, TRUE, 0, 0, 0, 280)

		# Dessin (en degrade)
		pdb.gimp_selection_layer_alpha(drawable)
		# fg_color_1 = custom_colors[chip] if chip in custom_colors else dark_color(color[0], 40)
		# fg_color_2 = custom_colors[chip] if chip in custom_colors else dark_color(color[1], 20)
		fg_color_1 = dark_color(color[0], 40)
		fg_color_2 = dark_color(color[1], 20)
		pdb.gimp_context_set_foreground(fg_color_1)
		pdb.gimp_context_set_background(fg_color_2)
		pdb.gimp_edit_blend(drawable, FG_BG_RGB_MODE, NORMAL_MODE, GRADIENT_LINEAR, 100, 0, 0, FALSE, TRUE, 3, 0.2, TRUE, 0, 0, 0, 280)



		# Reflet
		pdb.gimp_layer_add_alpha(calque4)
		pdb.gimp_context_set_background((255, 255, 255))
		pdb.gimp_context_set_foreground((0, 0, 0))
		vectors = pdb.gimp_vectors_new(image, 'path')
		pdb.gimp_vectors_stroke_new_from_points(vectors, VECTORS_STROKE_TYPE_BEZIER, 12, [50.0, -20.0, 50.0, -20.0, 350.0, 500.0, 350.0, 500.0, 400.0, -75.0, 400.0, -75.0], TRUE)
		pdb.gimp_image_insert_vectors(image, vectors, None, -1)
		pdb.gimp_image_select_item(image, CHANNEL_OP_REPLACE, vectors)
		pdb.gimp_edit_blend(calque4, FG_BG_RGB_MODE, NORMAL_MODE, GRADIENT_LINEAR, 100, 0, 0, TRUE, TRUE, 3, 0.2, TRUE, 118.0, 103, 320, 0)
		pdb.plug_in_colortoalpha(image, calque4, (0,0,0))
		pdb.gimp_layer_set_opacity(calque4, 25)

		# Fusion
		pdb.gimp_image_merge_visible_layers(image, EXPAND_AS_NECESSARY)



		# Sauvegarde de l'image
		# filename = output_folder + file
		# pdb.file_png_save_defaults(image, pdb.gimp_image_get_active_drawable(image), filename, filename)

		# Sauvegarde de l'image en 100x100
		pdb.gimp_image_scale_full(image, 100, 100, INTERPOLATION_CUBIC)
		filename = output_small_folder + file
		pdb.file_png_save_defaults(image, pdb.gimp_image_get_active_drawable(image), filename, filename)


		#### Glyph
		# glyph = pdb.file_png_load(black_folder + file, black_folder + file)
		# glyph_drawable = pdb.gimp_image_get_active_drawable(glyph)
		# pdb.gimp_image_scale_full(glyph, 310, 310, INTERPOLATION_CUBIC)

		# pdb.gimp_item_transform_scale(glyph_drawable, 30, 30, 280, 280)

		# pdb.gimp_layer_resize_to_image_size(pdb.gimp_image_get_active_layer(glyph))

		# pdb.script_fu_neon_logo_alpha(glyph, glyph_drawable, 45.0, (0,0,0,0), color[1], 0)

		# pdb.gimp_image_remove_layer(glyph, pdb.gimp_image_get_active_drawable(glyph))

		# pdb.gimp_image_merge_visible_layers(glyph, EXPAND_AS_NECESSARY)
		# pdb.gimp_image_scale_full(glyph, 100, 100, INTERPOLATION_CUBIC)

		# filename = glyph_folder + file
		# pdb.file_png_save_defaults(glyph, pdb.gimp_image_get_active_drawable(glyph), filename, filename)

		#~ break


def dark_color(color, dark):
	return (int(color[0] * dark / 100.0), int(color[1] * dark / 100.0), int(color[2] * dark / 100.0))

def light_color(color, light):
	#~ print color
	hsv = colorsys.rgb_to_hsv(color[0] / 255.0, color[1] / 255.0, color[2] / 255.0)
	#~ print hsv
	rgb = colorsys.hsv_to_rgb(hsv[0], hsv[1] * (light / 100.0), hsv[2] + (1 - hsv[2]) * (light / 100.0))
	#~ print rgb
	rgb = (int(rgb[0] * 255), int(rgb[1] * 255), int(rgb[2] * 255))
	#~ print rgb
	return rgb


#~ register(
	#~ "python_fu_leek_wars_chips",
	#~ "Leek Wars Chips",
	#~ "Create chips images",
	#~ "Pilow",
	#~ "Pilow",
	#~ "2014",
	#~ "Leek Wars chips...",
	#~ "", # Create a new image, don't work on an existing one
	#~ [], # parametres
	#~ [],
	#~ execute, menu="<Image>/File/Create")
#~
#~ main()
