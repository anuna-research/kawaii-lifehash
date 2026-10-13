import {test,expect} from '@playwright/test';

test('phrase length controls syllable count and duration deterministically',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  const {voicePhrase}=await import('/src/voice.ts');
  const short=voicePhrase('hello','speaking',0,{syllables:1});
  const long=voicePhrase('hello','speaking',0,{syllables:8});
  let rejected=0;
  for(const syllables of [0,9,1.5,NaN])try{voicePhrase('hello','speaking',0,{syllables});}catch{rejected++;}
  return {short:short.notes.length,long:long.notes.length,shorter:short.duration<long.duration,stable:JSON.stringify(long)===JSON.stringify(voicePhrase('hello','speaking',0,{syllables:8})),rejected};
 });
 expect(result).toEqual({short:1,long:8,shorter:true,stable:true,rejected:4});
 await page.locator('#add-audio').check();
 await page.locator('#phrase-length').fill('2');
 await expect(page.locator('#phrase-length-value')).toHaveText('2 syllables');
 await page.getByRole('button',{name:'Hear this companion'}).click();
 const caption=await page.locator('#voice-phrase').textContent();
 expect(caption!.split('“')[1].split('”')[0].split(' ')).toHaveLength(2);
 await page.getByRole('button',{name:'Stop',exact:true}).click();
});

test('seeded voices render real audio for all nine expressions',async({page})=>{
 await page.goto('/');
 const results=await page.evaluate(async()=>{
  const {voicePhrase,renderVoice}=await import('/src/voice.ts');
  const {STATES}=await import('/src/component.ts');
  const first=voicePhrase('companion:42','speaking',0);
  const repeated=voicePhrase('companion:42','speaking',0);
  const changed=voicePhrase('companion:43','speaking',0);
  const next=voicePhrase('companion:42','speaking',1);
  const audio=[];
  for(const state of STATES){
   const phrase=voicePhrase('companion:42',state,0);
   const context=new OfflineAudioContext(1,Math.ceil(phrase.duration*24000),24000);
   renderVoice(context,phrase,context.destination,0);
   const rendered=await context.startRendering(),samples=rendered.getChannelData(0);
   audio.push({state,text:phrase.text,duration:phrase.duration,finite:samples.every(Number.isFinite),peak:Math.max(...samples.map(Math.abs)),energy:samples.reduce((sum,x)=>sum+x*x,0)});
  }
  return {same:JSON.stringify(first)===JSON.stringify(repeated),different:JSON.stringify(first)!==JSON.stringify(changed),next:JSON.stringify(first)!==JSON.stringify(next),audio};
 });
 expect(results.same).toBe(true);expect(results.different).toBe(true);expect(results.next).toBe(true);
 expect(results.audio).toHaveLength(9);
 expect(new Set(results.audio.map(x=>x.text)).size).toBe(9);
 for(const sample of results.audio){expect(sample.finite).toBe(true);expect(sample.peak).toBeGreaterThan(.001);expect(sample.peak).toBeLessThan(1);expect(sample.energy).toBeGreaterThan(.01);}
});

test('voice is opt-in, animates the mouth, stops and follows expressions',async({page})=>{
 await page.goto('/?seed=byte%20%2F%20builder');
 await expect(page.locator('#character-name')).toHaveText('Momo');
 await page.locator('#add-audio').check();
 await expect(page.locator('#voice-engine')).toHaveValue('procedural');
 await expect(page.locator('#voice-enabled')).not.toBeChecked();
 await expect(page.locator('#stop-voice')).toBeDisabled();
 await expect(page.locator('#hero')).not.toHaveAttribute('data-vocalizing','');
 const digest=await page.locator('#hero').evaluate((hero:any)=>hero.identity.digest);
 await page.getByRole('button',{name:'Hear this companion'}).click();
 await expect(page.locator('#voice-phrase')).toContainText('Momo:');
 await expect(page.locator('#stop-voice')).toBeEnabled();
 await expect(page.locator('#hero')).toHaveAttribute('data-vocalizing','');
 await page.getByRole('button',{name:'Stop',exact:true}).click();
 await expect(page.locator('#stop-voice')).toBeDisabled();
 await expect(page.locator('#hero')).not.toHaveAttribute('data-vocalizing','');
 await page.locator('#voice-enabled').check();
 await page.getByRole('button',{name:'Success',exact:true}).click();
 await expect(page.locator('#voice-phrase')).toContainText('!”');
 await page.getByLabel('Your identity seed').fill('echo / reviewer');
 await expect(page.locator('#stop-voice')).toBeDisabled();
 await expect(page.locator('#character-name')).toHaveText('Rokuni');
 await page.getByRole('button',{name:'Curious',exact:true}).click();
 await expect(page.locator('#voice-phrase')).toContainText('Rokuni:');
 await page.locator('#voice-enabled').uncheck();
 await expect(page.locator('#stop-voice')).toBeDisabled();
 await page.getByLabel('Your identity seed').fill('byte / builder');
 await expect(page.locator('#character-name')).toHaveText('Momo');
 expect(await page.locator('#hero').evaluate((hero:any)=>hero.identity.digest)).toBe(digest);
});
