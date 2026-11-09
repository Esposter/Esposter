## Context

The `architecture-dialog-regions` change gives the base dialog its body and footer. The component read it was drawn from covered all 926 components and recorded 188 findings, which this change judges. The convention is `structured-containers` in the `vue-component-patterns` skill, and the sweep that carries it is the `vue-components` ledger.

## Verdicts

Each cluster is a shape that appears in several components, with the count the readers recorded and the verdict. A shape that appears in two places is a note, because an abstraction earns its place by a third consumer or by removing a mistake.

| Cluster                                                                        | Seen in                                            | Verdict                                                                                |
| ------------------------------------------------------------------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| A blade writes its own padded body, `p-4 ui-body`, some also scrolling         | 9 blades in resource, survey and program           | Built here: the blade outlet owns the padding and scroll                               |
| The settings content wrapper and `py-4 ui-body` inside it                      | 8 settings panels                                  | Built here: the settings content owns the padding                                      |
| A right sidebar pane builds its own header and scrolling body                  | 5 panes                                            | Built here: one pane container with header and body                                    |
| The frame has a title bar and body but no footer, and its body does not scroll | 6 cards, 5 section headers, 3 panels with a footer | Built here: the frame owns the scroll and gains a footer slot                          |
| The editor shell's regions are padded and scrolled by their content            | 9 regions across dashboard, clicker and survey     | Built here: the region owns the padding and scroll                                     |
| A page writes a scroll wrapper into the layout's slot                          | 4 pages                                            | Built here: the layout owns the scroll                                                 |
| A drawer body wrapper written twice in the layout                              | 1 file                                             | Built here with the dialog regions                                                     |
| Loading, error and empty states of a list written by hand                      | about 25 lists                                     | Built here: one async body                                                             |
| A dialog width literal, `w="[min(Nrem,90vw)]"`, in 7 files with 5 values       | 7 files in resource, message and sheet             | Built here: a named size on the base dialog                                            |
| `useSingletonDialog` lookup plus a confirm dialog behind a `v-if`              | about 25 sites                                     | Deferred: a separate change, since it is business logic and needs its own design       |
| Row and column create and edit dialogs repeating their form                    | 5 files in the sheet                               | Deferred: with the singleton confirm                                                   |
| Undo and redo buttons that differ by one field                                 | 2 files in the sheet                               | Built here: one history button                                                         |
| A field label with a required mark rebuilt in each field                       | 6 fields in the library                            | Built here: one field label                                                            |
| A user setting slider with a clone and a write on end                          | 4 files                                            | Deferred: three occurrences of a small shape, below the bar                            |
| A hover latch hand-rolled with two events                                      | 4 files                                            | Built here: VueUse's element hover, already a dependency                               |
| A sketched path with a label drawn by three whiteboard elements                | 3 files                                            | Deferred: the whiteboard's element rendering change owns it                            |
| The marquee and selection frames                                               | 2 files                                            | Rejected for now: two occurrences, and the whiteboard's selection change rewrites both |
| Dock buttons, calendar steppers and fades                                      | 4 to 5 files each                                  | Deferred: library-internal and cosmetic                                                |

## Defects fixed where they stand

| Defect                                           | Where                                                                | Fix                                                |
| ------------------------------------------------ | -------------------------------------------------------------------- | -------------------------------------------------- |
| A fieldset as a flex item, which does not shrink | the sheet export dialog, the survey runner element                   | A `div` with `role="group"` and an accessible name |
| A grid child without `min-h-0`                   | the call stage                                                       | `min-h-0` on the grid                              |
| A table with no horizontal overflow wrapper      | the survey matrix                                                    | A wrapper as the dynamic matrix has                |
| A heading row with three non-wrapping buttons    | the program status blade                                             | `flex-wrap`                                        |
| A fixed `w-72` on a region                       | the event calendar's navigator                                       | A flexible width                                   |
| A pixel width constant                           | the service menu                                                     | A rem constant                                     |
| Two nested scrollers                             | the editor region with tabs, the resource explorer, the call sidebar | One scroll owner                                   |
| A viewport-height iframe under chrome            | the published page frame                                             | The frame's own height                             |

## Decisions

- **One body shortcut for every container.** The frame, the blade outlet, the region, the pane and the dialog share the shortcut the dialog change introduces, so they pad and scroll alike. The alternative was a copy in each, which is how nine blades came to differ.
- **The async body is a container with four regions.** Loading, error, empty and the content are its slots, and it draws the one that applies. The alternative was a composable returning flags, which leaves every call site to write the branching it was meant to remove.
- **The frame is the card.** The frame already has a title bar and a body, so a card is a frame and no card component is added.
- **A named size, not a width prop.** The values in use are few, so a dialog says Small, Medium or Large and the base owns the numbers. The alternative was a width passthrough, which keeps the literal at every call site.
- **A shape seen twice is a note.** The singleton confirm is the one large cluster with a business-logic core, so it is its own change with its own design.

## Rejected

- A card component beside the frame, since it would be the frame with another name.
- A composable that returns loading, error and empty flags, for the reason above.
- A generic row component for every list row, since the 13 row shells differ in their trailing content and the item content already owns what is shared.

## Risks and trade-offs

- A body that scrolled in a child now has two scrollers until the child's is removed, so each migration checks the page in a driven browser.
- The blade outlet's padding changes every blade at once, so a blade that was deliberately full-bleed opts out with the same flag the dialog uses.
