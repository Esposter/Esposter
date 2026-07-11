---
title: Mention badges
description: Proposal — mention-only unread counts in the room sidebar.
---

# Mention Badges

Red count chips in the room sidebar for rooms with unread `@mentions` of the current user — the scoped alternative to full unread tracking (which is [rejected](/docs/esbabbler/rejected/read-receipts-unread-badges); mention-only counts are its explicitly allowed narrower version).

## Scope

**Today:** the sidebar shows a plain unread dot per room (based on `usersToRooms.lastMessageAt` vs room activity), and mention highlighting exists in the message list (mention parsing already detects `@user`/`@here`/`@everyone` targeting for push notifications).

**This adds:** a per-user, per-room **mention count** that increments when a message mentioning the user arrives and resets when the user views the room. Rendered as a red chip (count) on the room list item, taking precedence over the plain unread dot — Discord behaviour.

## How it works

Reuse the push-notification recipient detection: `createMessage` already computes which users are directly mentioned (`getPushSubscriptionsForMessage` parses mention `data-id`s). Persist a counter on `usersToRooms`:

- New column `mentionCount` (integer, NOT NULL DEFAULT 0) on `usersToRooms`.
- On `createMessage`, after mention parsing: `UPDATE usersToRooms SET mentionCount = mentionCount + 1 WHERE roomId AND userId IN (mentioned regular ids; @everyone/@here → all members per their notification rules, excluding sender)`. One batched SQL statement in the same request.
- On room view (client enters room / marks read): `updateUserToRoom({ roomId, mentionCount: 0 })` style reset via a dedicated `clearMentionCount` mutation (member).
- Counts arrive with `readMyUsersToRooms` at startup (already loaded for all rooms — see [/docs/esbabbler/nicknames](/docs/esbabbler/nicknames) endpoint split) and update live via the existing `onUpdateUserToRoom` subscription.

## Procedures

| Procedure                       | Auth   | Purpose                      |
| ------------------------------- | ------ | ---------------------------- |
| `clearMentionCount({ roomId })` | member | reset own count on room view |

(Increment happens inside `createMessage`; no new public write endpoint.)

## Key files

| File                                                                 | Change                                            |
| :------------------------------------------------------------------- | :------------------------------------------------ |
| `packages/db-schema/src/schema/usersToRoomsInMessage.ts`             | add `mentionCount` column (+ migration)           |
| `packages/db/src/services/message/getPushSubscriptionsForMessage.ts` | share the mention-target resolution               |
| `packages/app/server/trpc/routers/message/index.ts`                  | increment in `createMessage`; `clearMentionCount` |
| `packages/app/app/store/message/room/userToRoom.ts`                  | expose counts to the sidebar                      |
| `packages/app/app/components/Message/LeftSideBar/`                   | red chip on room list items                       |

## Notes

- Failure semantics: the increment is part of the `createMessage` request after the Table write; a failed increment loses one badge count, never a message — acceptable, no retry needed.
- No per-message read tracking anywhere — the counter is the only state, keeping the rejected read-receipt semantics out.
