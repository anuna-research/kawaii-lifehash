import {test,expect} from '@playwright/test';
test('TEST-014: keyboard controls, error announcement, download and responsive layout',async({page})=>{
 await page.goto('/');await expect(page.locator('#download')).toBeEnabled();await expect(page.locator('.friend')).toHaveCount(6);await expect(page.locator('.coat-example')).toHaveCount(4);
 const input=page.getByLabel('Your identity seed');await input.focus();await input.fill('keyboard:42');await expect(page.locator('#status')).toContainText('Ready');await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Idle',exact:true})).toBeFocused();
 await page.keyboard.press('Tab');await page.keyboard.press('Enter');await expect(page.getByRole('button',{name:'Thinking',exact:true})).toHaveAttribute('aria-pressed','true');
 const focusedOutline=await page.getByRole('button',{name:'Thinking',exact:true}).evaluate(e=>getComputedStyle(e).outlineStyle);expect(focusedOutline).toBe('solid');
 const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Download neutral SVG'}).click()]);expect(download.suggestedFilename()).toMatch(/-avatar.svg$/);
 await page.evaluate(()=>{document.querySelector('lifehash-avatar')!.setAttribute('size','bad');});await expect(page.getByRole('alert')).not.toBeEmpty();await expect(input).toHaveValue('keyboard:42');
 for(const width of [375,1280]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(await page.evaluate(()=>{const studio=document.querySelector('.studio')!.getBoundingClientRect();return Array.from(document.querySelectorAll('.controls,input,#download')).every(e=>{const box=e.getBoundingClientRect();return box.left>=studio.left&&box.right<=studio.right;});})).toBe(true);}
 await page.screenshot({path:`evidence/demo-${test.info().project.name}.png`,fullPage:true});
});
test('query seed renders exact text including empty strings, spaces, emoji and URL punctuation',async({page})=>{
 for(const seed of ['', ' hello world 😀 ', 'a+b&c=#/%', 'é\u0000']){
  await page.goto('/?'+new URLSearchParams({seed}));await expect(page.locator('#download')).toBeEnabled();await expect(page.getByLabel('Your identity seed')).toHaveValue(seed);
  const result=await page.evaluate(async seed=>{const hero=document.querySelector('#hero') as any;await hero.ready;const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(seed))),b=>b.toString(16).padStart(2,'0')).join('');const sizes=Array.from(document.querySelectorAll('#size-examples lifehash-avatar')) as any[];await Promise.all(sizes.map(a=>a.ready));return {seed:hero.seed,digest:hero.identity.digest,expected:digest,sizes:sizes.every(a=>a.seed===seed&&a.identity.digest===digest)};},seed);
  expect(result.seed).toBe(seed);expect(result.digest).toBe(result.expected);expect(result.sizes).toBe(true);
 }
 await page.getByLabel('Your identity seed').fill('edited');await expect(page.locator('#hero')).toHaveAttribute('seed','edited');await expect(page.locator('#status')).toContainText('Ready');
});
test('copy avatar link encodes the current input and preserves other URL parts',async({page})=>{
 await page.goto('/?seed=old&view=demo#studio');await expect(page.locator('#download')).toBeEnabled();
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async(text:string)=>{(window as any).copiedLink=text;}}});});
 const input=' hello + & 😀 /# ';await page.getByLabel('Your identity seed').fill(input);await page.getByRole('button',{name:'Copy avatar link',exact:true}).click();await expect(page.locator('#status')).toHaveText('Avatar link copied.');
 const result=await page.evaluate(()=>({copied:(window as any).copiedLink,url:location.href}));expect(result.copied).toBe(result.url);const url=new URL(result.url);expect(url.searchParams.get('seed')).toBe(input);expect(url.searchParams.get('view')).toBe('demo');expect(url.hash).toBe('#studio');
 await page.reload();await expect(page.getByLabel('Your identity seed')).toHaveValue(input);await expect(page.locator('#download')).toBeEnabled();
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('Clipboard blocked');}}});});await page.getByRole('button',{name:'Copy avatar link',exact:true}).click();await expect(page.locator('#error')).toContainText('address bar');
});
test('highlighted SDK markup follows query seed, edits and expression without injecting HTML',async({page})=>{
 const initial='hello 😀';await page.goto('/?'+new URLSearchParams({seed:initial}));await expect(page.locator('#download')).toBeEnabled();await expect(page.locator('#sdk-markup')).toContainText('seed="hello 😀"');await expect(page.locator('#sdk-markup .hljs-name')).not.toHaveCount(0);await expect(page.locator('#sdk-javascript .hljs-keyword')).not.toHaveCount(0);
 const input='a" & <script>alert(1)</script>';await page.getByLabel('Your identity seed').fill(input);await page.getByRole('button',{name:'Sleepy',exact:true}).click();
 const result=await page.evaluate(()=>{const code=document.querySelector('#sdk-markup')!;const element=new DOMParser().parseFromString(code.textContent!,'text/html').querySelector('lifehash-avatar')!;return {seed:element.getAttribute('seed'),state:element.getAttribute('state'),recipe:element.getAttribute('recipe'),size:element.getAttribute('size'),scripts:code.querySelectorAll('script').length};});expect(result).toEqual({seed:input,state:'sleepy',recipe:null,size:'300',scripts:0});
 await page.getByLabel('Your identity seed').fill('');await expect(page.locator('#sdk-markup')).toContainText('seed=""');
});
