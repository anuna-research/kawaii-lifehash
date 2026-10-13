import {test,expect} from '@playwright/test';
test('data-name and activity labels work at small sizes without changing identity',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  const a=document.createElement('lifehash-avatar');a.seed='byte / builder';a.dataset.name='Momo';a.size=24;document.body.append(a);await a.ready;
  const identity=a.identity,neutral=a.exportSVG();a.state='thinking';
  const label=a.shadowRoot!.querySelector('svg')!.getAttribute('aria-label');
  const same=a.identity===identity&&a.exportSVG()===neutral;
  a.dataset.name='Custom companion';
  const renamed=a.shadowRoot!.querySelector('svg')!.getAttribute('aria-label');
  const width=a.getBoundingClientRect().width;a.remove();return {label,renamed,same,width,exportName:neutral.includes('Momo')};
 });
 expect(result).toEqual({label:'Momo, Working',renamed:'Custom companion, Working',same:true,width:24,exportName:true});
});
test.beforeEach(async({page})=>{await page.goto('/');await expect(page.locator('.friend')).toHaveCount(6);await expect(page.locator('#download')).toBeEnabled();await page.evaluate(()=>import('/dist/component.js'));});
test('TEST-008: state, independent instances, reconnect, export and input failures',async({page})=>{
 const r=await page.evaluate(async()=>{
 const a=document.createElement('lifehash-avatar');a.seed='alpha';document.body.append(a);const first=await a.ready;const exported=a.exportSVG();
 const b=document.createElement('lifehash-avatar');b.seed='beta';document.body.append(b);await b.ready;
 for(const state of ['thinking','speaking','listening','success','error','sleepy','curious','confused','idle'] as const){a.state=state;if(a.identity!==first)throw new Error('State changed identity');}
 a.dispatchEvent(new PointerEvent('pointermove',{clientX:200,clientY:200}));const neutral=exported===a.exportSVG();
 const failures:string[]=[];a.addEventListener('generation-error',e=>failures.push((e as CustomEvent).detail.kind));a.setAttribute('state','<script>');a.size=NaN;a.seed='\ud800';
 const retained=a.state==='idle'&&a.size===256&&a.seed==='alpha';a.remove();a.dispatchEvent(new PointerEvent('pointermove',{clientX:0,clientY:0}));const disconnected=!a.shadowRoot!.querySelector('.face')!.hasAttribute('transform');document.body.append(a);await a.ready;
 return {neutral,retained,failures,disconnected,independent:a.identity!.digest!==b.identity!.digest,status:a.status};});
 expect(r).toEqual({neutral:true,retained:true,failures:['input','input','input'],disconnected:true,independent:true,status:'resolved'});
});
test('TEST-008: newest seed wins deliberately reordered generation and pending state survives',async({page})=>{
 const r=await page.evaluate(async()=>{
 const native=crypto.subtle.digest.bind(crypto.subtle);const releases:{done:()=>void,seed:string}[]=[];
 crypto.subtle.digest=((algorithm:any,data:any)=>new Promise(resolve=>{releases.push({seed:new TextDecoder().decode(data),done:()=>native(algorithm,data).then(resolve)});} )) as any;
 const a=document.createElement('lifehash-avatar');a.seed='old';document.body.append(a);const old=a.ready.catch(e=>e.message);
 while(releases.length<1)await new Promise(r=>setTimeout(r,5));a.seed='new';a.state='thinking';
 while(releases.length<2)await new Promise(r=>setTimeout(r,5));releases[1].done();await a.ready;const digest=a.identity!.digest;releases[0].done();await new Promise(r=>setTimeout(r,30));crypto.subtle.digest=native;
 return {seeds:releases.map(x=>x.seed),unchanged:digest===a.identity!.digest,state:a.state,old:await old};});
 expect(r.seeds).toEqual(['old','new']);expect(r.unchanged).toBe(true);expect(r.state).toBe('thinking');expect(r.old).toContain('superseded');
});
test('TEST-008: engine failure is observable without unhandled rejection',async({page})=>{
 const unhandled:string[]=[];page.on('pageerror',e=>unhandled.push(e.message));
 const r=await page.evaluate(async()=>{const a=document.createElement('lifehash-avatar');a.seed='valid';document.body.append(a);const first=await a.ready;const native=crypto.subtle.digest;crypto.subtle.digest=(()=>Promise.reject(new Error('induced failure'))) as any;let kind='';a.addEventListener('generation-error',e=>kind=(e as CustomEvent).detail.kind);a.seed='failure';let rejected=false;try{await a.ready}catch{rejected=true}crypto.subtle.digest=native;return {kind,rejected,status:a.status,retained:a.identity===first};});
 expect(r).toEqual({kind:'initialization',rejected:true,status:'failed',retained:true});expect(unhandled).toEqual([]);
});
test('TEST-009: generation performs no network request or audible/microphone action',async({page})=>{
 await page.evaluate(async()=>{const a=document.createElement('lifehash-avatar');document.body.append(a);await a.ready;});
 const urls:string[]=[];page.on('request',r=>urls.push(r.url()));await page.route('**/*',route=>route.abort());
 await page.evaluate(async()=>{const a=document.querySelector('lifehash-avatar')!;a.seed='private-secret-NUL\0😀';await a.ready;a.state='speaking';});
 expect(urls).toEqual([]);
});
test('TEST-014: reduced motion disables decorative animations and pointer response',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 const r=await page.evaluate(async()=>{const a=document.createElement('lifehash-avatar');document.body.append(a);await a.ready;const counts=[];for(const state of ['idle','thinking','speaking','listening','success','error','sleepy','curious','confused'] as const){a.state=state;counts.push(a.shadowRoot!.getAnimations().filter(x=>x.playState==='running').length);}document.dispatchEvent(new PointerEvent('pointermove',{clientX:99,clientY:99}));return {counts,transform:a.shadowRoot!.querySelector('.gaze')!.getAttribute('transform')};});
 expect(r.counts).toEqual([0,0,0,0,0,0,0,0,0]);expect(r.transform).toBeNull();
});
test('TEST-008: malformed global label cannot strand readiness',async({page})=>{
 const unhandled:string[]=[];page.on('pageerror',e=>unhandled.push(e.message));
 const r=await page.evaluate(async()=>{const a=document.createElement('lifehash-avatar');a.setAttribute('aria-label','\ud800\0');document.body.append(a);await a.ready;return {status:a.status,valid:!new DOMParser().parseFromString(a.exportSVG({label:'x\0'}),'image/svg+xml').querySelector('parsererror')};});
 expect(r).toEqual({status:'resolved',valid:true});expect(unhandled).toEqual([]);
});
test('TEST-008: render failures settle readiness and emit a failure signal',async({page})=>{
 const unhandled:string[]=[];page.on('pageerror',e=>unhandled.push(e.message));
 const r=await page.evaluate(async()=>{const a=document.createElement('lifehash-avatar');document.body.append(a);await a.ready;const previous=a.identity;const descriptor=Object.getOwnPropertyDescriptor(ShadowRoot.prototype,'innerHTML')!;Object.defineProperty(a.shadowRoot,'innerHTML',{configurable:true,get(){return descriptor.get!.call(this)},set(value){if(String(value).includes('<svg'))throw new Error('induced render failure');descriptor.set!.call(this,value)}});let signal=false;a.addEventListener('generation-error',()=>signal=true);a.seed='render-failure';let rejected=false;try{await a.ready}catch{rejected=true}delete (a.shadowRoot as any).innerHTML;return {signal,rejected,retained:a.identity===previous,status:a.status};});
 expect(r).toEqual({signal:true,rejected:true,retained:true,status:'failed'});expect(unhandled).toEqual([]);
});
test('TEST-008/014: pupils follow page cursor outside the avatar and release tracking on disconnect',async({page})=>{
 const r=await page.evaluate(async()=>{const a=document.createElement('lifehash-avatar');a.size=64;document.body.append(a);await a.ready;const box=a.getBoundingClientRect();document.dispatchEvent(new PointerEvent('pointermove',{clientX:box.right+400,clientY:box.bottom+400}));const gaze=a.shadowRoot!.querySelector('.gaze')!.getAttribute('transform');const face=a.shadowRoot!.querySelector('.face')!.getAttribute('transform');if(a.shadowRoot!.querySelector('.eye-shapes')!.hasAttribute('transform'))throw new Error('Eye shapes moved');a.remove();document.dispatchEvent(new PointerEvent('pointermove',{clientX:box.left-400,clientY:box.top-400}));const after=a.shadowRoot!.querySelector('.gaze')!.getAttribute('transform');return {gaze,face,after};});
 const [x,y]=r.gaze!.slice(10,-1).split(' ').map(Number);expect(x).toBeGreaterThan(0);expect(x).toBeLessThanOrEqual(1.5);expect(y).toBeGreaterThan(0);expect(y).toBeLessThanOrEqual(1);expect(r.face).toBeNull();expect(r.after).toBeNull();
});
test('TEST-008: distinct expressions retain eye geometry, pupil gaze, identity and neutral export',async({page})=>{
 const r=await page.evaluate(async()=>{const a=document.createElement('lifehash-avatar');document.body.append(a);await a.ready;const identity=a.identity;const neutral=a.exportSVG();const eyes=a.shadowRoot!.querySelector('.eye-shapes');document.dispatchEvent(new PointerEvent('pointermove',{clientX:3000,clientY:3000}));const gaze=a.shadowRoot!.querySelector('.gaze')!.getAttribute('transform');const mouths=[];let stable=true;for(const state of ['idle','thinking','speaking','listening','success','error','sleepy','curious','confused'] as const){a.state=state;mouths.push(a.shadowRoot!.querySelector('.mouth path')!.getAttribute('d'));stable&&=a.shadowRoot!.querySelector('.eye-shapes')===eyes&&a.shadowRoot!.querySelector('.gaze')!.getAttribute('transform')===gaze&&a.identity===identity&&a.exportSVG()===neutral;}return {distinct:new Set(mouths).size,stable};});
 expect(r).toEqual({distinct:9,stable:true});
});
test('TEST-014: idle blinks close and reopen without altering pupil tracking',async({page})=>{
 const r=await page.evaluate(async()=>{const a=document.createElement('lifehash-avatar');document.body.append(a);await a.ready;document.dispatchEvent(new PointerEvent('pointermove',{clientX:3000,clientY:3000}));const gaze=a.shadowRoot!.querySelector('.gaze')!.getAttribute('transform');a.getBoundingClientRect();const blink=a.shadowRoot!.getAnimations().find(animation=>(animation as CSSAnimation).animationName==='blink')!;blink.pause();blink.currentTime=0;const open=a.shadowRoot!.querySelector('.blink')!.getBoundingClientRect().height;blink.currentTime=Number(blink.effect!.getComputedTiming().duration)*.415;const closed=a.shadowRoot!.querySelector('.blink')!.getBoundingClientRect().height;blink.currentTime=0;const reopened=a.shadowRoot!.querySelector('.blink')!.getBoundingClientRect().height;return {closed:closed<open*.2,reopened:Math.abs(reopened-open)<.01,gaze:a.shadowRoot!.querySelector('.gaze')!.getAttribute('transform')===gaze};});
 expect(r).toEqual({closed:true,reopened:true,gaze:true});
});
