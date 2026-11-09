## Why

The creator draws every question on the design surface with its controls switched off, and all editing happens in the property panel beside it. SurveyJS Creator, the reference, lets the author click a question's title, description or a choice and type on the surface, and puts a toolbar of adorners on the selected question for its required flag, its kind, and duplicate, delete and move. Here a typo in a title costs a trip to the panel, a question's kind cannot be changed at all after it is inserted, and the surface shows the survey but cannot edit it.

## What Changes

- The selected question's title and description, and a page's title and description, are edited in place on the surface.
- A choice question's choices are edited in place: text, add, remove and reorder.
- The selected element carries an adorner bar with its required flag, a kind switch, duplicate, delete and move, and a rating question's rate type.
- A question's kind is changed in place, keeping what the new kind has and dropping what it has not.
- The surface ends with an add-question button and a skeleton for a new page.
- One shared adorner and one shared in-place text field are added to the UI library, so the whiteboard and the page builder reuse them.

## Capabilities

### Modified Capabilities

- `survey-creator`: in-place editing, adorners, converting a kind, and the surface's add controls are added.

## Impact

The canvas draws the selected element's text and choices as editable. The property panel keeps every control it has, since it remains the one place for the settings the surface has no room for. Edits go through the same commands as the panel, so undo, redo and the typing run's single step are unchanged.
