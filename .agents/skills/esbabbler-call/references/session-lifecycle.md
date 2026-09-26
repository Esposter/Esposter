# The Call Session and Its Lifecycle

Read when changing what a call persists or holds in memory, or a step of joining, subscribing or leaving on the server.

## Key entities

| Entity                                   | Role                                                                                                                                                                                                                            |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `callSessionsInMessage`                  | Persistent call row. `id` (`CALL_ID_LENGTH` characters) is both session key and shareable join code. `userId` is the creator who can join a standalone call directly. Room sessions created lazily on first `joinCallByRoomId`. |
| `callSessionParticipantMap` (in-memory)  | `Map<callSessionId, Map<sessionId, CallParticipant>>`. Lost on restart.                                                                                                                                                         |
| `callAdmittedParticipantMap` (in-memory) | `Map<callSessionId, Set<sessionId>>`. One-time standalone waiting-room admissions. Consumed by `joinCall({ id })`.                                                                                                              |
| `callStartTimeMap` (in-memory)           | `Map<callSessionId, Date>`. Tracks call start for duration calculation.                                                                                                                                                         |
| `callKnockerMap` (in-memory)             | `Map<callSessionId, Map<sessionId, CallParticipant>>`. The standalone waiting room's knockers (`references/standalone-lobby.md`).                                                                                               |

## Call session lifecycle

1. **Room entry**: `readCallSessionId({ roomId })` → reads `callSessionsInMessage`, returns `id` (`""` if none). Called by `useCallSubscribables` on viewed-room change; subscriptions skipped when `""`.
2. **Join via room**: `joinCallByRoomId({ roomId })` → membership required → creates session row if none (3-retry upsert inline) → returns `{ callSessionId, participants, liveKitUrl, liveKitToken }`.
3. **Join via id**: `joinCall({ id })` → auth only → finds **standalone** session by id → allows creator or admitted session → same join flow.
4. **Subscriptions** (`onJoinCall`, `onLeaveCall`, `onSetCameraEnabled`, `onSetHandRaised`, `onSetMuted`) take `callSessionId` (not `roomId`) and each passes `requireJoinedCallSession` — the call's creator or a participant in it; anyone else is `FORBIDDEN`.
5. **Leave**: `leaveCall({ callSessionId })`. Throws `NOT_FOUND` if the caller is not a participant. On the last participant leaving a room call: writes the call duration as a `MessageType.Call` system message — into the thread the call ran in, else the room. A standalone call has no room and writes none.
