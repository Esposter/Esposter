---
title: Optimistic mutations sweep
description: Proposal — make every user-facing tRPC mutation optimistic via useOptimisticMutation.
---

# Optimistic Mutations Sweep

Extend the settings pattern to **every user-facing tRPC mutation**: apply the change to the store immediately, run the mutation in the background, roll back + alert on failure. No control ever waits on a server round-trip.

## Scope

**Today:** settings mutations are optimistic (`useOptimisticMutation` — notification preference, room overview, nickname; `updateUserSettings` inline with staleness checks; `setHandRaisedEnabled` hand-rolls the same shape). Most other mutations still `await` the server before the store updates or rely solely on the subscription echo.

**This adds:** a sweep over the remaining mutation call sites, migrating each to `useOptimisticMutation` (or documenting why it can't be — see exclusions).

## How it works

Per call site: identify the store mutation that the subscription would eventually apply, run it inside `applyOptimistic` (returning the rollback closure), and fire the tRPC mutation as the background `mutate`. Subscriptions stay the confirming source of truth — the optimistic write is provisional, the echo idempotently re-applies the same state (create/update store operations already guard duplicates).

Sweep order (by user-perceived latency):

- [ ] Message actions — reactions, pin/unpin, mark-unread, delete
- [ ] Room membership — hide DM, leave room, category drag-reorder
- [ ] Roles/permissions editors (Roles tab save)
- [ ] Word filter + webhook CRUD
- [ ] Friends — send/accept/decline/block

Exclusions (must stay pessimistic): mutations whose result the client can't predict (server-generated ids/tokens like `createInvite`, `createRoom` navigation targets, file uploads with SAS URLs), and anything gated on server-side validation whose failure is common rather than exceptional.

## Key files

| File                                                           | Role                            |
| :------------------------------------------------------------- | :------------------------------ |
| `packages/app/app/composables/shared/useOptimisticMutation.ts` | the shared primitive            |
| `packages/app/app/store/message/**`                            | store mutations reused per site |
