import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

export async function readPublicConfig(root=process.cwd()) {
  const values = {};
  const envPath = `${root}/.env`;
  if (existsSync(envPath)) {
    const raw = await readFile(envPath,'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*(SUPABASE_URL|SUPABASE_ANON_KEY)\s*=\s*(.*?)\s*$/);
      if (match) values[match[1]] = match[2].replace(/^(['"])(.*)\1$/,'$2');
    }
  }
  values.SUPABASE_URL = process.env.SUPABASE_URL || values.SUPABASE_URL || '';
  values.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || values.SUPABASE_ANON_KEY || '';
  if (/service_role|sb_secret_/i.test(values.SUPABASE_ANON_KEY)) {
    throw new Error('Unsafe Supabase key: service_role/secret keys must never be used in browser configuration.');
  }
  return values;
}
export function configScript(values) {
  return `window.CFG = ${JSON.stringify(values, null, 2)};\n`;
}
