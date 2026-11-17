# resource/survey-creator Specification

## Purpose

The owner's editor for a survey's typed document: adding, moving, duplicating and removing its elements from a palette, a layers tree and a canvas, undoing and redoing each edit, and importing a survey only when it passes the survey check.

## Requirements

### Requirement: The owner adds a question from the palette

The palette SHALL insert a chosen question kind after the selected element, or, when the selection is a page, at the end of that page, and with nothing selected at the end of the first page. The inserted question is selected. The palette SHALL list only the kinds the insertion point accepts.

#### Scenario: Owner adds a rating question

- **GIVEN** the owner is editing a survey whose first question is selected
- **WHEN** the owner chooses the rating kind in the palette
- **THEN** a rating question is inserted directly after the selected question
- **AND** the new question is selected

#### Scenario: Owner adds a question to a selected page

- **GIVEN** the owner has selected a page with two questions
- **WHEN** the owner chooses the text kind in the palette
- **THEN** a text question is inserted at the end of the page
- **AND** the new question is selected

### Requirement: Alt+arrow moves the selected element

The Creator SHALL move the selected element up, down, into the element before it or out of its parent when the owner presses the matching Alt+arrow shortcut. A move the document does not accept is refused, leaving the document unchanged.

#### Scenario: Owner moves a question up with the keyboard

- **GIVEN** a page with two questions and the second selected
- **WHEN** the owner presses the move-up shortcut
- **THEN** the second question precedes the first
- **AND** the document passes the survey check

### Requirement: A move to another place is refused where the place does not take the element

Moving an element to another place SHALL change nothing when that place does not take the element's kind.

#### Scenario: A question is moved into a place that refuses it

- **GIVEN** a dynamic panel and a question that is itself a dynamic panel
- **WHEN** the owner moves the second into the first's template
- **THEN** the move is refused
- **AND** the document is unchanged

### Requirement: An edit can be undone and redone

Each edit SHALL be undoable and redoable, restoring the document each time it is undone or redone.

#### Scenario: Undo after a move

- **GIVEN** the owner moved a question to another page
- **WHEN** the owner undoes
- **THEN** the question is back where it was

#### Scenario: Redo after an undone move

- **GIVEN** the owner moved a question to another page and undid the move
- **WHEN** the owner redoes
- **THEN** the question is on the other page again

#### Scenario: Typing into one property is a single undo step

- **GIVEN** a question whose title is empty
- **WHEN** the owner types "Why" into its title one character at a time and then undoes
- **THEN** the question's title is empty again
- **AND** nothing is left to undo

### Requirement: The canvas selects the element the owner chooses

The canvas SHALL select the element the owner clicks, or the focused element the owner chooses with Enter, and the layers tree SHALL show that element as current.

#### Scenario: clicking a question selects it

- **GIVEN** a page holding one question
- **WHEN** the owner clicks the question in the canvas
- **THEN** the question is the selected element

#### Scenario: Enter on a focused question selects it from the keyboard

- **GIVEN** a page holding one question
- **WHEN** the owner focuses the question and presses Enter
- **THEN** the question is the selected element

#### Scenario: choosing an element in the canvas selects the same row of the layers tree

- **GIVEN** a page holding two questions
- **WHEN** the owner clicks the second question in the canvas
- **THEN** the second question's row is the current row of the layers tree

### Requirement: The layers tree lists every element in layer order

The layers tree SHALL list every element of the survey in layer order, each row under its own pointer.

#### Scenario: the tree lists every node in layer order, each row under its own pointer

- **GIVEN** a page holding a panel, and the panel holding a question
- **WHEN** the owner opens the Creator
- **THEN** the tree lists the page, the panel and the question in that order

### Requirement: The design and preview switch changes what the canvas draws

The Design or Preview switch SHALL change the canvas between the editor and the survey as a respondent sees it.

#### Scenario: the Preview choice makes the store preview the survey, and Design takes it back

- **GIVEN** the owner is editing the survey in Design
- **WHEN** the owner chooses Preview and then Design
- **THEN** the canvas draws the survey as a respondent sees it, and then the editor again

### Requirement: An imported document that fails the survey check is refused

An import SHALL be refused, leaving the open survey unchanged, when its content does not pass the survey check, and the refusal SHALL name the path of the first fault.

#### Scenario: Import with a duplicate name

- **GIVEN** a file holding a survey whose two questions share a name
- **WHEN** the owner imports it
- **THEN** the import is refused with the second question's path
- **AND** the open survey is unchanged

### Requirement: A completed preview shows the answers its completion would store

A completed preview SHALL show the answers its completion would store as a table of the Responses blade's columns and cells, with a JSON view of the same answers beside it.

#### Scenario: Completing a preview shows its answers as a table

- **GIVEN** a survey with a text question answered "Ana" and a rating question answered four
- **WHEN** the owner completes the preview
- **THEN** the results list each question's column with its answer
- **AND** the rating's answer reads 4

#### Scenario: The JSON view shows the same answers

- **GIVEN** a completed preview whose results show a table
- **WHEN** the owner chooses the JSON view
- **THEN** the JSON holds the same answers, keyed by question name

#### Scenario: A calculated value flagged for the result is in the results

- **GIVEN** a survey with a calculated value flagged for the result, whose expression reads a rating of four
- **WHEN** the owner completes the preview
- **THEN** the results hold that calculated value

### Requirement: A completed preview offers a restart from the first page

A completed preview SHALL offer Preview Survey Again, which clears the answers and returns the survey to its first page.

#### Scenario: Preview Survey Again starts the survey from its first page

