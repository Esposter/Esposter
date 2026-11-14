# Live updates to a client

Read when a change must reach another client, or deciding whether the caller of a mutation also updates its own store.

## Live updates are typed events, never subscriptions

A change another client must see is a frame of the owning object's typed event union, written to that object's sockets: `RoomEvent` on `/ws/room/:roomId`, `CallEvent` on `/ws/call/:callSessionId` and `UserEvent` on `/ws/user`, opened through the routes under `apps/web/server/routes/ws/`. The unions are declared once in `packages/db-schema/src/models/realtime/`, so the object that writes a frame and the client that reads it share one type. Queries and mutations stay on tRPC over HTTP, and no procedure is a tRPC subscription or an in-process emitter (`openspec/changes/infra-cloudflare-realtime/design.md`, "Events, not subscriptions").

A client receives a frame through a handler registered on `useConnectionStore` (`apps/web/app/store/realtime/connection.ts`) with `onRoomEvent`, `onCallEvent` or `onUserEvent`. The handler is keyed by the event's `type` and returns its unregister function. The feature's `use*Subscribables` composable registers it (`vue-composable-patterns` skill, `references/composable-lifecycle.md`). A new live feed adds a member to its object's union; it never adds a procedure.

## Whose socket hears a write

A write's event goes to every socket its object holds except the socket of the device or session that made the write: a room write names its device, a call write its session, and `excludeTag` skips that socket (`getSendOptions` in `apps/functions/src/durableObjects/RoomObject.ts`). A person's `UserEvent` reaches every session the person holds, unless the object names one to skip.

| Does the write's own socket hear the event?       | Store update after the mutation                                                               |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| No: a room or call write skips the sender         | Required: the store updates from the mutation's own result (`applyOptimistic` or `onSuccess`) |
| Yes: a person's `UserEvent` reaches every session | Not called: the handler is the single source of truth                                         |

Decide the side once for each event, then keep to it: the same row is never updated both by the mutation and by its handler.

## Open the socket before the read it must not miss

A read whose answer a change could overtake waits for its socket to settle, then reads. `openCall` returns a promise that settles once the call socket's first attempt opens or closes, so a read made after it misses no change (`apps/web/app/store/realtime/connection.ts`). A room socket opens with `after` set to the last message id the page holds, and the room object replays every message sent after that id before it goes live, so a reconnect misses nothing (`apps/functions/src/durableObjects/RoomObject.ts`).

## Room streams are socket routes, not procedures

No room's live events come through a procedure. The room's object writes its `RoomEvent` frames, and `broadcastRoomEvent` (`server/services/room/`) sends the room's writes to it. The membership check a subscription used to make when it opened is now made when the socket opens, in `apps/web/server/routes/ws/room/[roomId].get.ts` (`assertIsMember`). A departure drops the member's sockets on the room's object (`RoomObject.removeMember`), so no socket outlives its membership.
