---
title: Moderator notes
description: Proposal — private per-member notes visible to moderators only.
---

# Moderator Notes

Free-text notes a moderator can attach to a room member (visible only to holders of a moderation permission) — context for future moderation decisions ("warned twice for spam in June").

## Scope

**Today:** the moderation log records actions, but there is nowhere to record human judgment between actions.

**This adds:** append-only notes per `(roomId, targetUserId)`, written and read from the member's profile-card moderation menu.

## How it works

Notes are moderation-log-shaped (append-heavy, time-ordered, per-room, no joins) → **Azure Table**, alongside the existing log: new `AzureTable.ModerationNotes`, `partitionKey = roomId`, `rowKey = reverseTickedTimestamp`, fields `targetUserId`, `actorId`, `note` (max length constant). No edit/delete — corrections are new notes (append-only keeps the record trustworthy); room deletion cleans the partition like messages.

| Procedure                                               | Auth (permission) | Purpose                          |
| ------------------------------------------------------- | ----------------- | -------------------------------- |
| `createModerationNote({ roomId, targetUserId, note })`  | `KickMembers`     | append a note                    |
| `readModerationNotes({ roomId, targetUserId, cursor })` | `KickMembers`     | cursor-paginated per-member view |

`KickMembers` is the gate (the lowest "acts on members" moderation bit) — consistent with warn/timeout being visible to the same audience.

## UI

The in-room profile card's moderation menu ([/docs/esbabbler/profiles-and-presence](/docs/esbabbler/profiles-and-presence)) gains a **Notes** item opening a small dialog: note list (newest first) + input. A count badge shows when notes exist.

## Key files

| File                                                          | Change                   |
| :------------------------------------------------------------ | :----------------------- |
| `packages/db-schema/src/models/azure/table/AzureTable.ts`     | add `ModerationNotes`    |
| `packages/app/server/trpc/routers/message/moderation.ts`      | the two procedures       |
| `packages/app/app/components/Message/Model/User/ProfileCard/` | Notes menu item + dialog |
