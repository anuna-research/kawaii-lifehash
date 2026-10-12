import {test, expect} from '@playwright/test';
test.beforeEach(async ({page}) => {await page.goto('/');});
test('TEST-003: exact scalar input digest and invalid strings', async ({page})=>{
 const result=await page.evaluate(async()=>{
 const {generateAvatar}=await import('/dist/index.js');
 const seeds=['',' ','😀','a\0b','é','e\u0301','<svg onload="alert(1)">'];
 const pairs=[];
 for(const seed of seeds){const a=await generateAvatar(seed); const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(seed));pairs.push([a.digest,Array.from(new Uint8Array(d),b=>b.toString(16).padStart(2,'0')).join('')]);}
 const errors=[];for(const s of [null,42,{},'\ud800','\udc00']){try{await generateAvatar(s as any);errors.push(false)}catch{errors.push(true)}}
 return {pairs,errors};});
 expect(result.pairs.every(([a,b])=>a===b)).toBe(true);expect(result.errors.every(Boolean)).toBe(true);expect(result.pairs[4][0]).not.toBe(result.pairs[5][0]);
});
test('TEST-005/006/010: deterministic, validated and neutral portable SVG',async({page})=>{
 const r=await page.evaluate(async()=>{const m=await import('/dist/index.js');const a=await m.generateAvatar('researcher:42');const b=await m.generateAvatar('researcher:42');const svg=m.avatarSVG(a,{label:'<script>&"'});const errors=[];for(const o of [{size:NaN},{size:0},{shape:'<svg>'},{other:1},{label:'\ud800'}]){try{m.avatarSVG(a,o as any);errors.push(false)}catch{errors.push(true)}}for(const i of [{...a,recipe:'bad'},{...a,digest:'invalid'},{...a,traits:{...a.traits,shape:'script'}},{...a,fingerprint:{...a.fingerprint,pixels:[-1]}}]){try{m.avatarSVG(i as any);errors.push(false)}catch{errors.push(true)}}return {same:JSON.stringify(a)===JSON.stringify(b),svg,repeat:svg===m.avatarSVG(b,{label:'<script>&"'}),errors};});
 expect(r.same&&r.repeat).toBe(true);expect(r.errors.every(Boolean)).toBe(true);expect(r.svg).toContain('&lt;script&gt;');expect(r.svg).not.toContain('<script>');expect(r.svg).not.toContain('http://localhost');
});
test('TEST-004: independently invoked canonical C++ pixels', async({page})=>{
 const {execFileSync}=await import('node:child_process');
 for(const seed of ['', 'reference:42','😀','a\0b']){
  const identity=await page.evaluate(async(s)=>(await import('/dist/index.js')).generateAvatar(s),seed);
  const pixels=JSON.parse(execFileSync('./evidence/reference-renderer',[identity.digest],{encoding:'utf8'}));
  expect(identity.fingerprint.pixels).toEqual(pixels);
 }
});
test('TEST-010: standalone SVG image has transparent exterior and a visible texture',async({page})=>{
 const r=await page.evaluate(async()=>{const m=await import('/dist/index.js');const a=await m.generateAvatar('portable');const svg=m.avatarSVG(a);const image=new Image();image.src=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));await image.decode();const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d')!;ctx.drawImage(image,0,0);const data=ctx.getImageData(0,0,256,256).data;URL.revokeObjectURL(image.src);return {outside:data[3],inside:data[(139*256+128)*4+3],colours:new Set(Array.from({length:256*256},(_,i)=>Array.from(data.slice(i*4,i*4+3)).join(','))).size};});
 expect(r.outside).toBe(0);expect(r.inside).toBe(255);expect(r.colours).toBeGreaterThan(100);
});
test('TEST-006/010: labels remain XML and malformed or mismatched fingerprints fail',async({page})=>{
 const r=await page.evaluate(async()=>{
  const m=await import('/dist/index.js');const a=await m.generateAvatar('labels');const b=await m.generateAvatar('other');
  const svg=m.avatarSVG(a,{label:'NUL\0 control\u0001 & quote"'});const xml=new DOMParser().parseFromString(svg,'image/svg+xml');
  const failures=[];for(const f of [{...a.fingerprint,pixels:new Array(4096)},{...a.fingerprint,dataURI:'data:image/png;base64,AAAA'},{...a.fingerprint,dataURI:b.fingerprint.dataURI}]){try{m.avatarSVG({...a,fingerprint:f});failures.push(false)}catch{failures.push(true)}}
  return {xml:!xml.querySelector('parsererror'),failures};
 });expect(r.xml).toBe(true);expect(r.failures).toEqual([true,true,true]);
});
test('TEST-004/005: decoded full square pixels and reload repeatability',async({page})=>{
 const snapshot=async()=>page.evaluate(async()=>{const {generateAvatar,avatarSVG}=await import('/dist/index.js');const a=await generateAvatar('reload:😀\0');const image=new Image();const svg=avatarSVG(a);const parsed=new DOMParser().parseFromString(svg,'image/svg+xml');image.src=parsed.querySelector('.coat image')!.getAttribute('href')!;await image.decode();const c=document.createElement('canvas');c.width=c.height=32;const ctx=c.getContext('2d')!;ctx.drawImage(image,0,0,32,32);const decoded=Array.from(ctx.getImageData(0,0,32,32).data);return {identity:a,svg:avatarSVG(a),decoded};});
 const before=await snapshot();expect(before.decoded).toEqual(before.identity.fingerprint.pixels);await page.reload();const after=await snapshot();expect(after).toEqual(before);
});
test('the only recipe generates six deterministic shapes and rejects unsupported inputs',async({page})=>{
 const result=await page.evaluate(async()=>{
  const m=await import('/dist/index.js');const a=await m.generateAvatar('example:6');const explicit=await m.generateAvatar('example:6',{recipe:m.RECIPE});const found=new Set<string>();for(let n=0;n<128;n++)found.add((await m.generateAvatar(`shape:${n}`)).traits.shape);
  const failures=[];try{await m.generateAvatar('x',{recipe:'unsupported' as any});failures.push(false);}catch{failures.push(true);}try{m.avatarSVG({...a,recipe:'unsupported'} as any);failures.push(false);}catch{failures.push(true);}for(const shape of ['ghost','star']){try{m.avatarSVG(a,{shape:shape as any});failures.push(false);}catch{failures.push(true);}}
  const avatar=document.querySelector('lifehash-avatar')!;let inputError=false;avatar.addEventListener('generation-error',()=>{inputError=true;});avatar.setAttribute('recipe','unsupported');
  return {same:JSON.stringify(a)===JSON.stringify(explicit),shapes:[...found].sort(),recipes:m.RECIPES,failures,componentRecipe:avatar.recipe,inputError};
 });expect(result.same).toBe(true);expect(result.shapes).toEqual(['bloom','capsule','comet','droplet','egg','pebble']);expect(result.recipes).toEqual(['kawaii-lifehash-v5']);expect(result.failures).toEqual([true,true,true,true]);expect(result.componentRecipe).toBe('kawaii-lifehash-v5');expect(result.inputError).toBe(true);
});
test('all six shapes and four coats render at small sizes without changing the fingerprint',async({page})=>{
 const result=await page.evaluate(async()=>{
  const m=await import('/dist/index.js');const a=await m.generateAvatar('example:6');const before=JSON.stringify(a);const faces=[];const outside=[];const alpha=[];
  for(const shape of m.SHAPES)for(const coat of m.COATS)for(const size of [32,256]){const svg=m.avatarSVG(a,{shape,coat,size});const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await image.decode();const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d')!;ctx.drawImage(image,0,0,size,size);faces.push(ctx.getImageData(Math.floor(size/2),Math.floor(size*139/256),1,1).data[3]);outside.push(ctx.getImageData(0,0,1,1).data[3]);if(shape==='pebble'&&size===256)alpha.push(Array.from(ctx.getImageData(0,0,size,size).data).filter((_,i)=>i%4===3).join(','));}
  const failures=[];for(const coat of ['invalid',undefined]){try{m.avatarSVG({...a,traits:{...a.traits,coat}} as any);failures.push(false);}catch{failures.push(true);}}try{m.avatarSVG(a,{coat:'invalid' as any});failures.push(false);}catch{failures.push(true);}
  return {unchanged:before===JSON.stringify(a),faces,outside,distinct:new Set(alpha).size,failures};
 });expect(result.unchanged).toBe(true);expect(result.faces.every(a=>a===255)).toBe(true);expect(result.outside.every(a=>a===0)).toBe(true);expect(result.distinct).toBe(4);expect(result.failures).toEqual([true,true,true]);
});
test('new avatars and components use the soft coat by default',async({page})=>{
 const result=await page.evaluate(async()=>{const m=await import('/dist/index.js');const a=await m.generateAvatar('default:coat');const avatar=document.createElement('lifehash-avatar');document.body.append(avatar);await avatar.ready;return {recipe:a.recipe,coat:a.traits.coat,component:avatar.identity!.traits.coat};});expect(result).toEqual({recipe:'kawaii-lifehash-v5',coat:'soft',component:'soft'});
});
