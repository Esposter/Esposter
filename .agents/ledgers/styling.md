# Styling

What a component looks like rather than how it is composed: attributify props over `class`, theme primitives over bespoke values, the type set, `rem` over `px`, no hardcoded layout dimensions, the library's buttons and the shared shells, and occasional commands in one overflow menu.

| Unit                                                                                 | Notes                                                                              |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `app/components/Styled`                                                              | the shared shells                                                                  |
| `app/components/Message/Model/Message`                                               | the densest surface; the message row and its variants                              |
| `app/components/Message/Model/Room/Settings/Type/Role`, `Webhook`, `Emoji`, `Member` | the settings panels that own a list and an editor                                  |
| `app/components/Message/Model/Room/Settings/Type` — the rest                         | `Overview`, `Profile`, `AuditLog`, `WordFilter`, `Bans`, `Invite`, `Attachments`   |
| `app/components/Message/Model/Room/Settings` — the shell                             | the dialog, its sidebar and the shared field                                       |
| `app/components/Message/Model/Room` — the rest                                       | `Create`, `DirectMessage`, `Emoji`, `Invite`, `List`, `Role` and the loose dialogs |
| `app/components/Message/Model/User`                                                  | plus `Member`, `Status`, `RoomCategory`, `Settings`, `FileRenderer`                |
| `app/components/Message/Content/Call` — the media surfaces                           | `Audio`, `Camera`, `Video`, `ScreenShare`, `VirtualBackground`, `Device`, `Pip`    |
| `app/components/Message/Content/Call` — the session shell                            | `Control`, `Panel`, `Participant`, `JoinNotice`, `PreJoin`                         |
| `app/components/Message/Content/Call` — the entry surfaces                           | the loose cards, forms and buttons                                                 |
| `app/components/Message/Content` — the rest                                          | `Header`, `Show` and the room chrome                                               |
| `app/components/Message/RightSideBar`                                                | the member list, followed threads and search                                       |
| `app/components/Message/DraftsAndSent`                                               | the three tabs and the schedule dialog                                             |
| `app/components/Message/Friends`, `LeftSideBar`                                      | the friend lists and the room column                                               |
| `app/components/Resource/Sheet`                                                      | the sheet editor's own chrome                                                      |
| `app/components/Resource/List`                                                       |                                                                                    |
| `app/components/Resource` — the per-type editors                                     | `Survey`, `TodoList`, `Note`, `Program`, `Webpage`, `Email`, `Blueprint`           |
| `app/components/Resource` — the entry surfaces                                       | `Home`, `Search`, `Explorer`, `RecycleBin`, `Dashboard`                            |
| `app/components/Resource` — the shared chrome                                        | `Blade`, `Create`, `VersionHistory` and the loose dialogs                          |
| `app/components/Dungeons`                                                            | no DOM at all — every template is Phaser game objects                              |
| `app/components/App`, `Nuxt`, `Transition`, `Login`                                  | the chrome                                                                         |
| `app/components/Clicker`                                                             |                                                                                    |
| `app/components/Visual`                                                              |                                                                                    |
| `app/components/User`                                                                |                                                                                    |
| `app/components/Dashboard`, `Achievement`                                            |                                                                                    |
| `RichTextEditor`, `Anime`, `Dataset`, `About`, `content`                             |                                                                                    |
| `app/pages`, `app/layouts`                                                           | page-level layout; region sizing and the sidebar/panel rules                       |
| `uno.config.ts`                                                                      | the UnoCSS rule set behind the attributify vocabulary                              |
| `app/components/Ui`                                                                  |                                                                                    |

## Exclusions

- Component granularity, extraction and page composition — `vue-components`, over the same files. Different owning skills, so the split is deliberate.
- Placement and reachability — `ux`, likewise.
- `app/components/Dungeons` canvas internals: Phaser draw calls are not DOM styling. Only the Vue chrome around them is in scope.
- The files that keep `px` — the vendored ApexCharts sample SVGs — are the exclusion list of
  `apps/web/app/templates.test.ts`, which is the enforcer for that rule.
- A length a third-party API owns rather than CSS: `useDocumentPictureInPicture`'s window box, Phaser's scale. The
  dimension recipes report both every run and none of them is a finding —
  the unit there is the library's, which is the `px` rule's own stated exception.

## Find recipe

Everything a program can decide about a template is `apps/web/app/templates.test.ts` and the UnoCSS blocklist
(below). What is left to read is where `class` stands in for an attribute, and the survivors should be scoped
refs, dynamic bindings or third-party selectors:

```bash
grep -rn 'class="' --include=*.vue apps/web/app/components
```
