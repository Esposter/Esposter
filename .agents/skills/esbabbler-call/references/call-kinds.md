# Standalone and Room Calls

Read when a change touches how a call is joined, who may join it, or where it lives — a room, a thread or `/calls`.

| Aspect                | Room call                                  | Standalone call                                     |
| --------------------- | ------------------------------------------ | --------------------------------------------------- |
| Procedure             | `joinCallByRoomId({ roomId })`             | `createCall()` then `joinCall({ id })`              |
| Auth requirement      | Room membership (via `getMemberProcedure`) | Auth only — no room membership                      |
| `callRoomId` in store | Set to the room ID                         | Empty `""`                                          |
| Page                  | Room's message view + `Panel/Dialog`       | `/calls/[id]`                                       |
| InviteCard shown      | No (hidden when `callRoomId` is set)       | Yes — shares `window.location.href`                 |
| RBAC / moderation     | Full room RBAC applies                     | No room — the creator, in the call, admits knockers |

- **`joinCall({ id })`** only works for standalone sessions (`callSession.roomId === null`); throws `FORBIDDEN` for a room session ID. Succeeds only for the creator (`callSessionsInMessage.userId`) or a session just admitted via `admitKnocker`. Room calls must use `joinCallByRoomId`.
- **`createCall()`** creates a new standalone (roomless) session with `userId = ctx.getSessionPayload.user.id`, returns `callSessionId`. `/calls` calls this then navigates to `/calls/[callSessionId]`.
- **A thread call is a room call keyed by `(roomId, threadRootRowKey)`.** `joinCallByRoomId` and `readCallSessionId` take the optional `threadRootRowKey`, and the joined call's route is the thread's own, so the status bar and the picture-in-picture window lead back to the pane it was started in (`apps/web/content/docs/esbabbler/threads.md`).
