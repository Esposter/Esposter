# Esbabbler Calls

The call row and its in-memory participant maps, the id through `createId`, standalone and room calls, the four leave boundaries, and which store owns what.

| Unit                                                                                                                                 | Swept | Notes |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----- | ----- |
| `app/store/message/room/call`, `app/store/message/room/liveKit.ts`                                                                   | —     |       |
| `app/composables/message/room/call`                                                                                                  | —     |       |
| `app/services/message/room/call`, `app/services/message/room/liveKit`                                                                | —     |       |
| `Message/Content/Call` — the roots, `Control`, `Panel`, `PreJoin`, `JoinNotice`                                                      | —     |       |
| `Message/Content/Call` — `Participant`, `PictureInPicture`, `ScreenShare`, `Video`, `Audio`, `Camera`, `Device`, `VirtualBackground` | —     |       |
| `server/services/message/call`                                                                                                       | —     |       |
| `server/services/livekit`, `server/trpc/routers/call`, `server/api/webhooks`                                                         | —     |       |
| `pages/calls` and the call models in `app`, `server` and `shared`                                                                    | —     |       |
