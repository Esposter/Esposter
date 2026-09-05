# Styling

What a component looks like rather than how it is composed: attributify props over `class`, theme primitives over bespoke values, the MD3 type set, `rem` over `px`, no hardcoded layout dimensions, `StyledButton` and the shared shells, and the narrow-viewport collapse.

| Unit                                                                                       | Swept      | Notes                                                                      |
| ------------------------------------------------------------------------------------------ | ---------- | -------------------------------------------------------------------------- |
| `app/components/Styled`                                                                    | 2026-09-05 | the shared shells                                                          |
| `app/components/Message/Model/Message`                                                     | 2026-09-05 | the densest surface; the message row and its variants                      |
| `app/components/Message/Model/Room`                                                        | —          | settings panels and dialogs                                                |
| `app/components/Message/Model/User`                                                        | —          | plus `Member`, `Status`, `RoomCategory`, `Settings`, `FileRenderer`        |
| `app/components/Message/Content`                                                           | —          |                                                                            |
| `app/components/Message` — the rest                                                        | —          | `RightSideBar`, `DraftsAndSent`, `Friends`, `LeftSideBar`                  |
| `app/components/Resource/Sheet`                                                            | —          | the sheet editor's own chrome                                              |
| `app/components/Resource/List`                                                             | —          |                                                                            |
| `app/components/Resource` — the per-type editors                                           | —          | `Survey`, `TodoList`, `Note`, `Program`, `Webpage`, `Email`, `Blueprint`   |
| `app/components/Resource` — the entry surfaces                                             | —          | `Home`, `Search`, `Explorer`, `RecycleBin`, `Dashboard`, `Flowchart`       |
| `app/components/Resource` — the shared chrome                                              | —          | `Blade`, `Create`, `VersionHistory` and the loose dialogs                  |
| `app/components/Dungeons`                                                                  | —          | canvas-adjacent; much of it is Phaser rather than DOM                      |
| `app/components/App`, `Nuxt`, `Transition`, `Login`, `Fragment.vue`                        | —          | the chrome                                                                 |
| `app/components/Clicker`                                                                   | —          |                                                                            |
| `app/components/Visual`                                                                    | —          |                                                                            |
| `app/components/User`                                                                      | —          |                                                                            |
| `app/components/Docs`                                                                      | —          | the docs site's own chrome                                                 |
| `app/components/Dashboard`, `Achievement`                                                  | —          |                                                                            |
| `app/components/FlowchartEditor`, `RichTextEditor`, `Anime`, `Dataset`, `About`, `content` | —          |                                                                            |
| `app/pages`, `app/layouts`                                                                 | —          | page-level layout; region sizing and the sidebar/panel rules               |
| `app/**/*.scss`, `rules.config.ts`                                                         | —          | the style blocks and the UnoCSS rule set behind the attributify vocabulary |

## Exclusions

- Component granularity, extraction and page composition — `vue-components`, over the same files. Different owning skills, so the split is deliberate.
- Placement and reachability — `ux`, likewise.
- `app/components/Dungeons` canvas internals: Phaser draw calls are not DOM styling. Only the Vue chrome around them is in scope.
- `app/assets/dashboard/demo/icon/*.vue` — vendored ApexCharts sample SVGs, kept diff-identical to their source.
  They are the bulk of what the `px` recipe reports, and none of them is a finding.
- `app/assets/css/settings.scss`'s breakpoint map — Vuetify's SASS API takes px and computes the rem forms from
  them, so the unit there is the framework's rather than ours.

## Find recipe

```bash
# px in a template, style block or rules config — rem is the rule, with narrow exceptions
grep -rnE '[^a-z-][0-9]+px' --include=*.vue --include=*.scss packages/app/app packages/app/app/rules.config.ts
# class= where attributify would do — the survivors should be scoped refs, dynamic bindings, or third-party selectors
grep -rn 'class="' --include=*.vue packages/app/app/components
```

## Next enforceable

- An MD2 typography utility (`text-h6`, `text-caption`, `text-subtitle-1`, `text-medium-emphasis`) is a closed
  set of names, and as an **attribute** it generates nothing at all — Vuetify ships those as classes, so the
  attribute form is inert and reads on the page as no typography rather than as the wrong typography. A test over
  the tree decides it; an oxlint plugin cannot, because oxlint hands a JS plugin no Vue template
  (`scripts/oxlint/errorAlert.ts` says the same about inline handlers). The generic form — every `text-*`
  attribute in a template resolving to a rule the config generates — catches typos too, and needs an extraction
  that can tell an attributify utility from a Vuetify `text` prop.
- `px` outside the skill's named exceptions is a regex against templates and style blocks; a custom oxlint plugin or a test over the tree decides it.
- A Vuetify global default restated on a component is decidable by comparing the tag's props against the defaults object.
- Theme primitive vs bespoke colour needs the palette in mind and a judgement about intent; it stays with the sweep.
