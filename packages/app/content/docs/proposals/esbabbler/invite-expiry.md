---
title: Invite expiry
description: Proposal — expiring and max-use invite links.
---

# Invite Expiry & Max Uses

Invite links that expire after a duration and/or a number of uses — Discord's invite options, closing the gap where an invite token is currently forever-valid.

## Scope

**Today:** `invitesInMessage` holds an 8-char token per room with no constraints; anyone with the token can always join.

**This adds:** optional `expiresAt` and `maxUses`/`uses` on invites, an options UI when creating an invite, and enforcement + cleanup on join.

## Data model

`invitesInMessage` gains `expiresAt` (timestamp, nullable = never), `maxUses` (integer, nullable = unlimited), `uses` (integer, NOT NULL DEFAULT 0). Existing rows keep null = today's behaviour (no breaking change).

## How it works

- **Create**: the invite dialog gains Discord's two selects (expire after: 30m/1h/6h/12h/1d/7d/never; max uses: 1/5/10/25/50/100/∞). `createInvite` computes `expiresAt`.
- **Join**: the join-by-token path checks `expiresAt > now()` and `maxUses IS NULL OR uses < maxUses` in the same statement that increments `uses` (`UPDATE … RETURNING`, so two concurrent joins can't both consume the last use). Expired/exhausted → the same "invalid invite" error as an unknown token (don't leak which).
- **Cleanup**: no timer needed — expired rows are inert; the invite list UI shows expiry state and lets `ManageInvites` holders delete them.

## Procedures

Extends existing invite procedures (`createInvite` input, join validation); adds none.

## Key files

| File                                                     | Change                       |
| :------------------------------------------------------- | :--------------------------- |
| `packages/db-schema/src/schema/invitesInMessage.ts`      | three columns (+ migration)  |
| `packages/app/server/trpc/routers/room/` (invite + join) | options + atomic enforcement |
| `packages/app/app/components/Message/` (invite dialog)   | expiry/max-use selects       |
