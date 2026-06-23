---
name: esbabbler
description: Esposter messaging feature (esbabbler) conventions — Discord parity rule, display name/nickname resolution, push notification titles, store-mutation pattern (subscriptions as source of truth), online-subscribable watch sources, and scheduled-message jobs. Apply when working on the messaging module (packages/app/app/…/message/, server/trpc/routers/message/, userToRoom, roles, members, rooms). Calls/voice internals live in the esbabbler-call skill.
---

# Esbabbler (Messaging) Feature Conventions

## Discord Parity (Default Design Rule)

Esbabbler is a Discord clone. When a behaviour, structure, naming, information architecture, default, or feature semantic is undecided, **default to whatever Discord does** instead of inventing our own — bespoke decisions should be near zero.

- **Match:** feature behaviour, settings layout/categories, naming (Discord's term wins — e.g. "Roles", "Voice & Video"), defaults (e.g. push-to-talk off), scope (user vs server/room setting), keybinds, and copy.
- **Diverge only on:** visual styling (Vuetify-defined — not ours to match pixel-for-pixel) and the explicit infra/storage constraints already recorded (Postgres + Azure Table split, no expensive infrastructure).
- **When Discord's behaviour is unknown or ambiguous:** record it as an open question in the spec/roadmap — do not silently invent. A guess that diverges from Discord is a defect, not a design choice.
- A feature Discord has but we deliberately dropped lives in `features/esbabbler/out-of-scope/` or `deferred/` with rationale — grep there before re-proposing.

## Display Name Resolution

All member name display goes through `getDisplayName(user, roomId)` from `useUserToRoomStore`. Never read `user.name` / `member.name` directly in a room context.

```ts
// respects room nickname, falls back to global name — never bare member.name
<StyledAvatar :name="getDisplayName(member, roomId)" />
```

### Where nickname is applied

| Location                          | How                                                                                                       |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Mention labels in message body    | `useMessageWithMentions(message, roomId)` — pass `() => message.partitionKey` as second arg               |
| Member list sidebar               | `MemberListItem` via `displayName = computed(() => getDisplayName(member, room.id))`                      |
| Role permission panel member list | `MemberPanelListItem` with `member` prop — `displayName = computed(() => getDisplayName(member, roomId))` |
| Push notification title           | `message/index.ts` router queries `usersToRoomsInMessage.nickname` before publishing the EventGrid event  |

### `||` not `??` for nickname fallback

Nicknames are `text().notNull().default("")`. Empty string `""` is falsy — use `||` to fall back to global name:

```ts
// || (not ??) — empty-string nickname is falsy, so fall back to global name
getUserToRoomMap(roomId)?.get(user.id)?.nickname || user.name;
```

## Push Notification Title

Set in `server/trpc/routers/message/index.ts` before publishing to EventGrid. Look up the sender's room nickname:

```ts
const nickname = (await ctx.db.query.usersToRoomsInMessage.findFirst({
  columns: { nickname: true },
  where: { roomId: newMessageEntity.partitionKey, userId: ctx.getSessionPayload.user.id },
}))?.nickname;
notificationOptions: { icon: ..., title: nickname || ctx.getSessionPayload.user.name },
```

## Store Mutation Pattern — Subscriptions as Source of Truth

Subscriptions handle state updates for **all** clients including the caller. Don't duplicate subscription work in a store wrapper.

**Default**: call `$trpc` directly from the component/composable. Add a store function only when it does something subscriptions cannot:

1. Genuine optimistic update (local state before server responds)
2. Navigation or side effects not covered by any subscription
3. Combines multiple mutations or concerns

```ts
// call tRPC directly where the user action happens; the onLeaveRoom subscription owns state
$trpc.room.directMessage.deleteDirectMessageParticipant.mutate({ roomId, userId });
```

### Genuine optimistic update — `createMessage` is the canonical example

- Create a reactive entity locally with `isLoading: true` **before** the tRPC call so it renders immediately
- After the call, `Object.assign` the server response onto the same reactive object (same reference, no re-render flicker)
- Delete the `isLoading` flag — subscription receives the real event but the message is already in the list; dedup by composite key

```ts
const createMessage = async (input: StandardCreateMessageInput) => {
  const newMessage = reactive(createMessageEntity({ ...input, isLoading: true, userId: session.data.user.id }));
  await storeCreateMessage(newMessage); // renders immediately with loading state
  Object.assign(newMessage, await $trpc.message.createMessage.mutate(input)); // server response fills real data in-place
  delete newMessage.isLoading;
};
```

Use only when the delay would be visibly jarring (message send). For participant join/leave, hide/delete DM, etc. a subscription round-trip is imperceptible and the simplicity is worth it.

## Stable Watch Sources for `useOnlineSubscribable`

When subscriptions only need to react to **membership changes** (rooms added/removed), watch a stable primitive instead of the full reactive array. A `toSorted()` array produces a new reference on every `updatedAt` change, causing needless subscription teardown/rebuild on every incoming message.

```ts
// WRONG — re-subscribes on every updatedAt bump (every incoming message)
useOnlineSubscribable(directMessages, (newDirectMessages) => { ... });

// CORRECT — stable string; only changes when the set of IDs changes
useOnlineSubscribable(
  () => directMessages.value.map(({ id }) => id).toSorted().join(","),
  (roomIdsString) => {
    if (!roomIdsString) return undefined;
    const roomIds = roomIdsString.split(",");
    // set up subscriptions…
  },
);
```

A plain getter `() => expr` is equivalent to `computed(() => expr)` as a watch source and is preferred — no extra ref allocation.

## Scheduled Message Jobs Architecture

Scheduled messages and reminders use a two-step pattern: Postgres row + Azure Storage Queue.

**Flow**:

1. tRPC mutation inserts a row into `scheduledMessageJobsInMessage`.
2. Same mutation enqueues to `AzureQueue.ScheduledMessageJobs` with `visibilityTimeout = Math.min(Math.max(0, Math.ceil((runAt - now) / 1000)), 604800)`.
3. Azure Functions queue-trigger (`ProcessScheduledMessageJob`) reads the row, re-checks permissions/room state, executes, marks `completedAt`.

**Key constraint**: Azure Storage Queue max visibility timeout is 604800 seconds (7 days). Jobs with `runAt > 7 days` become visible early, so `ProcessScheduledMessageJob` re-checks `job.runAt` — if still in the future it re-enqueues itself with the remaining delay (`enqueueScheduledMessageJob`) instead of executing. It always verifies `cancelledAt`/`completedAt` for idempotency. No timer scan needed.

**No timer function** — a separate `EnqueueScheduledMessageJobs` polling timer is unnecessary complexity; the queue's native visibility timeout handles delay. The timer approach was removed in favour of direct enqueueing.

**Azure composable** — use `useQueueClient(AzureQueue.ScheduledMessageJobs)` (from `@@/server/composables/azure/queue/useQueueClient`) in server routes and tRPC routers. `packages/azure-functions` uses its own `getQueueClient(azureQueue)` wrapper over `@esposter/db`'s `getQueueClient(connectionString, azureQueue)`.
