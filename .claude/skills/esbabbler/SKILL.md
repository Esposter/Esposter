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
- A feature Discord has but we deliberately dropped lives in `packages/app/content/docs/esbabbler/rejected/` or `deferred/` with rationale — grep there before re-proposing.

## Display Name Resolution

All member name display goes through `getDisplayName(user, roomId)` from `useUserToRoomStore`. Never read `user.name` / `member.name` directly in a room context.

```ts
// respects room nickname, falls back to global name — never bare member.name
<StyledAvatar :name="getDisplayName(member, roomId)" />
```

When you only have a member **id** (an actor/target id from a moderation log or note, possibly no longer in the loaded member list), use `getMemberName(userId)` from `useMemberStore` — it finds the member, resolves through `getDisplayName` (current room), and falls back to the raw id. Never rebuild a local `computed(() => new Map(members.value.map(({ id, name }) => [id, name])))` + `?? userId` lookup — that plain-`name` map both duplicates this primitive and bypasses nickname resolution.

### Where nickname is applied

| Location                       | How                                                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Mention labels in message body | `useMessageWithMentions(message, roomId)` — pass `() => message.partitionKey` as second arg               |
| Member list sidebar            | `Message/Model/Member/ListItem.vue` — `displayName = computed(() => getDisplayName(member, room.id))`     |
| Room settings member list      | `Message/Model/Room/Settings/Type/Member/ListItem.vue` — `computed(() => getDisplayName(member, roomId))` |
| Push notification title        | `message/index.ts` router queries `usersToRoomsInMessage.nickname` before publishing the EventGrid event  |

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

## Settings Surfaces (Room + User Settings Dialogs)

Both settings dialogs share one structure and three conventions — apply them to every new settings tab or field:

- **Panels are lazy + skeletoned.** Each tab is a `defineAsyncComponent` in `SettingsContentMap` (room) / `UserSettingsContentMap` (user); the shared `Content.vue` wraps `<component :is>` in `<Suspense :timeout="0">` with `<MessageModelSettingsSkeleton />` as fallback. New tabs get the skeleton for free — never add per-panel spinners; if a panel needs data, top-level `await` it and let Suspense show the skeleton.
- **Every settings mutation is optimistic.** Never make a control wait on the server round-trip. Use `useMutation()` (`app/composables/shared/useMutation.ts`, standard: [/docs/architecture/client-data](/docs/architecture/client-data)): `applyOptimistic` mutates the store immediately and returns the rollback closure; the mutation runs in the background; failure rolls back + surfaces the error. Subscriptions stay the confirming source of truth. It bundles staleness guarding, so a slow earlier call never clobbers a newer one.
- **Sidebar section highlight uses `StyledSlideIndicator` with ALL visible keys.** Items carry `data-slide-indicator-key`; pass every visible section id (docs table-of-contents behaviour — the rail stretches across them), pinning to the clicked target while the programmatic scroll runs (`isScrollingToSection`). Never hand-roll a sliding/active rail.

## Scheduled Message Jobs Architecture

Scheduled messages and reminders use a two-step pattern: Postgres row + Azure **Service Bus** (not Storage Queue).

**Flow**:

1. tRPC mutation (`server/trpc/routers/message/scheduledMessageJob.ts`) inserts a row into `scheduledMessageJobsInMessage`.
2. Same mutation calls `enqueueScheduledMessageJob(useServiceBusSender(AzureQueue.ScheduledMessageJobs), job.id, job.runAt)` — a thin wrapper (`@esposter/db`) over `serviceBusSender.scheduleMessages(body, runAt)`. Pass `runAt` as a `Date` directly: **no clamping, no delay maths** — Service Bus takes an absolute enqueue time and delivers past-dated messages immediately.
3. Azure Functions Service Bus queue-trigger (`ProcessScheduledMessageJob`) reads the row, atomically claims it on `processingStartedAt IS NULL` (the single-shot claim that makes the handler idempotent under at-least-once delivery), executes, marks `completedAt`. If `job.runAt` is still in the future it re-enqueues itself instead of executing.

**No timer function** — a separate polling timer is unnecessary; Service Bus scheduled delivery handles the delay.

**Azure composable** — `useServiceBusSender(AzureQueue.ScheduledMessageJobs)` (`@@/server/composables/azure/serviceBus/useServiceBusSender`) in server routes and tRPC routers. `packages/azure-functions` uses its own `getServiceBusSender(azureQueue)` wrapper over `@esposter/db`'s `getServiceBusSender(connectionString, azureQueue)`.
