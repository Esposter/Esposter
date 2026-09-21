# Messaging

Esbabbler — its components, store, composables, services and models.

| Unit                                                                                     | Swept      | Notes                                                                             |
| ---------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------- |
| `app/store/message/room`                                                                 | 2026-09-21 |                                                                                   |
| `app/store/message/user`, `ui`, `search`                                                 | 2026-09-21 |                                                                                   |
| `app/store/message/input`, `moderation`, `file`, `draftsAndSent`                         | 2026-09-21 |                                                                                   |
| `app/store/message` — the top level                                                      | 2026-09-21 |                                                                                   |
| `app/composables/message/room/call`                                                      | 2026-09-21 |                                                                                   |
| `app/composables/message/room` — the rest                                                | 2026-09-21 |                                                                                   |
| `app/composables/message/subscribables`                                                  | 2026-09-21 | the live-update handlers                                                          |
| `app/composables/message/message`, `moderation`, `draftsAndSent`                         | 2026-09-21 |                                                                                   |
| `app/composables/message` — the composer family                                          | 2026-09-21 | editor, composer, slashCommand, suggestion, mentions, emoji                       |
| `app/composables/message` — the rest                                                     | 2026-09-21 | user, file, search, typing, thread, poll and the top level                        |
| `app/services/message/emoji`                                                             | 2026-09-21 |                                                                                   |
| `app/services/message/room`                                                              | 2026-09-21 |                                                                                   |
| `app/services/message` — the top level                                                   | 2026-09-21 |                                                                                   |
| `app/services/message/moderation`, `user`, `draftsAndSent`                               | 2026-09-21 |                                                                                   |
| `app/services/message/settings`, `filter`, `file`, `slashCommands`                       | 2026-09-21 |                                                                                   |
| `app/services/message` — the small trees                                                 | 2026-09-21 | roomCategory, poll, member, composer, ui, subscribables, friend, editor, draft    |
| `app/models/message/emoji`, `user`                                                       | 2026-09-21 |                                                                                   |
| `app/models/message/room`, `slashCommands`, `file`, `draftsAndSent`, `input`             | 2026-09-21 |                                                                                   |
| `app/models/message` — the top level                                                     | 2026-09-21 |                                                                                   |
| `app/components/Message/Model/Message/Input`                                             | 2026-09-21 |                                                                                   |
| `app/components/Message/Model/Message/Type`                                              | 2026-09-21 | one component per message type                                                    |
| `app/components/Message/Model/Message/File`, `List`, `Emoji`                             | 2026-09-21 |                                                                                   |
| `app/components/Message/Model/Message/Suggestion`, `OptionsMenu`, `LinkPreview`, `Reply` | 2026-09-21 |                                                                                   |
| `app/components/Message/Model/Message` — the top level and the dialogs                   | 2026-09-21 | ReactionsDialog, Forward, Search                                                  |
| `app/components/Message/Model/Room/Settings/Type/Role`, `Webhook`                        | 2026-09-21 |                                                                                   |
| `app/components/Message/Model/Room/Settings/Type/Overview`, `Member`, `Emoji`            | 2026-09-21 |                                                                                   |
| `app/components/Message/Model/Room/Settings/Type` — the rest                             | 2026-09-21 | WordFilter, Profile, AuditLog, Bans, Invite, Attachments and the top level        |
| `app/components/Message/Model/Room/Settings` — the top level                             | 2026-09-21 |                                                                                   |
| `app/components/Message/Model/Room` — the top level and the rest                         | 2026-09-21 | List, Invite, DirectMessage, Create, Emoji, Role                                  |
| `app/components/Message/Model/User/Settings`                                             | 2026-09-21 |                                                                                   |
| `app/components/Message/Model/User/ProfileCard`                                          | 2026-09-21 |                                                                                   |
| `app/components/Message/Model` — the rest                                                | 2026-09-21 | FileRenderer, Settings, RoomCategory, Member, Status                              |
| `app/components/Message/Content/Call/Control`, `Pip`, `Participant`, `Audio`             | 2026-09-21 |                                                                                   |
| `app/components/Message/Content/Call` — the top level and the rest                       | 2026-09-21 | ScreenShare, PreJoin, Panel, Video, JoinNotice, VirtualBackground, Device, Camera |
| `app/components/Message/Content` — outside `Call`                                        | 2026-09-21 | Header, Show and the top level                                                    |
| `app/components/Message/RightSideBar`                                                    | 2026-09-21 |                                                                                   |
| `app/components/Message/DraftsAndSent`                                                   | 2026-09-21 |                                                                                   |
| `app/components/Message/Friends`, `LeftSideBar`                                          | 2026-09-21 |                                                                                   |
