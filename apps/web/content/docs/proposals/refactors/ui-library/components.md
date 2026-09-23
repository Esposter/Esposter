---
title: Components
description: Proposal — the UI library's component catalogue. Each component with the Vuetify 0 primitive under it, the Vuetify components and Styled wrappers it replaces, and the stage that first needs it, plus what becomes plain layout rather than a component.
model: claude-opus-5-5
---

# Components

A component is added to the library when the first stage needs it, never ahead of a consumer. The shipped ones, and the surfaces and contracts they are built with, are the [as-built page's](/docs/architecture/ui-library#components); this page is the plan for all of them, so each is built once, in the right shape, rather than grown from whichever page reached for it first. A row names the Vuetify 0 primitive that owns the behaviour; where it names none, the component is presentation only and Vuetify 0's polymorphic base element is enough.

## Every component keeps the same contract

- **Behaviour from the primitive, look from the tokens.** The component spreads the primitive's attributes onto its own element, with the call site's on top, styles its states through the data attributes those attributes carry, and holds no colour of its own ([design language](/docs/proposals/refactors/ui-library/design-language)).
- **Props are the library's, not Vuetify's.** No component accepts a Vuetify prop bag, as the Styled wrappers do today with their button and dialog props. A call site states what it wants in the library's words, and a migrated call site is simpler than the one it replaces.
- **A label is required where the control has no visible text.** An icon button takes a label, which is its accessible name and its tooltip at once, so an unlabelled icon button does not type-check.
- **Each has a component test** of its keyboard contract and its ARIA, mounted with the real Vuetify 0 plugins rather than mocked injections, as Vuetify 0's [testing guide](https://0.vuetifyjs.com/guide/tooling/testing) asks. A feature test then never re-tests a menu's arrow keys.

## The catalogue

| Component group         | Vuetify 0 primitive                           | Replaces                                                                                  | First needed by         |
| :---------------------- | :-------------------------------------------- | :---------------------------------------------------------------------------------------- | :---------------------- |
| Icon                    | none                                          | the Vuetify icon, and the text glyphs the console drew as marks                           | icons, shipped          |
| Frame                   | none                                          | the console's panel frame, card, sheet, the Styled card                                   | agent console, shipped  |
| Button, icon button     | Button                                        | the console's panel button, the Vuetify button, the Styled button and tooltip icon button | agent console, shipped  |
| Popover                 | the popover composable, on the top layer      | the console's popover and its Floating UI positioning                                     | agent console, shipped  |
| Menu                    | Popover with roving focus                     | the console's menu, the Vuetify menu, the Styled overflow menu                            | agent console, shipped  |
| Select, suggestions     | Select; the popover with virtual focus        | the console's select and field menus, the Vuetify select, autocomplete and combobox       | agent console, shipped  |
| Loading bar, spinner    | Progress for the bar; none for the spinner    | the console's spinner and loading bar, the linear and circular progress                   | agent console, shipped  |
| Tooltip                 | Tooltip                                       | the Vuetify tooltip, the Styled help tooltip                                              | app shell, shipped      |
| Dialog, alert dialog    | Dialog, AlertDialog                           | the Vuetify dialog under the Styled dialog and delete dialog                              | retirement              |
| Drawer                  | Dialog when modal, a plain region when docked | the Vuetify navigation drawer under the Styled drawer and rail                            | retirement              |
| Toast                   | none                                          | the Vuetify snackbar, the Styled alert list and clipboard snackbar                        | app shell, shipped      |
| Avatar                  | Avatar                                        | the Vuetify avatar, the Styled avatar and default avatar                                  | app shell, shipped      |
| Breadcrumbs             | Breadcrumbs                                   | the app breadcrumbs                                                                       | page migration          |
| Overflow                | Overflow                                      | the hand-built collapse of a command bar into one menu on a narrow screen                 | page migration          |
| Context menu            | Popover with roving focus, at a point         | the hand-built right-click menus                                                          | context menus, shipped  |
| Text field, textarea    | Input                                         | the Vuetify text field, textarea and file input                                           | page migration, shipped |
| Number field            | NumberField                                   | numeric text fields                                                                       | page migration          |
| Checkbox, radio, switch | Checkbox, Radio, Switch                       | their Vuetify counterparts                                                                | page migration          |
| Slider                  | Slider                                        | the Vuetify slider                                                                        | page migration          |
| Form                    | Form, with the validation composable          | the Vuetify form and its rules                                                            | page migration, shipped |
| Toggle, toggle group    | Toggle, Group                                 | the Vuetify button toggle, and chips used as filters                                      | page migration          |
| Tabs                    | Tabs                                          | the Vuetify tabs and windows                                                              | page migration, shipped |
| Expansion panel         | ExpansionPanel, Collapsible                   | the Vuetify expansion panels and list groups                                              | page migration          |
| List, list item         | Selection or Group with roving focus          | the Vuetify list and its items, the Styled list and navigation list                       | page migration          |
| Tree                    | Treeview                                      | nested lists used as trees                                                                | page migration          |
| Data table              | the data table and virtual composables        | the Vuetify data table and its server variant                                             | page migration          |
| Pagination              | Pagination                                    | the Vuetify pagination                                                                    | page migration          |
| Alert                   | Alert                                         | the Vuetify alert                                                                         | page migration          |
| Skeleton                | none                                          | the Vuetify skeleton loader, the Styled skeleton                                          | page migration, shipped |
| Splitter                | Splitter                                      | the Styled resize handle                                                                  | page migration          |
| Carousel                | Carousel                                      | windows used as a slideshow, the Styled slide indicator                                   | page migration          |
| Date picker             | the date composable with Selection            | the Styled date picker and calendar                                                       | page migration          |

The breadcrumbs and overflow are first needed by a page's own header, so they arrive with page migration. The tooltip came with the shell, where the dock's controls show a mark alone and their names had to be seen. The dialog and the drawer move onto Vuetify 0 last: a modal in the top layer hides every Vuetify menu and tooltip its content opens, so until nothing inside them is Vuetify's they keep Vuetify's overlay and wear the library's look. The toast is presentation over the stores that already queue each kind of toast, so it takes no primitive.

Two groups are ours in full, because Vuetify 0 has no component for them: the context menu, which is a menu positioned at a point rather than at a trigger, and the date picker, which is a grid of days over its date adapter. Each gets the same keyboard contract a primitive would have given it, written to the WAI-ARIA pattern for its role, and its test is what holds it there.

## Not components

A large part of what Vuetify draws today is layout, and layout is not the library's job:

- **The grid.** The container, row, column and spacer elements become UnoCSS flex and grid utilities on the elements that are already there. They are among the most used Vuetify elements in the app and none carries behaviour.
- **Hover wrappers** become a hover variant, or a data attribute where the state is also needed in script.
- **Expand transitions** become the library's one stepped transition.
- **Dividers** are a one-step line in the edge colour, a utility rather than a component.
- **Chips used as labels** become text in the muted colour, which the `ux` skill's visual design sources (`.agents/skills/ux/references/visual-design-sources.md`) already call for. A chip that is a control is a toggle; a chip that is a count is a badge in the accent colour.

## The Styled wrappers

The Styled components exist to give Vuetify one house style. Each is either rebuilt on the library under the same role, or deleted when its last consumer moves:

- **Rebuilt, keeping their role and their contracts:** the dialog shell with its delete and edit variants ([dialog shell](/docs/architecture/dialog-shell), [destructive confirmation](/docs/architecture/destructive-confirmation)), the empty and error states, the page header and the waypoint. Their pages stay the standard and change only their implementation line. Where a unit needs one before the rest of its consumers move, the library's version sits beside the Styled one — `UiEmptyState` beside `StyledEmptyState` — and the Styled one goes with its last consumer.
- **Deleted in favour of a library component:** the button, card, avatar, tooltip icon button, overflow menu, skeleton and list wrappers, whose whole job was restyling one Vuetify component.

## Key files

| File                                                    | Role after the change                       |
| :------------------------------------------------------ | :------------------------------------------ |
| `apps/web/app/components/Styled/Dialog.vue`             | Rebuilt on the library's dialog             |
| `apps/web/app/components/Styled/OverflowMenu.vue`       | Replaced by the library's overflow and menu |
| `apps/web/app/components/Styled/Tooltip/IconButton.vue` | Replaced by the library's icon button       |

## Sources

- [WAI-ARIA Authoring Practices: menu and menu button](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/), W3C: the keyboard contract of the context menu.
- [WAI-ARIA Authoring Practices: grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/), W3C: the keyboard contract of the date grid, a grid of days walked by arrow.
- [Components](https://0.vuetifyjs.com/guide/fundamentals/components), Vuetify 0: the compound parts, the attributes object each part's slot hands over, and the polymorphic base element.
