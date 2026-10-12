import {fingerprintURI,fingerprintPNGURI} from './fingerprint.js';
import wasmBase64 from './wasm.js';
export const RECIPE = 'kawaii-lifehash-v5' as const;
export const RECIPES = [RECIPE] as const;
export type Recipe = typeof RECIPES[number];
export interface GenerationOptions {recipe?: Recipe}
export const SHAPES = ['pebble', 'droplet', 'capsule', 'bloom', 'comet', 'egg'] as const;
export type Shape = typeof SHAPES[number];
export const COATS = ['smooth', 'soft', 'fluffy', 'shaggy'] as const;
export type Coat = typeof COATS[number];
export type Eyes = 'round' | 'crescent' | 'sparkle';
export interface AvatarIdentity {
 readonly recipe: Recipe;
 readonly digest: string;
 readonly name: string;
 readonly traits: Readonly<{shape: Shape; eyes: Eyes; edge: 'smooth' | 'stitched'; cheeks: number; coat: Coat}>;
 readonly fingerprint: Readonly<{version: 'version2'; width: 32; height: 32; pixels: readonly number[]; dataURI: string}>;
}
export interface SVGOptions {size?: number; label?: string; shape?: Shape; coat?: Coat}
const names = ['Cairn', 'Dewby', 'Podlet', 'Floret', 'Wisp', 'Sprout'];
const eyes = ['round', 'crescent', 'sparkle'] as const;
let engine: Promise<any> | undefined;
export function recognizeSeed(seed: unknown): asserts seed is string {
 if (typeof seed !== 'string') throw new TypeError('Seed must be a primitive string of Unicode scalar values.');
 for (let i=0;i<seed.length;i++) {
  const c=seed.charCodeAt(i);
  if (c>=0xd800&&c<=0xdbff) {const d=seed.charCodeAt(++i);if (!(d>=0xdc00&&d<=0xdfff)) throw new TypeError('Seed contains an unpaired surrogate.');}
  else if (c>=0xdc00&&c<=0xdfff) throw new TypeError('Seed contains an unpaired surrogate.');
 }
}
function record(value: unknown, keys: string[]): asserts value is Record<string, unknown> {
 if (!value || typeof value!=='object' || ![Object.prototype,null].includes(Object.getPrototypeOf(value))) throw new TypeError('Expected a plain record.');
 for (const key of Reflect.ownKeys(value)) {
  if (typeof key!=='string'||!keys.includes(key)) throw new TypeError('Unknown record field.');
  const d=Object.getOwnPropertyDescriptor(value,key)!;
  if (!('value' in d)) throw new TypeError('Accessors are not accepted.');
 }
}
export function recognizeSize(size: unknown): asserts size is number {
 if (typeof size!=='number'||!Number.isFinite(size)||size<=0) throw new RangeError('Size must be a positive finite pixel count.');
}
function traitsFor(digest: string) {
 const bytes=Array.from({length:4},(_,i)=>parseInt(digest.slice(i*2,i*2+2),16));
 return {shape:SHAPES[bytes[0]%SHAPES.length],eyes:eyes[bytes[1]%3],edge:bytes[2]%2?'stitched' as const:'smooth' as const,cheeks:bytes[3]%3,coat:'soft' as const};
}
async function getEngine() {
 if (typeof document==='undefined'||typeof WebAssembly==='undefined'||!globalThis.crypto?.subtle) throw new Error('Avatar generation requires a secure-context browser with Canvas, WebAssembly and Web Crypto.');
 if (!document.createElement('canvas').getContext('2d')) throw new Error('Avatar generation requires Canvas 2D.');
 if (!engine) {
  engine=(async()=>{const {default:create}=await import('./engine/lifehash.js');const binary=Uint8Array.from(atob(wasmBase64),c=>c.charCodeAt(0));return create({wasmBinary:binary,print:()=>{},printErr:()=>{}});})();
  engine.catch(()=>{engine=undefined;});
 }
 return engine;
}
export function recognizeRecipe(recipe: unknown): asserts recipe is Recipe {
 if (!RECIPES.includes(recipe as Recipe)) throw new TypeError('Unknown avatar recipe.');
}
export async function generateAvatar(seed: string = '', options: GenerationOptions = {}): Promise<AvatarIdentity> {
 recognizeSeed(seed);record(options,['recipe']);
 const recipe=options.recipe??RECIPE;recognizeRecipe(recipe);
 const m=await getEngine();
 const digestBytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(seed)));
 const digest=Array.from(digestBytes,b=>b.toString(16).padStart(2,'0')).join('');
 const input=m._malloc(32);let image=0;
 try {
  m.HEAPU8.set(digestBytes,input);
  image=m._lifehash_make_from_digest(input,1,1,true);
  if (!image) throw new Error('LifeHash reference renderer returned no image.');
  const header=new Uint32Array(m.HEAPU8.buffer,image,3);
  if (header[0]!==32||header[1]!==32) throw new Error('Unexpected LifeHash version2 dimensions.');
  const pixels=Array.from(new Uint8Array(m.HEAPU8.buffer,header[2],4096));
  const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;
  const context=canvas.getContext('2d')!;const data=context.createImageData(32,32);data.data.set(pixels);context.putImageData(data,0,0);
  const traits=Object.freeze(traitsFor(digest));
  return Object.freeze({recipe,digest,name:names[SHAPES.indexOf(traits.shape)],traits,fingerprint:Object.freeze({version:'version2' as const,width:32 as const,height:32 as const,pixels:Object.freeze(pixels),dataURI:fingerprintURI(pixels)})});
 } finally {if(image)m._lifehash_image_free(image);m._free(input);}
}
export function recognizeIdentity(identity: unknown): asserts identity is AvatarIdentity {
 record(identity,['recipe','digest','name','traits','fingerprint']);
 recognizeRecipe(identity.recipe);
 if(typeof identity.digest!=='string'||! /^[a-f0-9]{64}$/.test(identity.digest)) throw new TypeError('Unsupported avatar identity.');
 record(identity.traits,['shape','eyes','edge','cheeks','coat']);const traits=identity.traits;const expected=traitsFor(identity.digest);
 if(Object.keys(expected).some(k=>traits[k]!==expected[k as keyof typeof expected])||identity.name!==names[SHAPES.indexOf(expected.shape)]) throw new TypeError('Identity traits do not match its recipe digest.');
 record(identity.fingerprint,['version','width','height','pixels','dataURI']);const f=identity.fingerprint;
 if(f.version!=='version2'||f.width!==32||f.height!==32||!Array.isArray(f.pixels)||f.pixels.length!==4096||Array.from(f.pixels).some(v=>!Number.isInteger(v)||v<0||v>255)||typeof f.dataURI!=='string') throw new TypeError('Invalid LifeHash fingerprint.');
 if(f.dataURI!==fingerprintURI(f.pixels as number[]))throw new TypeError('Fingerprint image does not match its pixels.');
}
export function recognizeOptions(options: unknown): asserts options is SVGOptions {
 record(options,['size','label','shape','coat']);
 if ('size' in options) recognizeSize(options.size);
 if ('label' in options) recognizeSeed(options.label);
 if ('coat' in options && !COATS.includes(options.coat as Coat)) throw new TypeError('Unknown coat.');
 if ('shape' in options && !SHAPES.includes(options.shape as Shape)) throw new TypeError('Unknown silhouette.');
}
const paths: Record<Shape,string>={
 pebble:'M128 48 C176 48 213 84 213 132 C213 180 178 216 128 216 C78 216 43 180 43 132 C43 84 80 48 128 48Z',
 droplet:'M119 47 Q128 38 137 47 L211 121 Q222 132 211 143 L139 215 Q128 226 117 215 L45 143 Q34 132 45 121Z',
 capsule:'M79 49 H177 Q210 49 210 82 V179 Q210 213 176 213 H80 Q46 213 46 179 V82 Q46 49 79 49Z',
 bloom:'M91 47 Q84 47 80 54 L41 121 Q35 132 41 143 L80 210 Q84 217 92 217 H164 Q172 217 176 210 L215 143 Q221 132 215 121 L176 54 Q172 47 164 47Z',
 comet:'M116 49 Q128 30 140 49 L218 190 Q232 213 206 213 H50 Q24 213 38 190Z',
 egg:'M128 35 C160 35 203 99 207 150 C212 199 174 221 128 221 C82 221 44 199 49 150 C53 99 96 35 128 35Z',
};
function escapeXML(value:string){return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g,'�').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));}
export function avatarSVG(identity: AvatarIdentity, options: SVGOptions = {}): string {
 recognizeIdentity(identity);recognizeOptions(options);
 const size=options.size??256;const shape=options.shape??identity.traits.shape;
 const cheekPalettes=[['#e7a3a8','#e6a4c3','#efa999'],['#e8b88a','#e8c979','#b8cca2'],['#bba5d7','#9ac9c7','#a7bde0']];
 const cheeks=cheekPalettes[identity.traits.cheeks][parseInt(identity.digest.slice(8,10),16)%3];
 let eyeMarkup='';let pupils='';
 for (const x of [108,148]) {
  if(identity.traits.eyes==='round')eyeMarkup+=`<ellipse cx="${x}" cy="126" rx="7" ry="9"/>`;
  else if(identity.traits.eyes==='crescent')eyeMarkup+=`<ellipse cx="${x}" cy="126" rx="7" ry="8"/>`;
  else eyeMarkup+=`<ellipse cx="${x}" cy="126" rx="8" ry="9"/>`;
  pupils+=`<ellipse class="pupil" cx="${x}" cy="126" rx="4.5" ry="6.5"/><circle cx="${x-2}" cy="123" r="2" fill="#fff"/>`;

 }
 const coat=options.coat??identity.traits.coat;
 const variant=coat?`-${coat}`:'';
 const maskId=`shape-${identity.digest}-${shape}${variant}`;
 const edgeId=`edge-${identity.digest}-${shape}${variant}`;
 const profile=coat==='smooth'?{major:5,minor:1.5,frequency:'.06 .08'}:coat==='soft'?{major:11,minor:2,frequency:'.065 .075'}:coat==='fluffy'?{major:20,minor:2,frequency:'.075 .075'}:{major:19,minor:4,frequency:'.12 .05'};
 const scale=Math.min(1,size/96);
 const major=profile.major*scale;const minor=profile.minor*scale;
 const edgeSeed=parseInt(identity.digest.slice(0,6),16)%997;
 const ears:Record<Shape,string>={
  pebble:'<circle cx="66" cy="53" r="24"/><circle cx="190" cy="53" r="24"/>',
  droplet:'<ellipse cx="99" cy="51" rx="13" ry="30" transform="rotate(-24 99 51)"/><ellipse cx="151" cy="51" rx="13" ry="30" transform="rotate(24 151 51)"/>',
  capsule:'',
  bloom:'<path d="M61 96 L53 31 Q75 40 92 57Z"/><path d="M164 57 Q181 40 203 31 L195 96Z"/>',
  comet:'',egg:''
 };
 const geometry=`<path class="body" d="${paths[shape]}"/><g class="ears">${ears[shape]}</g>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 256 256" role="img" aria-label="${escapeXML(options.label??identity.name)}"><title>${escapeXML(options.label??identity.name)}</title><defs><filter id="${edgeId}" filterUnits="userSpaceOnUse" x="0" y="0" width="256" height="256" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${profile.frequency}" numOctaves="2" seed="${edgeSeed}" result="tufts"/><feDisplacementMap in="SourceGraphic" in2="tufts" scale="${major}" xChannelSelector="R" yChannelSelector="G" result="uneven"/><feTurbulence type="fractalNoise" baseFrequency=".19 .27" numOctaves="1" seed="${edgeSeed+17}" result="grain"/><feDisplacementMap in="uneven" in2="grain" scale="${minor}" xChannelSelector="R" yChannelSelector="G"/></filter><mask id="${maskId}" maskUnits="userSpaceOnUse" x="0" y="0" width="256" height="256" style="mask-type:alpha"><g fill="#fff" filter="url(#${edgeId})">${geometry}</g></mask></defs><g class="companion"><g class="contour" filter="url(#${edgeId})" fill="none" stroke="#393142" stroke-width="1.25" stroke-opacity="0.25" stroke-linejoin="round" ${identity.traits.edge==='stitched'?'stroke-dasharray="2 7"':''}>${geometry}</g><g class="coat" mask="url(#${maskId})"><image href="${fingerprintPNGURI(identity.fingerprint.pixels)}" x="0" y="0" width="256" height="256" preserveAspectRatio="none" style="image-rendering:pixelated"/></g><g class="face"><g fill="${cheeks}" stroke="#fff8ee" stroke-width="1.5" paint-order="stroke fill"><ellipse cx="96" cy="141" rx="5" ry="3"/><ellipse cx="160" cy="141" rx="5" ry="3"/></g><g class="eyes"><g class="blink"><g fill="none" stroke="#fff8ee" stroke-width="${size<=96?8:4}" stroke-linejoin="round">${eyeMarkup}</g><g class="eye-shapes" fill="#fff8ee" stroke="#fff8ee" stroke-width="2" stroke-linejoin="round">${eyeMarkup}</g><g class="gaze" fill="#292537">${pupils}</g></g></g><g class="mouth" fill="none" stroke-linecap="round"><path d="M122 151 Q128 162 134 151" stroke="#fff8ee" stroke-width="${size<=96?11:7}"/><path d="M122 151 Q128 162 134 151" stroke="#292537" stroke-width="${size<=96?4:3}"/></g></g></g></svg>`;
}
