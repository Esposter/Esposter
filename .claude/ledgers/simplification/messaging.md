# Messaging

| Unit                                                                                      | Swept      | Notes                                                          |
| ----------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------- |
| `store/message`                                                                           | 2026-08-09 |                                                                |
| `Message/Model/Message`                                                                   | —          | the message row and its parts                                  |
| `Message/Model/Room`                                                                      | —          |                                                                |
| `Message/Model/User`                                                                      | —          | profile, presence, member surfaces                             |
| `Message/Model`                                                                           | —          | `FileRenderer`, `Member`, `RoomCategory`, `Settings`, `Status` |
| `Message/Content`                                                                         | —          | composer + message list                                        |
| `Message/DraftsAndSent`, `Message/RightSideBar`, `Message/LeftSideBar`, `Message/Friends` | —          |                                                                |
| `app/composables/message`                                                                 | —          | `room/` and `subscribables/` are half of it                    |
| `app/services/message`                                                                    | —          |                                                                |

`Message/Model` is two thirds of `app/components/Message`, so the units split at its sub-directories.
