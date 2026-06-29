#!/usr/bin/env python

from gimpfu import *
from os import listdir
from os.path import isfile, join
import colorsys

def execute():
	
	black_folder = "/home/pierre/dev/leek-wars/meta/image/apparat/black/"
	output_folder = "/home/pierre/dev/leek-wars/meta/image/apparat/big/"
	output_small_folder = "/home/pierre/dev/leek-wars/meta/image/apparat/small/"

	files = [f for f in listdir(black_folder) if isfile(join(black_folder, f))]
	print(files)

	blue = (27, 125, 255)
	dark_blue = (20, 0, 180)
	yellow = (255, 220, 80)
	orange = (250, 90, 38)
	black = (0,0,0)
	
	for (i, file) in enumerate(files):

		chip = file[:-4]
		image = pdb.file_png_load(black_folder + file, black_folder + file)
		
		pdb.gimp_image_scale_full(image, 240, 240, INTERPOLATION_CUBIC)
				
		drawable = pdb.gimp_image_get_active_drawable(image)

		calque1 = pdb.gimp_layer_new(image, 280, 280, RGBA_IMAGE, "Inner shadow", 100, NORMAL_MODE)
		calque2 = pdb.gimp_layer_new(image, 320, 320, RGBA_IMAGE, "Inner shadow", 100, NORMAL_MODE)
		calque3 = pdb.gimp_layer_new(image, 320, 320, RGBA_IMAGE, "Inner shadow", 100, NORMAL_MODE)
		calque4 = pdb.gimp_layer_new(image, 320, 320, RGBA_IMAGE, "Inner shadow", 100, NORMAL_MODE)
		
		color = [(0, 50, 255), (0, 0, 255)]
				
		print "Color: " + str(color)

		pdb.plug_in_vinvert(image, drawable)

		pdb.gimp_image_add_layer(image, calque1, 3)
		pdb.gimp_image_add_layer(image, calque2, 4)
		pdb.gimp_image_add_layer(image, calque3, 1)
		pdb.gimp_image_add_layer(image, calque4, 0)

		pdb.gimp_image_resize_to_layers(image)

		# Bordure noire
		pdb.gimp_context_set_background(black)
		pdb.gimp_context_set_foreground(black)
		pdb.gimp_image_select_round_rectangle(image, CHANNEL_OP_REPLACE, 0, 0, 320, 320, 30, 30)
		pdb.gimp_edit_blend(calque2, FG_BG_RGB_MODE, NORMAL_MODE, GRADIENT_LINEAR, 100, 0, 0, TRUE, TRUE, 3, 0.2, TRUE, 0, 0, 0, 280)
		
		# Bordure jaune
		pdb.gimp_context_set_background(yellow)
		pdb.gimp_context_set_foreground(orange)
		pdb.gimp_image_select_round_rectangle(image, CHANNEL_OP_REPLACE, 6, 6, 308, 308, 25, 25)
		pdb.gimp_edit_blend(calque2, FG_BG_RGB_MODE, NORMAL_MODE, GRADIENT_LINEAR, 100, 0, 0, TRUE, TRUE, 3, 0.2, TRUE, 0, 0, 0, 450)
			
		# Background
		pdb.gimp_context_set_background(dark_blue)
		pdb.gimp_context_set_foreground(blue)
		pdb.gimp_image_select_round_rectangle(image, CHANNEL_OP_REPLACE, 0, 0, 264, 264, 15, 15)
		pdb.gimp_edit_blend(calque1, FG_BG_RGB_MODE, NORMAL_MODE, GRADIENT_LINEAR, 100, 0, 0, TRUE, TRUE, 3, 0.2, TRUE, 0, 0, 0, 300)

		pdb.gimp_layer_translate(drawable, 40, 40) 
		pdb.gimp_layer_translate(calque1, 28, 28) 

		# Contour du dessin
		pdb.gimp_selection_layer_alpha(drawable)
		pdb.gimp_selection_grow(image, 6)
		pdb.gimp_context_set_foreground(dark_blue)
		pdb.gimp_context_set_background(dark_blue)
		pdb.gimp_edit_blend(calque3, FG_BG_RGB_MODE, NORMAL_MODE, GRADIENT_LINEAR, 100, 0, 0, FALSE, TRUE, 3, 0.2, TRUE, 0, 0, 0, 350)
		
		# Dessin (en degrade)
		pdb.gimp_selection_layer_alpha(drawable)
		pdb.gimp_context_set_foreground(yellow)
		pdb.gimp_context_set_background(orange)
		pdb.gimp_edit_blend(drawable, FG_BG_RGB_MODE, NORMAL_MODE, GRADIENT_LINEAR, 100, 0, 0, FALSE, TRUE, 3, 0.2, TRUE, 0, 75, 0, 280)
		
		
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
		pdb.gimp_layer_set_opacity(calque4, 15)
	
		# Fusion
		pdb.gimp_image_merge_visible_layers(image, EXPAND_AS_NECESSARY)
		
		
		
		# Sauvegarde de l'image
		filename = output_folder + file
		pdb.file_png_save_defaults(image, pdb.gimp_image_get_active_drawable(image), filename, filename)
		
		# Sauvegarde de l'image en 100x100
		pdb.gimp_image_scale_full(image, 100, 100, INTERPOLATION_CUBIC)
		filename = output_small_folder + file
		pdb.file_png_save_defaults(image, pdb.gimp_image_get_active_drawable(image), filename, filename)


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
	

