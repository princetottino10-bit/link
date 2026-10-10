// ホットシート版を手元で開くための小さな静的サーバー（依存なし）
// 使い方：node game/serve.js [port]  →  http://localhost:8080/
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.argv[2]) || 8080;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.md': 'text/plain; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml',
};

http.createServer((req, res) => {
  let rel;
  try { rel = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch (e) { res.writeHead(400); res.end(); return; }
  if (rel.includes(String.fromCharCode(0))) { res.writeHead(400); res.end(); return; }
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403); res.end(); return; } // フォルダの外は出さない
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(buf);
  });
}).listen(PORT, '127.0.0.1', () => {
  process.stdout.write(`プロトコル・スマッシュ: http://localhost:${PORT}/\n`);
});
