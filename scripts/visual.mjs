import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
const server=spawn('node',['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','43874'],{stdio:'ignore'});
const browser=await chromium.launch();
try{
 for(let i=0;i<100;i++){try{await fetch('http://127.0.0.1:43874');break}catch{await new Promise(r=>setTimeout(r,50));}}
 const page=await browser.newPage({viewport:{width:1440,height:1100}});await page.goto('http://127.0.0.1:43874');await page.waitForFunction(()=>document.querySelector('lifehash-avatar')?.status==='resolved');await page.screenshot({path:'evidence/demo-desktop.png',fullPage:true});
 await page.setViewportSize({width:375,height:900});await page.screenshot({path:'evidence/demo-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1600});await page.emulateMedia({reducedMotion:'no-preference'});
 for(const size of [64,256])for(const state of ['idle','thinking','speaking','listening','success','error']){
  await page.evaluate(async({size,state})=>{
   const {generateAvatar,SHAPES,avatarSVG}=await import('/dist/index.js');const {fingerprintURI,fingerprintPNGURI}=await import('/dist/fingerprint.js');await import('/dist/component.js');
   const seeds={};for(let n=0;Object.keys(seeds).length<5;n++){const a=await generateAvatar(`visual:${n}`);seeds[a.traits.shape]=`visual:${n}`;}
   const examples=await Promise.all(SHAPES.map(shape=>generateAvatar(seeds[shape])));
   document.body.innerHTML='';document.head.querySelectorAll('link').forEach(x=>x.remove());
   const style=document.createElement('style');style.textContent=`body{margin:20px;background:#eee;color:#333;font:14px system-ui}h1{font:24px system-ui}.matrix{display:grid;grid-template-columns:100px repeat(5,${size+20}px);gap:12px;align-items:center}.cell{text-align:center;background:#d4d4d4;border-radius:6px;padding:10px}span{display:block;font-size:11px}lifehash-avatar{display:block}`;document.head.append(style);
   const heading=document.createElement('h1');heading.textContent=`${state} · ${size}px · coat visibility matrix`;document.body.append(heading);const matrix=document.createElement('div');matrix.className='matrix';document.body.append(matrix);
   matrix.append(document.createElement('span'));for(const shape of SHAPES){const title=document.createElement('span');title.textContent=shape;matrix.append(title);}
   for(const background of ['black','white','mid-gray','checkerboard','LifeHash']){
    const label=document.createElement('span');label.textContent=background;matrix.append(label);
    for(const [index,shape] of SHAPES.entries()){
     const cell=document.createElement('div');cell.className='cell';const avatar=document.createElement('lifehash-avatar');avatar.seed=seeds[shape];avatar.size=size;avatar.state=state;cell.append(avatar);matrix.append(cell);await avatar.ready;
     const pixels=Array.from(examples[index].fingerprint.pixels);
     if(background!=='LifeHash')for(let y=0;y<32;y++)for(let x=0;x<32;x++){const v=background==='black'?0:background==='white'?255:background==='mid-gray'?128:(x+y)%2?255:0;const p=(y*32+x)*4;pixels[p]=pixels[p+1]=pixels[p+2]=v;pixels[p+3]=255;}
     avatar.shadowRoot.querySelector('.coat').innerHTML='<image href="'+fingerprintPNGURI(pixels)+'" width="256" height="256" style="image-rendering:pixelated"/>';
     avatar.getBoundingClientRect();for(const animation of avatar.shadowRoot.getAnimations()){animation.pause();animation.currentTime=Number(animation.effect.getComputedTiming().duration)*({idle:.5,thinking:.25,speaking:.5,listening:.4,success:.45,error:.25}[state]);}
    }
   }
  },{size,state});
  await page.screenshot({path:`evidence/face-${size}-${state}.png`,fullPage:true});
  if(state==='idle'||state==='speaking'){
   await page.evaluate(state=>{for(const avatar of document.querySelectorAll('lifehash-avatar'))for(const animation of avatar.shadowRoot.getAnimations()){const selected=state==='idle'?'blink':'talk';if(animation.animationName===selected){animation.pause();animation.currentTime=Number(animation.effect.getComputedTiming().duration)*(state==='idle'?.415:.36);}}},state);
   await page.screenshot({path:`evidence/face-${size}-${state}-${state==='idle'?'blink':'open'}.png`,fullPage:true});
  }

 }
 for(const size of [64,256]){
 await page.evaluate(async(size)=>{
  const {generateAvatar,avatarSVG,SHAPES}=await import('/dist/index.js');const {fingerprintURI,fingerprintPNGURI}=await import('/dist/fingerprint.js');document.body.innerHTML='<h1>Neutral exports · '+size+'px · full coat matrix</h1>';
  const matrix=document.createElement('div');matrix.className='matrix';matrix.style.gridTemplateColumns='100px repeat(5,'+(size+20)+'px)';document.body.append(matrix);
  for(const background of ['black','white','mid-gray','checkerboard','LifeHash']){const label=document.createElement('span');label.textContent=background;matrix.append(label);for(const shape of SHAPES){const a=await generateAvatar('export:'+shape);const pixels=Array.from(a.fingerprint.pixels);if(background!=='LifeHash')for(let y=0;y<32;y++)for(let x=0;x<32;x++){const v=background==='black'?0:background==='white'?255:background==='mid-gray'?128:(x+y)%2?255:0;const p=(y*32+x)*4;pixels[p]=pixels[p+1]=pixels[p+2]=v;pixels[p+3]=255;}const identity={...a,fingerprint:{...a.fingerprint,pixels,dataURI:fingerprintURI(pixels)}};const image=document.createElement('img');image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(avatarSVG(identity,{shape,size}));image.width=size;image.height=size;matrix.append(image);await image.decode();}}
 },size);await page.screenshot({path:'evidence/export-'+size+'.png',fullPage:true});
 }
 await writeFile('evidence/visual-matrix.json',JSON.stringify({sizes:[64,256],states:['idle','thinking','speaking','listening','success','error'],shapes:['pebble','droplet','capsule','bloom','comet'],coats:['black','white','mid-gray','checkerboard','LifeHash'],method:'Deterministic paused animation extrema with normal motion enabled; live shadow artwork coat replaced with worst-case test texture only; no production identity mutation. All state transforms retained. Separate standalone neutral exports rendered as images.'},null,2));
 console.log('Demo and face visibility screenshots recorded.');
}finally{await browser.close();server.kill();}
