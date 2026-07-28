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

This governs app-code-owned persisted state: client-authoritative blobs and localStorage state. Relational data in Postgres migrates through real Drizzle migrations (`pnpm db:gen`) — that is schema evolution of a server-owned store, not a legacy-shape read path, and is unaffected by this rule.

Azure Table entities follow the rule too, despite being server-owned: Table Storage is schemaless, so adding a field to an entity class silently reads back as that class's default for every row written before it existed. No backfill job runs, and no read path re-derives the field from its siblings. **A field added to an entity is a fact about rows written from now on** — a new `hasThumbnail = false` means every pre-change attachment reports "no thumbnail" and renders its original, and that is the accepted outcome, not a defect to compensate for. Where the pre-change population genuinely matters, the fix is a one-off backfill script committed with the change, never a read-side inference that guesses the missing fact.

User resource content (`content.json` blobs) sits between the two. The blob is the **user's** data, so a resource must be self-contained — a duplicate clones every asset its content references, working-copy and published alike ([resource file assets](/docs/platform/resource-file-assets)) — and never resets to a fresh default. But the content schema itself is app-owned, so reads still parse latest-shape-only: when app code changes a content schema, a draft written before the change failing to read (editor, duplicate, publish) is accepted, not migrated.
