---
title: Roadmap
description: Open resource work — the prioritized index over the proposal specs.
---

# Resource roadmap

Azure-portal parity program for the Resource Explorer: every product is already a resource behind one [explorer](/docs/resource/explorer), so this backlog closes the UX gap between our explorer and the real portal. Items link their full specs under [proposals](/docs/proposals) — directly or via their section heading; the specs are the plan, this page is only the priority order. Check [deferred](/docs/resource/deferred) + [rejected](/docs/resource/rejected) before adding items, and the [sheet editor](/docs/resource/sheet)'s own pair for anything inside the Data blade — the grid keeps its backlog with the editor. New Azure services are the only real cost anywhere below; everything else is frontend + procedures + at most a Postgres migration.

## Later

- [ ] [Content-addressed assets](/docs/proposals/resource/content-addressed-assets) — address resource assets by content so a publish references them instead of cloning them, with reference rows written from a scan of each version's content and a count-but-never-collect period before anything is deleted
- [ ] [Paid storage tiers](/docs/proposals/resource/paid-storage-tiers) — sell a larger allowance through a merchant-of-record checkout, with the tier column staying the one input to the quota gate. Blocked on wanting to take money at all, and on shipping account deletion + data export alongside it
