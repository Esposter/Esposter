---
title: Persisted data — latest shape only
description: No legacy-shape schemas, migration arms, or backwards-compat defaulting — every read path assumes the latest, cleanest shape.
---

# Persisted Data — Latest Shape Only

Schemas, constructors, and read paths for persisted data (save blobs, localStorage state, any client-authoritative payload) always model **only the latest, cleanest shape**. No legacy union arms, no `.default()`s papering over fields older data lacks, no constructor code migrating old layouts, no per-element tolerance filters that let stale data limp through.

## The rule

- One schema per entity, describing exactly what the code writes today.
- Data that fails to parse resets to a fresh default (`toClicker` falls back to `new Clicker()`, a dungeons blob that fails `dungeonsSchema` starts a new game). The reset **is** the migration.
- When a shape changes, change the schema and delete the old shape in the same commit — never ship a union of old + new or a read-side transform.

## Why

Migration code is permanent cost for a temporary population: it doubles the schema surface, needs its own tests, and rots the moment the next shape change lands on top of it. For casual client-authoritative state (game saves, drafts, UI state), losing pre-change data is an acceptable trade for a codebase that only ever describes one shape.

## Scope

This governs client-authoritative blobs and localStorage state. Relational data in Postgres migrates through real Drizzle migrations (`pnpm db:gen`) — that is schema evolution of a server-owned store, not a legacy-shape read path, and is unaffected by this rule.
