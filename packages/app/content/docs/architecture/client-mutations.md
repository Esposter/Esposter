---
title: Client mutations
description: useMutation is the single primitive for every user-facing tRPC mutation — optimistic apply, staleness guarding, and error surfacing in one place.
---

# Client Mutations

Every user-facing tRPC mutation on the client goes through one primitive, `useMutation` (`packages/app/app/composables/shared/useMutation.ts`). It bundles the three things every mutation needs so no call site re-implements them:

- **Optimistic apply + rollback** — write the change to the store immediately, roll it back if the server rejects it.
- **Staleness guarding** — when the same action fires repeatedly (rapid clicks, drags, select changes), a slower earlier call can never overwrite a newer call's state.
- **Error surfacing** — a failed mutation raises the actual error message as an alert; no call site writes `try`/`catch` or bespoke alert strings.

## The shape

```ts
const executeMutation = useMutation();

await executeMutation(mutate, {
  applyOptimistic: () => {
    // write the change to the store now
    return () => {
      // rollback closure — undo the write
    };
  },
  onSuccess: (result) => {
    // rare: write a server-authoritative result
  },
});
```

- `mutate` — the tRPC call. The only required argument.
- `applyOptimistic` — the normal path. Apply the local change and return its rollback closure. On failure the rollback runs (unless a newer call has superseded this one); the confirming server state still arrives via subscriptions, which idempotently re-apply the same value.
- `onSuccess` — the rare path, for mutations whose result the client can't predict (server-generated ids/tokens like `createInvite`). Omit `applyOptimistic` and take the server result here; it is written only if this call is still the latest.

Both `applyOptimistic` and `onSuccess` are staleness-guarded so a superseded call leaves the newer state intact. The error alert always fires with the real `Error.message`.

Call `useMutation()` once per logical action (each instance owns its own staleness counter); reach for a second instance when a store drives two independent mutations.

## When not to use it

`useMutation` is for mutations that alert on failure. Two neighbouring patterns stay on the lower-level `getConcurrentFunction` (`packages/app/shared/util/function/getConcurrentFunction.ts`), which provides staleness guarding alone:

- **Reads** (e.g. `useDataset`) — a stale response must not overwrite a newer one, but failure sets an inline error ref rather than an alert.
- **Local-only concurrency** (e.g. LiveKit virtual-background switching) — no server call, nothing to alert.

Device-coupled call operations that compose a local LiveKit step with a remote sync in one flow (`setCameraEnabled`, `setMuteEnabled`) stay hand-rolled — their error handling belongs to the composing `toggle*` action, not to a single mutation.
