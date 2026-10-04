---
name: backfills
description: Apply when a change to a persisted shape — a content blob's schema, a save blob's, an item entity's — would make data already stored fail to parse, or when stored data turns out not to match the schema that reads it. Esposter's backfill — run unasked, the session's own job, by a throwaway script in the scratchpad that rewrites the stored documents in place; dry run, then dev, then prod straight after, whether or not the new code has deployed yet; nothing of it committed.
---

# Backfills

A schema change that stored data no longer satisfies is finished only when the stored data satisfies it. The latest-shape-only standard (`apps/web/content/docs/architecture/persisted-data-latest-shape-only.md`) keeps every read path to one shape, so the data is brought to that shape once, from outside the app, rather than tolerated inside it.

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

A field _removed_ from a schema is not one: Zod's object parse drops the stale key, so the old documents still read.

## Where persisted JSON lives

| Store                               | Blobs                                                                                                      | Written by                     |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `resource-assets`                   | `{resourceId}/content.json` — every resource's working copy, a Blueprint's captured entries inside its own | `saveResourceContent`          |
| `clicker-assets`, `dungeons-assets` | `{userId}/save.json`                                                                                       | `createSaveBlobStateProcedure` |
| `resource-assets`                   | `{resourceId}/objects/{hash}` — version snapshots, content-addressed keyframes and deltas                  | `writeSnapshotVersion`         |

Every JSON blob is one zstd frame (`writeJsonBlob`): level `JSON_BLOB_COMPRESSION_LEVEL`, window `MAX_CONTENT_ENCODING_WINDOW_LOG`, served as `Content-Encoding: zstd`. A rewrite keeps all three.

Snapshot objects are not rewritten. They are named by their hash and listed in Postgres (`resourceVersions`), prod's database is not reachable from a session, and a version is restored through the save path, which parses it — so a snapshot older than the change no longer restores until it expires (the revision retention, `apps/web/content/docs/resource/resource-snapshots.md`), the same accepted tradeoff as the deploy window the run's prod step accepts. A published version of a publishable type is the exception worth a look: if the change reaches a publishable type's content, its published pages read that snapshot, and the change is raised with the user before it ships.

Rewriting a working copy leaves `resources.contentHash` and `contentSize` stale until the next save. That is safe: a delta save against the stale hash is refused with CONFLICT and the client retries it as a full save.

## The run

1. **Write the script in the scratchpad**, resolving `@azure/storage-blob` from a workspace package with `createRequire`. It walks each store, decodes each document, removes or reshapes the slots by the _shape of the object holding them_ (the keys that identify an item, a todo, a program) — never by key name alone, since a sheet cell can be named anything — and re-encodes only the documents it changed.
2. **Upload with `ifMatch` on the listed etag**, so a user's save landing mid-run wins and the document is simply retried on the next run.
3. **Get the connection string from the Azure CLI** — `az storage account show-connection-string -n <account> -g <group>`; the accounts are `devstesposter001` and `prodstesposter001`.
4. **Dry run, then write, on dev.** The dry run prints each document and slot count; the write run follows.
5. **Prod straight after dev, without waiting for the deploy.** The code still serving prod reads the old shape, so a rewritten document fails there until the change deploys; that window is accepted; holding the backfill for a deploy the session cannot see is not.
6. **Re-run until it reports nothing to change**, so a document skipped by a conflicting save is caught.
7. **Delete the script.** Report the counts per store.
