# Store mutations and subscribable watch sources

Read when a component mutates messaging state (and whether that belongs in a store at all), or when a composable sets up subscriptions from a reactive list or resumes one after an `await`.

## Subscriptions are the source of truth

Subscriptions deliver a write's state change to **every** client, the caller included, so a store function never repeats what the subscription will do. The caller runs the write through its own `useMutation`, and a store action exists only for what a subscription cannot do — whether one is earned is the `pinia` skill's (`references/mutation-actions.md`). The message send is the one optimistic flow outside `useMutation`, and why is `apps/web/content/docs/architecture/client-data.md` ("When not to use them").

## Stable watch sources for `useOnlineSubscribable`

When subscriptions only need to react to **membership changes** (rooms added/removed), watch a stable primitive instead of the full reactive array. A `toSorted()` array produces a new reference on every `updatedAt` change, causing needless subscription teardown/rebuild on every incoming message.

```ts
// WRONG — re-subscribes on every updatedAt bump (every incoming message)
useOnlineSubscribable(directMessages, (newDirectMessages) => { ... });

// CORRECT — stable string via getIdsKey; only changes when the set of IDs changes
useOnlineSubscribable(
  () => getIdsKey(directMessages.value),
  (roomIdsString) => {
    if (!roomIdsString) return undefined;
    const roomIds = roomIdsString.split(",");
    // set up subscriptions…
  },
);
```

- **`getIdsKey(items)`** (`app/services/message/subscribables/getIdsKey.ts`) is the canonical order-insensitive membership key (`map(id).toSorted().join(",")`) — never hand-roll it.
- A plain getter `() => expr` is equivalent to `computed(() => expr)` as a watch source and is preferred — no extra ref allocation.
- **`getOnlineSubscribableContext()`** (`app/composables/shared/getOnlineSubscribableContext.ts`) captures `getCurrentInstance()`/`getCurrentScope()` for async subscribable composables — call it into a `const` BEFORE any `await` (context is lost after suspension); never inline the two calls.
- **`requirePartitionKey(value, name)`** (`app/services/message/requirePartitionKey.ts`) is the guard for room-scoped reads needing a non-empty current room id (or user id): `const roomId = requirePartitionKey(currentRoomId.value, readMessages.name);` — never hand-write the `InvalidOperationError` throw.
