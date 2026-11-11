import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { readPublicConfig, configScript } from './env.mjs';
const root = process.cwd();
const out = `${root}/dist`;
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const entry of ['index.html','admin.html','css','js','assets','design-reference','supabase','.env.example','README.md']) {
  try { await cp(`${root}/${entry}`, `${out}/${entry}`, { recursive: true }); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const values=await readPublicConfig(root);
if(values.SUPABASE_URL && values.SUPABASE_ANON_KEY) {
  await writeFile(`${out}/js/config.js`,configScript(values));
}
console.log('Production bundle created in dist/');
