# Esbabbler

The messaging module's own rules — Discord parity, display names through the one resolver, `MessageTypeOperationPermissionMap`, and the rest of the `esbabbler` skill.

| Unit                                                                                                         | Swept | Notes                                   |
| ------------------------------------------------------------------------------------------------------------ | ----- | --------------------------------------- |
| `Message/Model/Message`                                                                                      | —     |                                         |
| `Message/Model/Room`                                                                                         | —     |                                         |
| `Message/Model/User`                                                                                         | —     |                                         |
| `Message/Content`, `Message/LeftSideBar`, `Message/RightSideBar`, `Message/DraftsAndSent`, `Message/Friends` | —     | calls are the `esbabbler-call` ledger's |
| `app/store/message`                                                                                          | —     |                                         |
| `app/composables/message`                                                                                    | —     |                                         |
| `app/services/message`                                                                                       | —     |                                         |
| `server/services/message`, `server/services/room`, `server/services/role`                                    | —     |                                         |
| `server/trpc/routers/message`, `server/trpc/routers/room`                                                    | —     |                                         |
| `packages/db-schema/src/models/message`                                                                      | —     |                                         |
