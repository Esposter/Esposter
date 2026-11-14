# Tasks

## 1.

- [ ] 1.1 Declare `RoomEvent`, `CallEvent` and `UserEvent` with their schemas in `apps/web/shared/models/realtime/`, one member per event the EventEmitters carry today. Verified by the schema tests.
- [ ] 1.2 Switch every D1 id to UUIDv7 from the `uuid` package's `v7` — the column defaults, better-auth's generator, `z.uuidv7()` in every schema — ban `crypto.randomUUID` and `uuid`'s `v4` by lint, and page every D1 cursor on `id` alone. Verified by the cursor pagination tests and the lint rule's cases.

## 2.

- [ ] 2.1 Build `UserObject`: hibernating sockets tagged by session and device, attach and detach on the first and last socket, online status, the sent-message and scheduled-message index, TodoList reminders on its alarm. Verified by its Miniflare tests.
- [ ] 2.2 Build `RoomObject`: messages with integer ids, reactions and the external-content FTS5 table in one transaction per write, the replay after a message id, viewers' sockets, online members, the debounced room-activity fan-out, scheduled messages on its alarm, erase, export and delete. Verified by its Miniflare tests.
- [ ] 2.3 Build `CallObject`: the participant, knocker, admitted and RealtimeKit maps and the preset queue in its storage, call sockets, the revoke's rejoin event. Verified by its Miniflare tests.

## 3.

- [ ] 3.1 Route `/ws/user`, `/ws/room/:roomId` and `/ws/call/:callSessionId` through the web Worker's session and membership check to the objects. Verified by the socket route tests.
- [ ] 3.2 Move every mutation that emitted an event to the owning object's RPC method, and every queue consumer that published to it; delete the EventEmitters, the `server` object forward, `/_internal/publish`, the `Scheduler` object and its two queues. Verified by the router and consumer tests.
- [ ] 3.3 Replace the client's subscribables with one connection manager and the event dispatch into the existing store handlers. Verified by the store tests.

## 4.

- [ ] 4.1 Teach the cutover to re-key D1 rows to UUIDv7 through the id map and to import each room's messages into its object in `createdAt` order. Verified by the cutover's mapper tests.

## 5.

- [ ] 5.1 Split `apps/functions` into `apps/realtime` (the three objects) and `apps/jobs` (queue consumers and the cron), rename the packages, the Worker purposes, the wrangler configs, the Pulumi consumers and every path that names them. Verified by each Worker's wrangler test.
