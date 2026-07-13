---
title: Client data access
description: useQuery and useMutation are the two primitives for every user-facing tRPC read and write — non-blocking fetch, optimistic apply, staleness guarding, and error surfacing in one place.
---

# Client Data Access

Every user-facing tRPC call on the client goes through one of two symmetric primitives, both in `packages/app/app/composables/shared/`:

- **`useQuery`** — reads. Fetches without blocking setup, populates reactive data, surfaces errors.
- **`useMutation`** — writes. Applies optimistically, rolls back on failure, surfaces errors.

Both share the same error stack (`getResultAsync` → `createAlert`) and the same staleness primitive (`getConcurrentFunction`), so no call site re-implements loading, error handling, or race protection.

## useQuery

`useQuery` (`composables/shared/useQuery.ts`) replaces top-level `await $trpc.x.query(...)` in component setup. A top-level await forces the component under a `<Suspense>` boundary and throws on failure; `useQuery` fetches in the background instead, so the component renders immediately and populates when data lands — no `Suspense`, no `NuxtErrorBoundary`.

```ts
const { data, refresh } = useQuery(() => $trpc.room.readMyInvite.query({ roomId }), {
  onSuccess: (result) => {
    // rare: derive local state from the loaded result
  },
});
```

- `query` — the tRPC read. The only required argument.
- `data` — a `shallowRef` holding the result, `undefined` until the first fetch resolves. Render loading/empty state off `data.value === undefined`.
- `refresh` — re-runs the query (retry after a failure, or refetch on demand). The initial fetch fires automatically on setup.
- `onSuccess` — rare; for seeding local state from the loaded result.

On failure the real `Error.message` is raised as an alert and `data` stays `undefined`, so the component falls back to its empty state. A superseded fetch (a newer `refresh`, a remounted component) can never overwrite a newer result.

## useMutation

`useMutation` (`composables/shared/useMutation.ts`) bundles the three things every write needs:

- **Optimistic apply + rollback** — write the change to the store immediately, roll it back if the server rejects it.
- **Staleness guarding** — when the same action fires repeatedly (rapid clicks, drags, select changes), a slower earlier call can never overwrite a newer call's state.
- **Error surfacing** — a failed mutation raises the actual error message as an alert; no call site writes `try`/`catch` or bespoke alert strings.

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

## When not to use them

Both primitives alert on failure. Two neighbouring patterns stay on the lower-level `getConcurrentFunction` (`packages/app/shared/util/function/getConcurrentFunction.ts`), which provides staleness guarding alone:

- **Paginated / event-driven reads** (e.g. `useReadMessages`, `useDataset`) — own their own cursor/error state and surface failure inline rather than as an alert; they are not one-shot setup fetches, so `useQuery` doesn't fit.
- **Local-only concurrency** (e.g. LiveKit virtual-background switching) — no server call, nothing to alert.
- **Search-as-you-type reads** go through `useAutoSearch` (see [Search](/docs/architecture/search)) — it shares the `getResultAsync` → `createAlert` error stack but replaces `getConcurrentFunction` with an `AbortController`, cancelling the superseded request instead of merely ignoring its result.
- **Background bookkeeping writes** (mark-read + mention-count clear on room enter, typing pings, push-subscription registration) — the user didn't act, so surfacing a failure as an alert would be noise; they stay raw fire-and-forget calls.
- **Composed SAS-upload flows** (generate upload URL → `uploadBlocks` → assign public URL) — the mutation is one step of a multi-step flow whose error/loading handling belongs to the composing function, like the device-coupled call operations.
- **The message send path** (`createMessage` in `store/message/data.ts`) — a bespoke optimistic flow (reactive `isLoading` placeholder + `MessageHookMap` hooks) that predates and exceeds what `applyOptimistic` models.

Device-coupled call operations that compose a local LiveKit step with a remote sync in one flow (`setCameraEnabled`, `setMuteEnabled`) stay hand-rolled — their error handling belongs to the composing `toggle*` action, not to a single mutation.
