#!/usr/bin/env python3
import os
import http.server
import socketserver

# Change to the public directory
os.chdir('public')

PORT = int(os.getenv('PORT', 8080))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"Server running at http://0.0.0.0:{PORT}")
    httpd.serve_forever()
