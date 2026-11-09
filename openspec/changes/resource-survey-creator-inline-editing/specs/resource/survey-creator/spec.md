## ADDED Requirements

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

The owner SHALL edit the text of each choice of the selected choice question on the surface, add a choice after the last by pressing Enter in it, remove a choice, and reorder choices by drag or by Alt with the arrow keys. A choice left empty on commit SHALL be removed, and the last remaining choice SHALL NOT be removable.

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

The selected element SHALL carry an adorner bar anchored to its box with its required flag, a kind switch, duplicate, delete and move, and for a rating question its rate type. Each adorner SHALL do what the same control in the property panel and the outline does.

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

The owner SHALL change the selected question's kind from the adorner bar. The change SHALL keep the name, title, description, required flag and visibility condition, SHALL keep the choices when both kinds hold choices, and SHALL drop the other props. A change that drops a prop holding content SHALL ask first, and the change SHALL be one undo step.

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
