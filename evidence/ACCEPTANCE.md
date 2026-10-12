---
mode: reference
---
# Local implementation acceptance

Next actor: owner reviews this local draft, its provenance and license choice before any release. Executable software acceptance is separate from legal/provenance clearance.

The requirement baseline is [[SPEC-001-independent-avatar-package]]. The local implementation follows [[IMPL-001-api-and-recipe]]. Elephant theory `kawaii-avatar-spec-001` tracks contract → generator → component → distribution → verification; readiness rules cite the governing clauses, and completion derives from recorded verified facts. The signed local theory is not a substitute for an independent provenance decision.

| Acceptance case | Evidence and mechanism | Result |
| --- | --- | --- |
| TEST-001 | [[PROVENANCE]], source-manifest.json; fresh empty workspace, approved dependencies only | Session access recorded; legal independence not certified |
| TEST-002 | Original design rationale, source geometry, screenshot family; [[independent-review-followup]] | Bounded design review passes; owner provenance review pending |
| TEST-003 | tests/generator.spec.ts; platform digests for empty, space, emoji, NUL, composed/decomposed accents; malformed scalar rejection | Browser suite |
| TEST-004 | Own C++ oracle compiled from pinned official canonical source, raw and decoded complete square pixel comparison | Browser suite |
| TEST-005 | Repeated identities/exports, reload, state/pointer invariance; consumer.json across browser engines | Browser suite and consumer integration |
| TEST-006 | Malformed options/identities, scalar rejection, markup-like seeds and XML labels, sparse pixels/mismatched images; [[independent-review-followup]] | Browser suite and independent regression review |
| TEST-007 | consumer.json: fresh npm archive installation, all entry declarations, Node SSR, development and production nested URL | Integration passes |
| TEST-008 | tests/component.spec.ts: reordered completion, pending state, readiness, input/engine/render failures, multiple instances, reconnect and disconnected pointer cleanup | Browser suite |
| TEST-009 | tests/component.spec.ts + consumer.json: network denied after initialization and recorded requests during private generation; embedded engine has no asset fetch | Browser suite and integration |
| TEST-010 | Export decoded in isolated Image/Canvas; transparent exterior, texture, neutral export; export visual matrices | Browser suite and visual review |
| TEST-011 | README, NOTICE, complete engine licenses and archive file listing; [[PROVENANCE]] | Packaging inspection passes |
| TEST-012 | Local source/build/demo/archive only; no publishing, pushes, deployment or author contact | Session action record |
| TEST-013 | face-{64,256}-{state}.png and export-{64,256}.png: all silhouettes, states, sizes and black/white/gray/checker/LifeHash coats | [[independent-review-followup]] |
| TEST-014 | Reduced motion, keyboard seed/state/download, visible focus, labels/error announcement, contained mobile controls, demo screenshots | Browser suite and independent mobile review |

The runnable core includes tests/generator.spec.ts, tests/component.spec.ts, tests/demo.spec.ts, and scripts/consumer.mjs. Visual review uses scripts/visual.mjs and independently inspected screenshots. No speculative performance target, authentication claim, server-side generation, speech synthesis or microphone integration is introduced.

## Failures and repairs

[[independent-review]] found XML control-label defects, stranded readiness through rendering exceptions, and sparse/non-image fingerprint acceptance. The scoped repairs retain exact seed bytes, serialize XML controls as replacement text, validate canonical image/pixel equality, and catch asynchronous rendering errors. Regression cases cover each finding.

The independent followup found hidden mobile clipping. The layout uses bounded grid tracks; the regression checks every studio control's rectangle rather than relying on the page's scroll width.

The deliberately broken high-surrogate recognizer makes TEST-003 fail with an executed assertion (mutation-surrogate.txt). The source is restored and rebuilt afterward. This is mutation evidence for that boundary, not a claim of exhaustive mutation coverage.

## Remaining release gates

The owner chooses a license for new code and obtains independent provenance/legal review before release. Newly authored code remains UNLICENSED and package metadata is private. Those gates do not block the authorized local implementation. Original supplied brief files remain unmodified, including their draft status; this evidence records local implementation status without rewriting the handoff author's claims.

## Final machine evidence

Final results: evidence/final-results.json and evidence/browser-results.json. All browser cases pass with no skipped, flaky or unexpected results. TypeScript checking, production demo build, fresh installed archive checks and npm audit pass. Structural document checks report no dead links, syntax errors or reasoning errors in evidence/zetl-check.json. Elephant completion proof, fulfilled commitments and final board are recorded in evidence/elephant-completion.txt, evidence/elephant-commitments.txt and evidence/elephant-final-next.json. The local-deliverable conclusion grants no publication permission.
