# Store mutations and subscribable watch sources

Read when a component mutates messaging state (and whether that belongs in a store at all), or when a composable sets up subscriptions from a reactive list or resumes one after an `await`.

## Subscriptions are the source of truth

Subscriptions handle state updates for **all** clients including the caller. Don't duplicate subscription work in a store wrapper.

**Default**: call `$trpc` directly from the component/composable. Add a store function only when it does something subscriptions cannot:

1. Genuine optimistic update (local state before the server responds)
2. Navigation or side effects not covered by any subscription
3. Combines multiple mutations or concerns

```ts
// call tRPC directly where the user action happens; the onLeaveRoom subscription owns state. Awaited, never a
// floating statement — see the pinia skill's references/mutation-actions.md
await $trpc.room.directMessage.deleteDirectMessageParticipant.mutate({ roomId, userId });
```

### Genuine optimistic update — `createMessage` is the canonical example

- Create a reactive entity locally with `isLoading: true` **before** the tRPC call so it renders immediately
- After the call, `Object.assign` the server response onto the same reactive object (same reference, no re-render flicker)
- Delete the `isLoading` flag — the subscription receives the real event but the message is already in the list; dedup by composite key

```ts
const createMessage = async (input: StandardCreateMessageInput) => {
  const newMessage = reactive(createMessageEntity({ ...input, isLoading: true, userId: session.data.user.id }));
  await storeCreateMessage(newMessage); // renders immediately with loading state
  Object.assign(newMessage, await $trpc.message.createMessage.mutate(input)); // server response fills real data in-place
  delete newMessage.isLoading;
};
```

Use it only when the delay would be visibly jarring (message send). For participant join/leave, hide/delete DM, etc. a subscription round-trip is imperceptible and the simplicity is worth it.

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
- **`getOnlineSubscribableContext()`** (in `useOnlineSubscribable.ts`) captures `getCurrentInstance()`/`getCurrentScope()` for async subscribable composables — call it into a `const` BEFORE any `await` (context is lost after suspension); never inline the two calls.
- **`requirePartitionKey(value, name)`** (`app/services/message/requirePartitionKey.ts`) is the guard for room-scoped reads needing a non-empty current room id (or user id): `const roomId = requirePartitionKey(currentRoomId.value, readMessages.name);` — never hand-write the `InvalidOperationError` throw.
