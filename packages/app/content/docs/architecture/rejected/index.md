---
title: Rejected
description: Repo-wide standards and third-party tools we decided against — one page per idea, with the rationale.
---

# Architecture rejected ideas

One page per rejected idea (won't do) — a cross-cutting standard, an enforcer, or a third-party tool we chose not to
adopt. Check here before proposing one; never re-argue a decided idea.

- [Migration chain guard](/docs/architecture/rejected/migration-chain-guard) — `db:gen` is the only producer of a snapshot, so a linearity test only catches an already-banned hand-edit
- [Spec frameworks](/docs/architecture/rejected/spec-frameworks) — the proposal/as-built/validator loop already exists here, and the docs suite checks more than a spec CLI does
