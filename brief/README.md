---
mode: how-to
---

# How to use this handoff

This folder contains a functional specification and a separation procedure for a new implementation. It contains no prototype code or artwork.

## Before you start

Use [[SPEC-001-independent-avatar-package]] as the product brief. The spec author previously saw restricted source; this process does not claim that prior exposure disappears. The owner reviews the brief before treating it as a formal clean-room boundary.

A new chat alone separates conversational context, but it does not restrict filesystem access. A new branch or worktree also retains the old repository's material. For stronger separation, use an empty container or workspace with only this handoff mounted. The implementer uses approved dependency sources and platform documentation.

## Steps

1. Create a new empty implementation directory or container. Do not clone or mount the old project.
2. Copy only this handoff's documents into it. Supply no existing source, generated package, tests, screenshots, or previous transcript.
3. Start a new agent session without history inheritance, session retrieval, or repository memory from the previous project.
4. Give the agent the launch instruction below. Do not ask this specification-authoring session to implement the rewrite.
5. Ask the implementer to record its inputs, consulted sources, original design decisions, and dependency versions in a provenance log.
6. Review the resulting local package, test evidence, designs, and provenance independently before deciding how to release it.

## Launch instruction

> Work only in this new project. Read the supplied handoff documents and implement the draft specification as a local, independently authored package. Treat the specification as a functional brief, not a code translation exercise.
>
> Do not access the previous prototype, the inspiration project's implementation, its screenshots or assets, old packages, tests, source history, or the earlier conversation. Do not search for cached copies or recover them through another agent or memory tool. The inspiration URL is for attribution text only.
>
> Obtain the LifeHash reference dependency directly from an approved official source. Record the exact source, version, and license. Language, platform, and package-tool documentation are permitted research inputs.
>
> Design and implement new shapes, faces, names, and animations from the brief. Document the new recipe and your proposed public API before coding. Write your own behavior tests from the specification. Keep seed strings inert and browser-local.
>
> Record sources consulted and decisions made. If restricted material appears accidentally, stop affected work, record the exposure, and ask the owner how to proceed. Do not conceal it or claim strict clean-room provenance.
>
> Produce source, an installable archive, a demo, declarations, license notices, tests, and a provenance record. Do not publish, push, deploy, contact anyone, or modify the prior project under this instruction.

## Result

The output is a separate local project. The owner and an independent reviewer decide whether provenance and implementation evidence support release.

The input is a behavior specification rather than an existing codebase to port. It does not guarantee legal clearance or establish what a model encountered during training.
