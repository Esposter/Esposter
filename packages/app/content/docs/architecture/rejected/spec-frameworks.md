---
title: Spec frameworks
description: Rejected — adopting OpenSpec, Spec Kit or a Kiro-style spec workflow on top of the docs tree.
---

# Spec frameworks

Spec-driven development frameworks — OpenSpec, GitHub's Spec Kit, the Kiro-style requirements/design/tasks trio — package one loop: a feature is written as a spec before it is written as code, the spec is validated by a CLI, and it is archived into a durable current-state spec once the work ships. Adopting one would mean laying its file layout (`changes/`, `specs/`, `tasks.md`) over `content/docs`.

## Why not

Every part of that loop already exists here, under names chosen for this repo:

| What a spec framework provides      | What this repo already has                                          |
| :---------------------------------- | :------------------------------------------------------------------ |
| A delta artifact per feature        | `content/docs/proposals/` — deleted on ship                         |
| The durable current-state spec      | The as-built page under its product area                            |
| Archive-on-completion               | The same move, done by hand, with proposals rarely left open        |
| A CLI that validates spec structure | `content/docs.test.ts`, in CI                                       |
| Authoring conventions               | The `docs` skill                                                    |
| —                                   | `.agents/ledgers/` — the maintenance loop, which has no counterpart |
| —                                   | A rendered `/docs` site with search, for humans                     |

The validator row is the decisive one, and it runs the wrong way from what adoption would suggest. A spec CLI checks that a spec file carries the headings its schema requires. `content/docs.test.ts` checks that every Mermaid diagram actually parses, that every page is registered in the sidebar map in both directions, that every `/docs/…` link resolves, and that every backticked repo path in a Key Files table exists on disk — across the whole tree, and across the skills beside it. No spec framework ships anything that strong, so adopting one would mean rebuilding these checks against a foreign file layout for no gain.

The two things a framework would genuinely add are already covered from elsewhere. Task decomposition — the `tasks.md` half — is what plan mode produces per session, and it is deliberately not committed: a checklist outlives its usefulness the moment the work lands, and the repo's standing backlog already has a home in each area's `roadmap.md`. Deltas phrased as ADDED/MODIFIED/REMOVED against the current spec matter when proposals are small enough to drown in restated context; here a proposal is whole-subsystem-sized by convention, so it states the design once and the diff against today's behaviour is the proposal's own scope section.

The point a framework cannot answer at all is that this tree is rendered and read by people. A spec directory is an agent-facing artifact that happens to be markdown. `/docs` is a section of the product, with navigation and search, and the same page serves the engineer onboarding and the agent grepping. Trading that for schema conformance is the wrong direction.

## What we take from it instead

The idea worth borrowing is narrow and needs no framework: **a proposal that modifies an existing subsystem states what changes against the current page rather than restating the whole design.** That is the delta discipline without the tooling, and it is the reason a small change skips the proposal step entirely instead of producing a page that is mostly context.
