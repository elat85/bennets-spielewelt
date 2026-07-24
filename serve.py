"""Lokaler Dev-Server ohne Browser-Caching (nur fuer die Entwicklung).
Start: python serve.py  ->  http://localhost:8642"""
import http.server


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()


if __name__ == '__main__':
    http.server.ThreadingHTTPServer(('127.0.0.1', 8642), NoCacheHandler).serve_forever()
