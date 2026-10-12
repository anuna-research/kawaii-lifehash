---
id: SPEC-001
title: Independent deterministic avatar package
status: draft
version: 0.1.0
last-updated: 2026-10-12
---

# Independent deterministic avatar package

| Field | Value |
| --- | --- |
| ID | SPEC-001 |
| Title | Independent deterministic avatar package |
| Owner | Repository owner |
| Next actor | Fresh-context implementer in a new, empty project |
| Source of requirements | Stakeholder requests for deterministic LifeHash coats, readable faces, an installable package, and a different shape family |
| Review status | Draft; no implementation or licensing clearance is claimed |

## Orientation

**Intent:** Build a browser package that turns an input string into a recognizable, animated companion with a genuine [[SPEC-001-independent-avatar-package#LifeHash]] coat. Its code and visual designs originate in a new project.

**Metaphor:** A string is a companion's birth certificate; a changing mood does not change its identity.

**Export:** [[SPEC-001-independent-avatar-package#REQ-010]] fixes a documented neutral pose, independent of live state and pointer position. Within one browser engine/version, identical input, explicit rendering options, and recipe version produce identical static SVG bytes.

**Structure:** These are responsibilities, not prescribed files or rendering techniques.

```text
Demo / browser component (CON-002) --> Generator (CON-001) --> Licensed LifeHash engine
Static SVG consumer (CON-001) -------> Generator (CON-001)
Package distribution (CON-003) ------> Generator + component + stylesheet
```

**Decisions:** [[SPEC-001-independent-avatar-package#ADR-001]] separates identity from presentation. [[SPEC-001-independent-avatar-package#ADR-002]] permits the licensed LifeHash reference engine.

**Load-bearing:** [[SPEC-001-independent-avatar-package#REQ-003]] exact input encoding; [[SPEC-001-independent-avatar-package#REQ-004]] reference LifeHash; [[SPEC-001-independent-avatar-package#REQ-005]] repeatability; [[SPEC-001-independent-avatar-package#REQ-007]] package boundaries.

**Controls:**

- [[SPEC-001-independent-avatar-package#REQ-001]]: The implementer receives only this handoff and approved dependency material, never the previous source or conversation.
- [[SPEC-001-independent-avatar-package#REQ-002]]: Original shapes, faces, names, and motion designs; no visual tracing or code translation.
- [[SPEC-001-independent-avatar-package#REQ-003]]: Reject inputs outside the declared string grammar before generation.
- [[SPEC-001-independent-avatar-package#REQ-006]]: Input strings never become executable markup or code.
- [[SPEC-001-independent-avatar-package#REQ-009]]: No input strings leave the consumer's browser through library requests.
- [[SPEC-001-independent-avatar-package#REQ-012]]: This handoff authorizes local implementation and testing, not publication, deployment, or contact with others.

**Open:** The implementer proposes character names and a stable trait-selection recipe. The owner chooses the license for new code. An independent reviewer examines provenance before any release. These decisions do not prevent a local draft implementation.

**Detail:** Handoff procedure: [[README]]. Review evidence: [[REVIEW]]. Implementer: [[SPEC-001-independent-avatar-package#CON-001]] through [[SPEC-001-independent-avatar-package#CON-003]], then [[SPEC-001-independent-avatar-package#Acceptance tests]]. Reviewer: [[SPEC-001-independent-avatar-package#Amendment Channels]] and [[SPEC-001-independent-avatar-package#Provenance and limitations]]. Stakeholder: [[SPEC-001-independent-avatar-package#User goals]] and [[SPEC-001-independent-avatar-package#Visual brief]].

The key words MUST, MUST NOT, REQUIRED, SHALL, SHALL NOT, SHOULD, SHOULD NOT, RECOMMENDED, MAY, and OPTIONAL have BCP 14 meanings only in capitals.

## User goals

An application developer needs an avatar from a stable agent ID without running a service. A demo visitor needs to see the result, change its state, and download it. The repository owner needs an independently authored implementation with documented dependency licenses and an inspiration credit.

Happy path: a developer imports the generator, supplies `researcher:42`, and renders its SVG. Importing the component separately enables an animated avatar. Changing from idle to thinking changes presentation while preserving identity and texture. Repeating the seed after a reload recreates the same static output.

## Problem being addressed

A previous prototype incorporated third-party avatar implementation material without a clear license grant. This specification addresses that dependency by describing product behavior for a new implementation. It does not authorize reuse of the prototype.

A second failure mode is a face disappearing into a patterned coat. The new design requires observable contrast tests rather than relying on a blend-mode label.

## Visual brief

The proposed new family is **pebble, droplet, capsule, bloom, and comet**. These names describe broad silhouette ideas, not reference drawings. Draw new geometry, facial features, appendages, and animations. Do not reproduce another project's coordinates, silhouettes, personality roster, layout, screenshots, or assets.

A pebble is an irregular rounded companion; a droplet has a tapered crest; a capsule is elongated; a bloom has a lobed outline; a comet has an asymmetric trailing feature. Keep enough interior space for a readable face. The implementer chooses dimensions, curves, proportions, facial style, names, and animation timing.

Coat treatments may include smooth and textured edges. The full LifeHash remains crisp; a stylized avatar is not a replacement for the complete square fingerprint. Idle, thinking, speaking, listening, success, and error are the required presentation states. Speaking is a silent animation; speech synthesis and microphone access are outside this release.

## Requirements

### REQ-001

**Title:** Isolated implementation inputs.

The implementer SHALL NOT read, copy, import, compare against, or translate the previous prototype or the inspiration project's source, builds, tests, screenshots, assets, or conversation.

The implementer starts in an empty project. A source manifest records files created, external materials consulted, dependency versions, and licenses. Only this handoff, platform documentation, and the approved LifeHash material are inputs.

Trace: [[SPEC-001-independent-avatar-package#TEST-001]].

### REQ-002

**Title:** Independent visual design.

The package SHALL provide an originally drawn version of each silhouette in the visual brief, with independently chosen face, character names, and state animations.

Acceptance is a source and design review, not a claim that different file contents establish independence.

Trace: [[SPEC-001-independent-avatar-package#TEST-002]].

### REQ-003

**Title:** Exact input encoding.

The generator SHALL compute [[SPEC-001-independent-avatar-package#SHA-256]] over [[SPEC-001-independent-avatar-package#UTF-8]] bytes of the accepted input string without trimming, case folding, or Unicode normalization.

Empty strings, whitespace, emoji, and embedded U+0000 are accepted. Unpaired surrogate code units and non-string values are rejected. Omitting the argument uses the empty string, because a no-options call still needs a stable identity.

Trace: [[SPEC-001-independent-avatar-package#CON-001]], [[SPEC-001-independent-avatar-package#TEST-003]].

### REQ-004

**Title:** Authentic texture.

The generator SHALL produce a full LifeHash version2 fingerprint matching the licensed reference engine for the input digest.

The same fingerprint supplies the coat. Clipping it into an avatar is permitted; changing or blurring the full fingerprint is not.

Trace: [[SPEC-001-independent-avatar-package#CON-001]], [[SPEC-001-independent-avatar-package#TEST-004]].

### REQ-005

**Title:** Versioned deterministic identity.

The generator SHALL reproduce identical identity traits and identical static SVG bytes for identical accepted input and identical explicit rendering options under one recipe version and one browser engine/version.

Across supported browser engines, digest values, traits, and decoded fingerprint pixels match. Identical PNG serialization bytes across different browser engines are not required.

The implementer specifies a new recipe identifier and documents its trait-selection algorithm. Different seeds can share a trait; uniqueness of all avatars is not claimed. Time, random values, agent state, and pointer position do not contribute to static identity. A recipe change creates a new recipe identifier.

Trace: [[SPEC-001-independent-avatar-package#CON-001]], [[SPEC-001-independent-avatar-package#TEST-005]].

### REQ-006

**Title:** Inert input strings.

The package SHALL NOT interpret seed strings or labels as HTML, SVG syntax, URLs, scripts, or expressions.

Text belongs in text nodes or escaped text output. Public appearance options are validated against their declared grammar. Invalid options produce an error rather than a silently substituted design.

Trace: [[SPEC-001-independent-avatar-package#CON-001]], [[SPEC-001-independent-avatar-package#CON-002]], [[SPEC-001-independent-avatar-package#TEST-006]].

### REQ-007

**Title:** Installable library boundaries.

The package SHALL expose a generator entry, a separate client-only custom-element entry, and a stylesheet entry with TypeScript declarations.

The root import has no automatic element registration. Generation requires browser Canvas and WebAssembly; importing the root during server rendering is permitted. The distribution contains the required licensed engine assets and notices. Consumers do not configure or copy a separate WASM file. Framework runtime dependencies are unnecessary.

Trace: [[SPEC-001-independent-avatar-package#CON-003]], [[SPEC-001-independent-avatar-package#TEST-007]].

### REQ-008

**Title:** Agent lifecycle presentation.

The component SHALL present the requested state without changing its resolved identity.

Default state is idle. The latest requested seed wins when asynchronous generations finish out of order. A readiness signal and failure signal are exposed. Changing presentation state during generation remains effective after resolution. Disconnecting releases component-owned listeners and animation scheduling. Instances do not interfere through duplicated graphic identifiers or shared mutable presentation state.

Trace: [[SPEC-001-independent-avatar-package#CON-002]], [[SPEC-001-independent-avatar-package#TEST-008]].

### REQ-009

**Title:** Browser-local privacy.

The package SHALL NOT transmit input strings through network requests, logs sent to a service, telemetry, or external avatar APIs.

Initialization can load bundled assets from the application origin. The demo can use local assets. There is no backend, account requirement, automatic microphone request, or automatic audible playback.

Trace: [[SPEC-001-independent-avatar-package#TEST-009]].

### REQ-010

**Title:** Portable SVG export.

The renderer SHALL return a self-contained SVG that depicts the generated avatar in a documented neutral state on a transparent background.

The export includes its texture. It requires no network, external stylesheet, font, or live component. Export options are explicit; live mood and mouse tracking do not leak into the static output.

Trace: [[SPEC-001-independent-avatar-package#CON-001]], [[SPEC-001-independent-avatar-package#TEST-010]].

### REQ-011

**Title:** Inspiration and dependency attribution.

The repository and distribution SHALL credit Kawaii-Dots as conceptual inspiration and retain the required LifeHash copyright and license notices.

Suggested credit: “Inspired by the idea of expressive agent avatars in Kawaii-Dots by Jérôme Massot. This project's avatar implementation and visual designs are independently authored.” This is a provenance statement to verify at review, not a claim established by the sentence itself.

The inspiration URL is recorded in [[SPEC-001-independent-avatar-package#Attribution-only reference]]. It is not an approved implementation input.

Trace: [[SPEC-001-independent-avatar-package#TEST-011]].

### REQ-012

**Title:** Local-only handoff scope.

The implementer SHALL NOT publish a package, push a remote repository, deploy a website, contact an author, or modify the existing prototype under this handoff.

The deliverable is a new local project with source, tests, notices, package archive, and review evidence. Release actions require a later explicit owner instruction.

Trace: [[SPEC-001-independent-avatar-package#TEST-012]].

## Non-functional requirements

### NFR-001

**Title:** Face visibility.

Face visibility SHALL pass the visual cases in [[SPEC-001-independent-avatar-package#TEST-013]] at small and large avatar sizes.

The implementer chooses the contrast technique. A blend mode alone is not evidence: mid-gray and high-frequency backgrounds require direct inspection. Dual light/dark outlines, local contrast regions, or another original treatment are permitted.

Trace: [[SPEC-001-independent-avatar-package#TEST-013]].

### NFR-002

**Title:** Accessible motion and demo controls.

The component SHALL provide a static presentation under the browser's reduced-motion preference. The demo's input, state controls, and export control SHALL be keyboard accessible with visible focus and text labels.

Decorative sample avatars are hidden from assistive technology; meaningful avatars have a text alternative. A generation error is announced without replacing the input string.

Trace: [[SPEC-001-independent-avatar-package#TEST-014]].

## Interface contracts

### CON-001

**Interface:** Package root, provisionally `kawaii-lifehash`.

Expose `generateAvatar(seed?)` as an asynchronous function and `avatarSVG(identity, options?)` as a static renderer. TypeScript declarations describe the returned identity and permitted options. Identity includes a recipe version, input digest, full fingerprint, and the traits needed to recreate the avatar. Internal file names and rendering architecture are unconstrained.

**Input grammar:** `seed` is absent or a primitive JavaScript string consisting of zero or more Unicode scalar values. Paired UTF-16 surrogates represent one scalar value. Unpaired surrogates are outside the grammar. Options are absent or a record with only declared keys and finite enum/numeric values; functions, markup, and URL strings are outside the option grammar.

**Preconditions:** Entire input and option records are recognized before hashing or rendering. Generated identities originate from this package's supported recipe. The renderer validates any externally supplied identity before generating markup.

**Postconditions:** Accepted inputs yield a documented identity and complete fingerprint. Identical seed/options/version yield identical static output within one browser engine/version. Across supported engines, digest values, traits, and decoded fingerprint pixels match. The digest covers input bytes once; the LifeHash engine receives that digest through its documented digest interface.

**Error model:** Invalid inputs produce a documented type/range error. Unsupported generation environments produce a descriptive error. Renderer initialization failures are observable promise rejections, not a silent substitute texture.

Implements: [[SPEC-001-independent-avatar-package#REQ-003]], [[SPEC-001-independent-avatar-package#REQ-004]], [[SPEC-001-independent-avatar-package#REQ-005]], [[SPEC-001-independent-avatar-package#REQ-006]], [[SPEC-001-independent-avatar-package#REQ-010]].

Verified by: [[SPEC-001-independent-avatar-package#TEST-003]], [[SPEC-001-independent-avatar-package#TEST-004]], [[SPEC-001-independent-avatar-package#TEST-005]], [[SPEC-001-independent-avatar-package#TEST-006]], [[SPEC-001-independent-avatar-package#TEST-010]].

### CON-002

**Interface:** A browser custom element from `kawaii-lifehash/component` with the new tag `<lifehash-avatar>`.

Expose seed, state, and size inputs; resolved identity; asynchronous readiness; an identity-resolved event; a generation-error event; and SVG export. The implementer proposes event and property names in its own API contract before implementation. Compatibility with a previous component's API is not required.

**Input grammar:** Seed follows [[SPEC-001-independent-avatar-package#CON-001]]. State belongs to `{idle, thinking, speaking, listening, success, error}`. Size is a positive finite pixel count; arbitrary CSS or executable expressions are not accepted. Missing state is idle; missing size is 256 pixels, the default large viewing size used in the face-visibility tests.

**Preconditions:** The component entry runs in a browser. The component recognizes its seed, state, and size attributes before interpreting them. Ordinary global HTML attributes retain browser semantics. Invalid changes report an error and retain the last valid presentation.

**Postconditions:** Only the latest seed resolves into the visible identity. State never alters the fingerprint. Readiness distinguishes pending, resolved, and failed generation. Multiple instances and reconnects function independently.

**Error model:** Initialization and input errors are distinguishable. A failed generation leaves the last valid identity available, or a labeled empty placeholder if none exists. No unhandled rejection is produced solely by declarative markup.

Implements: [[SPEC-001-independent-avatar-package#REQ-006]], [[SPEC-001-independent-avatar-package#REQ-008]].

Verified by: [[SPEC-001-independent-avatar-package#TEST-006]], [[SPEC-001-independent-avatar-package#TEST-008]], [[SPEC-001-independent-avatar-package#TEST-014]].

### CON-003

**Interface:** An installable npm archive, ESM exports, CSS, types, notices, and a separate static demo.

Root: generator. `./component`: custom element. `./styles.css`: component styles. Dependency material is present and appropriately attributed. The package does not include the demo build, source-provenance scratch files, credentials, or development-only tooling as runtime dependencies.

**Preconditions:** The project builds in a fresh checkout with declared dependencies. A recorded license choice covers the newly authored files before release.

**Postconditions:** Installing the archive in a new application resolves all exports. Development and production work without manual engine asset copying. A production application hosted under a nested path still generates its avatars. The root can be imported in a server-rendering process without touching browser globals.

**Error model:** Build and packaging failures stop artifact creation; a stale archive is not reported as the new release.

Implements: [[SPEC-001-independent-avatar-package#REQ-007]].

Verified by: [[SPEC-001-independent-avatar-package#TEST-007]].

## Decisions

### ADR-001

**Decision:** Identity and presentation have separate responsibilities.

**Context:** Consumers need stable avatars across reloads while an agent's mood changes frequently.

**Rationale:** A shared identity/rendering library supports both static exports and the animated component. Live state belongs to the component. Rendering techniques, file structure, and caching strategy remain implementer choices.

**Trade-off:** Browser generation is accepted for this release. Server-side generation is excluded; safe server-side import remains required.

### ADR-002

**Decision:** Use the licensed LifeHash reference implementation as an approved dependency.

**Context:** The requested texture is LifeHash, not a merely similar pattern.

**Rationale:** Independent reimplementation of the avatar code does not require reimplementing this separately licensed algorithm. Pin the dependency source and retain its license. Obtain dependency material directly from an approved source rather than the prior prototype.

**Trade-off:** Asset packaging and browser loading need integration tests. Embedded WASM or another automatic delivery mechanism is an implementer choice.

## Acceptance tests

These are behavioral cases to implement independently, not an existing test suite to copy. No test or implementation is claimed to exist yet.

### TEST-001

Validates: [[SPEC-001-independent-avatar-package#REQ-001]].

Type: prohibited-action and provenance review. Review the workspace input manifest, agent prompts, repository creation record, dependency origins, and material-access log. Confirm no previous code, screenshots, test fixtures, archive, or inherited transcript was supplied. If accidental exposure occurs, record it and obtain owner review before continuing; do not relabel the attempt isolated.

### TEST-002

Validates: [[SPEC-001-independent-avatar-package#REQ-002]].

Type: design review. Inspect the new design rationale, authored geometry, character names, and motion sketches. Confirm every proposed silhouette exists and the rationale derives from the visual brief. The reviewer can inspect restricted material separately; feedback to the implementer contains no source excerpts or tracing instructions.

### TEST-003

Validates: [[SPEC-001-independent-avatar-package#REQ-003]].

Type: positive, negative-input, and negative-output. Compare digest output with platform SHA-256 for empty input, whitespace, emoji, embedded NUL, and accented text. Verify whitespace remains meaningful; verify composed and decomposed accented strings retain their distinct byte sequences. Reject numbers, objects, null, and unpaired surrogates.

### TEST-004

Validates: [[SPEC-001-independent-avatar-package#REQ-004]].

Type: positive and negative-output. Compare decoded fingerprint pixels with an independently invoked licensed reference renderer at LifeHash version2. Repeat with different strings. Display the complete square alongside the stylized avatar. Do not use the old prototype as an oracle.

### TEST-005

Validates: [[SPEC-001-independent-avatar-package#REQ-005]].

Type: positive and scope-invariant. Repeat seeds across instances and reloads within one browser engine/version; compare identity traits and SVG bytes. Across supported engines, compare digests, traits, and decoded fingerprint pixels rather than PNG serialization bytes. Change state and pointer position; verify unchanged identity and neutral static export. Freeze fixtures only after the new recipe is documented.

### TEST-006

Validates: [[SPEC-001-independent-avatar-package#REQ-006]].

Type: negative-input and prohibited-action. Supply markup-like seeds and option values containing quotes, brackets, handlers, and script text. Seeds remain data. Invalid options are rejected. No injected element or executable handler appears. Exercise each public input boundary.

### TEST-007

Validates: [[SPEC-001-independent-avatar-package#REQ-007]].

Type: integration and scope-invariant. Build, pack, install into a fresh consumer, type-check all entry points, and generate a visible SVG. Exercise both development and production under a nested URL. Import the root in Node without browser globals. Confirm no manual WASM copy, automatic element registration from the root, or framework runtime dependency.

### TEST-008

Validates: [[SPEC-001-independent-avatar-package#REQ-008]].

Type: positive, negative-output, and scope-invariant. Change seeds rapidly with deliberately reordered completion. Change state while generation is pending. Test independent instances, disconnect, reconnect, readiness, and an induced engine failure. Confirm the newest seed wins, state survives, failures are observable, and component-owned activity ends on disconnect.

### TEST-009

Validates: [[SPEC-001-independent-avatar-package#REQ-009]].

Type: prohibited-action. Record network requests during initialization and generation. Neither request URL nor payload contains a seed. Generation works after local engine initialization with outside network access disabled. Confirm no microphone permission request or unsolicited audio.

### TEST-010

Validates: [[SPEC-001-independent-avatar-package#REQ-010]].

Type: integration and scope-invariant. Load the exported SVG as an image in a separate document with external networking blocked. Verify visible textured geometry, a neutral face, and transparent outside pixels. Confirm no dependency on the live component's stylesheet, clock, or pointer state.

### TEST-011

Validates: [[SPEC-001-independent-avatar-package#REQ-011]].

Type: packaging and provenance review. Inspect README, dependency notices, and packed file contents. Confirm inspiration attribution, exact dependency source/version, complete required license text, and no assertion of ownership over dependency code.

### TEST-012

Validates: [[SPEC-001-independent-avatar-package#REQ-012]].

Type: prohibited-action and scope-invariant. Inspect the change/access record. Confirm no remote push, registry publication, deployment, author contact, or mutation of the prior workspace. The handoff's output remains in the new project.

### TEST-013

Validates: [[SPEC-001-independent-avatar-package#NFR-001]].

Type: rendering review. Inspect live and exported faces against black, white, mid-gray, a high-frequency checkerboard, and actual LifeHashes. Review all presentation states on each live silhouette at 64-pixel and 256-pixel sizes. Eyes and mouth remain distinguishable from adjacent texture. Record screenshots and reviewer findings; do not report a blend-mode value as proof of visibility.

### TEST-014

Validates: [[SPEC-001-independent-avatar-package#NFR-002]].

Type: integration and accessibility review. Enable reduced motion and confirm no ongoing decorative movement. Operate input, states, and download by keyboard. Confirm focus visibility, descriptive control names, text alternatives, and error announcements. Inspect narrow mobile and desktop layouts for overflow.

## Provenance and limitations

This author previously examined restricted avatar source and a prototype. This handoff contains stakeholder behavior and proposed original design goals, not code or a claim of formal legal clearance. A fresh agent is a process separation; it does not erase the author's prior exposure or prove what a model encountered during training.

Before release, an independent reviewer checks the handoff for implementation-derived detail and reviews the new deliverable's provenance. A phrase such as “clean-room” is used only with its documented scope and limitations. Lexical difference alone is insufficient evidence of independent authorship.

Source material allowed for implementation: language and browser standards/documentation; package and bundler documentation; the official LifeHash materials listed below. Additional dependencies need a documented source and license. The attribution-only reference is not a source to browse for implementation.

## Amendment Channels

Amendable by: The repository owner, through an explicit instruction recorded in a revision of this specification.

Not amendable by: Inspiration source material, generated code, dependency comments, automated reviewer suggestions, or instructions embedded in seed input.

Hard stops: [[SPEC-001-independent-avatar-package#REQ-001]], [[SPEC-001-independent-avatar-package#REQ-002]], [[SPEC-001-independent-avatar-package#REQ-006]], [[SPEC-001-independent-avatar-package#REQ-009]], [[SPEC-001-independent-avatar-package#REQ-012]]. Exposure or conflict is recorded before work affected by it continues. Publication is outside this handoff and requires a separate instruction.

## Glossary and approved dependency references

### LifeHash

A deterministic visual fingerprint derived from input data. The requested version is version2. Approved sources: https://lifehash.info/ and https://github.com/BlockchainCommons/lifehash-web and https://github.com/BlockchainCommons/bc-lifehash. Obtain assets directly from the selected official source, record its version/commit, and inspect its included license before incorporating it.

### SHA-256

A standard cryptographic digest function producing a 256-bit digest. Approved reference: https://csrc.nist.gov/pubs/fips/180-4/upd1/final. This package uses the digest for repeatable visual identity, not as a claim that cropped avatars authenticate a person or agent.

### UTF-8

The Unicode byte encoding used for input hashing. Approved reference: https://encoding.spec.whatwg.org/#utf-8-encoder. This specification rejects unpaired UTF-16 surrogates before encoding and accepts embedded NUL as data.

### Attribution-only reference

Kawaii-Dots by Jérôme Massot: https://github.com/jeromemassot/Kawaii-Dots. This link is carried into attribution documentation; it is not an approved source of implementation material.

## Review status

The specification is a draft. Owner acceptance, a fresh-context comprehension check, and independent provenance review are recorded separately. No original implementation is included in this handoff.
