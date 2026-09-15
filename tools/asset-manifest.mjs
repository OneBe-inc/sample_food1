import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const names=['hero-salon','care-styling','botanical','lounge'];
const assets=names.map(name=>{const original=`assets-source/ai-20260916/${name}.png`,published=`dist/assets/ai-${name}.jpg`;return {name,original,published,sourceSha256:createHash('sha256').update(readFileSync(original)).digest('hex'),publishedSha256:createHash('sha256').update(readFileSync(published)).digest('hex'),derivative:'JPEG quality 88, dimensions unchanged; no content editing'};});
writeFileSync('provenance/asset-manifest.json',JSON.stringify({date:'2026-09-16',tool:'image_gen__imagegen',referenceImages:false,assets},null,2));
