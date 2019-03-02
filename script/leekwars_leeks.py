#!/usr/bin/env python

from gimpfu import *

def execute() :
    
    raw_images = [['front', "/home/pierre/dev/leek-wars/meta/leek/png/leeks_front.png"],
                  ['back', "/home/pierre/dev/leek-wars/meta/leek/png/leeks_back.png"]]
                  
    multi = ["/home/pierre/dev/leek-wars/meta/leek/png/leeks_multi_front.png",
             "/home/pierre/dev/leek-wars/meta/leek/png/leeks_multi_back.png"]

    rasta = ["/home/pierre/dev/leek-wars/meta/leek/png/leeks_rasta_front.png",
             "/home/pierre/dev/leek-wars/meta/leek/png/leeks_rasta_back.png"]
                  
    leeks = [[0, 100], [100, 150], [250, 150], [400, 180], [600, 180], [780, 180], [970, 200], [1170, 210], [1380, 230], [1605, 230], [1820, 250]]
   
    colors = [
              ['green', 0, 0, 0], ['blue', 90, 22, -5], ['yellow', -64, 20, 6], ['red', -120, 13, 0], ['orange', -87, 27, 0], 
              ['pink', -165, 20, 0], ['cyan', 63, 15, 0], ['purple', 167, 10, 0], ['black', 0, -60, -100], ['white'], 
              ['multi', 0, 0, 0], ['rasta', 0, 0, 0], ['alpha'], ['apple', -43, 13, 0]
    ];
    
    for (i, raw_image) in enumerate(raw_images) :

        for (c, color) in enumerate(colors):
            
            if color[0] == 'multi':
                image = pdb.file_png_load(multi[i], multi[i])
            elif color[0] == 'rasta' :
                image = pdb.file_png_load(rasta[i], rasta[i])
            else :
                image = pdb.file_png_load(raw_image[1], raw_image[1])
                
            drawable = pdb.gimp_image_get_active_drawable(image)
            
            pdb.gimp_context_set_sample_criterion(SELECT_CRITERION_H)
            pdb.gimp_image_select_color(image, CHANNEL_OP_ADD, drawable, (0,255,0))
            
            if color[0] == 'white' :
                pdb.gimp_desaturate_full(drawable, DESATURATE_LUMINOSITY)
                pdb.gimp_brightness_contrast(drawable, 90, 70)
            elif color[0] == 'alpha' :
                pdb.gimp_desaturate_full(drawable, DESATURATE_LUMINOSITY)
                pdb.gimp_brightness_contrast(drawable, 90, 70)
                pdb.plug_in_colortoalpha(image, drawable, (255,255,255)) 
            else :
                pdb.gimp_hue_saturation(drawable, ALL_HUES, color[1], color[2], color[3])
        
            pdb.gimp_selection_none(image)
            
            for (l, leek) in enumerate(leeks) : 
            
                # filename = "/home/pierre/dev/leek-wars/client/http/image/leek/leek{}_{}_{}.png".format(l + 1, raw_image[0], colors[c][0])
                filename = "/home/pierre/dev/leek-wars/leek{}_{}_{}.png".format(l + 1, raw_image[0], colors[c][0])
            
                pdb.gimp_rect_select(image, leeks[l][0], 0, leeks[l][1], pdb.gimp_image_height(image), CHANNEL_OP_ADD, FALSE, 0)
                pdb.gimp_edit_cut(drawable)
                pdb.gimp_floating_sel_to_layer(pdb.gimp_edit_paste(drawable, TRUE))
                pdb.plug_in_autocrop_layer(image, pdb.gimp_image_get_active_drawable(image))
                pdb.file_png_save_defaults(image, pdb.gimp_image_get_active_drawable(image), filename, filename)
    
#~ register(
    #~ "python_fu_leekwars_leeks",
    #~ "Leek Wars Leeks",
    #~ "Create leeks",
    #~ "Pilow",
    #~ "Pilow",
    #~ "2014",
    #~ "Leek Wars Leeks...",
    #~ "", # Create a new image, don't work on an existing one
    #~ [], # parametres
    #~ [],
    #~ leekwars_leeks, menu="<Image>/File/Create")

#~ main()
