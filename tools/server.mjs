import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { readPublicConfig, configScript } from './env.mjs';
const root = path.resolve(process.argv[2] || '.');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.sql':'text/plain; charset=utf-8'};
const server = http.createServer(async (req,res)=>{
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400).end('Bad request'); return; }
  if (pathname === '/') pathname='/index.html';
  if(pathname==='/js/config.js' && root===path.resolve('.')) {
    try {
      const cfg=await readPublicConfig(root);
      if(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY) {res.writeHead(200,{'Content-Type':types['.js'],'Cache-Control':'no-store'}).end(configScript(cfg));return;}
    } catch(e) {res.writeHead(500,{'Content-Type':'text/plain'}).end(e.message);return;}
  }
  const file=path.resolve(root,'.'+pathname);
  if (!file.startsWith(root+path.sep) && file!==root) { res.writeHead(403).end('Forbidden'); return; }
  if (!existsSync(file) || !statSync(file).isFile()) { res.writeHead(404).end('Not found'); return; }
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  createReadStream(file).pipe(res);
});
const port=Number(process.env.PORT||4173);
server.listen(port,'0.0.0.0',()=>console.log(`QARAQALPAQ ASXANASI is available at http://localhost:${port}`));
