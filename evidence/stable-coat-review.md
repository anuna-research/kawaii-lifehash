---
type: independent-review
date: 2026-10-12
scope: embedded lossless PNG coat and transformed rendering
---

# Stable coat review

Reviewed current `src/fingerprint.ts`, coat markup and compositor styling, the revised decode/reload test, and visual fixture source. Independently launched Chromium, Firefox and WebKit against a separate local Vite server and captured thinking, success and error at animation duration fraction 0.373, retaining fractional rotation/scale and translations. Directly viewed `coat-motion-review-chromium.png`, `coat-motion-review-firefox.png` and `coat-motion-review-webkit.png`. No implementation edits were made.

No new blocking defect was found. All nine independently captured avatars contain one embedded PNG coat image and zero coat rectangles. None of the directly viewed transformed frames shows the former per-cell transparent seam grid. Texture reaches the irregular body/ear boundary, ears remain joined, and face placement is preserved. Chromium/WebKit and Firefox make slightly different nearest-pixel choices under rotation; this is expected rasterization variation rather than altered encoded fingerprint bytes. The captured motion shapes remain readable.

The encoder emits a deterministic PNG with RGBA8 IHDR, filter-zero scanlines, one stored DEFLATE block, Adler-32 and PNG chunk CRCs, then a pure base64 encoding. The fixed 32x32 payload fits the stored-block size limit. It uses no Canvas, external compression service or browser globals at module initialization. Validated pixel input remains the source; the canonical standalone fingerprint SVG URI and validation contract remain unchanged. The embedded PNG preserves the complete square, while the avatar mask crops its visible silhouette (REQ-001 / TEST-004 / TEST-005).

The existing test now decodes the exact embedded PNG into a 32x32 canvas and compares every RGBA byte with the identity pixels, then repeats after reload. The parent reports this and the full 51-test suite passing across all three browsers; this review independently exercised transformed presentation, not another full test-suite run. Visual fixtures use the same PNG path as production.

These selected paused frames substantiate removal of independent cell seam artifacts under fractional transforms. They do not establish absence of every temporal flicker on every display, browser, seed or animation instant. Pixel-grid aliasing can still vary with motion because the coat intentionally remains pixelated. Earlier small checkerboard expression-detail limits, reference amendment and pending owner legal/license review remain applicable. No legal or provenance certification is offered.

Next actor: owner may assess the continuous animation on their display; implementation author should retain exact decoded-pixel coverage and record final consumer results.
