---
name: backfills
description: Apply when a change to a persisted shape — a content blob's schema, a save blob's, an item entity's — would make data already stored fail to parse, or when stored data turns out not to match the schema that reads it. Esposter's backfill — the session's own job, run unasked as a throwaway scratchpad script that rewrites the stored documents in place.
---

# Backfills

A schema change that stored data no longer satisfies is finished only when the stored data satisfies it. The latest-shape-only standard (`openspec/specs/architecture/persisted-data-latest-shape-only/design.md`) keeps every read path to one shape, so the data is brought to that shape once, from outside the app, rather than tolerated inside it.

## Settled — do not re-propose

- **A read-side transform, a union of old and new shapes, or a `.default()` papering over a missing field.** The backfill is the migration; the schema describes only what the code writes today.
- **Leaving the stored data broken** because the standard "accepts" a reset. A user's content and saves are theirs; the reset is for state nothing can repair.
- **Holding the backfill, or the schema, for compatibility with the code still deployed.** Prod is backfilled as soon as dev is, and the old code reads the new shape badly until the change ships — an accepted tradeoff for code that only ever describes one clean shape, never a reason for a transitional schema or a two-phase rollout.
- **Asking first.** The backfill is part of the change that needs it. The session runs it on dev and on prod itself, with no approval step.
- **Committing the backfill.** It is a scratchpad script, never a file in the repo, a Nitro plugin or a migration — so the tree carries no trace of it, and no dead code to delete later.

## When one is owed

- A field goes from nullable to optional, or from optional to required, in a schema that parses stored JSON.
- A field is renamed, re-typed or moved in such a schema.
- Stored data is found failing its schema for any reason.

A field _removed_ from a plain `z.object` schema is not one: Zod's object parse drops the stale key, so the old documents still read. A `z.strictObject` rejects that key, so its removal is one like any other.

## Where persisted JSON lives

Which blob holds a schema's stored data, and the writer that keeps it, is `references/persisted-stores.md`.

## The run

A backfill is a scratchpad script run dry then for real on dev, then prod straight after, re-run until it reports nothing, then deleted — `references/the-run.md`.

## Reference pages

- `references/persisted-stores.md` — when locating which store, blob and writer hold a persisted document a schema change touches.
- `references/the-run.md` — when running a backfill: the script, the dry run, the dev-then-prod order and the re-run.
