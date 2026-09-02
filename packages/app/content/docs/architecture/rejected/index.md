---
title: Rejected
description: Repo-wide standards and third-party tools we decided against — one page per idea, with the rationale.
---

# Architecture rejected ideas

One page per rejected idea (won't do) — a cross-cutting standard, an enforcer, or a third-party tool we chose not to
adopt. Check here before proposing one; never re-argue a decided idea.

- [Migration chain guard](/docs/architecture/rejected/migration-chain-guard) — `db:gen` is the only producer of a snapshot, so a linearity test only catches an already-banned hand-edit
- [Spec frameworks](/docs/architecture/rejected/spec-frameworks) — the proposal/as-built/validator loop already exists here, and the docs suite checks more than a spec CLI does
- [PDF viewer consolidation](/docs/architecture/rejected/pdf-viewer-consolidation) — the full viewer's product is search, virtual scrolling and ARIA, which the stop list refuses twice over
- [Monorepo task runners](/docs/architecture/rejected/monorepo-task-runners) — Turborepo-style per-package cache keys, for a package build measured in seconds and a third content-hash cache beside two that already exist
- [Nuxt build cache](/docs/architecture/rejected/nuxt-build-cache) — `experimental.buildCache` invalidates on the same commits the app build's content-hash marker already does, and trades that marker's key for one that cannot say when it is wrong
- [TypeScript build info cache](/docs/architecture/rejected/typescript-build-info-cache) — the only version that saves anything rests on the compiler's own invalidation rather than a hash of its inputs
