import {test,expect} from '@playwright/test';

test('local TTS returns decodable non-silent audio from five different source voices',async({page})=>{
 await page.goto('/');
 const audio=await page.evaluate(async()=>{
  const result=[];
  for(const voice of ['Samantha','Daniel','Karen','Moira','Tessa']){
   const response=await fetch('/api/speech',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:'Hello little companion.',voice,rate:180})});
   if(!response.ok)throw new Error(`${voice}: ${response.status}`);
   const context=new OfflineAudioContext(1,24000,24000);
   const buffer=await context.decodeAudioData(await response.arrayBuffer());
   const data=buffer.getChannelData(0);
   result.push({voice,duration:buffer.duration,energy:data.reduce((sum,x)=>sum+x*x,0),finite:data.every(Number.isFinite)});
  }
  return result;
 });
 expect(audio).toHaveLength(5);
 expect(new Set(audio.map(x=>x.duration)).size).toBeGreaterThan(3);
 for(const sample of audio){expect(sample.finite).toBe(true);expect(sample.energy).toBeGreaterThan(.01);expect(sample.duration).toBeGreaterThan(.2);}
});

test('character speech supports text, comparisons, babble, cancellation and stable profiles',async({page})=>{
 await page.goto('/');await expect(page.locator('#download')).toBeEnabled();
 await page.locator('#add-audio').check();
 await expect(page.locator('#voice-examples button')).toHaveCount(5);
 const result=await page.evaluate(async()=>{
  const {speechCharacter}=await import('/src/character-speech.ts');
  return {same:JSON.stringify(speechCharacter('a'))===JSON.stringify(speechCharacter('a')),voices:new Set(Array.from({length:100},(_,i)=>speechCharacter(`voice companion / ${i}`).voice)).size};
 });expect(result.same).toBe(true);expect(result.voices).toBe(5);
 await page.locator('#speech-text').fill('Hello! I am your little companion.');
 await page.getByRole('button',{name:'Speak text',exact:true}).click();
 await expect(page.locator('#hero')).toHaveAttribute('data-vocalizing','');
 await page.getByRole('button',{name:'Stop',exact:true}).click();
 await expect(page.locator('#hero')).not.toHaveAttribute('data-vocalizing','');
 await page.getByRole('button',{name:'Hear plain voice',exact:true}).click();
 await expect(page.locator('#hero')).toHaveAttribute('data-vocalizing','');
 await page.getByRole('button',{name:'Stop',exact:true}).click();
 await page.locator('#voice-examples button').nth(1).click();
 await expect(page.locator('#hero')).toHaveAttribute('data-vocalizing','');
 await expect(page.locator('#voice-phrase')).toContainText('little companion');
 await page.getByRole('button',{name:'Stop',exact:true}).click();
 await page.getByRole('button',{name:'Hear this companion'}).click();
 await expect(page.locator('#hero')).toHaveAttribute('data-vocalizing','');
 await expect(page.locator('#voice-phrase')).not.toContainText('little companion');
 await page.getByRole('button',{name:'Stop',exact:true}).click();
});

test('speech endpoint rejects unsupported voices and invalid text',async({request})=>{
 for(const body of [{voice:'$(echo unsafe)',rate:180,text:'hello'},{voice:'Samantha',rate:180,text:''},{voice:'Samantha',rate:180,text:'a'.repeat(1001)}]){
  const response=await request.post('/api/speech',{data:body});expect(response.status()).toBe(400);
 }
});
