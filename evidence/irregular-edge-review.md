---
type: independent-review
date: 2026-10-12
scope: stronger irregular edges, pupil tracking, listening presentation
---

# Irregular edge follow-up

Directly viewed the final refreshed idle coat matrices at 64 and 256 pixels and listening matrix at 256 pixels. All five silhouettes and black, white, gray, checkerboard and LifeHash coat cases were inspected. Read current rendering and pointer handling source. No implementation edits or remote implementation access occurred.

No new blocking defect was observed. The stronger coarse/fine edge treatment is visibly irregular at 256px and remains visible at 64px. Circle, diamond, rounded square, pointed-ear hexagon and triangle remain recognizable; inspected ears remain joined to their bodies. No viewport clipping, blank coat interior or displaced face was observed. The boundary has small tufts and larger uneven contours while the interior LifeHash grid stays crisp and continuous to the mask boundary (REQ-001 / NFR-001 / TEST-013).

Source applies the two digest-seeded turbulence/displacement stages only to the alpha silhouette union and contour. Coarse anisotropic noise uses displacement14 and fine noise displacement8; neither modifies the fingerprint pixel data. This preserves deterministic source inputs, but this review does not establish identical filter rasterization across browser engines or all possible digests.

The eye shells are now fixed pale cream and dark pupils are smaller. The pointer transform applies only to `.gaze`, with smooth radial tanh strength bounded to 1.5 horizontal / 1 vertical SVG units, zero displacement at center and leave/disconnect reset. This makes movement visible against the eye shell while retaining a restrained range. Source no longer contains the listening ring element or its animation; the directly viewed listening matrix has no surrounding ring. Listening brows, small smile and attentive nod remain. The parent's revised cross-browser tracking assertion was still rerunning when this report was written; no independent test-suite claim is made here.

The existing 64px artificial checkerboard limitation for subtle facial detail remains; these changes do not establish equal expression clarity on every texture. Prior reference-informed provenance amendment and pending owner legal/license review remain applicable. No legal originality or license certification is offered.

Next actor: implementation author should record final browser-check results; owner may assess the stronger edge appearance and restrained pupil response.
