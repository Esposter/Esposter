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

## Settled

- `Forward/RoomDialog` keeps its own `v-dialog` + `StyledCard` shell. `StyledDialog` grew the `#header` slot
  this was originally waiting on, but the pinned region this dialog needs is a **footer** — a message preview
  and a rich-text editor stacked full-width above a full-width send button, between the scroll block and the
  actions row. Nothing else in the app wants one, and a slot that earns its existence from a single consumer
  is the flag the `file-organization` skill rules out. Revisit if a second dialog needs the same region.
