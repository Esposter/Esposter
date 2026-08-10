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

`Message/Model` is two thirds of `app/components/Message`, so the units split at its sub-directories.

## Open findings

- The timeline renders `creator.name` raw in seven places while the member sidebar and settings list resolve through
  `getDisplayName(user, roomId)`, so a room nickname shows in one surface and not the other. The fix belongs in
  `useCreator` (`app/composables/message`), and the `Message/Model/User` pass has already established the shape it
  should take — `getDisplayName(user, roomId)` at the point of render.
- `Room/Settings/Content.vue` and `User/Settings/Content.vue` are the same header, diverged: Room mounts it `sticky`
  inside the scroll container, User in the `#header` slot outside it, and Room emits `close`/`open:drawer` up where
  User reads the dialog store directly. A shared `Message/Model/Settings/Header.vue` is the obvious home, but
  unifying picks a winner between two scroll behaviours. The same two files' `:deep(.v-list-group__items)` rule is
  byte-identical and belongs on the shared `Message/Model/Settings/LeftSideBar.vue`.
- `ProfileCard/Index.vue` reads `$trpc.room.readMutualRooms` with a bare top-level `await` rather than `useQuery`,
  which the `trpc` skill requires for every client read. The fix needs the value at setup time, so it is a shape
  change rather than a swap.
- `Forward/RoomDialog` resolves its target with its own computed rather than passing it to `useSingletonDialog`, so a
  forward target whose message leaves the timeline keeps `forwardStore.rowKey` set and re-opens when a later read
  brings it back — the bug the primitive's reconciliation exists to prevent. Adopting it changes behaviour. The
  second occurrence (`Room/Settings/Dialog`) was fixed in the `Message/Model/Room` pass and the rule now lives in
  `vue-page-composition/references/singleton-dialogs.md`, so this is the last known site rather than a class.
- `Room/Settings/Type/Overview/Index` and `Attachments/Index` duplicate the whole optimistic room-save block
  (`executeMutation` + a hand-built snapshot of exactly the written keys + `storeUpdateRoom`). Every extraction shape
  tried needs key-level casts to rebuild the snapshot generically; it wants a typed `pickKeys` primitive first.
- `Message/LeftSideBar/Rooms` and `DirectMessages` duplicate the collapsible sidebar header `v-list-item` verbatim.
- `Message/RightSideBar/Search/Header` still hand-rolls `result{{ count === 1 ? "" : "s" }}`; `pluralize` is now the
  rule (`string-utils`).
- `Type/Index` re-implements the message body inside its `isForward` branch, so a forwarded message silently loses the
  `(edited)` marker and the slot that carries the inline editor. Sharing one body component changes what renders.
- `Type/Call`, `Type/EditRoom`, `Type/PinMessage` and `Type/System` are four copies of one system-line shell that have
  already diverged (`op-medium-emphasis` against `text-gray`); unifying them settles which one is right.
- The three suggestion popovers use two different surfaces for one piece of chrome — `Suggestion/EmojiList` and
  `Suggestion/SlashCommandList` open a bare `v-sheet`, `Suggestion/MentionList` a `StyledCard`.
- `Forward/RoomDialog` builds its own dialog shell out of `v-dialog` + `StyledCard` instead of `StyledDialog`.
- `ScheduledMessageJobDialog` picks its icon with a literal that disagrees with `getScheduledMessageJobIcon`, which
  already owns the type-to-icon decision for the sent list.
- The `useRouter` + `triggerRef` route setup now behind `setCurrentRoomId` is still written out by hand in ten other
  test files across `store/`, `composables/` and `Room/Settings/`.
