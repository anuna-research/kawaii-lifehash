---
type: independent-review
date: 2026-10-12
scope: owner-authorized reference refinement
---

# Reference refinement review

Reviewed current local `src/index.ts` and `src/component.ts`, the owner reference amendment, and directly viewed the refreshed idle, thinking, success, error, idle-blink and speaking-open coat matrices at both 64 and 256 pixels. Each inspected matrix contains all five shapes with black, white, gray, checkerboard and LifeHash coats. No implementation files were changed. This review did not inspect remote implementation code or another workspace.

No new blocking implementation defect was found in this bounded review. The compact circle with round ears, diamond with elongated ears, rounded square, hexagon with pointed ears and triangle remain distinct. Coats extend continuously into the ears; no transparent interior, seam or clipped face was observed. At 256 pixels the glossy open eyes, smile, happy eyelids/open success mouth, thinking brows and concerned error face remain recognizable. The speaking opening and closed blink frames are visibly different from idle, without clipping or displaced facial features. The tongue is positioned inside the success mouth.

The final <=96px accommodation is present in source: thicker eye and mouth halos, thicker dark mouth stroke, and thicker happy eyelid outlines. Ordinary coats and the supplied LifeHash examples have recognizable faces at 64 pixels. The artificial alternating checkerboard remains a difficult case: the face can be located, but the small mouth curvature and thinking/error brow distinction are weaker than on ordinary coats. Treat this as a residual small-size detail limitation under NFR-001 / TEST-013, rather than claiming equally clear expressions on every coat. The open speaking mouth is easier to identify than the tiny closed smile/frown. No broad opaque face medallion was reintroduced.

Source retains the body/ear union mask and inline crisp LifeHash pixels. Pupils remain grouped separately in `.gaze`; happy eyelids intentionally replace open eyes in success. These appearance changes do not introduce seed-dependent randomness or a new texture source in the inspected rendering path. Runtime race, accessibility and browser behavior were covered by preceding independent reviews; this visual follow-up does not independently rerun the parent's reported 51 browser tests or fresh archive consumer checks.

The owner explicitly amended reference access in `docs/OWNER-REFERENCE-AMENDMENT.md`. Current geometry and expression refinements are reference-informed; earlier unseen-reference isolation claims apply only to the earlier implementation phase. This report provides no legal originality, copyright or license certification. Pending owner legal/license review remains separate from implementation findings. Screenshots establish selected Chromium frames and supplied examples, not all seeds, animation instants or browser rasterization.

Next actor: owner may assess the compact visual result and documented small checkerboard detail tradeoff; implementation author should preserve the amended provenance wording.
