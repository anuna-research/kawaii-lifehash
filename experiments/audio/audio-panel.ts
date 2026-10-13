import type {LifeHashAvatar} from '../../src/component.js';
import {CompanionVoice,voicePhrase} from '../../src/voice.js';
import {CharacterSpeech,speechCharacter} from '../../src/character-speech.js';
import {AvatarAudio} from '../../src/audio.js';
import {generateName} from '../../demo/kawaii-name.js';
export interface AudioPanel {stop():void;stateChanged():void;dispose():void}
export function initAudioPanel(hero:LifeHashAvatar,seed:HTMLInputElement,sizeAvatars:LifeHashAvatar[]):AudioPanel{
 const listeners:(()=>void)[]=[];
 function listen(target:EventTarget,event:string,handler:EventListener){target.addEventListener(event,handler);listeners.push(()=>target.removeEventListener(event,handler));}
const voiceEnabled=document.querySelector<HTMLInputElement>('#voice-enabled')!;
const stopButton=document.querySelector<HTMLButtonElement>('#stop-voice')!;
const voiceCaption=document.querySelector('#voice-phrase')!;
const level=(value:number)=>{hero.setAudioLevel(value);for(const avatar of sizeAvatars)avatar.setAudioLevel(value);};
const voice=new CompanionVoice(level);
const speech=new CharacterSpeech(level);
const audio=new AvatarAudio({setAudioLevel:level});
const speechText=document.querySelector<HTMLTextAreaElement>('#speech-text')!;
const engine=document.querySelector<HTMLSelectElement>('#voice-engine')!;
const phraseLength=document.querySelector<HTMLInputElement>('#phrase-length')!;
listen(phraseLength,'input',()=>{document.querySelector('#phrase-length-value')!.textContent=`${phraseLength.value} syllables`;});
function updateVoiceCharacter(){document.querySelector('#voice-character')!.textContent=speechCharacter(hero.seed).label;}
updateVoiceCharacter();
let utterance=0,lastVoiceSeed=hero.seed,playback=0;
function stopVoice(){playback++;voice.stop();speech.stop();audio.stop();stopButton.disabled=true;}
async function hearVoice(){
 stopVoice();const current=playback;
 if(lastVoiceSeed!==hero.seed){utterance=0;lastVoiceSeed=hero.seed;}
 const phrase=voicePhrase(hero.seed,hero.state,utterance++,{syllables:Number(phraseLength.value)});
 voiceCaption.textContent=`${hero.dataset.name}: “${phrase.text}”`;
 stopButton.disabled=false;
 try{if(engine.value==='procedural')await voice.play(phrase);else await speech.play(phrase.notes.map((n,i)=>n.syllable+((i+1)%3===0?',':'')).join(' '),hero.seed,hero.state);}catch{if(current===playback)voiceCaption.textContent='Character speech could not start. Use the local macOS demo, or choose Procedural chatter.';}
 finally{if(current===playback){voice.stop();speech.stop();audio.stop();stopButton.disabled=true;}}
}
async function speakText(plain=false){
 stopVoice();const current=playback;
 const text=speechText.value.trim();if(!text){voiceCaption.textContent='Write a little something to say.';return;}
 voiceCaption.textContent=`${hero.dataset.name}: “${text}”`;
 stopButton.disabled=false;
 try{await speech.play(text,hero.seed,hero.state,plain);}catch{if(current===playback)voiceCaption.textContent='Character speech needs the local macOS demo.';}
 finally{if(current===playback){speech.stop();stopButton.disabled=true;}}
}
listen(document.querySelector('#speak-text')!,'click',()=>{void speakText();});
listen(document.querySelector('#plain-speech')!,'click',()=>{void speakText(true);});
listen(engine,'change',stopVoice);
const exampleVoices=new Set<string>();
for(let i=0;exampleVoices.size<5&&i<100;i++){
 const exampleSeed=`voice companion / ${i}`,character=speechCharacter(exampleSeed);
 if(exampleVoices.has(character.voice))continue;
 exampleVoices.add(character.voice);
 const button=document.createElement('button');button.type='button';button.textContent=`${generateName(exampleSeed)} · ${character.label.split(' · ')[0]}`;
 listen(button,'click',()=>{seed.value=exampleSeed;seed.dispatchEvent(new Event('input',{bubbles:true}));void speakText();});
 document.querySelector('#voice-examples')!.append(button);
}
listen(document.querySelector('#hear-voice')!,'click',()=>{void hearVoice();});
listen(stopButton,'click',stopVoice);
listen(voiceEnabled,'change',()=>{if(voiceEnabled.checked)void hearVoice();else stopVoice();});
listen(document,'visibilitychange',()=>{if(document.hidden)stopVoice();});
listen(window,'pagehide',stopVoice);

listen(seed,'input',()=>{stopVoice();updateVoiceCharacter();});
async function playAudio(input:string|File){
 stopVoice();const current=playback;stopButton.disabled=false;
 voiceCaption.textContent='Playing your audio…';
 try{await audio.play(input);}catch{if(current===playback)voiceCaption.textContent='Could not play this audio. Try another file, or a URL that allows browser access.';}
 finally{if(current===playback){audio.stop();stopButton.disabled=true;}}
}
listen(document.querySelector('#audio-file')!,'change',()=>{const file=document.querySelector<HTMLInputElement>('#audio-file')!.files?.[0];if(file)void playAudio(file);});
listen(document.querySelector('#play-audio-url')!,'click',()=>{const url=document.querySelector<HTMLInputElement>('#audio-url')!.value.trim();if(url)void playAudio(url);});
return {stop:stopVoice,stateChanged(){if(voiceEnabled.checked)void hearVoice();else stopVoice();},dispose(){stopVoice();listeners.forEach(remove=>remove());void audio.dispose();void voice.dispose();void speech.dispose();}};
}
