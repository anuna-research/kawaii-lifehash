import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lifeRelief, reliefSVG, installChatTexture, createTexture, PATTERNS } from './conway-texture.mjs';

test('handoff API preserves seeded geometry and gives all six patterns identical opacity', () => {
  const texture = createTexture(42);
  assert.equal(texture.seed, 42);
  assert.equal(PATTERNS.length, 6);
  for (const pattern of PATTERNS) {
    const svg = texture.svg({pattern, theme: 'light', opacity: 0.15});
    assert.equal(svg, createTexture(42).svg({pattern, theme: 'light', opacity: 0.15}));
    assert.ok([...svg.matchAll(/(?:stroke|fill)-opacity="([^"]+)"/g)].every(match => Number(match[1]) === 0.15));
    assert.match(texture.css({pattern}), /^url\("data:image\/svg\+xml,/);
  }
  assert.notEqual(texture.svg(), createTexture(43).svg());
  assert.throws(() => createTexture(-1), RangeError);
  assert.throws(() => texture.svg({pattern: 'unknown'}), RangeError);
  assert.throws(() => texture.svg({opacity: 2}), RangeError);
});

test('all patterns and themes use the same opacity at every slider setting', () => {
  const history = lifeRelief(42);
  for (const contrast of [0, 1, 17.5, 50]) {
    for (const theme of ['dark', 'light']) {
      for (const pattern of ['relief', 'pebbles', 'ripples', 'cells', 'dunes', 'weave', 'stipple', 'grain', 'scales', 'trails', 'loops', 'filaments', 'hatching']) {
        const svg = reliefSVG(history, theme, contrast, pattern);
        const opacities = [...svg.matchAll(/(?:stroke|fill)-opacity="([^"]+)"/g)].map(match => Number(match[1]));
        assert.ok(opacities.length > 0, pattern);
        assert.ok(opacities.every(value => value === contrast / 50), `${pattern} ${theme} ${contrast}`);
      }
    }
  }
});

test('every concept depends on Conway activity rather than drawing an independent pattern', () => {
  const history = lifeRelief(42);
  const empty = new Uint8Array(history.length);
  for (const pattern of ['relief', 'pebbles', 'ripples', 'cells', 'dunes', 'weave', 'stipple', 'grain', 'scales', 'trails', 'loops', 'filaments', 'hatching']) {
    const active = reliefSVG(history, 'light', 10, pattern);
    assert.match(active, /<(path|circle) /, pattern);
    assert.doesNotMatch(reliefSVG(empty, 'light', 10, pattern), /(?:d="[^"]+"|<circle )/, pattern);
  }
});

test('seeded history is repeatable, varied, and bounded', () => {
  const a = lifeRelief(42);
  assert.deepEqual(a, lifeRelief(42));
  assert.notDeepEqual(a, lifeRelief(43));
  assert.equal(a.length, 10000);
  assert.ok(a.every(value => value <= 32));
  const occupied = a.filter(value => value >= 3).length / a.length;
  assert.ok(occupied > 0.1 && occupied < 0.9);
});

test('themes share geometry with subtle inks and a repeatable tile', () => {
  const field = lifeRelief(42);
  const dark = reliefSVG(field, 'dark');
  const light = reliefSVG(field, 'light');
  assert.match(dark, /width="800" height="800"/);
  assert.match(light, /#6f6a57/);
  assert.match(dark, /#aeb7c4/);
  assert.deepEqual([...dark.matchAll(/d="([^"]*)"/g)].map(m => m[1]), [...light.matchAll(/d="([^"]*)"/g)].map(m => m[1]));
  assert.ok(!dark.includes('NaN'));
});

test('each installation gets a new field and exposes both theme images', () => {
  const first = new Map();
  const second = new Map();
  installChatTexture({ style: { setProperty: (key, value) => first.set(key, value) } });
  installChatTexture({ style: { setProperty: (key, value) => second.set(key, value) } });
  assert.equal(first.size, 2);
  assert.match(first.get('--chat-texture-dark'), /^url\("data:image\/svg\+xml,/);
  assert.notEqual(first.get('--chat-texture-dark'), second.get('--chat-texture-dark'));
});
