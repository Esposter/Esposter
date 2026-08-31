---
title: Roadmap
description: Open platform work — the prioritized index over the proposal specs.
---

# Platform roadmap

Azure-portal parity program for the Resource Explorer: every product is already a resource behind one [explorer](/docs/platform/resource-explorer), so this backlog closes the UX gap between our explorer and the real portal. Items link their full specs under [proposals](/docs/proposals) — directly or via their section heading; the specs are the plan, this page is only the priority order. Check [deferred](/docs/platform/deferred) + [rejected](/docs/platform/rejected) before adding items. New Azure services are the only real cost anywhere below; everything else is frontend + procedures + at most a Postgres migration.

## Next

- [ ] [Resource snapshots](/docs/proposals/platform/resource-snapshots) — generalize the publish snapshot into a core channel mechanism, giving every type restorable checkpoints of its working copy, a pre-restore safety net, and a fix for the survey settings a restore silently reverts

## Later

- [ ] [Paid storage tiers](/docs/proposals/platform/paid-storage-tiers) — sell a larger allowance through a merchant-of-record checkout, with the tier column staying the one input to the quota gate. Blocked on wanting to take money at all, and on shipping account deletion + data export alongside it
