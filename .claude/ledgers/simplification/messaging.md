# Messaging

| Unit                                                                                      | Swept      | Notes                                                                                                                             |
| ----------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `store/message`                                                                           | 2026-08-09 |                                                                                                                                   |
| `Message/Model/Message`                                                                   | 2026-08-10 | `getSuggestionListTitle`, `getFileCornerStyle`, `useFocusWhenActive`, `setCurrentRoomId` test helper                              |
| `Message/Model/Room`                                                                      | 2026-08-10 | `Styled/SkeletonListItem`, `Room/BaseListItem`, `Settings/Field`, `DetailPlaceholder`; two behaviour fixes below                  |
| `Message/Model/User`                                                                      | 2026-08-10 | Profile card resolved through `getDisplayName`; three device-select wrappers deleted; activator stacks onto the Styled primitives |
| `Message/Model`                                                                           | —          | `FileRenderer`, `Member`, `RoomCategory`, `Settings`, `Status`                                                                    |
| `Message/Content`                                                                         | —          | composer + message list                                                                                                           |
| `Message/DraftsAndSent`, `Message/RightSideBar`, `Message/LeftSideBar`, `Message/Friends` | —          |                                                                                                                                   |
| `app/composables/message`                                                                 | —          | `room/` and `subscribables/` are half of it                                                                                       |
| `app/services/message`                                                                    | —          |                                                                                                                                   |

`Message/Model` is two-thirds of `app/components/Message`, so the units split at its sub-directories.

## Open findings

- `Room/Settings/Content.vue` mounts its header `sticky` inside the scroll container while
  `User/Settings/Content.vue` uses the shared shell's `#header` slot outside it. Unifying is a decision between
  two scroll behaviours, not a cleanup — the recommendation is that Room adopts the `#header` slot the shell
  already declares, after which a shared `Message/Model/Settings/Header.vue` is trivial.
- `Forward/RoomDialog` builds its own `v-dialog` + `StyledCard` shell because its search field is pinned above
  the scroll region and `StyledDialog`'s body is a single scroll block. Blocked on `StyledDialog` growing a
  pinned-header slot; until then the bespoke shell is correct, not an omission.
