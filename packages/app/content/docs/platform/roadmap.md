---
title: Roadmap
description: Open platform work — the prioritized index over the proposal specs.
---

# Platform roadmap

Azure-portal parity program for the Resource Explorer: the [consolidation](/docs/platform/resource-consolidation) shipped — this backlog closes the UX gap between our explorer and the real portal. Items link their full specs under [proposals](/docs/proposals) — directly or via their section heading; the specs are the plan, this page is only the priority order. Check [deferred](/docs/platform/deferred) + [rejected](/docs/platform/rejected) before adding items. New Azure services are the only real cost anywhere below; everything else is frontend + procedures + at most a Postgres migration (never run `db:gen`/`db:up` automatically — generate on request, user applies).

## Next

- [ ] [Storage quotas](/docs/proposals/platform/storage-quotas) — per-user blob-storage allowance (Free = 10 GiB) enforced by a pre-flight tRPC middleware, a per-user usage counter, and a Gmail-like usage bar; supersedes the deferred storage usage surface.

Otherwise the tracked Azure-portal-parity backlog is clear. New ideas start as a [proposal](/docs/proposals) and get a prioritized checkbox here.
