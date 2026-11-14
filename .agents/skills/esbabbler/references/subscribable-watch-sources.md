# Subscribable watch sources

Read when a composable sets up live updates from a reactive list, or sets them up after an `await`.

When live updates only need to react to the reader moving to another room, watch the room id, which changes only then. A `toSorted()` array produces a new reference on every `updatedAt` change, causing needless teardown and rebuild on every incoming message.

```ts
// WRONG — re-registers on every updatedAt bump (every incoming message)
useOnlineSubscribable(directMessages, (newDirectMessages) => { ... });

// CORRECT — the room id changes only when the reader moves to another room
useOnlineSubscribable(currentRoomId, (roomId) => {
  if (!roomId) return undefined;
  // open the socket or read the room's list…
});
```

The room list is not a subscription input any more: the person's own socket carries every room-list event, so no id list is watched.

- Room and user events do not need a source at all: `use*Events` composables register their handlers with `onRoomEvent` or `onUserEvent` and dispose each one with its scope (`composables/message/events/`).
- A plain getter `() => expr` is equivalent to `computed(() => expr)` as a watch source and is preferred — no extra ref allocation.
- **`getOnlineSubscribableContext()`** (`apps/web/app/composables/shared/getOnlineSubscribableContext.ts`) captures `getCurrentInstance()`/`getCurrentScope()` for async subscribable composables — call it into a `const` BEFORE any `await` (context is lost after suspension); never inline the two calls.
- **`requirePartitionKey(value, name)`** (`apps/web/app/services/message/requirePartitionKey.ts`) is the guard for room-scoped reads needing a non-empty current room id (or user id): `const roomId = requirePartitionKey(currentRoomId.value, readMessages.name);` — never hand-write the `InvalidOperationError` throw.
