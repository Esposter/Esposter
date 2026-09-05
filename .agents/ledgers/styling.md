# Styling

What a component looks like rather than how it is composed: attributify props over `class`, theme primitives over bespoke values, the MD3 type set, `rem` over `px`, no hardcoded layout dimensions, `StyledButton` and the shared shells, and the narrow-viewport collapse.

| Unit                                                                                       | Swept      | Notes                                                                              |
| ------------------------------------------------------------------------------------------ | ---------- | ---------------------------------------------------------------------------------- |
| `app/components/Styled`                                                                    | 2026-09-05 | the shared shells                                                                  |
| `app/components/Message/Model/Message`                                                     | 2026-09-05 | the densest surface; the message row and its variants                              |
| `app/components/Message/Model/Room/Settings/Type/Role`, `Webhook`, `Emoji`, `Member`       | 2026-09-05 | the settings panels that own a list and an editor                                  |
| `app/components/Message/Model/Room/Settings/Type` — the rest                               | —          | `Overview`, `Profile`, `AuditLog`, `WordFilter`, `Bans`, `Invite`, `Attachments`   |
| `app/components/Message/Model/Room/Settings` — the shell                                   | 2026-09-05 | the dialog, its sidebar and the shared field                                       |
| `app/components/Message/Model/Room` — the rest                                             | —          | `Create`, `DirectMessage`, `Emoji`, `Invite`, `List`, `Role` and the loose dialogs |
| `app/components/Message/Model/User`                                                        | —          | plus `Member`, `Status`, `RoomCategory`, `Settings`, `FileRenderer`                |
| `app/components/Message/Content/Call` — the media surfaces                                 | 2026-09-05 | `Audio`, `Camera`, `Video`, `ScreenShare`, `VirtualBackground`, `Device`, `Pip`    |
| `app/components/Message/Content/Call` — the session shell                                  | —          | `Control`, `Panel`, `Participant`, `JoinNotice`, `PreJoin`                         |
| `app/components/Message/Content/Call` — the entry surfaces                                 | 2026-09-05 | the loose cards, forms and buttons                                                 |
| `app/components/Message/Content` — the rest                                                | —          | `Header`, `Show` and the room chrome                                               |
| `app/components/Message` — the rest                                                        | —          | `RightSideBar`, `DraftsAndSent`, `Friends`, `LeftSideBar`                          |
| `app/components/Resource/Sheet`                                                            | —          | the sheet editor's own chrome                                                      |
| `app/components/Resource/List`                                                             | —          |                                                                                    |
| `app/components/Resource` — the per-type editors                                           | —          | `Survey`, `TodoList`, `Note`, `Program`, `Webpage`, `Email`, `Blueprint`           |
| `app/components/Resource` — the entry surfaces                                             | —          | `Home`, `Search`, `Explorer`, `RecycleBin`, `Dashboard`, `Flowchart`               |
| `app/components/Resource` — the shared chrome                                              | —          | `Blade`, `Create`, `VersionHistory` and the loose dialogs                          |
| `app/components/Dungeons`                                                                  | —          | canvas-adjacent; much of it is Phaser rather than DOM                              |
| `app/components/App`, `Nuxt`, `Transition`, `Login`, `Fragment.vue`                        | 2026-09-05 | the chrome                                                                         |
| `app/components/Clicker`                                                                   | —          |                                                                                    |
| `app/components/Visual`                                                                    | 2026-09-05 |                                                                                    |
| `app/components/User`                                                                      | 2026-09-05 |                                                                                    |
| `app/components/Docs`                                                                      | 2026-09-05 | the docs site's own chrome                                                         |
| `app/components/Dashboard`, `Achievement`                                                  | 2026-09-05 |                                                                                    |
| `app/components/FlowchartEditor`, `RichTextEditor`, `Anime`, `Dataset`, `About`, `content` | 2026-09-05 |                                                                                    |
| `app/pages`, `app/layouts`                                                                 | 2026-09-05 | page-level layout; region sizing and the sidebar/panel rules                       |
| `app/**/*.scss`, `uno.config.ts`                                                           | 2026-09-05 | the style blocks and the UnoCSS rule set behind the attributify vocabulary         |

