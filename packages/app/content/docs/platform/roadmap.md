---
title: Roadmap
description: Open platform work — the prioritized index over the proposal specs.
---

# Platform roadmap

Azure-portal parity program for the Resource Explorer: the [consolidation](/docs/platform/resource-consolidation) shipped — this backlog closes the UX gap between our explorer and the real portal. Items link their full specs under [proposals](/docs/proposals) — directly or via their section heading; the specs are the plan, this page is only the priority order. Check [deferred](/docs/platform/deferred) + [rejected](/docs/platform/rejected) before adding items. New Azure services are the only real cost anywhere below; everything else is frontend + procedures + at most a Postgres migration (never run `db:gen`/`db:up` automatically — generate on request, user applies).

## Next

- [ ] [Resource manager service menu](/docs/proposals/platform/resource-manager-service-menu) — a standing left nav for the area, with Recent and Favorites promoted from hub cards to list views over the existing surface
  - [ ] `ResourceServiceMenu` in the `resource` layout, active entry decided by the router
  - [ ] `/resources/favorites` and `/resources/recents` as `ResourceListView` routes, replacing the hub cards
  - [ ] `/resources/tags` — tag list with resource counts, linking into `/all` pre-filtered
  - [ ] `Last accessed` column, default-off outside Recent
  - [ ] Settle the two open questions on the spec first: whether recents move server-side, and what `/resources` is once its cards are routes

Storage quotas shipped — see [storage quotas](/docs/platform/storage-quotas). New ideas start as a [proposal](/docs/proposals) and get a prioritized checkbox here.
