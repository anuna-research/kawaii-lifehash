---
mode: reference
---
# Facial animation review

Reviewer: independent review agent, 2026-10-12. Scope: current authored component expressions/animation CSS, renderer eye/mouth structure, visual capture script, and regenerated live visibility matrices. Next actor: implementer completes current browser checks and may deepen animation-phase evidence; owner reviews the local deliverable. No implementation edits, restricted materials, external publication or contact occurred.

## Direct visual inspection

Opened the current live 64px and 256px matrices for idle, thinking, speaking, listening, success and error. Each frame covers all five silhouettes and black, white, mid-gray, checkerboard and actual LifeHash coats. The enlarged white eye shells retain visible pupil regions over the texture. Brows remain visually above the eyes; mouths remain below them. Thinking's uneven mouth/brows, speaking's open dark mouth, listening's smaller smile, success's broad open smile and error's frown have visibly different shapes.

At 64px the success open smile remains identifiable, including over checkerboard, and its dark interior is distinct from both eyes. The tongue is an accent rather than necessary for recognizing success; at this size its fine detail is subtle. Speaking's sampled open oval likewise remains distinct from the eyes and coat. At 256px both open mouths and the success tongue are clear. Error's concerned brow/frown arrangement stays readable. No concrete new facial clipping or visibility failure was found in the supplied frames. This supports [[SPEC-001-independent-avatar-package#NFR-001]] and [[SPEC-001-independent-avatar-package#TEST-013]] within the stated sampled-frame scope.

## Source review

The expression map supplies per-state mouth and brow geometry. `#presentation()` updates that geometry in place and limits filled mouths to speaking/success; it does not change identity or fingerprint. Cursor tracking still translates only `.gaze`, nested under the fixed eye shells; state changes retain that group. The static export path calls the identity renderer directly, so live mouth/brow changes, pointer translation, tongue and CSS cadence do not leak into neutral export. Attribution: [[SPEC-001-independent-avatar-package#REQ-005]], [[SPEC-001-independent-avatar-package#REQ-008]], [[SPEC-001-independent-avatar-package#REQ-010]].

Blink timing closes the eye group briefly at irregular intervals. Speaking cadence varies horizontal and vertical mouth scale through several keyframes; listening introduces a small nod. Success hops a bounded number of times while cheeks continue to glow, and error's short wobble terminates. Reduced-motion CSS disables animations and transitions, while the pointer handler skips gaze movement under that preference. Disconnect removes document pointer listeners and suppresses animation. No new concrete source-level violation was identified in these mechanisms. Attribution: [[SPEC-001-independent-avatar-package#REQ-008]], [[SPEC-001-independent-avatar-package#NFR-002]]. This inspection does not substitute for the pending executable cross-browser checks.

## Evidence limits and useful followup

The current visual script chooses one fraction per state and applies it to every animation's own duration. Speaking is sampled at 0.5, which is near its compressed mouth keyframe at 0.48, rather than its largest opening at 0.36. Blink closures at 0.415 and 0.775 are also absent from the supplied screenshots. Therefore the record's general phrase "animation extrema" is broader than the current captured evidence. The frames directly establish the expressions at their chosen phases, including the static success open smile; they do not establish the largest speaking opening or a closed blink frame. A bounded additional capture at speaking 0.36 and a blink closure would deepen the evidence without requiring implementation changes. This is a verification limitation, not a reproduced production defect.

Provenance/license conclusions remain those documented in [[independent-review-followup]]; appearance and motion review does not establish legal clearance or authorize release.

## Followup: explicit speaking opening and blink closure

Directly opened `face-64-idle-blink.png`, `face-256-idle-blink.png`, `face-64-speaking-open.png` and `face-256-speaking-open.png`. These new matrices supersede the omitted-frame limitation above: blink is explicitly sampled at its 41.5% closure, and speaking at its 36% largest vertical opening.

The expanded speaking mouth has a clear dark interior with a light perimeter and remains distinguishable from both eyes across every supplied silhouette/coat at both sizes. It does not clip out of the face or obscure the pupils. The blink frames show the expected thin closed-eye lines; they are much less prominent than open eyes, particularly over the checkerboard, but the mouth/brow/cheek arrangement remains readable and this intentional brief closure is not a new persistent face-visibility defect. No new concrete defect was found in these added frames. Together with the preceding review, this closes the named visual evidence gap for [[SPEC-001-independent-avatar-package#NFR-001]] and [[SPEC-001-independent-avatar-package#TEST-013]]. This is still selected-frame inspection, not exhaustive time sampling or independent execution of the full browser suite.
