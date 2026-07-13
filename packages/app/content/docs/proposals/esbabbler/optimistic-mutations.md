---
title: Optimistic mutations sweep
description: Proposal — route every user-facing tRPC mutation through the unified useMutation primitive.
---

# Optimistic Mutations Sweep

Route **every user-facing tRPC mutation** through [`useMutation`](/docs/architecture/client-data): apply the change to the store immediately, run the mutation in the background, roll back + surface the error on failure. No control ever waits on a server round-trip.

## Scope

**Today:** `useMutation` is the single primitive for mutations. Optimistic settings mutations (notification preference, room overview, nickname), `updateUserSettings`, hand-raise, category drag-reorder, and the (non-optimistic) invite link all go through it — and the sweep below has migrated the remaining user-facing esbabbler mutation call sites.

## How it works

See the [client data access](/docs/architecture/client-data) standard for the primitive itself. Per call site: identify the store mutation that the subscription would eventually apply, run it inside `applyOptimistic` (returning the rollback closure), and fire the tRPC mutation as the `mutate` argument. Subscriptions stay the confirming source of truth — the optimistic write is provisional, the echo idempotently re-applies the same state (create/update store operations already guard duplicates).

Sweep order (by user-perceived latency):

- [x] Message actions — reactions, pin/unpin, mark-unread, delete
- [x] Room membership — hide DM, leave room (plus create/join/delete room and create DM, non-optimistic via `onSuccess`)
- [x] Roles/permissions editors (create/update/delete/assign/revoke role)
- [x] Word filter + webhook CRUD
- [x] Friends — send/accept/decline/remove/block/unblock (mutations moved into the friend/friendRequest/block stores)
- [x] Long tail — room categories, bans, admin actions, status, search history, scheduled jobs, forward/edit message, DM participants, link previews, message files, posts/comments/likes, survey responses

Still outside `useMutation` by design: the message send path (bespoke optimistic `isLoading` placeholder + hooks in `store/message/data.ts`), and the sanctioned exceptions in [client data access](/docs/architecture/client-data). The platform resource layer (`useResource` CRUD map + editor save flows) is deferred to its own sweep — it overlaps the portal-parity branch.

Non-optimistic sites still use `useMutation` (for staleness + error surfacing) but omit `applyOptimistic` and take the server result via `onSuccess`: mutations whose result the client can't predict (server-generated ids/tokens like `createInvite`, `createRoom` navigation targets, file uploads with SAS URLs). Device-coupled call operations (`setCameraEnabled`, `setMuteEnabled`) stay hand-rolled because they compose a local LiveKit step with the remote sync in one flow.

## Key files

| File                                                 | Role                            |
| :--------------------------------------------------- | :------------------------------ |
| `packages/app/app/composables/shared/useMutation.ts` | the shared primitive            |
| `packages/app/app/store/message/**`                  | store mutations reused per site |
