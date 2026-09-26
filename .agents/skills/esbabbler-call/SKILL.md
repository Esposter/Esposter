---
name: esbabbler-call
description: Apply when working on calls (store/message/room/call/, liveKit.ts, callSession routers, /calls pages). Esposter messaging calls (esbabbler) implementation — the persistent callSessionsInMessage row plus the ephemeral in-memory participant maps, a short random code always being the row's id via createId, standalone vs room calls and their join procedures, the four leave boundaries, and which call store owns each piece of client state.
---

# Esbabbler Calls — Implementation

Calls build on `callSessionsInMessage` (Postgres) + ephemeral in-memory maps. The session persists; participants do not.

## Key entities

A call is one persistent `callSessionsInMessage` row whose `id` is the join code, plus in-memory participant, admission, start-time and knocker maps lost on restart (`references/session-lifecycle.md`).

## Random id terminology

A call's join code is the row's `id`, made by `createId(CALL_ID_LENGTH)` — the random-id key rule is the `drizzle` skill's (`references/primary-keys.md`).

## Standalone vs room calls

A room call joins by `joinCallByRoomId` under room RBAC; a standalone call is `createCall()` then `joinCall({ id })`, open to the creator and admitted knockers; a thread call is a room call keyed by its thread (`references/call-kinds.md`).

## Call session lifecycle

`readCallSessionId` on room entry, `joinCallByRoomId` or `joinCall` to join, subscriptions keyed by `callSessionId`, and `leaveCall` writing a room call's duration message when its last participant leaves (`references/session-lifecycle.md`).

## Call leave boundaries

Only user intent, moderation, session loss and leaving `/calls/[id]` remove the local participant — room navigation never does (`references/leave-boundaries.md`).

## Client-side call stores

`useCallStore` holds `activeCallSessionId` (the call the user is in) and `currentRoomCallSessionId` (the viewed room's) — never swapped; participants are `useParticipantStore`, media `useMediaStore`, and every track and device `useLiveKitStore` (`references/client-stores.md`).

## Deep Dives

- `references/participant-state.md` — when reading, iterating or mutating call participants on the client, or adding a field that describes one.
- `references/permissions-and-admin-actions.md` — when adding a `RoomPermission` bit or an `AdminActionType`, or wiring an admin action hook into the call stores.
- `references/standalone-lobby.md` — when working on `/calls` or `/calls/[id]`: the shareable link, pre-join states, and knock/admit.
- `references/session-lifecycle.md` — when changing what a call persists or holds in memory, or a join or leave step.
- `references/call-kinds.md` — when a change touches how a call is joined or where it lives.
- `references/leave-boundaries.md` — when something might remove the local participant from a call.
- `references/client-stores.md` — when client call state is read or added.
