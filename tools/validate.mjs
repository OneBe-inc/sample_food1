import {readFileSync, existsSync, statSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'dist/index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate HTML IDs');
for (const [,path] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (path.startsWith('#')) { if (!ids.includes(path.slice(1))) throw new Error('Missing anchor ' + path); }
  else if (!/^(https?:|mailto:|tel:)/.test(path)) {
    const file = resolve(root, 'dist', path);
    if (!existsSync(file) || !statSync(file).size) throw new Error('Missing asset ' + path);
  }
}
for (const [,target] of html.matchAll(/data-dialog="([^"]+)"/g)) if (!ids.includes(target)) throw new Error('Missing dialog ' + target);
for (const name of ['interior','styling','botanical','detail']) {
  const photo = readFileSync(resolve(root, `dist/assets/${name}.jpg`));
  if (photo[0] !== 255 || photo[1] !== 216 || photo.length < 10000) throw new Error('Invalid JPEG: ' + name);
}
if (/fujiya|omakase|wp-content|gtag|turnstile/i.test(html)) throw new Error('Reference-site artifact found');
const js = readFileSync(resolve(root,'dist/app.js'),'utf8');
if (/innerHTML|localStorage|sessionStorage|fetch\(|XMLHttpRequest/.test(js)) throw new Error('Unexpected data persistence or unsafe rendering');
execFileSync(process.execPath,['--check',resolve(root,'dist/app.js')],{stdio:'inherit'});
console.log('PASS: local assets, JPEGs, anchors, dialogs, unique IDs, JavaScript syntax, no copied reference-site integration, no form transmission/storage.');
