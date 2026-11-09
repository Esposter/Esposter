## Context

The canvas draws each question through the runner's field with `pointer-events-none` and the field disabled, so the surface is a picture of the survey. The property panel holds every control, among them `ChoiceListEditor`, `MatrixColumnsEditor` and `NameTitleFields`, and edits go through the creator's commands and `applyEdit`, with a run of writes to one prop continuing one undo step. A question's kind is fixed at insertion.

## Gap analysis

The design-surface rows of the SurveyJS audit, read from its end-user guide and Creator V2 notes, with the verdict this change gives each. The other sections of that audit are judged in the changes and deferred records that name them.

| Feature                                                     | Verdict                                                                              |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Edit a title or description in place                        | Built here                                                                           |
| Edit choices, rows and columns in place                     | Built here for choices; rows and columns deferred until the choice editing is in use |
| Reorder choices on the surface                              | Built here, by drag and by Alt and the arrows                                        |
| Required toggle as an adorner                               | Built here                                                                           |
| Rate type switch as an adorner                              | Built here                                                                           |
| Duplicate, delete and move as adorner actions               | Built here, reusing the outline's commands                                           |
| Change a question's kind in place                           | Built here                                                                           |
| Add question button on the surface                          | Built here                                                                           |
| Skeleton of a new page at the bottom                        | Built here                                                                           |
| Page menu to switch pages                                   | Rejected: the outline already selects a page and the canvas scrolls to it            |
| Collapse and expand elements                                | Deferred: revisit when a survey outgrows scrolling                                   |
| Search above ten tree items                                 | Deferred: the outline is short in practice                                           |
| Dynamic panel template editable on the surface              | Deferred: with the panel's own editing change                                        |
| Visibility condition per choice, default answer, input mask | Deferred: each needs an engine model change, and each has its own record             |
| Logic actions beyond conditions                             | Deferred: the largest absent area, and a design of its own                           |
| Quiz scoring and time limits                                | Deferred: a separate product surface                                                 |
| Dynamic text piping                                         | Deferred: an expression-language change first                                        |
| Device presets in preview                                   | Deferred: with the preview's own change                                              |

## Decisions

- **The adorner and the in-place field are library components.** The whiteboard's text editing and the page builder's text blocks have the same two needs, so the library owns an adorner bar anchored to an element's box and an in-place text field that commits on blur or Enter and cancels on Escape. The alternative was survey-only components, which the whiteboard change would then copy.
- **Only the selected element is editable.** An unselected question is still a picture with its pointer events off, so a click selects it, as now, and a second click on its title edits it. The alternative was every question editable at once, which turns every click on the surface into a text cursor and makes selection and drag unreliable.
- **An edit writes through the panel's command.** The in-place field calls the same prop write the panel's field calls, so a run of typing is one undo step and the panel and the surface cannot disagree. The alternative was a separate path for surface edits, which would have its own undo behaviour.
- **A kind change keeps what the new kind has.** It keeps the name, title, description, required flag and visibility condition, and keeps the choices when both kinds hold choices, and drops the rest. A change that would drop a prop with content asks first. The alternative was to refuse any change that drops content, which makes a text question unable to become a comment without a rebuild.
- **The surface edits choices, and the panel keeps rows and columns.** Choices are the case authors edit most. Matrix rows and columns have a second axis the surface has no clear room for, so they stay in the panel.
- **An add-question control ends each page.** A click inserts the default single-line question at the end of that page, and the ellipsis offers the other kinds, as SurveyJS does. The palette keeps its place for drag.

## Rejected

- Making every question editable at once, for the reason above.
- A rich-text title, since the survey's titles are plain strings in the model and a rich title is an engine change.
- A floating adorner anchored to the pointer, since an adorner anchored to the selected element's box does not move away from what it acts on.

## Risks and trade-offs

- A kind change that drops content is the one destructive path, so it asks first and is undone as one step.
- An editable title inside a draggable element competes with the drag handle for pointer events, so the handle stays the only drag target and the text edits on a second click.
