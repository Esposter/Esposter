---
title: Mention badges
description: Mention-only unread counts — red chips on sidebar room items that clear on room view.
---

# Mention Badges

Red count chips in the room sidebar for rooms with unread `@mentions` of the current user — the scoped alternative to full unread tracking (which is [rejected](/docs/esbabbler/rejected/read-receipts-unread-badges); mention-only counts are its explicitly allowed narrower version).

## How it works

A per-user, per-room counter (`usersToRooms.mentionCount`) increments when a message mentioning the user arrives and resets when the user views the room. The room list item renders it as a red chip, taking precedence over the plain unread bold — Discord behaviour.

`createMessage` classifies the message's mentions (`classifyMentions`) and bumps every targeted member's counter in a single batched UPDATE (`incrementMentionCounts`): direct and role mentions badge unconditionally; `@everyone`/`@here` follow each member's notification rules (`Never` opts out; `@here` requires online, with no status row treated as online — the same broadcast targeting as [push notifications](/docs/esbabbler/push-notifications)); the sender is always excluded. The increment runs best-effort after the Table write — a failed increment loses one badge count, never a message, so there is no retry.

Counts arrive with `readMyUsersToRooms` at startup (already loaded for every room — see [/docs/esbabbler/nicknames](/docs/esbabbler/nicknames)) and update live through the existing `onUpdateUserToRoom` subscription: both the increment and the clear emit `updateUserToRoom` per affected row, so the chip appears and disappears with no new subscription.

```mermaid
flowchart LR
  CM["createMessage"] -->|"incrementMentionCounts<br/>(one batched UPDATE, sender excluded)"| DB[("usersToRooms.mentionCount")]
  VIEW["room view<br/>(/messages/[id])"] -->|"clearMentionCount"| DB
  DB -->|"updateUserToRoom event"| SUB["onUpdateUserToRoom subscription"]
  SUB --> STORE["useUserToRoomStore.myUserToRoom"]
  STORE -->|"mentionCount > 0"| CHIP["room ListItem red chip"]
```

## Data model

`usersToRooms.mentionCount` — integer, NOT NULL DEFAULT 0, with a `>= 0` check. The counter is the only state — there is no per-message read tracking anywhere, keeping the rejected read-receipt semantics out.

## Procedures

| Procedure                       | Auth   | Purpose                                                                |
| ------------------------------- | ------ | ---------------------------------------------------------------------- |
| `clearMentionCount({ roomId })` | member | reset own count on room view; idempotent, emits only when a count fell |

(The increment happens inside `createMessage`; there is no public write endpoint for it.)

## Key files

| File                                                           | Role                                                          |
| -------------------------------------------------------------- | ------------------------------------------------------------- |
| `packages/db-schema/src/schema/usersToRoomsInMessage.ts`       | `mentionCount` column + check                                 |
| `packages/db/src/services/message/incrementMentionCounts.ts`   | batched increment (`MentionBadgeConditionBuilders` targeting) |
| `packages/app/server/services/message/createUserMessage.ts`    | best-effort increment + `updateUserToRoom` fan-out            |
| `packages/app/server/trpc/routers/userToRoom.ts`               | `clearMentionCount`                                           |
| `packages/app/app/pages/messages/[id]/index.vue`               | clears the count on room view                                 |
| `packages/app/app/components/Message/Model/Room/List/Item.vue` | red count chip                                                |

## Notes

- Badge vs push targeting: a direct or role mention always badges regardless of the member's notification preference (Discord), while push delivery respects the `DirectMessage` preference. Both share the broadcast rules and role-member resolution through the `getMentionConditions` core with pluggable builders (`MentionBadgeConditionBuilders` vs `MentionNotificationConditionBuilders`).
- Mentions arriving while the room is being viewed are suppressed in the sidebar (`isActive`), matching the existing unread-bold behaviour; the stored count clears on the next room view.
