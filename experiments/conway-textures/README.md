# Seeded Conway background textures — agent handoff

This folder contains the complete standalone experiment. No npm dependencies,
build step, external assets, WASM, or image-generation service are required.
The cbcl-bus application has **not** been modified by this package.

## What the user selected

Keep these six primary choices:

| Pattern ID | Label | How it uses Conway history |
| --- | --- | --- |
| `dunes` | Dunes | Smoothed activity displaces horizontal scan lines. |
| `relief` | Relief | Rounded contours trace activity thresholds. |
| `scales` | Scales | Activity controls overlapping arc sizes and nested arcs. |
| `filaments` | Filaments | Curves follow a vector field derived from smoothed activity. |
| `weave` | Weave | Activity controls crossing orientation, bend, and thread length. |
| `grain` | Paper Grain | Activity controls mark density and length; gradients orient the marks. |

Other trials remain available under `EXPERIMENTAL_PATTERNS`. They are optional,
not part of the six main choices.

User requirements: procedurally generated, inspired by LifeHash and Conway's
Game of Life, fresh random seed on each page load, thicker rounded edges,
same opacity setting across patterns, and light/dark support.
This is **not** the standardized LifeHash algorithm or an identity fingerprint.

## Run and verify

From this directory:

```sh
python3 -m http.server 5176 --bind 127.0.0.1
node --test conway-texture.test.mjs
```

Open `http://127.0.0.1:5176/`. Use a local HTTP server rather than `file://`,
because the preview imports JavaScript modules. Web Crypto needs a secure
context; localhost works, and deployed pages should use HTTPS.

The preview has pattern, opacity, theme, seed, regeneration, and texture-only
controls. The preview starts at 35% to make inspection easy. Try 2–5% for a
subtle production background. Enter the same seed to reproduce a pattern.

## Integration API

```js
import {createTexture} from './conway-texture.mjs';

// Omit seed to generate a new cryptographically random uint32 once per load.
// Reuse this object when changing patterns, opacity or themes.
const texture = createTexture();

const surface = document.querySelector('.chat-transcript');
surface.style.backgroundImage = texture.css({
  pattern: 'relief',
  theme: 'dark',
  opacity: 0.035, // actual opacity, from 0 to 1; identical for all concepts
});
surface.style.backgroundSize = '800px 800px';
surface.style.backgroundRepeat = 'repeat';
surface.style.backgroundAttachment = 'local';

// Store/display this value if a user needs to reproduce the background.
console.log(texture.seed);

// Explicit reproducible seed:
const reproduced = createTexture(42);
// Raw SVG for export, instead of a CSS background value:
const svg = reproduced.svg({pattern: 'scales', theme: 'light', opacity: 0.05});
```

`createTexture(seed?)` computes the history once. `.svg(options)` and
`.css(options)` render it; neither reseeds or reruns the Conway simulation.
`.css()` returns a quoted, URI-encoded SVG data URL suitable for
`background-image`. Options default to `dunes`, `dark`, and opacity `0.035`.
Invalid seed, pattern, theme, or opacity arguments throw `RangeError`.

`randomSeed()` is also exported for a New seed action. Use
`createTexture(randomSeed())` to regenerate. The low-level `lifeRelief`,
`reliefSVG`, and `installChatTexture` exports remain for compatibility with
the original experiment; use `createTexture` for new integrations.
The low-level `reliefSVG` parameter called `contrast` is a legacy scale:
`50` means full opacity. The recommended API uses ordinary 0–1 opacity.

## cbcl-bus integration location

The original transcript styles are in
`apps/cbcl_chat/priv/web/index.html`, on `.clog`. They currently reference
`/static/img/pebbles-dark.svg` and `/static/img/pebbles-light.svg` through
`--chat-texture`. The client entry is `apps/cbcl_chat/priv/web/app.js`.

Copy `conway-texture.mjs` into the app's served static module directory.
Generate the history once during client startup, then supply both theme images:

```js
import {createTexture} from './conway-texture.mjs';

const texture = createTexture();
const options = {pattern: 'relief', opacity: 0.035};
const root = document.documentElement;
for (const theme of ['dark', 'light']) {
  root.style.setProperty(`--chat-texture-${theme}`, texture.css({...options, theme}));
}
```

Update the existing theme variables, keeping the pebbles as a startup fallback:

```css
:root, [data-theme="dark"] {
  --chat-texture: var(--chat-texture-dark, url('/static/img/pebbles-dark.svg'));
}
[data-theme="light"] {
  --chat-texture: var(--chat-texture-light, url('/static/img/pebbles-light.svg'));
}
.clog {
  background-image: var(--chat-texture);
  background-size: 800px 800px;
  background-repeat: repeat;
  background-attachment: local;
}
```

Check static module serving, cache versioning, and the app's CSP when integrating:
the current output uses `data:` image URLs. A restrictive `img-src` must allow
them, or the integrating agent can generate a Blob URL and manage its lifetime.

## Generation and drawing

- A seeded PRNG populates a 100×100 toroidal grid at 38% initial occupancy.
- Standard Conway B3/S23 rules run for 32 generations.
- Each cell accumulates the number of generations it was alive.
- Every visual concept reads that same activity history, including the ones
  inspired by other generative-art techniques.
- SVG uses an 800×800 transparent tile. Theme-specific inks are warm graphite
  (`#6f6a57`) and pale blue-grey (`#aeb7c4`). The CSS surface supplies the ground.
- All strokes are 4px at the tile's intended scale. All marks use the exact same
  requested opacity. Pattern density and overlapping paths can still affect
  perceived contrast; identical opacity does not mean identical visual coverage.
- Colors are selected in the generator. To support arbitrary background colors,
  adapt the ink selection; SVG data URLs cannot inherit CSS `currentColor`.
- There is no animation loop or ongoing simulation after generation. The preview
  schedules slider updates with `requestAnimationFrame` only on input events.

The repeating tile intentionally repeats after 800px. Wrapped simulation and
edge handling support tiling, but inspect seams and each selected concept in
the actual app, at its actual zoom and scale, before release.

In local Chromium, the relief history plus two theme SVGs measured around
20–24ms after warm-up. That measures generation only, not rasterization,
scrolling, or low-end devices. SVG size depends on the seed and concept;
one measured pair was roughly 357KB uncompressed. Cache rendered variants
if switching becomes frequent, or move generation into a worker if it causes
startup latency on target devices. There is no need to regenerate on resize.

## Files

- `conway-texture.mjs`: complete generator and integration API.
- `index.html`, `preview.mjs`, `preview.css`: dependency-free browser preview.
- `conway-texture.test.mjs`: seed reproducibility, Conway dependence, shared
  opacity, theme geometry, regeneration, and API checks.
- `browser-check.mjs`: optional Playwright browser verification; the core package
  does not require Playwright. See the file's comments for execution.
- `LICENSE`: Apache-2.0, matching the containing repository.

## Visual inspiration

The additional concepts were researched with `ar-crawl session`:

- [Reinder Nijhoff: Truchet Tiles](https://reindernijhoff.net/2019/10/truchet-tiles-simple-rules-infinite-patterns/)
  inspired the experimental connected-arc Loops concept.
- [Tyler Hobbs: Flow Fields](https://www.tylerxhobbs.com/words/flow-fields)
  inspired the primary Filaments concept and the idea of mapping activity into
  a vector field.

Their artwork and code are not bundled. The rendering code here was written
for this experiment. The LifeHash influence is the accumulation of Conway
history into texture, rather than a dependency on the LifeHash library.
