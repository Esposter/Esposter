---
name: esbabbler
description: Apply when working on the messaging module (apps/web/app/…/message/, server/trpc/routers/message/, userToRoom, roles, members, rooms). Esposter messaging feature (esbabbler) conventions — Discord parity as the default design rule, display names resolved through getDisplayName/getMemberName with the || nickname fallback, MessageTypeOperationPermissionMap as the one source of what may be done to a message, and a subscription written on another member's behalf recording that member's own decision on the row. Calls/voice internals live in the esbabbler-call skill.
---

# Esbabbler (Messaging) Feature Conventions

## Discord Parity (Default Design Rule)

Esbabbler is a Discord clone: an undecided behaviour, name, default or layout takes Discord's, diverging only on visual style and recorded infrastructure limits, and an unknown is an open question rather than a guess (`references/discord-parity.md`).

## Display Name Resolution

Every member name inside a room goes through `getDisplayName(user, roomId)`, an id alone through `getMemberName(userId)`, and a nickname falls back with `||` — never a bare `user.name` in a room (`references/display-names.md`).

## What May Be Done To A Message

`MessageTypeOperationPermissionMap` (`shared/services/message/`) is the **single** source of truth, read by both the server procedures and the client menu. It answers two questions that must not be collapsed — whether the operation exists for that `MessageType` at all, and whether _this_ caller may perform it. `getMessageProcedure(schema, operation)` names the operation it guards; never hardcode a type check in a procedure.

## A Subscription Written on Somebody Else's Behalf Records the Member's Own Decision

An opt-out is recorded on the row rather than deleting it, only the member's own action clears it, and an id lifted off a message is guarded because a webhook has none (`references/third-party-subscriptions.md`).

## Deep Dives

- `references/message-operations.md` — when adding a message operation or `MessageType`, or gating a message menu item on who may use it.
- `references/client-state.md` — when a component mutates messaging state (and whether that belongs in a store at all), or when a composable sets up subscriptions from a reactive list or resumes one after an `await`.
- `references/settings-surfaces.md` — when adding a tab, panel or field to the room or user settings dialog.
- `references/scheduled-message-jobs.md` — when scheduling work to run at a future time (scheduled messages, reminders).
- `references/discord-parity.md` — when a messaging behaviour, name or default is undecided.
- `references/display-names.md` — when rendering a member's name, or holding only a member id.
- `references/third-party-subscriptions.md` — when one member's action subscribes another, or an opt-out is recorded.
