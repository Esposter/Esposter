---
title: Proposals
description: Designs that are not implemented yet — one self-contained spec per feature, indexed by each area's roadmap.
---

# Proposals

Everything under this folder is **future work awaiting implementation** — one self-contained spec per feature, written so a cold implementation session can execute it without extra context. When a proposal ships, it is rewritten as an as-built feature page under its product area and deleted from here.

Each product area's roadmap is the prioritized index over its proposals:

- [users roadmap](/docs/user/roadmap)
- [esbabbler roadmap](/docs/esbabbler/roadmap)
- [posts roadmap](/docs/post/roadmap)
- [resource roadmap](/docs/resource/roadmap)
- [sheet editor roadmap](/docs/resource/sheet/roadmap)
- [achievements roadmap](/docs/achievement/roadmap)
- [virrun roadmap](/docs/virrun/roadmap)
- [infra roadmap](/docs/infra/roadmap)

The list is which areas keep a roadmap, not which have work open — a mature area's roadmap often reads "no open work", and an area with none has never needed one. `ls */roadmap.md` answers the first question and the page itself answers the second.

Repo-wide refactor plans have no area roadmap and live here directly:

- [the Vite+ migration](/docs/proposals/refactors/vite-plus) — make `vp` the toolchain entry point and cached task runner, retire the hand-rolled caches and virrun, and leave Nuxt owning the app build.
- [objectWrap collapse](/docs/proposals/refactors/object-wrap-collapse) — hand the one-line-object rule to `oxfmt`, at the cost of every deliberate expansion in the repository.

Sweeps are not proposals. A proposal designs behaviour that does not exist yet; a sweep carries a settled convention across code that already works and changes nothing about what it does. They are tracked as repo state in `.agents/ledgers/`, one ledger file per sweep — or one coverage folder, once a sweep outgrows a single file.
