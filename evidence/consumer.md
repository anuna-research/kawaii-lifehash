---
mode: reference
---
# Fresh consumer evidence

Machine evidence: evidence/consumer.json. scripts/consumer.mjs creates a fresh temporary application, installs the local archive, type-checks all exports, checks Node import, and exercises development and nested production in Chromium, Firefox and WebKit. It compares digests, traits and pixels across engines and rejects network requests during offline generation. The temporary consumer is removed after checking. Requirement attribution: [[SPEC-001-independent-avatar-package#TEST-007]], [[SPEC-001-independent-avatar-package#TEST-009]], [[SPEC-001-independent-avatar-package#TEST-005]].
