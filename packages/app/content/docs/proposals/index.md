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

An area with nothing outstanding carries no roadmap at all, so the list above is also the list of areas that have open work to track — `ls */roadmap.md` answers it, and each roadmap says whether it is currently empty.

Repo-wide refactor plans have no area roadmap and live here directly:

- [ESLint → oxlint migration](/docs/proposals/refactors/eslint-to-oxlint-migration) — move rules to oxlint as coverage lands, prioritized by ESLint rule time.

Sweeps are not proposals. A proposal designs behaviour that does not exist yet; a sweep carries a settled convention across code that already works and changes nothing about what it does. They are tracked as repo state in `.agents/ledgers/`, one ledger file per sweep — or one coverage folder, once a sweep outgrows a single file.
