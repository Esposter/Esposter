# UX

Placement and reachability, carried across the surfaces built before the rules were written. Standing: a unit's
date says the rules held there on that date, and the pass resumes from the files changed since.

Nothing here is lint-checkable. A feature reachable only from settings typechecks and passes every test — it is
wrong only from a seat in front of it — so this ledger is the only thing that finds it.

## Rules

| Rule                                                                       | Owner              |
| -------------------------------------------------------------------------- | ------------------ |
| Point-of-need entry point beside the management one                        | `ux` skill         |
| Settings panels configure and manage; creation forms move to dialogs       | `ux` skill         |
| One dialog shared by every surface that creates the same thing             | `ux` skill         |
| Standing controls are never displaced by a transient value                 | `ux` skill         |
| Reference-product wording, layout and interaction where the domain matches | `ux` skill         |
| A management surface exists only where its actions can succeed             | `ux` skill         |
| A button whose write waits on the server says so through `is-pending`      | `ui-library` skill |

## What a pass asks of each unit

For every feature the unit owns: **when does someone first want this?** If the only way to reach it from that
moment is a trip to settings, the entry point is missing. Then, for every settings panel the unit owns: is anything
in it a creation form rather than configuration?

Then the question the first two do not ask: **does the reference product ship this, and is its arrangement better
than ours?** Reachability can be right while the surface a reader arrives at is still the worse version of a screen
Discord or Slack already solved — the same state, the same permissions, a worse layout. That is a finding here, and
a better arrangement of our own is an acceptable answer to it, as long as a comment says what it departed from.

Last, for every button the unit owns that fires a write: **does the write change what the reader sees before the
server answers?** If not, and the button is not a dialog's answer, it binds `is-pending`.

## Find recipe

```bash
rg -n -A12 '<Ui(Icon)?Button\b' apps/web/app/components apps/web/app/pages -g '*.vue' | rg -i '@click="(async|.*(save|delete|remove|create|update|submit|send|revoke|publish|upload|import|generate|restore|leave|join|accept|decline))' | rg -v 'is-pending|isOpen = |Open = true|open[A-Z]\w*\('
```

Each hit is a question, not a finding: read the write it calls for an optimistic entry or a local-only change.

## Coverage

| Unit                                                                      | Swept                  | Notes                                                                                                                                                                                       |
| ------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| custom emoji                                                              | 2026-11-22 · Haiku 5.5 | `components/Message/Model/Room/Emoji` and `components/Message/Model/Room/Settings/Type/Emoji`; the emoji picker mounts the one create dialog                                                |
| the rest of room settings — roles                                         | —                      | `components/Message/Model/Room/Settings/Type/Role`                                                                                                                                          |
| the rest of room settings — webhooks, word filter, bans                   | —                      | `components/Message/Model/Room/Settings/Type/{Webhook,WordFilter,Bans}`                                                                                                                     |
| the rest of room settings — overview, profile, attachments, audit log     | —                      | `components/Message/Model/Room/Settings/Type/{Overview,Profile,Attachments,AuditLog}`                                                                                                       |
| the rest of room settings — the remaining panels                          | —                      | `components/Message/Model/Room/Settings` direct files, `LeftSideBar`, `Type/Invite`, `Type/Member` and `Type` direct files; which panels a member may see is a gate map with a test over it |
| messaging — composer                                                      | —                      | `components/Message/Model/Message/Input`; a dialog's composer entry and its slash command share one execute switch and one icon                                                             |
| messaging — message types                                                 | —                      | `components/Message/Model/Message/Type`                                                                                                                                                     |
| messaging — reactions and suggestions                                     | —                      | `components/Message/Model/Message/{Emoji,ReactionsDialog,Suggestion}`                                                                                                                       |
| messaging — files, link previews, forwarding, replies, search             | —                      | `components/Message/Model/Message/{File,LinkPreview,Forward,Reply,Search}`                                                                                                                  |
| messaging — message list, options menu and the module's own files         | —                      | `components/Message/Model/Message/{List,OptionsMenu}` and the files directly in `Message`                                                                                                   |
| messaging — rooms, invites, roles, moderation                             | —                      | the role toggle is one component over one composable, so no surface reads hierarchy itself                                                                                                  |
| calls — audio, camera, controls and devices                               | —                      | `components/Message/Content/Call/{Audio,Camera,Control,Device}`                                                                                                                             |
| calls — pre-join, join notice and panel                                   | 2026-11-22 · Haiku 5.5 | `components/Message/Content/Call/{PreJoin,JoinNotice,Panel}`                                                                                                                                |
| calls — participants, picture-in-picture, screen share, video, background | —                      | `components/Message/Content/Call/{Participant,PictureInPicture,ScreenShare,Video,VirtualBackground}`                                                                                        |
| calls — the module's own files and the calls page                         | 2026-11-22 · Haiku 5.5 | `components/Message/Content/Call` direct files and `pages/calls`                                                                                                                            |
| resource explorer — blades and the service menu                           | —                      |                                                                                                                                                                                             |
| resource editors — sheet rows                                             | —                      | `components/Resource/Sheet/Row`                                                                                                                                                             |
| resource editors — sheet columns, find and replace                        | —                      | `components/Resource/Sheet/{Column,FindReplace}`                                                                                                                                            |
| resource editors — sheet dialogs, toolbar and the sheet's own files       | —                      | `components/Resource/Sheet` direct files and `{Toolbar,EditDialog,ExportDialog}`; the sheet's Settings blade is its data-source configuration and nothing else                              |
| resource editors — dashboard editor                                       | —                      | `components/Dashboard/Editor`                                                                                                                                                               |
| resource editors — dashboard visual widgets                               | —                      | `components/Dashboard/Visual`                                                                                                                                                               |
| resource editors — dashboard grid, palette and page                       | —                      | `components/Dashboard` direct files, `{Grid,Palette}` and `components/Resource/Dashboard`                                                                                                   |
| user settings and profile — profile card and the user page                | —                      | `components/Message/Model/User/ProfileCard` and `pages/user`; the settings dialog and `/user/settings` render the same cards rather than two forms                                          |
| user settings — account, appearance, keybinds, notifications              | —                      | `components/Message/Model/User/Settings` direct files and `Type/{Account,Appearance,Keybinds,Notifications}`                                                                                |
| user settings — voice                                                     | —                      | `components/Message/Model/User/Settings/Type/Voice`                                                                                                                                         |
| user components — the settings dialog, profile and cards                  | —                      | `components/User`                                                                                                                                                                           |
| posts and achievements                                                    | —                      | the reference products here are Reddit and GitHub                                                                                                                                           |
