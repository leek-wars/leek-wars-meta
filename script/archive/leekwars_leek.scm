(define
	(script-fu-leekwars_leek image drawable filename)

	; Début du groupe d'annulation (un Ctrl+Z revient ici)
	(gimp-undo-push-group-start image)

	(let* (
		(image-width (car (gimp-image-width image)))
		(image-height (car (gimp-image-height image)))
		(w image-width)
		(h image-height)
	) 
	
	(gimp-rect-select image 0 0 100 h CHANNEL-OP-ADD FALSE 0)
	(gimp-edit-cut drawable)
	(gimp-floating-sel-to-layer (car (gimp-edit-paste drawable TRUE)))
	(plug-in-autocrop-layer 0 image (car (gimp-image-get-active-drawable image)))
	(file-png-save-defaults 1 image (car (gimp-image-get-active-drawable image)) (string-append "leek1_" filename ".png") (string-append "leek1" filename ".png"))
	
	(gimp-rect-select image 100 0 150 h CHANNEL-OP-ADD FALSE 0)
	(gimp-edit-cut drawable)
	(gimp-floating-sel-to-layer (car (gimp-edit-paste drawable TRUE)))
	(plug-in-autocrop-layer 0 image (car (gimp-image-get-active-drawable image)))
	(file-png-save-defaults 1 image (car (gimp-image-get-active-drawable image)) (string-append "leek2_" filename ".png") (string-append "leek2" filename ".png"))
	
	(gimp-rect-select image 250 0 150 h CHANNEL-OP-ADD FALSE 0)
	(gimp-edit-cut drawable)
	(gimp-floating-sel-to-layer (car (gimp-edit-paste drawable TRUE)))
	(plug-in-autocrop-layer 0 image (car (gimp-image-get-active-drawable image)))
	(file-png-save-defaults 1 image (car (gimp-image-get-active-drawable image)) (string-append "leek3_" filename ".png") (string-append "leek3" filename ".png"))
	
	(gimp-rect-select image 400 0 180 h CHANNEL-OP-ADD FALSE 0)
	(gimp-edit-cut drawable)
	(gimp-floating-sel-to-layer (car (gimp-edit-paste drawable TRUE)))
	(plug-in-autocrop-layer 0 image (car (gimp-image-get-active-drawable image)))
	(file-png-save-defaults 1 image (car (gimp-image-get-active-drawable image)) (string-append "leek4_" filename ".png") (string-append "leek4" filename ".png"))
	
	(gimp-rect-select image 600 0 180 h CHANNEL-OP-ADD FALSE 0)
	(gimp-edit-cut drawable)
	(gimp-floating-sel-to-layer (car (gimp-edit-paste drawable TRUE)))
	(plug-in-autocrop-layer 0 image (car (gimp-image-get-active-drawable image)))
	(file-png-save-defaults 1 image (car (gimp-image-get-active-drawable image)) (string-append "leek5_" filename ".png") (string-append "leek5" filename ".png"))
	
	(gimp-rect-select image 780 0 180 h CHANNEL-OP-ADD FALSE 0)
	(gimp-edit-cut drawable)
	(gimp-floating-sel-to-layer (car (gimp-edit-paste drawable TRUE)))
	(plug-in-autocrop-layer 0 image (car (gimp-image-get-active-drawable image)))
	(file-png-save-defaults 1 image (car (gimp-image-get-active-drawable image)) (string-append "leek6_" filename ".png") (string-append "leek6" filename ".png"))
	
	(gimp-rect-select image 970 0 200 h CHANNEL-OP-ADD FALSE 0)
	(gimp-edit-cut drawable)
	(gimp-floating-sel-to-layer (car (gimp-edit-paste drawable TRUE)))
	(plug-in-autocrop-layer 0 image (car (gimp-image-get-active-drawable image)))
	(file-png-save-defaults 1 image (car (gimp-image-get-active-drawable image)) (string-append "leek7_" filename ".png") (string-append "leek7" filename ".png"))
	
	(gimp-rect-select image 1170 0 210 h CHANNEL-OP-ADD FALSE 0)
	(gimp-edit-cut drawable)
	(gimp-floating-sel-to-layer (car (gimp-edit-paste drawable TRUE)))
	(plug-in-autocrop-layer 0 image (car (gimp-image-get-active-drawable image)))
	(file-png-save-defaults 1 image (car (gimp-image-get-active-drawable image)) (string-append "leek8_" filename ".png") (string-append "leek8" filename ".png"))
	
	(gimp-rect-select image 1380 0 230 h CHANNEL-OP-ADD FALSE 0)
	(gimp-edit-cut drawable)
	(gimp-floating-sel-to-layer (car (gimp-edit-paste drawable TRUE)))
	(plug-in-autocrop-layer 0 image (car (gimp-image-get-active-drawable image)))
	(file-png-save-defaults 1 image (car (gimp-image-get-active-drawable image)) (string-append "leek9_" filename ".png") (string-append "leek9" filename ".png"))
	
	(gimp-rect-select image 1605 0 230 h CHANNEL-OP-ADD FALSE 0)
	(gimp-edit-cut drawable)
	(gimp-floating-sel-to-layer (car (gimp-edit-paste drawable TRUE)))
	(plug-in-autocrop-layer 0 image (car (gimp-image-get-active-drawable image)))
	(file-png-save-defaults 1 image (car (gimp-image-get-active-drawable image)) (string-append "leek10_" filename ".png") (string-append "leek10" filename ".png"))
	
	(gimp-rect-select image 1820 0 250 h CHANNEL-OP-ADD FALSE 0)
	(gimp-edit-cut drawable)
	(gimp-floating-sel-to-layer (car (gimp-edit-paste drawable TRUE)))
	(plug-in-autocrop-layer 0 image (car (gimp-image-get-active-drawable image)))
	(file-png-save-defaults 1 image (car (gimp-image-get-active-drawable image)) (string-append "leek11_" filename ".png") (string-append "leek11" filename ".png"))
	
	(gimp-selection-none image)

	; Cleanup
	(gimp-undo-push-group-end image)
	(gimp-displays-flush)
))

(script-fu-register
	"script-fu-leekwars_leek"
	_"<Image>/Filters/Artistic/Leekwars Leeks"
	"Leekwars Leeks"
	"Pilow <pierre.laupretre@gmail.com>"
	"Pilow"
	"2013/01/12"
	"RGBA GRAYA"
	SF-IMAGE "Image" 0
	SF-DRAWABLE "Drawable" 0
    SF-STRING "Nom des fichiers" "color"
)
