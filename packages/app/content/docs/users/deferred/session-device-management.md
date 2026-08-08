---
title: Session and device management
description: A settings surface listing active sessions with per-session revocation.
---

# Session and Device Management

A settings surface listing the account's active sessions — device, browser, approximate location, last seen — with a revoke button per row and a "sign out everywhere else" action. The storage is already there: the `sessions` table records `ipAddress` and `userAgent` on every row, and better-auth ships the endpoints unused (`listSessions`, `revokeSession({ token })`, `revokeSessions`, `revokeOtherSessions`, plus an optional `multiSession` plugin for holding several signed-in accounts at once). Nothing in the app calls any of them and no UI exposes them.

**Not to be confused with the device identity that does exist.** `Device` (`packages/app/shared/models/auth/Device.ts`) is just `{ sessionId, userId }`, and `getDeviceId`/`getIsSameDevice` in `server/services/auth/` use it for exactly one job: scoping push subscriptions so a notification is not delivered to the same device that sent the message — see [Auth](/docs/architecture/auth). It identifies a device for delivery routing; it does not enumerate sessions, expose them, or revoke anything.

**Why deferred:** Session revocation answers "someone else has my session" — a question that needs a second party to be worth answering. Sign-in is OAuth-only ([password auth is rejected](/docs/users/rejected/password-auth)), so there is no credential to leak independently of the provider. Revoking the grant at the provider is **not** a substitute — it stops future sign-ins, but the session rows here are ours and keep working until they expire, which is precisely the gap this surface would close. The deferral rests on usage rather than on that being covered: single-user, invite-shaped traffic makes a stolen session a threat nobody has met yet. Building the list also means deciding what `userAgent` and `ipAddress` are rendered as, which is a small privacy surface of its own (the raw IP is stored, and showing it to the account holder is a choice) for a feature nobody has asked for.

**Revisit when:** the platform opens to real external users and either a session-compromise report arrives or shared/public-device sign-in becomes a normal way people use it — whichever comes first. Sooner if a moderation case ever needs an operator to terminate a specific user's sessions rather than ban the account.
