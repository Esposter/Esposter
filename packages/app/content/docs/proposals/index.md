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

Infra has open area proposals right now; every other area's roadmap is clear.

Repo-wide refactor plans have no area roadmap and live here directly:

- [ESLint → oxlint migration](/docs/proposals/refactors/eslint-to-oxlint-migration) — move rules to oxlint as coverage lands, prioritized by ESLint rule time.

Sweeps are not proposals. A proposal designs behaviour that does not exist yet; a sweep carries a settled convention across code that already works and changes nothing about what it does. They are tracked as repo state in `.agents/ledgers/`, one ledger file per sweep — or one coverage folder, once a sweep outgrows a single file.
