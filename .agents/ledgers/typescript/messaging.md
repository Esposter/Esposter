# Messaging

| Unit                                                                                     | Swept | Notes                                                                             |
| ---------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------------------------------- |
| `app/store/message/room`                                                                 | —     |                                                                                   |
| `app/store/message/user`, `ui`, `search`                                                 | —     |                                                                                   |
| `app/store/message/input`, `moderation`, `file`, `draftsAndSent`                         | —     |                                                                                   |
| `app/store/message` — the top level                                                      | —     |                                                                                   |
| `app/composables/message/room/call`                                                      | —     |                                                                                   |
| `app/composables/message/room` — the rest                                                | —     |                                                                                   |
| `app/composables/message/subscribables`                                                  | —     | the live-update handlers                                                          |
| `app/composables/message/message`, `moderation`, `draftsAndSent`                         | —     |                                                                                   |
| `app/composables/message` — the composer family                                          | —     | editor, composer, slashCommand, suggestion, mentions, emoji                       |
| `app/composables/message` — the rest                                                     | —     | user, file, search, typing, thread, poll and the top level                        |
| `app/services/message/emoji`                                                             | —     |                                                                                   |
| `app/services/message/room`                                                              | —     |                                                                                   |
| `app/services/message` — the top level                                                   | —     |                                                                                   |
| `app/services/message/moderation`, `user`, `draftsAndSent`                               | —     |                                                                                   |
| `app/services/message/settings`, `filter`, `file`, `slashCommands`                       | —     |                                                                                   |
| `app/services/message` — the small trees                                                 | —     | roomCategory, poll, member, composer, ui, subscribables, friend, editor, draft    |
| `app/models/message/emoji`, `user`                                                       | —     |                                                                                   |
| `app/models/message/room`, `slashCommands`, `file`, `draftsAndSent`, `input`             | —     |                                                                                   |
| `app/models/message` — the top level                                                     | —     |                                                                                   |
| `app/components/Message/Model/Message/Input`                                             | —     |                                                                                   |
| `app/components/Message/Model/Message/Type`                                              | —     | one component per message type                                                    |
| `app/components/Message/Model/Message/File`, `List`, `Emoji`                             | —     |                                                                                   |
| `app/components/Message/Model/Message/Suggestion`, `OptionsMenu`, `LinkPreview`, `Reply` | —     |                                                                                   |
| `app/components/Message/Model/Message` — the top level and the dialogs                   | —     | ReactionsDialog, Forward, Search                                                  |
| `app/components/Message/Model/Room/Settings/Type/Role`, `Webhook`                        | —     |                                                                                   |
| `app/components/Message/Model/Room/Settings/Type/Overview`, `Member`, `Emoji`            | —     |                                                                                   |
| `app/components/Message/Model/Room/Settings/Type` — the rest                             | —     | WordFilter, Profile, AuditLog, Bans, Invite, Attachments and the top level        |
| `app/components/Message/Model/Room/Settings` — the top level                             | —     |                                                                                   |
| `app/components/Message/Model/Room` — the top level and the rest                         | —     | List, Invite, DirectMessage, Create, Emoji, Role                                  |
| `app/components/Message/Model/User/Settings`                                             | —     |                                                                                   |
| `app/components/Message/Model/User/ProfileCard`                                          | —     |                                                                                   |
| `app/components/Message/Model` — the rest                                                | —     | FileRenderer, Settings, RoomCategory, Member, Status                              |
| `app/components/Message/Content/Call/Control`, `Pip`, `Participant`, `Audio`             | —     |                                                                                   |
| `app/components/Message/Content/Call` — the top level and the rest                       | —     | ScreenShare, PreJoin, Panel, Video, JoinNotice, VirtualBackground, Device, Camera |
| `app/components/Message/Content` — outside `Call`                                        | —     | Header, Show and the top level                                                    |
| `app/components/Message/RightSideBar`                                                    | —     |                                                                                   |
| `app/components/Message/DraftsAndSent`                                                   | —     |                                                                                   |
| `app/components/Message/Friends`, `LeftSideBar`                                          | —     |                                                                                   |
