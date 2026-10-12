---
mode: reference
---
# Requested visual refinements

The owner requested full shape texture coverage, a less prominent outline, additive shapes such as ears, and cursor tracking of pupils rather than whole eyes. These instructions refine the local draft's appearance without changing seed encoding or trait selection.

The renderer combines body, separate ears and feet in an additive alpha mask. One inline crisp LifeHash pixel grid covers the union, avoiding pattern resets at joins and the nested-image transparency observed in Firefox. Contour strokes are thin and translucent, and are drawn below the coat so overlapping parts do not create internal borders.

The eye shells remain fixed. A nested gaze group contains only pupils and their highlights; page cursor events move this group within a bounded range. Reduced motion suppresses gaze movement; disconnection removes document listeners. Export remains neutral.

Removing the opaque face medallion initially weakened 64px face visibility on checkerboard coats. Larger eye shells, white outer halos and broader dual-stroke mouths resolve the reviewed cases. [[texture-coverage-review]] records the independent checks; [[visual-matrix]] records the method. Attribution: [[SPEC-001-independent-avatar-package#TEST-008]], [[SPEC-001-independent-avatar-package#TEST-010]], [[SPEC-001-independent-avatar-package#TEST-013]], [[SPEC-001-independent-avatar-package#TEST-014]].
