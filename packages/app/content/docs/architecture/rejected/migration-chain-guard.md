---
title: Migration chain guard
description: Rejected — a test asserting the Drizzle migration snapshots form one linear chain.
---

# Migration chain guard

A test globbing every `snapshot.json` under the migrations folder and asserting the `id`/`prevIds` lineage is unique, linear, ordered by folder timestamp, and free of orphans — so a forked chain fails CI instead of the next `pnpm db:gen`.

## Why not

The invariant is already guaranteed by the process that produces it: `db:gen` is the only sanctioned way to write a snapshot, and it derives `prevIds` from the existing chain. A guard would therefore only ever fire on a hand-cloned or hand-edited snapshot — something the agent guide and the `drizzle` skill already ban outright, and which no correct workflow produces. Testing that a banned action was not taken is enforcement theatre: it adds a suite to maintain for a failure mode that only exists when someone deliberately ignores the one documented rule, and even then `db:gen` itself reports the fork with a clearer message.

The migration SQL is deliberately hand-editable before it applies, so the surface worth guarding is the applied-migration hash, which drizzle-orm's migrator already checks at startup.
