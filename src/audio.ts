export interface AudioAvatar {setAudioLevel(level:number):void}

/** Optional audio playback and lip movement. Does not create a context until used. */
export class AvatarAudio {
 #context:AudioContext|null=null;#source:AudioBufferSourceNode|null=null;
 #frame=0;#sequence=0;#abort:AbortController|null=null;#settle:(()=>void)|null=null;
 #external:AudioNode|null=null;#element:HTMLMediaElement|null=null;
 #elements=new WeakMap<HTMLMediaElement,MediaElementAudioSourceNode>();
 #disconnect:(()=>void)|null=null;
 constructor(private avatar:AudioAvatar){}
 async #ready(){const context=this.#context??=new AudioContext();await context.resume();return context;}
 stop(){
  this.#sequence++;this.#abort?.abort();this.#abort=null;cancelAnimationFrame(this.#frame);
  this.#source?.stop();this.#source?.disconnect();this.#source=null;
  this.#element?.pause();this.#element=null;this.#external?.disconnect();this.#external=null;
  this.#disconnect?.();this.#disconnect=null;
  this.#settle?.();this.#settle=null;this.avatar.setAudioLevel(0);
 }
 #meter(context:AudioContext,source:AudioNode,audible:boolean){
  const analyser=context.createAnalyser();analyser.fftSize=512;source.connect(analyser);
  const output=context.createGain();output.gain.value=audible?1:0;
  analyser.connect(output);output.connect(context.destination);
  const samples=new Float32Array(analyser.fftSize),sequence=this.#sequence;
  let previous=0;
  const tick=()=>{
   if(sequence!==this.#sequence){analyser.disconnect();output.disconnect();return;}
   analyser.getFloatTimeDomainData(samples);
   const rms=Math.sqrt(samples.reduce((sum,x)=>sum+x*x,0)/samples.length);
   // Compress the level range so quiet speech still makes a readable mouth shape.
   // The floor keeps background noise and silence from opening the mouth.
   const target=Math.min(1,Math.sqrt(Math.max(0,rms-.002)*24));
   previous=target>previous?previous*.2+target*.8:previous*.55+target*.45;
   this.avatar.setAudioLevel(previous<.015?0:previous);
   this.#frame=requestAnimationFrame(tick);
  };tick();
  const disconnect=()=>{analyser.disconnect();output.disconnect();};
  this.#disconnect=disconnect;return disconnect;
 }
 /** Play a URL, uploaded file, or decoded audio buffer. */
 async play(input:string|Blob|AudioBuffer){
  this.stop();const sequence=this.#sequence,context=await this.#ready();
  if(sequence!==this.#sequence)return;
  let buffer:AudioBuffer;
  if(input instanceof AudioBuffer)buffer=input;
  else{
   let bytes:ArrayBuffer;
   if(typeof input==='string'){
    const abort=new AbortController();this.#abort=abort;
    const response=await fetch(input,{signal:abort.signal});if(!response.ok)throw new Error('Audio could not be fetched.');
    bytes=await response.arrayBuffer();
   }else bytes=await input.arrayBuffer();
   buffer=await context.decodeAudioData(bytes);
  }
  if(sequence!==this.#sequence)return;
  this.#abort=null;const source=context.createBufferSource();source.buffer=buffer;this.#source=source;
  const disconnect=this.#meter(context,source,true);
  await new Promise<void>(resolve=>{
   this.#settle=resolve;
   source.onended=()=>{disconnect();if(sequence===this.#sequence){cancelAnimationFrame(this.#frame);this.#source=null;this.#settle=null;this.avatar.setAudioLevel(0);}resolve();};
   source.start();
  });
 }
 /** Route an existing audio/video element; the caller controls its playback. */
 async connectMediaElement(element:HTMLMediaElement){
  this.stop();const sequence=this.#sequence,context=await this.#ready();if(sequence!==this.#sequence)return;
  let source=this.#elements.get(element);
  if(!source){source=context.createMediaElementSource(element);this.#elements.set(element,source);}
  this.#element=element;this.#external=source;this.#meter(context,source,true);
 }
 /** Meter an existing stream. Monitoring is muted by default to avoid feedback. */
 async connectStream(stream:MediaStream,{monitor=false}={}){
  this.stop();const sequence=this.#sequence,context=await this.#ready();if(sequence!==this.#sequence)return;
  const source=context.createMediaStreamSource(stream);this.#external=source;this.#meter(context,source,monitor);
 }
 async dispose(){this.stop();await this.#context?.close();this.#context=null;}
}