## Exclusions

- Component granularity, extraction and page composition — `vue-components`, over the same files. Different owning skills, so the split is deliberate.
- Placement and reachability — `ux`, likewise.
- `app/components/Dungeons` canvas internals: Phaser draw calls are not DOM styling. Only the Vue chrome around them is in scope.
- `app/assets/dashboard/demo/icon/*.vue` — vendored ApexCharts sample SVGs, kept diff-identical to their source.
  They are the bulk of what the `px` recipe reports, and none of them is a finding.
- `app/assets/css/settings.scss`'s breakpoint map — Vuetify's SASS API takes px and computes the rem forms from
  them, so the unit there is the framework's rather than ours.
- `app/components/Visual/FloatingAstronaut.scss` — a vendored SVG's own `fclass*` fills, which the skill already
  names as the one place a raw hex is the source's rather than ours.

## Find recipe

```bash
# px in a template or a style block — rem is the rule, with narrow exceptions
grep -rnE '[^a-z-][0-9]+px' --include=*.vue --include=*.scss packages/app/app
# class= where attributify would do — the survivors should be scoped refs, dynamic bindings, or third-party selectors
grep -rn 'class="' --include=*.vue packages/app/app/components
# A bare --variable inside a colour function in an arbitrary value: the token matches, the declaration is
# Invalid, and the whole property is dropped with nothing to see (styling/references/arbitrary-values.md)
grep -rnE '(rgb|rgba|hsl)\(--|color-mix\(in srgb, --' --include=*.vue --include=*.scss packages/app/app
# A bare bracket attribute — UnoCSS extracts it as a class token, so the rule it emits is a `.class` the
# Element never carries. Only the valued form `prop="[...]"` produces an attribute selector
grep -rnoE '(^|[[:space:]])[a-z][A-Za-z0-9:_-]*-\[[^]"'"'"']*\]([[:space:]/>]|$)' --include=*.vue packages/app/app
# The `text-hint` shortcut written out — uno.config.ts defines it as exactly this pair
grep -rn 'op-medium-emphasis text-body-small' --include=*.vue packages/app/app
# A numeric opacity spelling out an emphasis token — op-60 is medium, op-87 is high; op-0/op-100 are reveals
grep -rnE '(^|[^-a-z0-9])op-(38|60|87)([^0-9]|$)' --include=*.vue packages/app/app
# An emphasis name used as a colour: they are opacity utilities, so b-/bg-/text- prefixed they generate nothing
grep -rnE '(^|[^-a-z])(b|bg|text)-(medium|high)-emphasis' --include=*.vue packages/app/app
```

## Next enforceable

- An MD2 typography utility (`text-h6`, `text-caption`, `text-subtitle-1`, `text-medium-emphasis`) is a closed
  set of names, and as an **attribute** it generates nothing at all — Vuetify ships those as classes, so the
  attribute form is inert and reads on the page as no typography rather than as the wrong typography. A test over
  the tree decides it; an oxlint plugin cannot, because oxlint hands a JS plugin no Vue template
  (`scripts/oxlint/errorAlert.ts` says the same about inline handlers). The generic form — every `text-*`
  attribute in a template resolving to a rule the config generates — catches typos too, and needs an extraction
  that can tell an attributify utility from a Vuetify `text` prop.
- The general form of the two greps above — **every attributify attribute in a template producing a rule the
  config actually emits** — subsumes them and catches the next silent no-op nobody has met yet. The generator
  answers it directly (`createGenerator(config).generate(source)` returns the matched tokens, and a token that
  matched can still emit nothing), so the blocker is not the check but the input: an attribute on a component is
  as likely to be a Vuetify prop as a utility, and reporting `text` on a `v-tab` would bury the real findings.
  It needs an extraction that reads the tag, which is the same thing the typography item below is waiting for.
- `px` outside the skill's named exceptions is a regex against templates and style blocks; a custom oxlint plugin or a test over the tree decides it.
- A Vuetify global default restated on a component is decidable by comparing the tag's props against the defaults object.
- Theme primitive vs bespoke colour needs the palette in mind and a judgement about intent; it stays with the sweep.
