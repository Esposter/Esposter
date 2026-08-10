# Messaging

| Unit                                                                                      | Swept      | Notes                                                                                                |
| ----------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| `store/message`                                                                           | 2026-08-09 |                                                                                                      |
| `Message/Model/Message`                                                                   | 2026-08-10 | `getSuggestionListTitle`, `getFileCornerStyle`, `useFocusWhenActive`, `setCurrentRoomId` test helper |
| `Message/Model/Room`                                                                      | —          |                                                                                                      |
| `Message/Model/User`                                                                      | —          | profile, presence, member surfaces                                                                   |
| `Message/Model`                                                                           | —          | `FileRenderer`, `Member`, `RoomCategory`, `Settings`, `Status`                                       |
| `Message/Content`                                                                         | —          | composer + message list                                                                              |
| `Message/DraftsAndSent`, `Message/RightSideBar`, `Message/LeftSideBar`, `Message/Friends` | —          |                                                                                                      |
| `app/composables/message`                                                                 | —          | `room/` and `subscribables/` are half of it                                                          |
| `app/services/message`                                                                    | —          |                                                                                                      |

`Message/Model` is two thirds of `app/components/Message`, so the units split at its sub-directories.

## Open findings

- The timeline renders `creator.name` raw in seven places while the member sidebar and settings list resolve through
  `getDisplayName(user, roomId)`, so a room nickname shows in one surface and not the other. The fix belongs in
  `useCreator`, outside this unit.
- `Forward/RoomDialog` resolves its target with its own computed rather than passing it to `useSingletonDialog`, so a
  forward target whose message leaves the timeline keeps `forwardStore.rowKey` set and re-opens when a later read
  brings it back — the bug the primitive's reconciliation exists to prevent. Adopting it changes behaviour.
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
