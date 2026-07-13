---
title: Resource layer useMutation sweep
description: Proposal — route the platform resource CRUD map and editor save flows through useMutation.
---

# Resource Layer useMutation Sweep

The [client data access](/docs/architecture/client-data) standard covers every user-facing tRPC mutation, but the platform resource layer still calls `$trpc` raw: the per-type CRUD map in `useResource` (`deleteResource`/`publishResource`/`saveResourceContent`/`unpublishResource`/`updateResource` across dashboard/email/file/flowchart/survey/todoList/webpage) and the editor save flows built on it (`useSave`, `useSurveyCreator`, upload helpers).

Deferred from the esbabbler mutation sweep because it overlaps the open portal-parity branch — sweep it once that merges.

## Shape

- The CRUD map entries stay raw thunks — the **callers** (`useResource.save`/`rename`/`remove`, capability actions) wrap them in `useMutation`, one instance per logical action.
- `saveResourceContent` keeps its optimistic-concurrency `contentVersion` handling; a stale-version rejection surfaces through the standard error alert.
- `useSave` dirty-check semantics are unchanged — `useMutation` wraps the network call, not the snapshot bookkeeping.

## Key files

| File                                                      | Role                                   |
| :-------------------------------------------------------- | :------------------------------------- |
| `packages/app/app/composables/resource/useResource.ts`    | per-type CRUD map + save/rename/remove |
| `packages/app/app/composables/shared/useSave.ts`          | dirty-check save wrapper               |
| `packages/app/app/composables/survey/useSurveyCreator.ts` | survey editor save flow                |
