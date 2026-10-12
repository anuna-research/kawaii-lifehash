---
mode: reference
---
# Independent implementation review

Reviewer: fresh-context agent, 2026-10-12. Next actor: implementer repairs the findings and adds regression checks; owner handles release provenance and license decisions separately.

Scope: supplied [[SPEC-001-independent-avatar-package]], [[IMPL-001-api-and-recipe]], [[PROVENANCE]], generator, component, current tests, packaging metadata, build script, and demo entry. No prior prototype, inspiration source/material, or other project was accessed. Implementation files were not modified. This review assesses the snapshot read during implementation; later repairs require verification.

## Finding: XML-invalid labels produce unusable exports

Severity: high. Attribution: [[SPEC-001-independent-avatar-package#REQ-006]], [[SPEC-001-independent-avatar-package#REQ-010]], [[SPEC-001-independent-avatar-package#CON-001]].

`src/index.ts:78-79` validates labels with the seed scalar recognizer. Unicode scalar strings include U+0000 and other characters forbidden in XML 1.0. `escapeXML` at line 89 copies them into the SVG attribute and title. `avatarSVG(identity, {label: 'a\u0000b'})` succeeds, but parsing its output as `image/svg+xml` yields a `parsererror`. This differs from seeds: NUL seeds are explicitly valid and must remain valid. Reject labels that cannot be represented in the documented XML output, or choose a documented valid serialization policy. Check both the static renderer and component labels.

Evidence: bounded Chromium check using generated identity, `DOMParser.parseFromString(..., 'image/svg+xml')`; result `nulLabelParserError: true`.

## Finding: render exceptions strand readiness and escape failure signaling

Severity: high. Attribution: [[SPEC-001-independent-avatar-package#REQ-008]], [[SPEC-001-independent-avatar-package#CON-002]].

`src/component.ts:73` marks status resolved and calls `#render()` before resolving the outer readiness promise. The promise returned by the `.then(...)` chain is discarded. A render throw consequently leaves `ready` pending forever and produces an unhandled rejection instead of a generation-error event. This is reproducible with ordinary declarative global input: set `aria-label` to an unpaired surrogate before attaching a new component. Its generation succeeds, but `avatarSVG` rejects the label during rendering. The host global attribute is never recognized through `#input`; it enters rendering directly at lines 46 and 86. A subsequently changed invalid label also throws from its callback.

Evidence: bounded Chromium check attached such an element and raced `ready` against a 600 ms timer. Result: `readiness: timeout`, `status: resolved`, unhandled rejection `TypeError: Seed contains an unpaired surrogate.` This is a concrete exception path, independent of whether normal engine generation fails. Resolve or reject readiness on every completion path, observe the entire asynchronous chain, and define/report invalid rendering-label handling while retaining the last valid presentation.

## Finding: fingerprint recognizer accepts absent pixels and non-PNG texture

Severity: medium. Attribution: [[SPEC-001-independent-avatar-package#REQ-004]], [[SPEC-001-independent-avatar-package#CON-001]].

`src/index.ts:74` uses `Array.prototype.some`, which skips holes. `new Array(4096)` therefore passes as a complete RGBA fingerprint. The data URI regular expression recognizes characters but does not establish that the bytes are a PNG. A fabricated identity with zero digest, matching documented traits/name, that sparse array, and `data:image/png;base64,AAAA` successfully produces SVG. `AAAA` decodes to three zero-valued bytes rather than a PNG, so the exported coat cannot render. Even a dense pixel array is not checked against the supplied URI; replacing a genuine identity's URI with another image is accepted while the fingerprint pixels remain unchanged.

Evidence: Node root import and direct `avatarSVG` invocation reported `sparse/non-PNG accepted: true`. Require each pixel position to hold a recognized byte and ensure the rendered image represents the declared fingerprint. Decide and document the external identity integrity policy rather than treating a URI prefix as complete PNG recognition.

## Current acceptance evidence gaps

The root imports successfully in Node without browser globals. The reference-engine invocation, exact digest path, recipe mapping, XML metacharacter escaping, separation of mood from identity, shadow-root identifier scope, and reduced-motion CSS are present in source. These observations are not complete acceptance evidence.

The current tests read by this reviewer exercise digest validation and basic deterministic/render-option rejection. They do not yet demonstrate deliberately reordered generation, induced initialization failure, reconnect behavior, independent reference-renderer pixel comparison, installed archive and nested-path production integration, standalone exported-image rendering, privacy recording, the face-visibility matrix, or keyboard/error-announcement behavior. The current `index.html` is an implementation-in-progress paragraph with no demo controls. These are pending deliverables against the corresponding acceptance cases, not findings that unseen future work fails. In particular, the opaque medallion is a plausible visibility treatment but is not a substitute for the required screenshot inspection.

## Owner release gates, distinct from implementation defects

[[PROVENANCE]] records official dependency origins and explicitly limits its claims. This reviewer did not compare restricted material and cannot establish independent authorship by lexical differences. Independent provenance review, verification of the handoff author's documented prior exposure, and selection of a license for newly authored code remain owner decisions under [[SPEC-001-independent-avatar-package#REQ-001]], [[SPEC-001-independent-avatar-package#REQ-002]], and [[SPEC-001-independent-avatar-package#REQ-012]]. `private: true` and `UNLICENSED` appropriately express a local unreleased draft; they are not a runtime defect. No publication, deployment, contact, or Elephant enrollment occurred in this review.
