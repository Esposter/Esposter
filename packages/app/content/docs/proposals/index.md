---
title: Proposals
description: Designs that are not implemented yet — one self-contained spec per feature, indexed by each area's roadmap.
---

# Proposals

Everything under this folder is **future work awaiting implementation** — one self-contained spec per feature, written so a cold implementation session can execute it without extra context. When a proposal ships, it is rewritten as an as-built feature page under its product area and deleted from here.

Each product area's roadmap is the prioritized index over its proposals:

- [users roadmap](/docs/users/roadmap)
- [esbabbler roadmap](/docs/esbabbler/roadmap)
- [platform roadmap](/docs/platform/roadmap)
- [sheet editor roadmap](/docs/sheet-editor/roadmap)
- [achievements roadmap](/docs/achievements/roadmap)
- [virrun roadmap](/docs/virrun/roadmap)
- [infra roadmap](/docs/infra/roadmap)

posts, vue-phaserjs, clicker, dungeons, anime, and fluid-simulator have no roadmap and no open proposals.

Repo-wide refactor plans have no area roadmap and live here directly:

- [Null removal](/docs/proposals/refactors/null-removal) — eliminate `null` in favour of `undefined`, ESLint-enforced.
- [Comment cleanup](/docs/proposals/refactors/comment-cleanup) — sweep ledger for keeping comments tight repo-wide.
- [ESLint → oxlint migration](/docs/proposals/refactors/eslint-to-oxlint-migration) — move rules to oxlint as coverage lands, prioritized by ESLint rule time.
- [File upload consolidation](/docs/proposals/refactors/file-upload-consolidation) — one SAS round-trip and one file validator instead of four and three.
- [Docs consistency tests](/docs/proposals/refactors/docs-consistency-tests) — fail CI on broken `/docs` links, unregistered pages, and dead Key Files paths.
- [Migration chain guard](/docs/proposals/refactors/migration-chain-guard) — assert the Drizzle snapshot chain is linear in CI instead of at the next `db:gen`.
