# Esbabbler Calls

The call row and its in-memory participant maps, the id through `createId`, standalone and room calls, the four leave boundaries, and which store owns what.

| Unit                                                                                                                                 | Swept                 | Notes |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | ----- |
| `app/store/message/room/call`, `app/store/message/room/liveKit.ts`                                                                   | 2026-09-25 · Opus 5.5 |       |
| `app/composables/message/room/call`                                                                                                  | 2026-09-25 · Opus 5.5 |       |
| `app/services/message/room/call`, `app/services/message/room/liveKit`                                                                | 2026-09-25 · Opus 5.5 |       |
| `Message/Content/Call` — the roots, `Control`, `Panel`, `PreJoin`, `JoinNotice`                                                      | 2026-09-25 · Opus 5.5 |       |
| `Message/Content/Call` — `Participant`, `PictureInPicture`, `ScreenShare`, `Video`, `Audio`, `Camera`, `Device`, `VirtualBackground` | 2026-09-25 · Opus 5.5 |       |
| `server/services/message/call`                                                                                                       | 2026-09-25 · Opus 5.5 |       |
| `server/services/livekit`, `server/trpc/routers/call`, `server/api/webhooks`                                                         | 2026-09-25 · Opus 5.5 |       |
| `pages/calls` and the call models in `app`, `server` and `shared`                                                                    | 2026-09-25 · Opus 5.5 |       |
