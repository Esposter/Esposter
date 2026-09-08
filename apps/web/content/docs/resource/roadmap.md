---
title: Roadmap
description: Open resource work — the prioritized index over the proposal specs.
---

# Resource roadmap

Azure-portal parity program for the Resource Explorer: every product is already a resource behind one [explorer](/docs/resource/explorer), so this backlog closes the UX gap between our explorer and the real portal. Items link their full specs under [proposals](/docs/proposals) — directly or via their section heading; the specs are the plan, this page is only the priority order. Check [deferred](/docs/resource/deferred) + [rejected](/docs/resource/rejected) before adding items. New Azure services are the only real cost anywhere below; everything else is frontend + procedures + at most a Postgres migration.

## Next

- [ ] [Resource version store](/docs/proposals/resource/resource-version-store) — hold version history as content-addressed keyframes and deltas so a version costs the edit rather than a full copy of the document, and the storage meter stops climbing for a resource that did not grow. Its own workspace package, no new Azure resource, and a second phase that retires publish-time asset cloning

## Later

- [ ] [Paid storage tiers](/docs/proposals/resource/paid-storage-tiers) — sell a larger allowance through a merchant-of-record checkout, with the tier column staying the one input to the quota gate. Blocked on wanting to take money at all, and on shipping account deletion + data export alongside it
