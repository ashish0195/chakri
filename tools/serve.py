#!/usr/bin/env python3
"""Serves the Chakri folder for development, with caching off: python3 tools/serve.py [port]"""
import functools
import http.server
import os
import sys


class NoCache(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, '.js': 'text/javascript', '.mjs': 'text/javascript'}

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8642
handler = functools.partial(NoCache, directory=root)
print(f'Serving {root} at http://localhost:{port}', flush=True)
http.server.ThreadingHTTPServer(('127.0.0.1', port), handler).serve_forever()
