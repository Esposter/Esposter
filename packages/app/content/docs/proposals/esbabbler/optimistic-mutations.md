---
title: Optimistic mutations sweep
description: Proposal — route every user-facing tRPC mutation through the unified useMutation primitive.
---

# Optimistic Mutations Sweep

Route **every user-facing tRPC mutation** through [`useMutation`](/docs/architecture/client-data): apply the change to the store immediately, run the mutation in the background, roll back + surface the error on failure. No control ever waits on a server round-trip.

## Scope

**Today:** `useMutation` is the single primitive for mutations. Optimistic settings mutations (notification preference, room overview, nickname), `updateUserSettings`, hand-raise, category drag-reorder, and the (non-optimistic) invite link all go through it. Most other mutations still `await` the server before the store updates or rely solely on the subscription echo.

**This adds:** a sweep over the remaining mutation call sites, migrating each to `useMutation`.

## How it works

See the [client data access](/docs/architecture/client-data) standard for the primitive itself. Per call site: identify the store mutation that the subscription would eventually apply, run it inside `applyOptimistic` (returning the rollback closure), and fire the tRPC mutation as the `mutate` argument. Subscriptions stay the confirming source of truth — the optimistic write is provisional, the echo idempotently re-applies the same state (create/update store operations already guard duplicates).

Sweep order (by user-perceived latency):

- [ ] Message actions — reactions, pin/unpin, mark-unread, delete
- [ ] Room membership — hide DM, leave room
- [ ] Roles/permissions editors (Roles tab save)
- [ ] Word filter + webhook CRUD
- [ ] Friends — send/accept/decline/block

Non-optimistic sites still use `useMutation` (for staleness + error surfacing) but omit `applyOptimistic` and take the server result via `onSuccess`: mutations whose result the client can't predict (server-generated ids/tokens like `createInvite`, `createRoom` navigation targets, file uploads with SAS URLs). Device-coupled call operations (`setCameraEnabled`, `setMuteEnabled`) stay hand-rolled because they compose a local LiveKit step with the remote sync in one flow.

## Key files

| File                                                 | Role                            |
| :--------------------------------------------------- | :------------------------------ |
| `packages/app/app/composables/shared/useMutation.ts` | the shared primitive            |
| `packages/app/app/store/message/**`                  | store mutations reused per site |
