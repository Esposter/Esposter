# Messaging

| Unit                                                                                      | Swept      | Notes                                                                                                                                     |
| ----------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `store/message`                                                                           | 2026-08-09 |                                                                                                                                           |
| `Message/Model/Message`                                                                   | 2026-08-10 | `getSuggestionListTitle`, `getFileCornerStyle`, `useFocusWhenActive`, `setCurrentRoomId` test helper                                      |
| `Message/Model/Room`                                                                      | 2026-08-10 | `Styled/SkeletonListItem`, `Room/BaseListItem`, `Settings/Field`, `DetailPlaceholder`; two behaviour fixes                                |
| `Message/Model/User`                                                                      | 2026-08-10 | Profile card resolved through `getDisplayName`; three device-select wrappers deleted; activator stacks onto the Styled primitives         |
| `Message/Model`                                                                           | —          | `FileRenderer`, `Member`, `RoomCategory`, `Status`; `Settings` done — one `Settings/Header.vue`, Room adopting the shell's `#header` slot |
| `Message/Content`                                                                         | —          | composer + message list                                                                                                                   |
| `Message/DraftsAndSent`, `Message/RightSideBar`, `Message/LeftSideBar`, `Message/Friends` | —          |                                                                                                                                           |
| `app/composables/message`                                                                 | —          | `room/` and `subscribables/` are half of it                                                                                               |
| `app/services/message`                                                                    | —          |                                                                                                                                           |

`Message/Model` is two-thirds of `app/components/Message`, so the units split at its sub-directories.
