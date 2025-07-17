from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from controller import resolver_problema

class Handler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        if self.path == '/otimizar':
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            
            try:
                dados = json.loads(body)
                resultado = resolver_problema(dados)
                
                self._set_headers()
                self.wfile.write(json.dumps(resultado).encode())
            except Exception as e:
                self._set_headers(400)
                self.wfile.write(json.dumps({
                    'error': str(e)
                }).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({
                'Erro': 'Endpoint não encontrado'
            }).encode())

if __name__ == '__main__':
    print('Servidor rodando em http://localhost:8000')
    server = HTTPServer(('', 8000), Handler)
    server.serve_forever()