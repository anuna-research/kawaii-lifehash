---
mode: reference
---
# Texture coverage appearance review

Reviewer: independent review agent, 2026-10-12. Scope: authorized owner appearance change to cover the complete silhouette with LifeHash and place outlined facial features directly on the texture. Next actor: implementer strengthens small-size face visibility and regenerates evidence; reviewer checks those frames. No implementation edits or restricted source access occurred.

## Reviewed evidence

Read the current generator facial markup and reviewed every regenerated live `face-64-*` and `face-256-*` screenshot for idle, thinking, speaking, listening, success and error, plus `export-64.png` and `export-256.png`. Each contains pebble, droplet, capsule, bloom and comet over black, white, mid-gray, checkerboard and LifeHash coats. Live motion uses the previously documented selected paused normal-motion frames. This review supersedes the preceding medallion-based visual conclusion in [[independent-review-followup]] for the changed appearance only.

Texture now extends behind the facial features across the main silhouette. Feet use the texture pattern as well; no opaque face-region oval remains. The full fingerprint's serialization is separate from this clipping treatment. Thus the source and examples implement the requested coverage approach. This observation does not require comparing any external avatar design.

## Finding: small checkerboard faces lose reliable distinction

Severity: medium. Attribution: [[SPEC-001-independent-avatar-package#NFR-001]] and [[SPEC-001-independent-avatar-package#TEST-013]].

At native 64-pixel size the eyes and mouth merge perceptually into the high-frequency checkerboard. This is visible across the checkerboard rows of the live idle, thinking, success and error matrices and the standalone neutral export matrix. In those examples the colored cheeks identify approximately where the face is, but the mouth's smile/frown contour and some eye contours are difficult to distinguish from adjacent alternating coat pixels. The expanded speaking mouth is more legible but does not repair the other required cases. Actual LifeHash examples also have weaker face separation than the preceding appearance, particularly the pale and busy comet/export patterns.

The source explains the small-size regression. Crescent eyes have an 8-unit light under-stroke and a 4-unit dark stroke, leaving about 0.5 physical pixel of halo on each side at 64px. Mouth strokes have the same 4-unit difference. Sparkle/round eye outlines use a 3-unit stroke, about 0.375 physical pixel outside their edge at 64px. Anti-aliasing and the neighboring high-frequency pixels compete with these thin margins.

The 256-pixel examples retain distinguishable eyes and mouth on the checkerboard and actual LifeHashes. Solid black/white/mid-gray examples remain recognizable at both sizes, although the small faces are faint. This is a concrete small-size contrast finding, not a request to restore the opaque medallion. Increase facial feature size and strengthen the two-tone outlines sufficiently for the 64px checkerboard and busy real textures; preserve the texture behind the face as requested. Regenerate and review the same full matrix before marking the changed appearance accepted.

## Limits

This is direct visual inspection of supplied Chromium frames, not exhaustive verification of every identity or animated instant. No new lifecycle, encoding or authenticity defect was established by this appearance review. Previous runtime checks do not alone establish acceptance of the changed facial treatment. Owner provenance/legal review and licensing remain separate from the implementation finding above.

## Repair review: additive mask, restrained contour and pupil tracking

Reviewed the revised `src/index.ts` facial/geometry markup and `src/component.ts` tracking selector, then directly opened all newly generated live state matrices at both sizes and both neutral-export matrices. The appearance now uses a shared inline pixel grid masked by additive body, ear and foot geometry. No nested-image pattern remains in the inspected renderer. Ears connect visually to the body, with continuous texture across their join; there are no opaque face patches. Feet share the same coordinate grid. The softer contour removes the previous dark perimeter emphasis without introducing a visible join-line defect. The source changes pointer translation on `.gaze`, containing pupils and highlights, while white eye shapes, cheeks and mouth remain outside that group. Source inspection supports the requested pupil-only mechanism; these static visual matrices do not themselves prove pointer behavior or the reported Firefox fix.

The larger white eye interiors and wider mouth outline improve face recognition over solid coats and real LifeHashes. The 256px checkerboard faces remain readable, including expanded speaking mouths and error frowns. At 64px the checkerboard continues to compete strongly with the tiny facial features: in native idle/thinking/error and neutral-export frames, recognizing the eye contours and distinguishing the mouth's smile/frown remains unreliable without zooming. The broader mouth under-stroke is an improvement, but the former finding is only partially repaired. I cannot mark [[SPEC-001-independent-avatar-package#NFR-001]] accepted for the 64px checkerboard cases on the supplied evidence. Enlarging the overall face features/spacing at small sizes or further strengthening local two-tone separation would address that specific remaining case while preserving full texture coverage.

No additional geometry continuity defect was found in these frames. This visual review does not certify browser test outcomes that were still running, nor alter the earlier provenance/legal limitations. Next actor remains the implementer for the small-size visibility finding, followed by a direct image recheck.

## Final small-size repair review

Reopened the current 64px live screenshots for every required state and the current standalone `export-64.png` matrix, and inspected the enlarged eye-shell and mouth markup. The enlarged white shells with dark pupils now establish visibly separate eye regions; the broader mouth halo forms a distinct region below them. In the checkerboard rows I can distinguish eyes from mouth and identify the upward smile versus the error frown in these selected frames. The expanded speaking mouth is also distinct. Black, white, mid-gray and sampled actual LifeHash coats preserve that separation. The outlines remain local to the features, and texture continues across the surrounding silhouette, ears and feet.

Final status of the earlier small-size finding: resolved for the supplied visual cases. This supports [[SPEC-001-independent-avatar-package#NFR-001]] and [[SPEC-001-independent-avatar-package#TEST-013]] within this bounded direct review. The checkerboard still makes the face less immediately prominent than a plain coat, but I found no remaining concrete case in these images where the eyes/mouth disappeared or smile and frown could not be distinguished. Earlier statements describing partial repair apply to the superseded smaller-eye versions, not the current screenshots.

This final pass specifically rechecked 64px appearance; the prior 256px review established visibility before the further enlargement. It does not independently assert outcomes of consumer/browser checks still in progress. Source, provenance, and legal review limits remain unchanged.
