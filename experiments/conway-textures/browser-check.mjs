// Optional check: requires @playwright/test and its Chromium browser.
// In this repository they are already installed. Serve this folder on 5176,
// then run: node browser-check.mjs
// Override the preview URL with CONWAY_PREVIEW_URL if needed.
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {PATTERNS} from './conway-texture.mjs';

const browser = await chromium.launch();
try {
  const page = await browser.newPage({viewport: {width: 1280, height: 900}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.CONWAY_PREVIEW_URL ?? 'http://127.0.0.1:5176/');
  await page.waitForFunction(() => document.querySelector('#surface').style.backgroundImage.startsWith('url('));
  const image = () => page.locator('#surface').evaluate(element => element.style.backgroundImage);
  const seed = page.locator('#seed');
  await seed.fill('42');
  await seed.dispatchEvent('change');
  const outputs = [];
  for (const pattern of PATTERNS) {
    await page.locator('#pattern').selectOption(pattern);
    outputs.push(await image());
    assert.equal(await seed.inputValue(), '42');
  }
  assert.equal(new Set(outputs).size, 6, 'Each favourite has distinct geometry');
  await page.locator('#pattern').selectOption('dunes');
  const before = await image();
  const geometry = value => [...decodeURIComponent(value).matchAll(/d="([^"]*)"/g)].map(match => match[1]);
  await page.locator('#opacity').evaluate(element => {
    element.value = '15';
    element.dispatchEvent(new Event('input', {bubbles: true}));
  });
  await page.waitForFunction(() => document.querySelector('#opacity-value').value === '15%');
  const after = await image();
  assert.notEqual(before, after);
  assert.deepEqual(geometry(before), geometry(after), 'Opacity preserves geometry');
  assert.match(decodeURIComponent(after), /stroke-opacity="0.15"/);
  await page.locator('#theme').click();
  assert.deepEqual(geometry(after), geometry(await image()), 'Theme preserves geometry');
  await page.locator('#toggle-content').click();
  assert.equal(await page.locator('.transcript').isVisible(), false);
  await page.locator('#reseed').click();
  assert.notEqual(await seed.inputValue(), '42');
  assert.notDeepEqual(geometry(after), geometry(await image()), 'Reseeding changes geometry');
  await seed.fill('42');
  await seed.dispatchEvent('change');
  assert.deepEqual(geometry(after), geometry(await image()), 'Restoring seed reproduces geometry');
  await page.setViewportSize({width: 390, height: 844});
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.deepEqual(errors, []);
  console.log('Browser checks passed: six concepts, shared opacity, theme, seed replay, texture-only view, and mobile layout.');
} finally {
  await browser.close();
}
