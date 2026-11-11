import { readFile, access, writeFile, unlink } from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';

const root=process.cwd();
for (const file of ['index.html','admin.html','js/app.js','js/config.js','css/style.css','supabase/schema.sql','README.md','js/config.js.example','design-reference/DESIGN.md']) await access(path.join(root,file));
for (const file of ['js/app.js','js/config.js','tools/server.mjs','tools/build.mjs','tools/env.mjs']) {
  const result=spawnSync(process.execPath,['--check',file],{cwd:root,encoding:'utf8'});
  assert.equal(result.status,0,`${file} syntax error: ${result.stderr}`);
}
const admin=await readFile(path.join(root,'admin.html'),'utf8');
const script=[...admin.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
const temp=path.join(os.tmpdir(),`qara-admin-${process.pid}.js`);
await writeFile(temp,script);
const adminCheck=spawnSync(process.execPath,['--check',temp],{encoding:'utf8'});
await unlink(temp);
assert.equal(adminCheck.status,0,`admin inline JS syntax error: ${adminCheck.stderr}`);
const html=await readFile(path.join(root,'index.html'),'utf8');
for(const token of ['id="home"','id="menu"','id="about"','id="contact"','id="cart-drawer"','id="dish-dialog"']) assert.ok(html.includes(token),`missing UI section ${token}`);
const app=await readFile(path.join(root,'js/app.js'),'utf8');
for(const token of ['create_order','get_table','showDetail','renderCart','delivery','pickup']) assert.ok(app.includes(token),`missing app feature ${token}`);
const sql=await readFile(path.join(root,'supabase/schema.sql'),'utf8');
for(const token of ['enable row level security','security definer','set search_path','create_order','pg_advisory_xact_lock','public.is_admin()']) assert.ok(sql.toLowerCase().includes(token.toLowerCase()),`missing SQL security/function feature ${token}`);
const server=spawn(process.execPath,['tools/server.mjs'],{cwd:root,env:{...process.env,PORT:'4174'},stdio:'ignore'});
try {
  let ready=false;
  for(let i=0;i<30;i++){try{const r=await fetch('http://127.0.0.1:4174/');if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
  assert.ok(ready,'development server did not start');
  for(const route of ['/','/admin.html','/js/app.js','/supabase/schema.sql']){
    const r=await fetch('http://127.0.0.1:4174'+route);assert.equal(r.status,200,`HTTP route failed: ${route}`);
  }
} finally {server.kill('SIGTERM');}
console.log('PASS: static files, JavaScript syntax, UI sections, order features, SQL security markers, and HTTP smoke routes.');
