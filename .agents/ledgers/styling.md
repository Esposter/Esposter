# Styling

What a component looks like rather than how it is composed: attributify props over `class`, theme primitives over bespoke values, the MD3 type set, `rem` over `px`, no hardcoded layout dimensions, `StyledButton` and the shared shells, and the narrow-viewport collapse.

| Unit                                                                                       | Swept      | Notes                                                                              |
| ------------------------------------------------------------------------------------------ | ---------- | ---------------------------------------------------------------------------------- |
| `app/components/Styled`                                                                    | 2026-09-15 | the shared shells                                                                  |
| `app/components/Message/Model/Message`                                                     | 2026-09-15 | the densest surface; the message row and its variants                              |
| `app/components/Message/Model/Room/Settings/Type/Role`, `Webhook`, `Emoji`, `Member`       | 2026-09-15 | the settings panels that own a list and an editor                                  |
| `app/components/Message/Model/Room/Settings/Type` — the rest                               | 2026-09-15 | `Overview`, `Profile`, `AuditLog`, `WordFilter`, `Bans`, `Invite`, `Attachments`   |
| `app/components/Message/Model/Room/Settings` — the shell                                   | 2026-09-15 | the dialog, its sidebar and the shared field                                       |
| `app/components/Message/Model/Room` — the rest                                             | 2026-09-15 | `Create`, `DirectMessage`, `Emoji`, `Invite`, `List`, `Role` and the loose dialogs |
| `app/components/Message/Model/User`                                                        | 2026-09-15 | plus `Member`, `Status`, `RoomCategory`, `Settings`, `FileRenderer`                |
| `app/components/Message/Content/Call` — the media surfaces                                 | 2026-09-15 | `Audio`, `Camera`, `Video`, `ScreenShare`, `VirtualBackground`, `Device`, `Pip`    |
| `app/components/Message/Content/Call` — the session shell                                  | 2026-09-15 | `Control`, `Panel`, `Participant`, `JoinNotice`, `PreJoin`                         |
| `app/components/Message/Content/Call` — the entry surfaces                                 | 2026-09-15 | the loose cards, forms and buttons                                                 |
| `app/components/Message/Content` — the rest                                                | 2026-09-15 | `Header`, `Show` and the room chrome                                               |
| `app/components/Message/RightSideBar`                                                      | 2026-09-15 | the member list, followed threads and search                                       |
| `app/components/Message/DraftsAndSent`                                                     | 2026-09-15 | the three tabs and the schedule dialog                                             |
| `app/components/Message/Friends`, `LeftSideBar`                                            | 2026-09-15 | the friend lists and the room column                                               |
| `app/components/Resource/Sheet`                                                            | 2026-09-15 | the sheet editor's own chrome                                                      |
| `app/components/Resource/List`                                                             | 2026-09-15 |                                                                                    |
| `app/components/Resource` — the per-type editors                                           | 2026-09-15 | `Survey`, `TodoList`, `Note`, `Program`, `Webpage`, `Email`, `Blueprint`           |
| `app/components/Resource` — the entry surfaces                                             | 2026-09-15 | `Home`, `Search`, `Explorer`, `RecycleBin`, `Dashboard`, `Flowchart`               |
| `app/components/Resource` — the shared chrome                                              | 2026-09-15 | `Blade`, `Create`, `VersionHistory` and the loose dialogs                          |
| `app/components/Dungeons`                                                                  | 2026-09-15 | no DOM at all — every template is Phaser game objects                              |
| `app/components/App`, `Nuxt`, `Transition`, `Login`, `Fragment.vue`                        | 2026-09-15 | the chrome                                                                         |
| `app/components/Clicker`                                                                   | 2026-09-15 |                                                                                    |
| `app/components/Visual`                                                                    | 2026-09-15 |                                                                                    |
| `app/components/User`                                                                      | 2026-09-15 |                                                                                    |
| `app/components/Docs`                                                                      | 2026-09-15 | the docs site's own chrome                                                         |
| `app/components/Dashboard`, `Achievement`                                                  | 2026-09-15 |                                                                                    |
| `app/components/FlowchartEditor`, `RichTextEditor`, `Anime`, `Dataset`, `About`, `content` | 2026-09-15 |                                                                                    |
| `app/pages`, `app/layouts`                                                                 | 2026-09-15 | page-level layout; region sizing and the sidebar/panel rules                       |
| `app/**/*.scss`, `uno.config.ts`                                                           | 2026-09-15 | the style blocks and the UnoCSS rule set behind the attributify vocabulary         |

## Exclusions

- Component granularity, extraction and page composition — `vue-components`, over the same files. Different owning skills, so the split is deliberate.
- Placement and reachability — `ux`, likewise.
- `app/components/Dungeons` canvas internals: Phaser draw calls are not DOM styling. Only the Vue chrome around them is in scope.
- The three files that keep `px` — the vendored ApexCharts sample SVGs, Vuetify's SASS breakpoint map, a vendored
  SVG's own fills — are the exclusion list of `apps/web/app/templates.test.ts`, which is the enforcer for that rule.
- A length a third-party API owns rather than CSS: `NodeResizer`'s flow coordinates, `useDocumentPictureInPicture`'s
  window box, Phaser's scale. The dimension recipes report all three every run and none of them is a finding —
  the unit there is the library's, which is the `px` rule's own stated exception.

## Find recipe

Everything a program can decide about a template is `apps/web/app/templates.test.ts` and the UnoCSS blocklist
(below). What is left to read is where `class` stands in for an attribute, and the survivors should be scoped
refs, dynamic bindings or third-party selectors:

```bash
grep -rn 'class="' --include=*.vue apps/web/app/components
```

## Not enforceable — settled

What a program decides here it now decides: a second spelling of a utility family and every Vuetify helper
class written as an attribute are `BLOCKED_SPELLINGS` in `apps/web/uno.config.ts`, which the generator refuses and
`unocss/blocklist` reports; a valueless attribute on a **native** element that generates no rule, a utility bound
to `'' : undefined`, a bare bracket attribute, the
`text-hint` pair written out, a Vuetify global default restated on an instance, a Vuetify length given a bare
number, a `px` length outside the three vendored files and a bare custom property inside a colour function are
`apps/web/app/templates.test.ts`. What is left stays a reading pass, for these reasons:

- An attribute on a **component** that generates nothing is as likely to be one of that component's props as a
  misspelt utility, and telling the two apart needs the component's prop list, which no extraction of the
  template has. The blocklist carries every inert family met so far, so the miss is a typo nobody has made yet.
- Theme primitive vs bespoke colour needs the palette in mind and a judgement about intent.
- A fixed dimension on a layout region is a judgement about what a region is.
