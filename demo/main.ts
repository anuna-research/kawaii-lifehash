import {generateAvatar,avatarSVG,SHAPES,COATS} from '../src/index.js';
import {STATES,STATE_LABELS,type LifeHashAvatar} from '../src/component.js';
import {generateName} from './kawaii-name.js';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';
hljs.registerLanguage('javascript',javascript);
hljs.registerLanguage('xml',xml);
const hero=document.querySelector<LifeHashAvatar>('#hero')!;
const seed=document.querySelector<HTMLInputElement>('#seed')!;
const querySeed=new URLSearchParams(location.search).get('seed');
if(querySeed!==null){seed.value=querySeed;hero.seed=querySeed;}
hero.dataset.name=generateName(hero.seed);
const download=document.querySelector<HTMLButtonElement>('#download')!;
const status=document.querySelector('#status')!;
const error=document.querySelector('#error')!;
const sizeAvatars:LifeHashAvatar[]=[];
for(const size of [24,32,48,64,96,128,192,256]){
 const figure=document.createElement('figure');figure.className='size-example';
 const avatar=document.createElement('lifehash-avatar');avatar.recipe=hero.recipe;avatar.size=size;avatar.seed=hero.seed;avatar.dataset.name=hero.dataset.name;avatar.state=hero.state;avatar.setAttribute('aria-label',`Companion at ${size} pixels`);
 const caption=document.createElement('figcaption');caption.textContent=`${size} px`;
 figure.append(avatar,caption);document.querySelector('#size-examples')!.append(figure);sizeAvatars.push(avatar);
}
function resolved(){hero.dataset.name=generateName(hero.seed);for(const avatar of sizeAvatars){avatar.seed=hero.seed;avatar.dataset.name=hero.dataset.name;}const identity=hero.identity!;document.querySelector('#character-name')!.textContent=hero.dataset.name;document.querySelector('#character-traits')!.textContent=`${identity.traits.shape.toUpperCase()} / ${(identity.traits.coat??identity.traits.edge).toUpperCase()} COAT`;document.querySelector<HTMLImageElement>('#fingerprint')!.src=identity.fingerprint.dataURI;download.disabled=false;status.textContent='Ready. Your seed stays in this browser.';error.textContent='';}
hero.addEventListener('identity-resolved',resolved);
hero.addEventListener('generation-error',e=>{error.textContent=(e as CustomEvent).detail.error.message;status.textContent='Generation failed. Your input is unchanged.';download.disabled=!hero.identity;});
seed.addEventListener('input',()=>{status.textContent='Preparing your companion…';hero.dataset.name=generateName(seed.value);hero.seed=seed.value;updateMarkup();});
document.querySelector('#new-seed')!.addEventListener('click',()=>{
 seed.value=`little companion / ${crypto.randomUUID()}`;
 seed.dispatchEvent(new Event('input',{bubbles:true}));
});
for(const state of STATES){const button=document.createElement('button');button.type='button';button.tabIndex=0;button.textContent=state[0].toUpperCase()+state.slice(1);button.setAttribute('aria-pressed',String(state==='idle'));button.addEventListener('click',()=>{hero.state=state;for(const avatar of sizeAvatars)avatar.state=state;for(const other of document.querySelectorAll('#states button'))other.setAttribute('aria-pressed',String(other===button));updateMarkup();document.querySelector('#activity-status')!.textContent=STATE_LABELS[hero.state];});document.querySelector('#states')!.append(button);}
download.addEventListener('click',()=>{const blob=new Blob([hero.exportSVG({label:hero.dataset.name})],{type:'image/svg+xml'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=`${hero.dataset.name!.toLowerCase()}-avatar.svg`;anchor.hidden=true;document.body.append(anchor);anchor.click();setTimeout(()=>{anchor.remove();URL.revokeObjectURL(url);},10000);});
hero.ready.then(resolved,()=>{});
const familyNames=SHAPES.map(shape=>generateName(`kawaii-lifehash:friend:${shape}`));
(async()=>{for(const [i,shape] of SHAPES.entries()){const identity=await generateAvatar(`kawaii-lifehash:friend:${shape}`,{recipe:'kawaii-lifehash-v5'});const card=document.createElement('article');card.className='friend';const image=document.createElement('img');image.alt='';image.setAttribute('aria-hidden','true');image.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(avatarSVG(identity,{shape,size:160}))}`;const name=document.createElement('h3');name.textContent=familyNames[i];const description=document.createElement('p');description.textContent=shape;card.append(image,name,description);document.querySelector('#family')!.append(card);}})().catch(e=>{error.textContent=e.message;});

(async()=>{const identity=await generateAvatar('example:0',{recipe:'kawaii-lifehash-v5'});for(const coat of COATS){const card=document.createElement('figure');card.className='coat-example';const image=document.createElement('img');image.alt=`${coat} coat on the same pebble avatar`;image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(avatarSVG(identity,{shape:'pebble',coat,size:256}));const caption=document.createElement('figcaption');caption.textContent=coat==='soft'?'Soft · Default':coat;card.append(image,caption);document.querySelector('#coat-examples')!.append(card);}})().catch(e=>{error.textContent=e.message;});

document.querySelector<HTMLButtonElement>('#copy-link')!.addEventListener('click',async()=>{const url=new URL(location.href);url.searchParams.set('seed',seed.value);history.replaceState(null,'',url);try{await navigator.clipboard.writeText(url.href);status.textContent='Avatar link copied.';error.textContent='';}catch{error.textContent='Could not copy the link. You can copy it from the address bar.';}});

function updateMarkup(){
 const attribute=(value:string)=>value.replace(/[&<>"\r\n\t]/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\r':'&#13;','\n':'&#10;','\t':'&#9;'}[character]!));
 const markup=`<lifehash-avatar seed="${attribute(hero.seed)}"
  data-name="${attribute(hero.dataset.name!)}"
  state="${hero.state}" size="${hero.size}"></lifehash-avatar>`;
 document.querySelector('#sdk-markup')!.innerHTML=hljs.highlight(markup,{language:'xml'}).value;
}
updateMarkup();
const javascriptExample=document.querySelector('#sdk-javascript')!;
javascriptExample.innerHTML=hljs.highlight(javascriptExample.textContent??'',{language:'javascript'}).value;

const taskExample=document.querySelector('#sdk-task')!;
taskExample.innerHTML=hljs.highlight(taskExample.textContent??'',{language:'javascript'}).value;