- **GIVEN** a completed preview showing its results
- **WHEN** the owner chooses Preview Survey Again
- **THEN** the survey shows its first page with no answers
- **AND** the results are gone

### Requirement: Leaving the preview clears its results

Leaving the preview SHALL clear its results, so the next preview starts with no answers.

#### Scenario: Leaving the preview clears its results

- **GIVEN** a completed preview showing its results
- **WHEN** the owner chooses Design and then Preview again
- **THEN** the survey shows its first page with no answers

### Requirement: Completing a preview saves no response

Completing a preview SHALL save no response, whether as a draft or as a submission.

#### Scenario: Completing a preview saves no response

- **GIVEN** a survey that already holds responses
- **WHEN** the owner completes the preview
- **THEN** the survey holds the same responses as before

### Requirement: A preview completion blocked by an error shows the error and no results

A preview completion blocked by an error SHALL show that error on its page and SHALL show no results.

#### Scenario: A preview blocked by an error shows the error and no results

- **GIVEN** a survey whose required question on its second page is unanswered
- **WHEN** the owner completes the preview
- **THEN** the preview moves to the second page and shows the question's error
- **AND** no results are shown

### Requirement: The selected element's text is edited in place

The owner SHALL edit the title and description of the selected question, and of a page, in place on the design surface. Enter or leaving the field SHALL commit the text, Escape SHALL restore the text from before the edit, and a run of typing SHALL be one undo step.

#### Scenario: Editing a question's title on the surface

- **GIVEN** a selected question
- **WHEN** the owner clicks its title, types, and presses Enter
- **THEN** the question's title is the typed text
- **AND** the property panel shows the same title

#### Scenario: Escape restores the title

- **GIVEN** a question's title open for editing with text typed
- **WHEN** the owner presses Escape
- **THEN** the title is the text from before the edit

#### Scenario: A run of typing is one undo step

- **GIVEN** a title typed one key at a time and committed
- **WHEN** the owner undoes once
- **THEN** the title is the text from before the first key

#### Scenario: An unselected question is not edited by a click

- **GIVEN** a question that is not selected
- **WHEN** the owner clicks its title
- **THEN** the question is selected and no text field is open

### Requirement: A choice question's choices are edited in place

The owner SHALL edit the text of each choice of the selected choice question on the surface, add a choice after the last by pressing Enter in it, remove a choice, and reorder choices by Alt with the arrow keys. A choice left empty on commit SHALL be removed, and the last remaining choice SHALL NOT be removable.

#### Scenario: Enter in the last choice adds one

- **GIVEN** a selected choice question with its last choice open for editing
- **WHEN** the owner presses Enter
- **THEN** a new empty choice follows it and is open for editing

#### Scenario: An emptied choice is removed on commit

- **GIVEN** a choice open for editing with its text cleared
- **WHEN** the owner commits
- **THEN** the choice is removed

#### Scenario: The last choice cannot be removed

- **GIVEN** a choice question with one choice
- **WHEN** the owner clears its text and commits
- **THEN** the choice stays with its text from before the edit

#### Scenario: Alt and the arrow keys reorder a choice

- **GIVEN** a selected choice question with a choice focused
- **WHEN** the owner presses Alt and the down arrow
- **THEN** the choice moves one place down

### Requirement: The selected element carries an adorner bar

The selected element SHALL carry an adorner bar anchored to its box with its required flag, a kind switch, duplicate, delete, and for a rating question its rate type. Each adorner SHALL do what the same control in the property panel and the outline does. The element is moved by the drag handle the canvas draws on it, so the bar has no move control.

#### Scenario: The required adorner toggles the flag

- **GIVEN** a selected question that is not required
- **WHEN** the owner presses the required adorner
- **THEN** the question is required and the property panel shows it

#### Scenario: The duplicate adorner copies the question after it

- **GIVEN** a selected question
- **WHEN** the owner presses the duplicate adorner
- **THEN** a copy with a different name follows it and is selected

#### Scenario: Nothing selected shows no adorner

- **GIVEN** no selected element
- **WHEN** the surface is drawn
- **THEN** no adorner bar exists

### Requirement: A question's kind is changed in place

The owner SHALL change the selected question's kind from the adorner bar. The change SHALL keep the name, title, description, required flag and visibility condition, SHALL keep the choices when both kinds hold choices, and SHALL drop the other props. The kinds offered SHALL be the palette's answering kinds other than the question's own, each one the change can carry the question into. A change that drops a prop holding content SHALL ask first, and the change SHALL be one undo step.

#### Scenario: A choice question becomes another choice kind with its choices

- **GIVEN** a single-choice question with three choices
- **WHEN** the owner changes its kind to multiple choice
- **THEN** the question is multiple choice with the same three choices and the same name

#### Scenario: A change that drops content asks first

- **GIVEN** a choice question with three choices
- **WHEN** the owner changes its kind to a text question
- **THEN** the owner is asked to confirm, and declining leaves the question unchanged

#### Scenario: A kind change undoes as one step

- **GIVEN** a confirmed kind change
- **WHEN** the owner undoes once
- **THEN** the question has its earlier kind and props

### Requirement: The surface ends with add controls

Each page on the surface SHALL end with an add-question control that inserts the default single-line question at the end of that page, with the other kinds offered beside it, and the last page SHALL be followed by a skeleton that adds a page.

#### Scenario: The add control inserts at the end of its page

- **GIVEN** a page with two questions
- **WHEN** the owner presses the page's add-question control
- **THEN** a single-line question is the third on that page and is selected

#### Scenario: The skeleton adds a page

- **GIVEN** a survey with one page
- **WHEN** the owner presses the new-page skeleton
- **THEN** the survey has a second page and it is selected
