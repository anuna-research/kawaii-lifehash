import type {AvatarState} from './component.js';

export const VOICE_VERSION='kawaii-voice-v2';
const vowels={a:[800,1200],i:[300,2300],u:[350,850],o:[500,950],e:[500,1900]} as const;
const onsets=['m','n','w','y','p','b','ch','k','pr'];
const moods:Record<AvatarState,{count:number;pace:number;pitch:number;rise:number;gap:number}>={
 idle:{count:3,pace:1.1,pitch:.85,rise:-.1,gap:.16},
 thinking:{count:4,pace:1.2,pitch:.95,rise:.1,gap:.27},
 speaking:{count:8,pace:.8,pitch:1,rise:0,gap:.06},
 listening:{count:2,pace:.9,pitch:.9,rise:.08,gap:.13},
 success:{count:6,pace:.65,pitch:1.2,rise:.5,gap:.05},
 error:{count:3,pace:.9,pitch:.65,rise:-.3,gap:.1},
 sleepy:{count:3,pace:1.7,pitch:.7,rise:-.35,gap:.3},
 curious:{count:4,pace:.9,pitch:1.05,rise:.5,gap:.15},
 confused:{count:5,pace:1.1,pitch:.9,rise:.3,gap:.22},
};
function random(seed:string){
 let state=2166136261;
 for(const byte of new TextEncoder().encode(seed))state=Math.imul(state^byte,16777619)>>>0;
 return ()=>{state=(state+0x6d2b79f5)>>>0;let t=Math.imul(state^(state>>>15),state|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
}
export interface VoiceNote {syllable:string;vowel:keyof typeof vowels;start:number;duration:number;pitch:number;endPitch:number;formantScale:number;breath:number;noiseSeed:number;stress:number}
export interface VoicePhrase {version:typeof VOICE_VERSION;text:string;duration:number;notes:VoiceNote[]}
export interface VoicePhraseOptions {/** 1–8 syllables; omitted uses the expression's default. */syllables?:number}
/** Same seed, expression and utterance index give the same phrase and voice. */
export function voicePhrase(seed:string,state:AvatarState,index=0,options:VoicePhraseOptions={}):VoicePhrase{
 if(typeof seed!=='string'||!moods[state]||!Number.isSafeInteger(index)||index<0)throw new TypeError('Invalid voice phrase input.');
 const identity=random(`${VOICE_VERSION}:identity:${seed}`);
 const pitch=150+identity()*160,scale=.8+identity()*.45,pace=.85+identity()*.3;
 const next=random(`${VOICE_VERSION}:phrase:${seed}:${state}:${index}`),mood=moods[state];
 const count=options.syllables??mood.count;
 if(!Number.isInteger(count)||count<1||count>8)throw new RangeError('Phrase length must be 1–8 syllables.');
 const notes:VoiceNote[]=[];let cursor=.06;
 const beat=(.2+identity()*.045)*mood.pace*pace;
 for(let i=0;i<count;i++){
  const vowel=(Object.keys(vowels) as (keyof typeof vowels)[])[Math.floor(next()*5)];
  const onset=onsets[Math.floor(next()*onsets.length)];
  // Uneven pairs: the second syllable leans behind the beat, while some pickups lead it.
  const pocket=i%2===1?beat*(.13+next()*.13):-beat*next()*.07;
  const drift=(next()-.5)*beat*.12;
  const start=Math.max(.015,cursor+pocket+drift);
  const duration=beat*(.7+next()*.35)*(i===count-1?1.3:1);
  const stress=i%3===0?.85+next()*.15:.55+next()*.3;
  const frequency=pitch*mood.pitch*(.9+next()*.2)*(1+mood.rise*i/count);
  notes.push({syllable:onset+vowel,vowel,start,duration,pitch:frequency,endPitch:frequency*(1+mood.rise*.3),formantScale:scale,breath:.025+next()*.035,noiseSeed:Math.floor(next()*0xffffffff),stress});
  // A shared pulse, with occasional breathing space between little word groups.
  cursor+=beat+mood.gap*(.25+next()*.5)+(i%3===2?beat*(.25+next()*.35):0);
  cursor=Math.max(cursor,start+duration*.82);
 }
 return {version:VOICE_VERSION,text:notes.map(n=>n.syllable).join(' ')+(state==='success'?'!':mood.rise>.2?'?':'…'),duration:Math.max(cursor,...notes.map(n=>n.start+n.duration))+.18,notes};
}

/** Soft glottal harmonics, moving vowel resonances and seeded breath/articulation. */
export function renderVoice(context:BaseAudioContext,phrase:VoicePhrase,destination:AudioNode,when=context.currentTime){
 const real=new Float32Array(25),imaginary=new Float32Array(25);
 for(let harmonic=1;harmonic<25;harmonic++)imaginary[harmonic]=Math.exp(-harmonic/10)/Math.pow(harmonic,1.55);
 const glottal=context.createPeriodicWave(real,imaginary);
 for(const [index,note] of phrase.notes.entries()){
  const next=random(String(note.noiseSeed));
  const start=when+note.start,end=start+note.duration;
  const envelope=context.createGain(),shape=new Float32Array(64);
  // Rounded attack and release, with a small asymmetrical swell instead of an on/off beep.
  for(let i=0;i<shape.length;i++){
   const t=i/(shape.length-1);
   shape[i]=.3*note.stress*Math.pow(Math.sin(Math.PI*t),.7)*(1-.18*t);
  }
  envelope.gain.setValueCurveAtTime(shape,start,note.duration);envelope.connect(destination);
  const source=context.createOscillator();source.setPeriodicWave(glottal);
  const contour=new Float32Array(48),wander=Array.from({length:7},()=>next()-.5);
  const vibrato=4.5+next()*1.5,phase=next()*Math.PI*2;
  for(let i=0;i<contour.length;i++){
   const t=i/(contour.length-1),position=t*6,section=Math.min(5,Math.floor(position)),fraction=position-section;
   const irregular= (wander[section]*(1-fraction)+wander[section+1]*fraction)*.013;
   const glide=note.pitch+(note.endPitch-note.pitch)*t;
   contour[i]=glide*(.96+.04*Math.min(1,t*6)+.035*Math.sin(Math.PI*t)+irregular+.006*Math.sin(phase+t*note.duration*vibrato*Math.PI*2));
  }
  source.frequency.setValueCurveAtTime(contour,start,note.duration);
  const previous=phrase.notes[index-1]??note,following=phrase.notes[index+1]??note;
  // Moving the mouth between vowels blends syllables rather than fixing a filter per beep.
  for(const [band,frequency] of [...vowels[note.vowel],2700].entries()){
   const resonance=context.createBiquadFilter();resonance.type='bandpass';resonance.Q.value=band===0?2.5:3.5;
   const onsetFrequency=band<2?vowels[previous.vowel][band]:2700;
   const finalFrequency=band<2?vowels[following.vowel][band]:2700;
   resonance.frequency.setValueAtTime((frequency*.7+onsetFrequency*.3)*note.formantScale,start);
   resonance.frequency.linearRampToValueAtTime(frequency*note.formantScale,start+note.duration*.28);
   resonance.frequency.setValueAtTime(frequency*note.formantScale,start+note.duration*.7);
   resonance.frequency.linearRampToValueAtTime((frequency*.8+finalFrequency*.2)*note.formantScale,end);
   const weight=context.createGain();weight.gain.value=band===0?1.7:band===1?.9:.25;
   source.connect(resonance);resonance.connect(weight);weight.connect(envelope);
  }
  // A quiet low-passed fundamental adds body beneath the vowel resonances.
  const warmth=context.createBiquadFilter();warmth.type='lowpass';warmth.frequency.value=550;
  const body=context.createGain();body.gain.value=.18;
  source.connect(warmth);warmth.connect(body);body.connect(envelope);
  source.start(start);source.stop(end);
  const noise=context.createBuffer(1,Math.ceil(context.sampleRate*note.duration),context.sampleRate);
  const data=noise.getChannelData(0);
  const plosive=/^(p|b|k)/.test(note.syllable),fricative=note.syllable.startsWith('ch');
  for(let i=0;i<data.length;i++){
   const t=i/context.sampleRate;
   const articulation=plosive?Math.exp(-t*75)*.13:fricative?Math.exp(-t*22)*.16:0;
   data[i]=(next()*2-1)*(note.breath*.6+articulation);
  }
  const breath=context.createBufferSource();breath.buffer=noise;
  const filter=context.createBiquadFilter();filter.type='bandpass';filter.frequency.value=fricative?3200:1500;filter.Q.value=.6;
  breath.connect(filter);filter.connect(envelope);breath.start(start);breath.stop(end);
 }
}

export class CompanionVoice {
 #context:AudioContext|null=null;#output:GainNode|null=null;#frame=0;#sequence=0;
 constructor(private level:(value:number)=>void){}
 async dispose(){this.stop();await this.#context?.close();this.#context=null;}
 stop(){this.#sequence++;cancelAnimationFrame(this.#frame);this.#output?.disconnect();this.#output=null;this.level(0);}
 async play(phrase:VoicePhrase){
  this.stop();const sequence=this.#sequence;
  const context=this.#context??=new AudioContext();await context.resume();
  if(sequence!==this.#sequence)return;
  const output=context.createGain();output.gain.value=.7;this.#output=output;
  const analyser=context.createAnalyser();analyser.fftSize=256;
  output.connect(analyser);analyser.connect(context.destination);
  const begin=context.currentTime+.04;
  renderVoice(context,phrase,output,begin);
  const samples=new Float32Array(analyser.fftSize);
  return new Promise<void>(resolve=>{
   const tick=()=>{
    if(sequence!==this.#sequence){resolve();return;}
    if(context.currentTime>=begin+phrase.duration){this.stop();resolve();return;}
    analyser.getFloatTimeDomainData(samples);
    this.level(Math.min(1,Math.sqrt(samples.reduce((sum,x)=>sum+x*x,0)/samples.length)*18));
    this.#frame=requestAnimationFrame(tick);
   };tick();
   // Cancellation also settles play even when its animation frame is cancelled.
   setTimeout(resolve,(phrase.duration+.1)*1000);
  });
 }
}
