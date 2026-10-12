import {mkdtemp,writeFile,readFile,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync,spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {chromium,firefox,webkit} from '@playwright/test';
const root=process.cwd();const dir=await mkdtemp(join(tmpdir(),'pebble-consumer-'));const evidence=[];let server,dev;
function command(bin,args){const out=execFileSync(bin,args,{cwd:dir,encoding:'utf8',stdio:['ignore','pipe','pipe']});evidence.push({command:[bin,...args],output:out});return out;}
try{
 await writeFile(join(dir,'package.json'),JSON.stringify({name:'fresh-consumer',private:true,type:'module'}));
 command('npm',['install','--ignore-scripts',join(root,'artifacts/kawaii-lifehash-0.1.0.tgz')]);
 command('node',['--input-type=module','-e',"const m=await import('kawaii-lifehash'); if(typeof m.generateAvatar!=='function'||globalThis.customElements)throw Error('SSR boundary'); console.log('SSR import succeeded');"]);
 await writeFile(join(dir,'typecheck.ts'),"import {generateAvatar, avatarSVG, type AvatarIdentity} from 'kawaii-lifehash'; import {LifeHashAvatar, type AvatarState} from 'kawaii-lifehash/component'; import 'kawaii-lifehash/styles.css'; const state:AvatarState='thinking'; const a:Promise<AvatarIdentity>=generateAvatar('typed'); a.then(x=>avatarSVG(x,{shape:'bloom',size:64})); const el:LifeHashAvatar=document.createElement('lifehash-avatar');el.state=state;");
 command('node',[join(root,'node_modules/typescript/bin/tsc'),'--noEmit','--strict','--module','NodeNext','--moduleResolution','NodeNext','--target','ES2022','typecheck.ts']);
 await writeFile(join(dir,'index.html'),'<html lang="en"><meta charset="utf-8"><title>Fresh consumer</title><body><lifehash-avatar seed="fresh:consumer" state="thinking"></lifehash-avatar><script type="module" src="./main.js"></script></body></html>');
 await writeFile(join(dir,'main.js'),"import {generateAvatar,avatarSVG} from 'kawaii-lifehash';import 'kawaii-lifehash/component';import 'kawaii-lifehash/styles.css';window.result=(async()=>{const a=await generateAvatar('fresh:consumer');const element=document.querySelector('lifehash-avatar');await element.ready;return {digest:a.digest,svg:avatarSVG(a),pixels:a.fingerprint.pixels,traits:a.traits,status:element.status};})();");
 await writeFile(join(dir,'vite.config.mjs'),"export default {base:'./'};");
 dev=spawn('node',[join(root,'node_modules/vite/bin/vite.js'),'--host','127.0.0.1','--port','43872'],{cwd:dir,stdio:'ignore'});
 for(let i=0;i<100;i++){try{await fetch('http://127.0.0.1:43872');break}catch{await new Promise(r=>setTimeout(r,50));}}
 const snapshots=[];
 for(const [name,type] of Object.entries({chromium,firefox,webkit})){const browser=await type.launch();try{const page=await browser.newPage();const requests=[];page.on('request',r=>requests.push(r.url()));await page.goto('http://127.0.0.1:43872');const result=await page.evaluate(()=>window.result);if(result.status!=='resolved'||!result.svg.includes('<svg'))throw Error('Consumer development failed');if(requests.some(u=>u.includes('fresh:consumer')||u.endsWith('.wasm')))throw Error('Unexpected data or engine request');snapshots.push({name,...result});}finally{await browser.close();}}
 dev.kill();dev=undefined;
 command('node',[join(root,'node_modules/vite/bin/vite.js'),'build']);
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname;const relative=path.replace(/^\/nested\/consumer\//,'');if(path===relative)throw Error('Outside mount');const file=join(dir,'dist',relative||'index.html');res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.wasm')?'application/wasm':'text/html');res.end(await readFile(file));}catch{res.statusCode=404;res.end();}});
 await new Promise(r=>server.listen(43873,'127.0.0.1',r));
 for(const [name,type] of Object.entries({chromium,firefox,webkit})){const browser=await type.launch();try{const page=await browser.newPage();await page.goto('http://127.0.0.1:43873/nested/consumer/');const result=await page.evaluate(()=>window.result);const expected=snapshots.find(x=>x.name===name);if(JSON.stringify(result)!==JSON.stringify({digest:expected.digest,svg:expected.svg,pixels:expected.pixels,traits:expected.traits,status:expected.status}))throw Error('Nested production mismatch');const requests=[];await page.route('**/*',r=>r.abort());page.on('request',r=>requests.push(r.url()));await page.evaluate(async()=>{const el=document.querySelector('lifehash-avatar');el.seed='offline:secret';await el.ready;});if(requests.length)throw Error('Offline generation requested network');}finally{await browser.close();}}
 if(snapshots.some(x=>x.digest!==snapshots[0].digest||JSON.stringify(x.pixels)!==JSON.stringify(snapshots[0].pixels)||JSON.stringify(x.traits)!==JSON.stringify(snapshots[0].traits)))throw Error('Cross-browser identity mismatch');
 evidence.push({result:'Fresh install, all entry declarations, SSR, development, nested production, offline generation and cross-browser pixels/traits passed.',browsers:snapshots.map(x=>({name:x.name,digest:x.digest,traits:x.traits}))});
 await writeFile(join(root,'evidence/consumer.json'),JSON.stringify(evidence,null,2));console.log(evidence.at(-1).result);
}finally{dev?.kill();await new Promise(r=>server?server.close(r):r());await rm(dir,{recursive:true,force:true});}
