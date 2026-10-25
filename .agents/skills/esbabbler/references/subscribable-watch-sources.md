# Subscribable watch sources

Read when a composable sets up subscriptions from a reactive list, or resumes one after an `await`.

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

- **`getIdsKey(items)`** (`apps/web/app/services/message/subscribables/getIdsKey.ts`) is the canonical order-insensitive membership key (`map(id).toSorted().join(",")`) — never hand-roll it.
- A plain getter `() => expr` is equivalent to `computed(() => expr)` as a watch source and is preferred — no extra ref allocation.
- **`getOnlineSubscribableContext()`** (`apps/web/app/composables/shared/getOnlineSubscribableContext.ts`) captures `getCurrentInstance()`/`getCurrentScope()` for async subscribable composables — call it into a `const` BEFORE any `await` (context is lost after suspension); never inline the two calls.
- **`requirePartitionKey(value, name)`** (`apps/web/app/services/message/requirePartitionKey.ts`) is the guard for room-scoped reads needing a non-empty current room id (or user id): `const roomId = requirePartitionKey(currentRoomId.value, readMessages.name);` — never hand-write the `InvalidOperationError` throw.
