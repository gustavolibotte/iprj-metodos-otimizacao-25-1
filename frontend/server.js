const http = require('http');
const fs = require('fs');
const path = require('path');
const { request } = require('http');

// Caminho base para os arquivos frontend
const baseDir = path.join(__dirname, 'frontend');

// Mime types simples
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
};

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/otimizar') {
    // Redireciona POST para backend Python
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const options = {
        hostname: 'localhost',
        port: 8000,
        path: '/otimizar',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const proxy = request(options, backendRes => {
        let data = '';
        backendRes.on('data', chunk => (data += chunk));
        backendRes.on('end', () => {
          res.writeHead(backendRes.statusCode, {
            'Content-Type': 'application/json',
          });
          res.end(data);
        });
      });

      proxy.on('error', err => {
        console.error('Erro no proxy para backend:', err.message);
        res.writeHead(502);
        res.end('Erro ao conectar com o backend.');
      });

      proxy.write(body);
      proxy.end();
    });

    return;
  }

  // Servir arquivos estáticos
  let filePath = path.join(baseDir, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Arquivo não encontrado.');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
