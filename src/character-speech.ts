import type {AvatarState} from './component.js';

const characters=[
 {label:'Velvet · low and warm',voice:'Daniel',pitch:.84,color:1100,air:.1,drive:1.05},
 {label:'Pip · tiny and bright',voice:'Samantha',pitch:1.38,color:2600,air:.25,drive:1},
 {label:'Bramble · husky and textured',voice:'Karen',pitch:.94,color:1500,air:.12,drive:2.4},
 {label:'Wisp · light and airy',voice:'Moira',pitch:1.13,color:3500,air:.55,drive:1},
 {label:'Bumble · round and playful',voice:'Tessa',pitch:1.22,color:850,air:.18,drive:1.35},
] as const;
export function speechCharacter(seed:string){
 let hash=2166136261;
 for(const byte of new TextEncoder().encode(`character-speech-v1:${seed}`))hash=Math.imul(hash^byte,16777619)>>>0;
 return {...characters[hash%characters.length],variation:((hash>>>8)%100)/100};
}
const moods:Record<AvatarState,{rate:number;pitch:number;brightness:number}>={
 idle:{rate:165,pitch:.96,brightness:.9},thinking:{rate:140,pitch:1,brightness:.95},
 speaking:{rate:185,pitch:1,brightness:1},listening:{rate:155,pitch:.98,brightness:.9},
 success:{rate:205,pitch:1.08,brightness:1.3},error:{rate:160,pitch:.9,brightness:.7},
 sleepy:{rate:115,pitch:.9,brightness:.65},curious:{rate:175,pitch:1.06,brightness:1.15},
 confused:{rate:145,pitch:1.02,brightness:.9},
};

export class CharacterSpeech {
 #context:AudioContext|null=null;#source:AudioBufferSourceNode|null=null;#abort:AbortController|null=null;
 #frame=0;#sequence=0;#settle:(()=>void)|null=null;
 constructor(private level:(value:number)=>void){}
 async dispose(){this.stop();await this.#context?.close();this.#context=null;}
 stop(){this.#sequence++;this.#abort?.abort();this.#abort=null;cancelAnimationFrame(this.#frame);this.#source?.stop();this.#source?.disconnect();this.#source=null;this.#settle?.();this.#settle=null;this.level(0);}
 async play(text:string,seed:string,state:AvatarState,plain=false){
  this.stop();const sequence=this.#sequence;
  const context=this.#context??=new AudioContext();await context.resume();
  if(sequence!==this.#sequence)return;
  const character=speechCharacter(seed),mood=moods[state],abort=new AbortController();this.#abort=abort;
  const response=await fetch('/api/speech',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,voice:character.voice,rate:mood.rate}),signal:abort.signal});
  if(!response.ok)throw new Error('Run the local macOS demo to use character speech.');
  const buffer=await context.decodeAudioData(await response.arrayBuffer());
  if(sequence!==this.#sequence)return;
  this.#abort=null;
  const source=context.createBufferSource();source.buffer=buffer;this.#source=source;
  const analyser=context.createAnalyser();analyser.fftSize=256;
  const master=context.createGain();master.gain.value=.8;
  if(plain){source.connect(master);}else{
   const pitch=character.pitch*mood.pitch*(.97+character.variation*.06);
   source.playbackRate.value=pitch;
   // Gentle phrase-level movement keeps real text intelligible.
   const contour=new Float32Array(24);
   for(let i=0;i<contour.length;i++)contour[i]=pitch*(1+.015*Math.sin(i*.85+character.variation*6));
   source.playbackRate.setValueCurveAtTime(contour,context.currentTime+.04,buffer.duration/pitch);
   const resonance=context.createBiquadFilter();resonance.type='peaking';resonance.frequency.value=character.color*mood.brightness;resonance.Q.value=.75;resonance.gain.value=7;
   const soften=context.createBiquadFilter();soften.type='lowpass';soften.frequency.value=character.label.startsWith('Velvet')?2800:6500;
   const saturation=context.createWaveShaper(),curve=new Float32Array(512);
   for(let i=0;i<curve.length;i++){const x=i*2/(curve.length-1)-1;curve[i]=Math.tanh(x*character.drive)/Math.tanh(character.drive);}
   saturation.curve=curve;saturation.oversample='2x';
   source.connect(resonance);resonance.connect(soften);soften.connect(saturation);saturation.connect(master);
   const delay=context.createDelay(.1);delay.delayTime.value=.018+character.variation*.012;
   const air=context.createGain();air.gain.value=character.air;
   soften.connect(delay);delay.connect(air);air.connect(master);
  }
  const compressor=context.createDynamicsCompressor();compressor.threshold.value=-18;compressor.ratio.value=3;
  master.connect(compressor);compressor.connect(analyser);analyser.connect(context.destination);
  const samples=new Float32Array(analyser.fftSize);
  await new Promise<void>(resolve=>{
   this.#settle=resolve;
   source.onended=()=>{if(sequence===this.#sequence){this.#source=null;cancelAnimationFrame(this.#frame);this.#settle=null;this.level(0);master.disconnect();analyser.disconnect();}resolve();};
   const tick=()=>{if(sequence!==this.#sequence)return;analyser.getFloatTimeDomainData(samples);this.level(Math.min(1,Math.sqrt(samples.reduce((sum,x)=>sum+x*x,0)/samples.length)*7));this.#frame=requestAnimationFrame(tick);};
   source.start(context.currentTime+.04);tick();
  });
 }
}
