---
title: Profiles & presence
description: User profile card and editing, and the Online/Idle/DND/Offline presence system.
---

# Profiles & Presence

Who a user appears as (profile card, biography, avatar) and whether they appear available (status, custom status message).

## Presence

`userStatuses` table (Postgres), one row per user: `status` (nullable enum), `isConnected`, `message` (custom status), `expiresAt`.

- `UserStatus`: `Online | Idle | DoNotDisturb | Offline` — **nullable**: `null` means "connected, no manual override", so the effective status is derived (`getDetectedUserStatus`) from `isConnected` + any manual override + expiry.
- `user.upsertStatus` upserts the row (`onConflictDoUpdate` on `userId`) and emits `upsertStatus` on `userEventEmitter`; the `onUpsertStatus` subscription pushes live presence to members. `user.readStatuses(userIds)` batch-loads statuses for the member list.
- Auto-idle: the client flips to Idle after `autoIdleThresholdMs` from [/docs/esbabbler/settings](/docs/esbabbler/settings).

## Profile

- **Profile card** — avatar, display name, biography; shown from the member list and message avatars.
- **Editing** — the bottom-left user panel opens the edit dialog: `name`, biography, avatar upload, with a preview of the card as others see it.
- `users.biography` — text, max 160 chars (`USER_BIOGRAPHY_MAX_LENGTH`), shown beneath the display name.
- `user.updateUser` — restricted to the caller's own row; validates `name` (`USER_NAME_MAX_LENGTH`), `biography`, `image`.
- Avatar upload uses the standard two-step SAS flow ([/docs/architecture/file-uploads](/docs/architecture/file-uploads)) into `AzureContainer.PublicUserAssets` at `{userId}/ProfileImage`; rooms have the equivalent room profile image at `rooms/{roomId}/ProfileImage`.

In room contexts the displayed name goes through `getDisplayName` — the per-room nickname wins over the profile name ([/docs/esbabbler/nicknames](/docs/esbabbler/nicknames)).

## Key files

| File                                                          | Role                                                 |
| :------------------------------------------------------------ | :--------------------------------------------------- |
| `packages/db-schema/src/schema/userStatusesInMessage.ts`      | presence table + `UserStatus` enum                   |
| `packages/app/server/trpc/routers/user.ts`                    | `upsertStatus`, `readStatuses`, `updateUser`         |
| `packages/app/app/components/User/ProfileCard/`               | editable profile card (global surface)               |
| `packages/app/app/components/Message/Model/User/ProfileCard/` | in-room profile card (mutual rooms, moderation menu) |
