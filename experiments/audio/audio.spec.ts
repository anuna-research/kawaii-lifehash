import {test,expect} from '@playwright/test';

function wave(){
 const samples=24000,buffer=Buffer.alloc(44+samples*2);
 buffer.write('RIFF');buffer.writeUInt32LE(buffer.length-8,4);buffer.write('WAVEfmt ',8);buffer.writeUInt32LE(16,16);
 buffer.writeUInt16LE(1,20);buffer.writeUInt16LE(1,22);buffer.writeUInt32LE(24000,24);buffer.writeUInt32LE(48000,28);
 buffer.writeUInt16LE(2,32);buffer.writeUInt16LE(16,34);buffer.write('data',36);buffer.writeUInt32LE(samples*2,40);
 for(let i=0;i<samples;i++)buffer.writeInt16LE(i<2400?0:Math.round(Math.sin(i*2*Math.PI*220/24000)*8000),44+i*2);
 return buffer;
}

test('audio is absent until opted in and disabling removes controls and playback',async({page})=>{
 const loaded:string[]=[];page.on('request',req=>loaded.push(req.url()));
 await page.goto('/');await expect(page.locator('#download')).toBeEnabled();
 await expect(page.locator('#audio-panel')).toBeEmpty();
 expect(loaded.some(url=>/\/(voice|character-speech|audio)\.(ts|js)/.test(url))).toBe(false);
 await page.locator('#add-audio').check();
 await expect(page.locator('#audio-file')).toBeVisible();
 await page.locator('#audio-file').setInputFiles({name:'hello.wav',mimeType:'audio/wav',buffer:wave()});
 await expect(page.locator('#hero')).toHaveAttribute('data-vocalizing','');
 await page.locator('#add-audio').uncheck();
 await expect(page.locator('#audio-panel')).toBeEmpty();
 await expect(page.locator('#hero')).not.toHaveAttribute('data-vocalizing','');
 await page.locator('#add-audio').check();await expect(page.locator('#audio-file')).toBeVisible();
});

test('file and URL playback move the mouth and restore it without changing identity',async({page})=>{
 await page.route('**/sample.wav',route=>route.fulfill({contentType:'audio/wav',body:wave()}));
 await page.goto('/');await expect(page.locator('#download')).toBeEnabled();
 const digest=await page.locator('#hero').evaluate((hero:any)=>hero.identity.digest);
 await page.locator('#add-audio').check();
 await page.locator('#audio-file').setInputFiles({name:'hello.wav',mimeType:'audio/wav',buffer:wave()});
 await expect(page.locator('#hero')).toHaveAttribute('data-vocalizing','');
 await expect(page.locator('#stop-voice')).toBeDisabled();
 await expect(page.locator('#hero')).not.toHaveAttribute('data-vocalizing','');
 await page.locator('#audio-url').fill('/sample.wav');
 await page.getByRole('button',{name:'Play audio URL'}).click();
 await expect(page.locator('#hero')).toHaveAttribute('data-vocalizing','');
 await page.getByRole('button',{name:'Stop',exact:true}).click();
 await expect(page.locator('#hero')).not.toHaveAttribute('data-vocalizing','');
 expect(await page.locator('#hero').evaluate((hero:any)=>hero.identity.digest)).toBe(digest);
});

test('existing media elements and streams can drive mouth movement',async({page})=>{
 await page.goto('/');await expect(page.locator('#download')).toBeEnabled();
 const result=await page.evaluate(async bytes=>{
  const {AvatarAudio}=await import('/src/audio.ts');
  const levels:number[]=[];const audio=new AvatarAudio({setAudioLevel(level:number){levels.push(level);}});
  const element=document.createElement('audio');element.src=URL.createObjectURL(new Blob([new Uint8Array(bytes)],{type:'audio/wav'}));
  await audio.connectMediaElement(element);await element.play();
  await new Promise(resolve=>element.addEventListener('ended',resolve,{once:true}));
  const media=levels.some(level=>level>.1);audio.stop();levels.length=0;
  const context=new AudioContext();await context.resume();const oscillator=context.createOscillator(),gain=context.createGain();gain.gain.value=.15;
  gain.gain.value=.025;
  const stream=context.createMediaStreamDestination();oscillator.connect(gain);gain.connect(stream);oscillator.start();
  await audio.connectStream(stream.stream);await new Promise(resolve=>setTimeout(resolve,180));
  const live=levels.some(level=>level>.5);await audio.dispose();oscillator.stop();await context.close();URL.revokeObjectURL(element.src);
  return {media,live,restored:levels.at(-1)===0};
 },Array.from(wave()));
 expect(result).toEqual({media:true,live:true,restored:true});
});
