import {generateAvatar,avatarSVG,recognizeSeed,recognizeSize,recognizeRecipe,RECIPE,type Recipe, type AvatarIdentity,type SVGOptions} from './index.js';
export const STATES=['idle','thinking','speaking','listening','success','error','sleepy','curious','confused'] as const;
export type AvatarState=typeof STATES[number];
export interface GenerationFailure {kind:'input'|'initialization';error:Error}
function recognizeState(value:unknown): asserts value is AvatarState {if(!STATES.includes(value as AvatarState))throw new TypeError('Unknown avatar state.');}
const expressions:Record<AvatarState,{mouth:string;left:string;right:string;open:boolean}>={
 idle:{mouth:'M122 151 Q128 162 134 151',left:'M101 109 Q108 106 115 109',right:'M141 109 Q148 106 155 109',open:false},
 thinking:{mouth:'M124 155 Q129 152 134 155',left:'M101 108 Q108 102 115 106',right:'M141 112 Q148 110 155 112',open:false},
 speaking:{mouth:'M123 150 C123 146 133 146 133 150 C135 164 121 164 123 150Z',left:'M101 109 Q108 106 115 109',right:'M141 109 Q148 106 155 109',open:true},
 listening:{mouth:'M125 152 Q128 158 131 152',left:'M101 105 Q108 101 115 105',right:'M141 105 Q148 101 155 105',open:false},
 success:{mouth:'M121 150 Q128 153 135 150 C135 163 121 163 121 150Z',left:'M101 107 Q108 104 115 107',right:'M141 107 Q148 104 155 107',open:true},
 error:{mouth:'M118 160 Q128 142 138 160',left:'M99 113 Q107 108 116 101',right:'M140 101 Q149 108 157 113',open:false},
 sleepy:{mouth:'M123 153 Q128 158 133 153',left:'M101 109 Q108 108 115 109',right:'M141 109 Q148 108 155 109',open:false},
 curious:{mouth:'M125 153 C125 149 131 149 131 153 C131 157 125 157 125 153Z',left:'M100 104 Q108 96 116 102',right:'M141 110 Q148 107 155 110',open:true},
 confused:{mouth:'M119 154 Q123 149 128 155 Q133 161 138 153',left:'M100 104 Q108 97 116 104',right:'M140 112 L156 108',open:false}
};
const css=`
:host{display:inline-block;vertical-align:middle;max-width:100%;width:var(--avatar-size,256px);height:var(--avatar-size,256px)}
.companion{will-change:transform}
svg{display:block;width:100%;height:100%;overflow:visible}
.placeholder{display:grid;place-items:center;height:100%;font:14px system-ui;color:#554c64;background:transparent}
.companion,.mouth,.eyes,.blink,.brows,.cheeks{transform-box:fill-box;transform-origin:center}
.eyes,.brows,.cheeks{transition:transform .22s ease-out,opacity .22s ease-out}
:host([data-motion="idle"]) .companion{animation:breathe 4.8s ease-in-out infinite}
:host([data-motion="idle"]) .blink{animation:blink 6.7s infinite}
:host([data-motion="thinking"]) .companion{animation:ponder 4.2s ease-in-out infinite}
:host([data-motion="thinking"]) .blink{animation:blink 5.3s infinite}
:host([data-motion="thinking"]) .eyes{transform:scaleY(.88)}
:host([data-motion="thinking"]) .brows{animation:consider 4.2s ease-in-out infinite}
:host([data-motion="speaking"]) .mouth{animation:talk 1.3s ease-in-out infinite}
:host([data-motion="speaking"]) .blink{animation:blink 7.1s infinite}
:host([data-motion="speaking"]) .brows{animation:emphasize 2.6s ease-in-out infinite}
:host([data-motion="listening"]) .eyes{transform:scaleY(1.07)}
:host([data-motion="listening"]) .blink{animation:blink 8.1s infinite}
:host([data-motion="listening"]) .companion{animation:nod 3.8s ease-in-out infinite}
:host([data-motion="success"]) .companion{animation:hop .8s ease-in-out 3}
:host([data-motion="success"]) .eyes{transform:scaleY(.78)}
:host([data-motion="success"]) .cheeks{animation:glow 2.4s ease-in-out infinite}
:host([data-motion="error"]) .companion{animation:puzzled 1.8s ease-in-out 1}
:host([data-motion="error"]) .eyes{transform:scaleY(1.12)}
:host([data-motion="error"]) .cheeks{opacity:.85}
:host([data-motion="error"]) .cheeks ellipse{fill:#e08091}
:host([data-motion="sleepy"]) .brows{opacity:.35}
:host([data-motion="sleepy"]) .companion{animation:breathe 7s ease-in-out infinite}
:host([data-motion="sleepy"]) .cheeks{opacity:.65}
:host([data-motion="curious"]) .companion{transform:rotate(5deg)}
:host([data-motion="curious"]) .eyes{transform:scaleY(1.1)}
:host([data-motion="curious"]) .blink{animation:blink 7.7s infinite}
:host([data-motion="confused"]) .companion{animation:puzzled 2.4s ease-in-out 2}
:host([data-motion="confused"]) .blink{animation:blink 6.1s infinite}
:host([data-motion="idle"]) .brows,:host([data-motion="speaking"]) .brows,:host([data-motion="success"]) .brows{opacity:0}
.happy-eyes{display:none}:host([data-motion="success"]) .happy-eyes,:host([data-motion="sleepy"]) .happy-eyes{display:block}:host([data-motion="success"]) .blink,:host([data-motion="sleepy"]) .blink{opacity:0}
.tongue{display:none}:host([data-motion="success"]) .tongue{display:block}
@keyframes blink{0%,40%,43%,76%,79%,100%{transform:scaleY(1)}41.5%,77.5%{transform:scaleY(.08)}}
@keyframes breathe{50%{transform:translateY(-2px) scale(1.008)}}
@keyframes ponder{20%,65%{transform:rotate(-2deg)}40%,85%{transform:rotate(1deg)}}
@keyframes consider{25%,70%{transform:translateY(-2px)}}
@keyframes emphasize{18%,58%{transform:translateY(-2px)}30%,70%{transform:translateY(0)}}
@keyframes talk{0%,100%{transform:scale(.9,.4)}12%{transform:scale(1,1)}23%{transform:scale(.85,.55)}36%{transform:scale(1.05,1.15)}48%{transform:scale(.95,.45)}62%{transform:scale(.9,.9)}75%{transform:scale(1.08,.65)}87%{transform:scale(.9,.35)}}
@keyframes nod{0%,35%,65%,100%{transform:translateY(0)}44%,56%{transform:translateY(3px)}}
@keyframes hop{45%{transform:translateY(-9px) rotate(2deg)}75%{transform:scale(1.025,.975)}}
@keyframes glow{50%{opacity:.75;transform:scale(1.1)}}
@keyframes puzzled{35%,65%{transform:rotate(-4deg)}100%{transform:rotate(0)}}
:host([data-disconnected]) *{animation:none!important}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;
export class LifeHashAvatar extends HTMLElement {
 static observedAttributes=['seed','state','size','recipe','aria-label','aria-hidden'];
 #recipe:Recipe=RECIPE;#seed='';#state:AvatarState='idle';#size=256;#identity:AvatarIdentity|null=null;#status:'pending'|'resolved'|'failed'='pending';
 #sequence=0;#reject:((error:Error)=>void)|undefined;#ready:Promise<AvatarIdentity>;#restore=false;
 #media:MediaQueryList|null=null;#reduced=false;
 #root:ShadowRoot;
 constructor(){super();this.#root=this.attachShadow({mode:'open'});this.#ready=Promise.reject(new Error('Avatar is not connected.'));this.#ready.catch(()=>{});}
 get recipe(){return this.#recipe} set recipe(value:Recipe){this.#input('recipe',value);}
 get seed(){return this.#seed} set seed(value:string){this.#input('seed',value);}
 get state(){return this.#state} set state(value:AvatarState){this.#input('state',value);}
 get size(){return this.#size} set size(value:number){this.#input('size',value);}
 get identity(){return this.#identity} get ready(){return this.#ready} get status(){return this.#status}
 connectedCallback(){this.removeAttribute('data-disconnected');this.#media=matchMedia('(prefers-reduced-motion: reduce)');this.#reduced=this.#media.matches;this.#media.addEventListener('change',this.#motion);this.ownerDocument.addEventListener('pointermove',this.#pointer,{passive:true});this.ownerDocument.addEventListener('pointerleave',this.#leave);this.#render();this.#generate();}
 disconnectedCallback(){this.setAttribute('data-disconnected','');this.#sequence++;this.#reject?.(new Error('Avatar disconnected.'));this.#reject=undefined;this.#media?.removeEventListener('change',this.#motion);this.#media=null;this.ownerDocument.removeEventListener('pointermove',this.#pointer);this.ownerDocument.removeEventListener('pointerleave',this.#leave);this.#leave();}
 attributeChangedCallback(name:string,_old:string|null,value:string|null){
  if(this.#restore)return;
  if(name==='aria-label'||name==='aria-hidden'){this.#render();return;}
  if(name==='size'){
   const parsed=value===null?256:/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value)?Number(value):NaN;
   this.#input('size',parsed,true);
  }else this.#input(name,value??(name==='seed'?'':name==='recipe'?RECIPE:'idle'),true);
 }
 #input(name:string,value:unknown,attribute=false){
  try {
   if(name==='recipe')recognizeRecipe(value);else if(name==='seed')recognizeSeed(value);else if(name==='state')recognizeState(value);else recognizeSize(value);
  }catch(error){
   if(attribute){this.#restore=true;this.setAttribute(name,String(name==='seed'?this.#seed:name==='state'?this.#state:name==='recipe'?this.#recipe:this.#size));this.#restore=false;}
   this.#failure('input',error);return;
  }
  const changed=(name==='seed'&&value!==this.#seed)||(name==='recipe'&&value!==this.#recipe);
  if(name==='recipe')this.#recipe=value as Recipe;else if(name==='seed')this.#seed=value as string;else if(name==='state')this.#state=value as AvatarState;else this.#size=value as number;
  if(!attribute){this.#restore=true;this.setAttribute(name,String(value));this.#restore=false;}
  if(name==='state')this.#presentation();else if(name!=='seed')this.#render();if(changed&&this.isConnected)this.#generate();
 }
 #generate(){
  const seq=++this.#sequence;
  this.#reject?.(new Error('Avatar generation superseded.'));
  this.#status='pending';const seed=this.#seed;const recipe=this.#recipe;
  this.#ready=new Promise((resolve,reject)=>{
   this.#reject=reject;
   // Start in a microtask so the readiness promise is installed before completion.
   Promise.resolve().then(()=>generateAvatar(seed,{recipe})).then(identity=>{
    if(seq!==this.#sequence||!this.isConnected)return;
    const previous=this.#identity;this.#identity=identity;
    try{this.#render();}catch(error){this.#identity=previous;throw error;}
    this.#status='resolved';this.#reject=undefined;resolve(identity);
    this.dispatchEvent(new CustomEvent<AvatarIdentity>('identity-resolved',{detail:identity,bubbles:true,composed:true}));
   }).catch(error=>{
    if(seq!==this.#sequence||!this.isConnected)return;
    this.#status='failed';this.#reject=undefined;reject(error);this.#failure('initialization',error);
    try{this.#render();}catch{/* Readiness and failure signaling are already settled. */}
   });
  });this.#ready.catch(()=>{});
 }
 #failure(kind:GenerationFailure['kind'],error:unknown){this.dispatchEvent(new CustomEvent<GenerationFailure>('generation-error',{detail:{kind,error:error instanceof Error?error:new Error(String(error))},bubbles:true,composed:true}));}
 #render(){
  this.style.setProperty('--avatar-size',`${this.#size}px`);this.setAttribute('data-motion',this.#state);
  if(!this.#identity){this.#root.innerHTML=`<style>${css}</style><div class="placeholder" part="placeholder">${this.#status==='failed'?'Avatar unavailable':'Preparing companion…'}</div>`;return;}
  // The shadow tree scopes static SVG identifiers independently per instance.
  const svg=avatarSVG(this.#identity,{size:this.#size,label:new TextDecoder().decode(new TextEncoder().encode(this.getAttribute('aria-label')??this.#identity.name))});
  this.#root.innerHTML=`<style>${css}</style>${svg}`;
  this.#presentation();
  if(this.getAttribute('aria-hidden')==='true')this.#root.querySelector('svg')!.setAttribute('aria-hidden','true');
 }
 #presentation(){
  this.setAttribute('data-motion',this.#state);
  const face=this.#root.querySelector('.face');if(!face)return;
  const expression=expressions[this.#state];
  const mouth=this.#root.querySelector('.mouth')!;
  const paths=mouth.querySelectorAll('path');
  for(const path of paths)path.setAttribute('d',expression.mouth);
  paths[1].setAttribute('fill',expression.open?'#292537':'none');
  if(!mouth.querySelector('.tongue')){
   const tongue=document.createElementNS('http://www.w3.org/2000/svg','ellipse');tongue.setAttribute('class','tongue');tongue.setAttribute('cx','128');tongue.setAttribute('cy','158');tongue.setAttribute('rx','3');tongue.setAttribute('ry','1.5');tongue.setAttribute('fill','#e7a3a8');mouth.append(tongue);
  }
  if(!face.querySelector('.happy-eyes')){
   const happy=document.createElementNS('http://www.w3.org/2000/svg','g');happy.setAttribute('class','happy-eyes');
   for(const [stroke,width] of [['#fff8ee',this.#size<=96?'8':'4'],['#292537',this.#size<=96?'3':'2']]){
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M102 127 Q108 117 114 127 M142 127 Q148 117 154 127');path.setAttribute('fill','none');path.setAttribute('stroke',stroke);path.setAttribute('stroke-width',width);path.setAttribute('stroke-linecap','round');happy.append(path);
   }face.querySelector('.eyes')!.append(happy);
  }
  for(const path of face.querySelectorAll('.happy-eyes path'))path.setAttribute('d',this.#state==='sleepy'?'M100 124 Q108 132 116 124 M140 124 Q148 132 156 124':'M102 127 Q108 117 114 127 M142 127 Q148 117 154 127');
  let brows=face.querySelector('.brows');
  if(!brows){brows=document.createElementNS('http://www.w3.org/2000/svg','g');brows.setAttribute('class','brows');face.insertBefore(brows,face.querySelector('.eyes'));}
  brows.replaceChildren();
  for(const d of [expression.left,expression.right])for(const [stroke,width] of [['#fff8ee','3'],['#292537','1.5']]){
   const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);path.setAttribute('fill','none');path.setAttribute('stroke',stroke);path.setAttribute('stroke-width',width);path.setAttribute('stroke-linecap','round');brows.append(path);
  }
  face.firstElementChild?.setAttribute('class','cheeks');
 }
 #motion=()=>{this.#reduced=this.#media?.matches??false;this.#leave();};
 #pointer=(event:PointerEvent)=>{
  if(this.#reduced)return;const box=this.getBoundingClientRect();if(!box.width||!box.height)return;
  const dx=(event.clientX-box.left-box.width/2)/box.width;const dy=(event.clientY-box.top-box.height*126/256)/box.height;
  const distance=Math.hypot(dx,dy);const strength=distance?Math.tanh(distance*2)/distance:0;
  const x=dx*strength*1.5;const y=dy*strength;
  this.#root.querySelector('.gaze')?.setAttribute('transform',`translate(${x} ${y})`);
 };
 #leave=()=>{this.#root.querySelector('.gaze')?.removeAttribute('transform');};
 exportSVG(options:SVGOptions={}){if(!this.#identity)throw new Error('No resolved avatar is available.');return avatarSVG(this.#identity,options);}
}
if(!customElements.get('lifehash-avatar'))customElements.define('lifehash-avatar',LifeHashAvatar);
declare global {interface HTMLElementTagNameMap {'lifehash-avatar':LifeHashAvatar}}
