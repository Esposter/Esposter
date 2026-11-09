## Context

`UiDialog` draws a section with a header and an unstyled slot, and its frame is held to a maximum height by placement. A caller that wants a scrolling body has to write a flex-item child with a minimum height of zero and an overflow of its own. The shell page says the styled shell owns that, and says nothing else hand-rolls a dialog and its confirm pair. The code disagrees with the page: of 41 call sites, only the styled shells fill a footer by construction, and 28 write the footer themselves.

## Findings

A read of every call site, with the shape each takes.

| Shape                                      | Count | Notes                                                                       |
| ------------------------------------------ | ----- | --------------------------------------------------------------------------- |
| Body with its own scroll on a direct child | 16    | the scroll lives on whichever element the author chose                      |
| Scroll only on a grandchild                | 4     | the direct child is a fixed height or hidden                                |
| A footer written inside the default slot   | 28    | six write it as a sibling of the body, the rest inside the body or the form |
| A form around body and footer              | 10    | the footer sits inside the form's scroll                                    |
| Unpadded, full bleed                       | 2     | the command palette and the settings wrapper                                |
| A fixed body height                        | 2     | the settings wrapper and the reactions dialog                               |
| A single child component fills the dialog  | 4     | the palette, the editor region and two chart dialogs                        |
| A multi-state body                         | 6     | loading, empty, error and form states in one dialog                         |

Two causes of overflow follow from this and are the causes the regions remove by construction, so the fix is checked once after the edits in a driven browser and no before-measurement is taken. A fieldset as a flex item does not shrink below its content in every engine, so a column list in a fieldset overflows its frame. A body whose scroll sits on a grandchild leaves the direct child to size to its content.

## Decisions

- **The base owns the regions, and the call site owns only content.** The default slot is the body and a named footer slot is the footer. The alternative was to keep the styled shell as the one owner and move all 41 call sites onto it, which cannot work for the 13 dialogs with no confirm to give, for the forms, or for the two with an unpadded child, and left a second dialog base to choose between.
- **The region is a shared UnoCSS shortcut, and the component uses it.** The popover panel takes the same shortcut, so the dialog and the popover scroll alike. The alternative was a copied class list in each component, which is the drift the page records.
- **One opt-out prop for a bare body.** A dialog whose body is a single full-bleed child, such as a listbox, takes the body region without its padding. The alternative was a second slot for bare content, which two call sites do not earn.
- **The footer never scrolls.** It is drawn after the body outside its overflow, so a long body cannot push the actions out of the frame.
- **A form dialog's submit is tied to its form by id.** A form sits in the body, and its submit sits in the footer with the form's id on it, which the browser already honours. The alternative was to let the base draw a form element around both regions, which gives the base a form it does not otherwise have.
- **The styled shells fill the footer and keep their props.** The shell's actions row becomes its footer slot content, so Cancel, the third choice and the confirm are unchanged for every consumer.
- **A scan test holds it.** A dialog call site whose default slot root draws a scroll class or a footer fails a test, so the construction is enforced by the same enforcer as the other shells, and no review has to remember it.
- **Fixed body heights are removed.** The settings wrapper and the reactions dialog use the frame's height and a flexible body instead of a viewport height.

## Rejected

- A body height set per placement at each call site, since that is the duplication this change removes.
- A device-specific dialog, which the responsive skill already rules out.
- A scroll on the dialog element itself, since it scrolls the title bar away with the body.

## Risks and trade-offs

- Moving a footer out of a form changes how the submit is wired, so each of the ten form dialogs needs its submit proven to still submit on Enter and to stay disabled while invalid.
- A dialog whose single child brought its own scroll, such as the data table, now has two nested scrollers until its own is removed, which each migration checks.
