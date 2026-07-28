---
title: Publish history
description: A blade listing every published snapshot of a resource, with per-version view and restore-to-draft.
---

# Publish history

Every publishable resource gets a **Publish history** blade: a table of every `{id}/published/{n}` snapshot with when it was published, a command to open any version's public render, and a command to restore an old version's content into the current draft. It is the first capability-conditional built-in blade — it appears only for [publishable](/docs/architecture/publishing) resource types.

## How it works

Publishing already writes an immutable snapshot to `{id}/published/{publishVersion}` and bumps `publishVersion` on the `resource_publications` row ([publishing](/docs/architecture/publishing)). Prior snapshots are never deleted on re-publish — only unpublish (which clears the whole `{id}/published` subtree) and delete remove them — so the retained blobs are already a complete history, and the blade needs no extra table.

```mermaid
flowchart LR
  PUB["publishResource (n++)"] -->|"writes snapshot"| BLOB[("Blob {id}/published/{n}")]
  BLADE["Publish history blade"] -->|"resource.readPublishHistory"| LIST["versions table<br/>(blob prefix listing)"]
  LIST -->|"View v{k}"| VIEW["/view/[type]/[id]?version=k<br/>(owner-only)"]
  LIST -->|"Restore v{k}"| RESTORE["resource.restorePublishedVersion"]
  RESTORE -->|"copies snapshot into working copy (contentVersion++)"| DRAFT["draft content"]
```

- **List** — `resource.readPublishHistory` enumerates the `{id}/published/{n}.json` blobs under the `{id}/published/` prefix as a hierarchy listing, so the per-publish asset subdirectories beside them are skipped. Each row carries the version number, the snapshot timestamp from the blob `lastModified`, and a "current" badge on the version the `resource_publications` row names as live. The badge is never derived from the listing: unpublish drops the row and sweeps the prefix through a best-effort event, so a republish moments later restarts numbering at 1 while snapshots 1..n are still on disk — "highest version wins" would then badge a retired snapshot as live while the public route served the new version 1. No row means nothing is published, so nothing is current.
- **View a version** — the public view route gains an optional `version` query param. When it is present the renderer loads `{id}/published/{k}` through an owner-only read; the snapshot's stable asset urls resolve through `/api/resource-assets` without any content rewriting. Which of that endpoint's two published-asset paths answers depends on the resource, not on the version being viewed: while a publication row exists every `{id}/published/…` asset is served anonymously, retained snapshots included, and only once the resource is unpublished does the owner fallback carry them — and then only for a direct request, since the sandboxed `srcdoc` iframe a published view renders in sends no cookies. Anonymous visitors never pass the param and always get the latest publish, so public behaviour is unchanged, and a non-owner passing one is rejected server-side.
- **Restore** — `resource.restorePublishedVersion` copies the snapshot's content into the working copy and bumps `contentVersion` in one transaction, then lands the owner in the Editor blade. It never re-points the publication — a restore produces a draft to review and re-publish, mirroring the [recycle bin](/docs/platform/recycle-bin) restore-returns-a-Draft rule.
- The snapshot's **assets are cloned back into the working copy**, not referenced where they sit (`cloneContentAssets(content, id)` — the same call the duplicate path makes). A snapshot embeds `{id}/published/{publishId}/…` urls, and unpublish wipes that whole prefix ([blob lifecycle](/docs/architecture/blob-lifecycle)): restoring the blob verbatim would hand the draft urls a later unpublish deletes, and re-publishing that draft would ship the same dead urls with re-uploading every asset as the only recovery.

Retention stays "keep everything" — there is no prune step. A prune command would be a separate decision.

## Procedures

| Procedure                            | Auth                | Input             | Purpose                                            |
| ------------------------------------ | ------------------- | ----------------- | -------------------------------------------------- |
| `resource.readPublishHistory`        | `getOwnerProcedure` | `{ id }`          | list snapshot versions from a blob prefix listing  |
| `resource.restorePublishedVersion`   | `getOwnerProcedure` | `{ id, version }` | copy a snapshot's content into the working copy    |
| `{type}.readPublishedVersionContent` | `getOwnerProcedure` | `{ id, version }` | owner-only read of one snapshot for the view route |

## Key files

| File                                                         | Role                                               |
| ------------------------------------------------------------ | -------------------------------------------------- |
| `app/components/Resource/PublishHistory/Index.vue`           | blade — versions table with View and Restore       |
| `app/components/Resource/PublishHistory/RestoreDialog.vue`   | restore confirmation dialog                        |
| `server/services/resource/readPublishHistory.ts`             | blob prefix enumeration into version rows          |
| `server/trpc/routers/resource.ts`                            | `readPublishHistory` and `restorePublishedVersion` |
| `server/trpc/procedure/resource/createResourceProcedures.ts` | `readPublishedVersionContent` (publishable types)  |
| `app/pages/view/[type]/[id].vue`                             | owner-only `version` query param                   |

## Notes

- The blade is registered as `ResourceBladeType.PublishHistory` and rendered only for `PublishableResourceType`, so `BladeNav` gates it with the same `hasCapability(type, "publishable")` check the command bar uses for its Publish command.
- After an unpublish the version numbering restarts at 1, because unpublish deletes the publication row and publishes the snapshot prefix for deletion. That sweep is best-effort and asynchronous, so a republish can land while the old snapshots are still present — which is exactly why the live version is read from the publication row rather than inferred from which snapshots exist.
