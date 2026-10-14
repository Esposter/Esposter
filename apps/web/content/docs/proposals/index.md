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
- [achievements roadmap](/docs/achievement/roadmap)
- [infra roadmap](/docs/infra/roadmap)
- [shared roadmap](/docs/shared/roadmap)

The list is which areas keep a roadmap, not which have work open — a mature area's roadmap often reads "no open work", and an area with none has never needed one. `ls */roadmap.md` answers the first question and the page itself answers the second.

A program too large for one area's roadmap indexes its own proposals:

- [Genshin](/docs/proposals/genshin) — Genshin Impact's world rebuilt as the agent console's world, a walkable fan recreation with the engine first and each region after it.

A standard every area will follow, not yet built, lives under `proposals/architecture/`, since the architecture section keeps no roadmap of its own:

- [AI-native resources](/docs/proposals/architecture/ai-native-resources) — whatever a person can do in a resource editor, an agent can do through generic typed tools derived from each type's own declaration.

Repo-wide refactor plans have no area roadmap and live here directly, under `proposals/refactors/`; none is open.

Sweeps are not proposals. A proposal designs behaviour that does not exist yet; a sweep carries a settled convention across code that already works and changes nothing about what it does. They are tracked as repo state in `.agents/ledgers/`, one ledger file per sweep — or one coverage folder, once a sweep outgrows a single file.
