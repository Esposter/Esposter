# Styling

What a component looks like rather than how it is composed: attributify props over `class`, theme primitives over bespoke values, the MD3 type set, `rem` over `px`, no hardcoded layout dimensions, `StyledButton` and the shared shells, and the narrow-viewport collapse.

| Unit                                                                                       | Swept      | Notes                                                                         |
| ------------------------------------------------------------------------------------------ | ---------- | ----------------------------------------------------------------------------- |
| `app/components/Styled`                                                                    | 2026-08-27 | the shared shells; carries one open finding below                             |
| `app/components/Message/Model/Message`                                                     | —          | the densest surface; the message row and its variants                         |
| `app/components/Message/Model/Room`                                                        | —          | settings panels and dialogs                                                   |
| `app/components/Message/Model/User`                                                        | —          | plus `Member`, `Status`, `RoomCategory`, `Settings`, `FileRenderer`           |
| `app/components/Message/Content`                                                           | —          |                                                                               |
| `app/components/Message` — the rest                                                        | —          | `RightSideBar`, `DraftsAndSent`, `Friends`, `LeftSideBar`                     |
| `app/components/Resource/Sheet`                                                            | —          | the sheet editor's own chrome                                                 |
| `app/components/Resource` — the rest                                                       | —          | `List`, `Survey`, `TodoList`, `Home`, `Search` and the small per-type folders |
| `app/components/Dungeons`                                                                  | —          | canvas-adjacent; much of it is Phaser rather than DOM                         |
| `app/components/App`, `Nuxt`, `Transition`, `Login`, `Fragment.vue`                        | —          | the chrome                                                                    |
| `app/components/Clicker`, `Visual`, `User`, `Docs`, `Dashboard`, `Achievement`             | —          |                                                                               |
| `app/components/FlowchartEditor`, `RichTextEditor`, `Anime`, `Dataset`, `About`, `content` | —          |                                                                               |
| `app/pages`, `app/layouts`                                                                 | —          | page-level layout; region sizing and the sidebar/panel rules                  |
| `app/**/*.scss`, `rules.config.ts`                                                         | —          | the style blocks and the UnoCSS rule set behind the attributify vocabulary    |

## Exclusions

- Component granularity, extraction and page composition — `vue-components`, over the same files. Different owning skills, so the split is deliberate.
- Placement and reachability — `ux`, likewise.
- `app/components/Dungeons` canvas internals: Phaser draw calls are not DOM styling. Only the Vue chrome around them is in scope.
- `app/assets/dashboard/demo/icon/*.vue` — vendored ApexCharts sample SVGs, kept diff-identical to their source.
  They are the bulk of what the `px` recipe reports, and none of them is a finding.
- `app/assets/css/settings.scss`'s breakpoint map — Vuetify's SASS API takes px and computes the rem forms from
  Them, so the unit there is the framework's rather than ours.

## Open findings

- **Two inline `:style` object bindings where attributify would do — needs eyes on the page.**
  `Styled/Button.vue` binds `{ backgroundImage: "var(--midnight-bloom)" }`, a static style on the most-used shell
  In the app, allocating a fresh object every render; `Styled/EditableNameDialogButton.vue` binds a conditional
  `pointerEvents`. The attributify forms are `bg-[var(--midnight-bloom)]` and a bound `pointer-events`, but
  UnoCSS's `bg-[…]` is ambiguous between `background-color` and `background-image` for a gradient value, and
  `Styled/Dialog.test.ts` asserts the current inline style. Neither can be settled without looking at the rendered
  page, which no agent here does (`run-app` skill) — so it is a question for a human, not a rewrite to attempt.

- **Two static utility classes that attributify would carry.**
  `Message/Model/Message/File/ViewerDialog.vue` writes `class="max-h-[80vh]"` on both the video and the image,
  Where the attribute form is `max-h="[80vh]"`. Left for the pass that reads that tree, since the file has no
  Test and the change is only visible on the rendered dialog.

## Find recipe

```bash
# px in a template, style block or rules config — rem is the rule, with narrow exceptions
grep -rnE '[^a-z-][0-9]+px' --include=*.vue --include=*.scss packages/app/app packages/app/app/rules.config.ts
# class= where attributify would do — the survivors should be scoped refs, dynamic bindings, or third-party selectors
grep -rn 'class="' --include=*.vue packages/app/app/components
```

## Next enforceable

- `px` outside the skill's named exceptions is a regex against templates and style blocks; a custom oxlint plugin or a test over the tree decides it.
- A Vuetify global default restated on a component is decidable by comparing the tag's props against the defaults object.
- Theme primitive vs bespoke colour needs the palette in mind and a judgement about intent; it stays with the sweep.
