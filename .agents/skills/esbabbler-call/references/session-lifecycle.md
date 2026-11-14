# The Call Session and Its Lifecycle

Read when changing what a call persists or holds in memory, or a step of joining, subscribing or leaving on the server.

## Key entities

| Entity                                                   | Role                                                                                                                                                                                                                            |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `callSessionsInMessage`                                  | Persistent call row. `id` (`CALL_ID_LENGTH` characters) is both session key and shareable join code. `userId` is the creator who can join a standalone call directly. Room sessions created lazily on first `joinCallByRoomId`. |
| `CallObject` (one per session, `callSessionId` names it) | Durable Object in `apps/functions`, SQLite in its own storage (`apps/functions/src/durableObjects/call/schema.ts`). Survives eviction.                                                                                          |
| `participants` table                                     | Joined connections, keyed by session id. Created by a join, deleted by a leave.                                                                                                                                                 |
| `knockers` table                                         | The standalone waiting room. Dismissed when the call ends.                                                                                                                                                                      |
| `admittedSessions` table                                 | One-time admissions a doorkeeper granted, consumed by the admitted connection's `joinCall`.                                                                                                                                     |
| `realtimeKitParticipants` table                          | Each joined connection's RealtimeKit participant, its publish sources and whether a revoke is replacing it.                                                                                                                     |
| `callState` row                                          | The RealtimeKit meeting (made by the first join) and the call's start time, read by the last leaver for the duration.                                                                                                           |

## Call session lifecycle

1. **Room entry**: `readCallSessionId({ roomId })` → reads `callSessionsInMessage`, returns `id` (`""` if none). Called by `useCallSubscribables` on viewed-room change; subscriptions skipped when `""`.
2. **Join via room**: `joinCallByRoomId({ roomId })` → membership required → creates session row if none (an inline upsert with bounded retries) → returns `{ authToken, callSessionId, isDoorkeeper, meetingId, participantMap }`.
3. **Join via id**: `joinCall({ id })` → auth only → finds **standalone** session by id → allows creator or admitted session → same join flow.
4. **Call socket**: the joined call is held by one call socket (`/ws/call/[callSessionId]`), which the object accepts only while the connection is joined or knocking on the call. Its events are the `CallEvent` frames the object broadcasts: a join to the others, a rejoin to its own connection, a knock to the doorkeeper, an admission or dismissal to the knocker's session. Reads of the participant map go through `readCallParticipantMap`, which requires the joined gate.
5. **Leave**: `leaveCall({ callSessionId })` calls the object, which answers `null` when the caller is not a participant (the procedure throws `NOT_FOUND`). The departure that empties the call dismisses its knockers, clears its admissions, and returns the duration; the web Worker writes that duration as the call's summary in the room (on a room call only).
