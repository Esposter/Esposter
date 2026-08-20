---
name: esbabbler
description: Esposter messaging feature (esbabbler) conventions — the Discord parity default (match behaviour/naming/defaults, diverge only on styling and recorded infra constraints, record unknowns as open questions), display name resolution through getDisplayName/getMemberName with nickname applied everywhere including push titles, the || not ?? empty-string nickname fallback, MessageTypeOperationPermissionMap as the single source of truth for what may be done to a message, and subscriptions written on another member's behalf recording the member's own decision on the row rather than deleting it — plus deep dives on capability vs permission for message operations, subscriptions-as-source-of-truth store mutations and stable subscribable watch sources, the room/user settings dialog surfaces, and the Service Bus scheduled-message-job architecture. Apply when working on the messaging module (packages/app/app/…/message/, server/trpc/routers/message/, userToRoom, roles, members, rooms). Calls/voice internals live in the esbabbler-call skill.
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

The rule has **no room-scoped exceptions** — a surface that renders a member's name inside a room resolves it, including ones that read like a global profile. The profile card is the standing example: it opens over a room, so `Message/Model/User/ProfileCard/Index.vue` resolves through `getDisplayName(user, currentRoomId.value)` and the card shows the nickname, matching the message header that opened it. A surface that genuinely has no room (account settings, the global user menu) reads `user.name` directly.

Where the plumbing is not obvious:

| Location                       | How                                                                                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mention labels in message body | `useMessageWithMentions(message, roomId)` — pass `() => message.partitionKey` as second arg                                                                                     |
| Profile card                   | `Message/Model/User/ProfileCard/Index.vue` — `computed(() => getDisplayName(user, currentRoomId.value))`, the room coming from the route rather than a prop                     |
| Push notification title        | `server/trpc/routers/message/index.ts` queries `usersToRoomsInMessage.nickname` for the sender before publishing the EventGrid event, and passes it as the notification `title` |

### `||` not `??` for nickname fallback

Nicknames are `text().notNull().default("")`. Empty string `""` is falsy — use `||` to fall back to the global name:

```ts
// || (not ??) — empty-string nickname is falsy, so fall back to global name
getUserToRoomMap(roomId)?.get(user.id)?.nickname || user.name;
```

## What May Be Done To A Message

`MessageTypeOperationPermissionMap` (`shared/services/message/`) is the **single** source of truth, read by both the server procedures and the client menu. It answers two questions that must not be collapsed — whether the operation exists for that `MessageType` at all, and whether _this_ caller may perform it. `getMessageProcedure(schema, operation)` names the operation it guards; never hardcode a type check in a procedure.

## A Subscription Written on Somebody Else's Behalf Records the Member's Own Decision

Discord parity means a member's action routinely subscribes _another_ member — replying to a message follows that thread for its root's author too (`packages/app/content/docs/esbabbler/thread-follows.md`). Two rules fall out, and both are about the row, not the caller:

- **Deleting the row on opt-out makes "never subscribed" and "opted out" the same absence**, so the next third-party action re-subscribes them and the opt-out can never stick. Record the decision on the row instead (`threadFollowsInMessage.isUnfollowed`) and filter it out of every read. Whether a write may clear that tombstone is decided by **whose action it is** — the member's own (the bell, their own reply) clears it, anyone else's only ever inserts.
- **The other member may not exist.** A webhook message has no `userId` at all, so any id lifted off a message entity is guarded on presence before it reaches a `NOT NULL` column — the whole best-effort tail is swallowed into `console.error`, so the constraint violation costs the operator a stack trace per message and nothing else surfaces.

## Deep Dives

- `references/message-operations.md` — when adding a message operation or `MessageType`, or gating a message menu item on who may use it.
- `references/client-state.md` — when a component mutates messaging state (and whether that belongs in a store at all), or when a composable sets up subscriptions from a reactive list or resumes one after an `await`.
- `references/settings-surfaces.md` — when adding a tab, panel or field to the room or user settings dialog.
- `references/scheduled-message-jobs.md` — when scheduling work to run at a future time (scheduled messages, reminders).
