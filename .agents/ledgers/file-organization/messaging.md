# Messaging

| Unit                                         | Notes                                                          |
| -------------------------------------------- | -------------------------------------------------------------- |
| `apps/web/app/components/Message/Model/User` | `FileRenderer`, `Settings`, `RoomCategory`, `Status`, `Member` |

Notes on a tree several units share:

- `apps/web/app/models/message`: a type derived from a services map is a type-only import, not a move
- `apps/web/app/components/Message` — `Content`, `DraftsAndSent`, `Friends`, the side bars: the stray-component half is `components/index.test.ts`, not a pass
