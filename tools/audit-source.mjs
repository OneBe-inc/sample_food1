import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const evidence=resolve(root,'.artifacts/copyright-review-20260916');
const read=name=>readFileSync(resolve(root,name),'utf8');
const reference=read('.artifacts/copyright-review-20260916/reference.html');
const html=read('dist/index.html');
function visible(html){return html.replace(/<(script|style|svg)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<[^>]+>/g,'').replace(/\s+/g,'');}
const refText=visible(reference),ownText=visible(html);
const matches=new Set();
for(let i=0;i<ownText.length-24;i++){const part=ownText.slice(i,i+24);if(/[\u3040-\u30ff\u4e00-\u9fff]{8}/.test(part)&&refText.includes(part))matches.add(part);}
const copiedCssSelectors=[...new Set([...read('dist/style.css').matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m=>m[1]))].filter(selector=>selector.length>8&&read('.artifacts/copyright-review-20260916/reference.css').includes('.'+selector));
const scanText=['dist/index.html','dist/style.css','dist/app.js','dist/assets/favicon.svg'].map(read).join('\n');
const foreignMarkers=scanText.match(/fujiya|omakase|pexels|wp-content|cm-h__|p-top__|js-popuplink|i-logo-en|gtag|turnstile/gi)||[];
const photos=readdirSync(resolve(root,'dist/assets')).filter(name=>/\.(png|jpg|jpeg|webp)$/i.test(name));
const images=photos.map(name=>{const bytes=readFileSync(resolve(root,'dist/assets',name));return {file:name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};});
const result={checkedAt:new Date().toISOString(),reference:'https://fujiya1935.com/',scope:'Current reference page and local publish directory; not exhaustive copyright clearance',matchingJapanese24CharacterWindows:[...matches],matchingLongCssClassNames:copiedCssSelectors,foreignMarkers,images,limitations:['Literal comparison cannot detect all adaptations or creative-expression similarity','Common CSS, UI words and section patterns are not treated as infringement proof','No exhaustive reverse image search or model training-data access']};
writeFileSync(resolve(evidence,'source-comparison.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
