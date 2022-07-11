(define
	(script-fu-leekwars_chip image drawable color)

	; Début du groupe d'annulation (un Ctrl+Z revient ici)
	(gimp-undo-push-group-start image)

	(let* (
		; Création d'un nouveau calque
		(calque1 (car (gimp-layer-new image 280 280 RGBA-IMAGE "Inner shadow" 100 NORMAL-MODE)))
		(calque2 (car (gimp-layer-new image 320 320 RGBA-IMAGE "Inner shadow" 100 NORMAL-MODE)))
		(image-width (car (gimp-image-width image)))
		(image-height (car (gimp-image-height image)))
		(final-w image-width)
		(final-h image-height)
	)
	
	(gimp-context-set-foreground color)
	(gimp-context-set-background '(255 255 255))
	
	 ; Ajout du nouveau calque dans l'image
    (gimp-image-add-layer image calque1 1)
    (gimp-image-add-layer image calque2 3)
    
    (gimp-image-resize-to-layers image)
    	
	(gimp-edit-blend calque1 FG-BG-RGB-MODE NORMAL-MODE GRADIENT-LINEAR 100 0 0 TRUE TRUE 3 0.2 TRUE 0 0 0 280)
	
	(gimp-context-set-foreground '(50 50 50))
	(gimp-edit-fill calque2 0)
	
	(gimp-layer-translate drawable 35 35) 
	(gimp-layer-translate calque1 20 20) 
	
	; Dégradé dans le motif
	(gimp-selection-layer-alpha drawable)
	
	(gimp-context-set-foreground '(100 100 100))
	(gimp-context-set-background '(0 0 0))
	(gimp-edit-blend drawable FG-BG-RGB-MODE NORMAL-MODE GRADIENT-LINEAR 100 0 0 FALSE TRUE 3 0.2 TRUE 0 0 0 280)
	
	(gimp-selection-none image)
	
	(gimp-image-merge-visible-layers image EXPAND-AS-NECESSARY)
	

	; Cleanup
	(gimp-undo-push-group-end image)
	(gimp-displays-flush)
))

(script-fu-register
	"script-fu-leekwars_chip"
	_"<Image>/Filters/Artistic/Leekwars Chip"
	"Leekwars Chip"
	"Pilow <>"
	"Pilow"
	"2013/01/12"
	"RGBA GRAYA"
	SF-IMAGE "Image" 0
	SF-DRAWABLE "Drawable" 0
    SF-COLOR "Couleur" '(255 0 0)
)
