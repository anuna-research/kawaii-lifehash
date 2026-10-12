---
mode: reference
---
# Independent review followup

Reviewer: same independent review agent, 2026-10-12. Next actor: owner reviews the local deliverable and separately performs provenance and release decisions. Scope remained this project and its supplied brief. No restricted source, other workspace, publication, contact, or Elephant enrollment was involved. Implementation was not modified.

## Repaired findings

The original XML label defect from [[independent-review]] is resolved: `escapeXML` replaces XML-forbidden scalar controls with U+FFFD, and [[IMPL-001-api-and-recipe]] documents this policy. An independent bounded Chromium check parsed a NUL-containing label export successfully as `image/svg+xml`. Attribution: [[SPEC-001-independent-avatar-package#REQ-006]], [[SPEC-001-independent-avatar-package#REQ-010]].

The malformed-global-label readiness reproduction is resolved: the component converts native label input into well-formed Unicode for rendering. The independent check attached an element with an unpaired surrogate and NUL in `aria-label`, awaited readiness, and observed resolved status. A regression test now exercises this path. The final asynchronous completion chain now catches rendering exceptions, restores the preceding identity, settles rejection before fallback rendering, and exposes failure signaling. The added induced-render-failure regression test exercises that broader path. Attribution: [[SPEC-001-independent-avatar-package#REQ-008]], [[SPEC-001-independent-avatar-package#CON-002]].

The sparse/non-image fingerprint reproduction is resolved: dense materialization catches holes and the data URI must equal the canonical SVG serialization of the recognized RGBA pixels. The canonical texture serializer emits crisp pixel rectangles. Regression coverage rejects sparse pixels, malformed old PNG strings, and a different generated identity's texture URI. The API expressly does not authenticate caller-created pixels against their claimed digest; authentic identities originate from `generateAvatar`. That documented limit should remain visible. Attribution: [[SPEC-001-independent-avatar-package#REQ-004]], [[SPEC-001-independent-avatar-package#CON-001]].

## Mobile clipping finding: repaired and independently verified

Original severity: medium; final status resolved. Attribution: [[SPEC-001-independent-avatar-package#NFR-002]], [[SPEC-001-independent-avatar-package#TEST-014]].

The supplied mobile screenshot visibly cuts the right edge of the seed input and download button, and the small stage stamp overlaps the character-trait text. A bounded Chromium check at a 375-pixel viewport confirmed studio horizontal bounds `[20,355]`, client width 333, scroll width 368. Its controls occupy `[21,389]`; seed input and download button end at x=361. The studio's `overflow:hidden` clips that content. The current demo test checks only document scroll width, so it remains green despite clipping inside this ancestor. The implementer then changed intrinsic grid sizing with minmax(0,1fr) and min-width:0, hid the small stamp on mobile, and added child/control bounds assertions. I reopened the regenerated mobile and desktop screenshots: the mobile input and download button now fit with visible right padding, and the stamp no longer overlaps traits. A second independent Chromium check confirms the controls lie within studio bounds and its scroll width equals client width. No substantive implementation finding remains from this bounded review.

## Direct visual review

Opened every supplied `face-64-*` and `face-256-*` image through the image-viewing tool, covering idle, thinking, speaking, listening, success and error. Each matrix contains pebble, droplet, capsule, bloom and comet over black, white, mid-gray, checkerboard and actual LifeHash coats. At both supplied sizes the opaque cream medallion separates eyes and mouth from the patterned coat. Eyes remain distinguishable from the mouth, including the small crescent and sparkle features. Success's thicker smile and error's frown remain clear. No face disappears into the worst-case coats in these frames. The neutral exported-image examples likewise retain readable faces and recognizable silhouette differences. Attribution: [[SPEC-001-independent-avatar-package#NFR-001]], [[SPEC-001-independent-avatar-package#TEST-013]].

Final motion and export evidence was regenerated and directly reviewed; see the final visual subsection below. The earlier reduced-motion-only limitation no longer describes the current matrices.

The desktop demo screenshot has readable controls, a complete square fingerprint alongside the companion, clearly separated family cards, and attribution. The regenerated mobile screenshot shows contained controls and cleanly reflowed family/footer content. The neutral-export screenshot shows textured standalone image results at both sizes.

## Acceptance and planning evidence reviewed

Current generator tests independently invoke the compiled canonical C++ oracle and compare pixels, exercise exact encoding and invalid values, verify standalone transparent textured export, and cover the earlier boundary failures. Component tests deliberately reorder digests, exercise pending state, independent instances, reconnect, invalid input, induced failure, local offline generation and reduced motion. Demo tests exercise keyboard state controls, visible focus, download, and an alert without changing the input. [[consumer]] records fresh archive installation, successful root SSR import, entry-point declaration checking, Vite production building, nested-path/offline generation and matching digest/traits across Chromium, Firefox and WebKit. This review inspected those records and code; it did not independently rerun the complete integration suite.

[[plan]] contains a claimable initial contract task and serial prerequisites through generator, component, distribution and verification. Each task has a description, acceptance text and a source-bearing readiness rule. `plan-next.json` offers the contract with explain/describe/promise commands, and `plan-dag.txt` shows downstream work initially unready rather than falsely complete. These are initial planning snapshots; they are not final completion proofs. The artifacts demonstrate a workable local dependency graph. A single local signer cannot replace this separate adversarial review or certify legal provenance. No reviewer enrollment was attempted.

## Provenance and release limitations

The source manifest and independently written design rationale were inspected as deliverables. This review cannot prove their origin statements from source appearance and did not compare restricted material. The handoff's documented author exposure and model-training limitations persist. Owner provenance/legal review and a license choice for newly authored files remain separate release gates under [[SPEC-001-independent-avatar-package#REQ-001]], [[SPEC-001-independent-avatar-package#REQ-002]] and [[SPEC-001-independent-avatar-package#REQ-012]]. The local private UNLICENSED draft does not itself violate the authorized scope.


## Final visual evidence: normal motion and complete export coats

I reread `scripts/visual.mjs` and [[visual-matrix]], then reopened the final live matrices for both 64- and 256-pixel sizes in every requested state, and the new `export-64.png` and `export-256.png` matrices. Normal motion is now enabled. Each discovered shadow-root animation is paused at a specified fraction of its duration: idle 0.5, thinking 0.25, speaking 0.5, listening 0.4, success 0.45 and error 0.25. These correspond to the chosen breathing peak, tilt, expanded mouth, visible listening ring, hop and wobble frames. Static state transforms remain enabled, including lifted/scaled/tilted eyes.

The expanded speaking mouth remains inside the contrasting face medallion and remains distinct from both eyes at both sizes. Tilted and hopped companions retain readable faces. The listening ring does not obscure eyes or mouth in the sampled frame. The error frown remains visibly different from the smile. Each reviewed live frame retains clear facial features across all five silhouettes and black, white, mid-gray, checkerboard and actual LifeHash coats. The standalone neutral exports now exercise the same complete coat matrix at both sizes; eyes and mouths remain readable and textures render as independent images. No new concrete visual or rendering defect was found. This directly supports [[SPEC-001-independent-avatar-package#NFR-001]] and [[SPEC-001-independent-avatar-package#TEST-013]].

Scope of evidence: these are selected normal-motion frames captured in Chromium, not exhaustive sampling of every instant, every possible identity or all browser rendering versions. The separate reduced-motion behavioral tests continue to establish no running decorative animations under that preference. This visual extension changes no provenance or license conclusion.
