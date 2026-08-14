#!/bin/sh
# Sert la racine leek-wars pour que l'outil accède à meta/ et client/.
# - multi-thread : le générateur charge une centaine d'images d'un coup, ce
#   qu'un http.server mono-thread ne tient pas (échecs de chargement).
# - sans cache : sinon le navigateur garde un data.js/app.js périmé après édition.
cd "$(dirname "$0")/../../.." || exit 1
exec python3 -c "
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

    def send_header(self, key, value):
        if key == 'Last-Modified':
            return
        super().send_header(key, value)

ThreadingHTTPServer(('127.0.0.1', 8123), Handler).serve_forever()
"
