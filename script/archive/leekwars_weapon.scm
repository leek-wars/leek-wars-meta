(define
	(script-fu-leekwars_weapon image drawable color)

	; Début du groupe d'annulation (un Ctrl+Z revient ici)
	(gimp-undo-push-group-start image)

	(let* (
		; Création d'un nouveau calque
		(image-width (car (gimp-image-width image)))
		(image-height (car (gimp-image-height image)))
		(final-w image-width)
		(final-h image-height)
	)
	
	(gimp-drawable-transform-matrix-default drawable 0.62284 0.13457 21.55306 0.31891 1.15476 -20.037285 -0.00164 0.00224 1.08024 TRUE 0)

	

	; Cleanup
	(gimp-undo-push-group-end image)
	(gimp-displays-flush)
))

(script-fu-register
	"script-fu-leekwars_weapon"
	_"<Image>/Filters/Artistic/Leekwars Weapon"
	"Leekwars Weapon"
	"Pilow <pierre.laupretre@gmail.com>"
	"Pilow"
	"2013/01/12"
	"RGBA GRAYA"
	SF-IMAGE "Image" 0
	SF-DRAWABLE "Drawable" 0
    SF-COLOR "Couleur" '(255 0 0)
)
