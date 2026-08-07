---
title: Rejected
description: Repo-wide standards we decided against — one page per idea, with the rationale.
---

# Architecture rejected ideas

One page per rejected idea (won't do). Check here before proposing a cross-cutting standard or enforcer — never re-argue a decided idea.

- [Migration chain guard](/docs/architecture/rejected/migration-chain-guard) — `db:gen` is the only producer of a snapshot, so a linearity test only catches an already-banned hand-edit
