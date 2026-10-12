---
type: independent-review
date: 2026-10-12
scope: softened error expression and seeded silhouette edges
---

# Soft error and edge review

Directly inspected the final refreshed `face-64-error.png`, `face-256-error.png` and `demo-desktop.png`, together with current `src/index.ts`, `src/component.ts` and `demo/style.css`. Earlier stale error matrices were excluded from this conclusion. No implementation edits were made.

No new blocking defect was found. At 256px the error face now reads as uncertain/puzzled: uneven curved raised brows, open eyes and a small wavy mouth replace the prior inward-sloping angry brows and frown. The captured gentle tilt retains clear geometry and facial alignment. At 64px ordinary coats and supplied LifeHash examples retain a visible face without obvious anger; nuanced mouth/brow differences remain subtle, particularly on the artificial checkerboard, as documented in the preceding review (NFR-001 / TEST-013).

The edge treatment is confined to the union silhouette mask and contour: digest-derived integer seed, fractal noise and displacement scale 5. Interior LifeHash pixels retain their inline crisp grid, with no stochastic runtime input introduced in the inspected path. The refreshed 256px coats extend to the softly irregular outer boundary and ears with no blank interior, broken ear joins or viewport clipping observed across the five shapes and five supplied coat cases. Filter bounds cover the full 256-unit viewport; inspected geometry remains inset from that boundary. This is bounded screenshot/source evidence, not certification of cross-browser filter rasterization or every digest.

The desktop stage now has a plain background, with no preview dot grid. Main preview, family examples and controls remain visibly contained. The parent reports 51 passing browser tests after the sequential final build; this review did not independently rerun that suite.

The owner-authorized reference amendment and pending owner legal/license review remain unchanged. This report makes no legal originality or license certification. Next actor: owner may assess the softened expression and subtle irregular edge appearance.
