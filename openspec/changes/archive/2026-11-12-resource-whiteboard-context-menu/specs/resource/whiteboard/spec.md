## ADDED Requirements

### Requirement: A right-click on the canvas opens the whiteboard's own menu

The whiteboard SHALL open a context menu at the pointer on a right-click, selecting the element under the pointer first when it is not already selected and clearing the selection when the pointer is on empty canvas.

#### Scenario: A right-click on an unselected element selects it and opens its menu

- **GIVEN** a shape that is not selected
- **WHEN** the owner right-clicks it
- **THEN** the shape is the selection
- **AND** the menu opens with the selection's commands

#### Scenario: A right-click on a selected element keeps the selection

- **GIVEN** two selected elements
- **WHEN** the owner right-clicks one of them
- **THEN** both stay selected

#### Scenario: A right-click on empty canvas clears the selection and opens the board's menu

- **GIVEN** a selected shape
- **WHEN** the owner right-clicks empty canvas
- **THEN** nothing is selected
- **AND** the menu opens with the board's commands

### Requirement: The element menu lists the selection's commands

The menu over an element SHALL list cut, copy, paste, duplicate, the four stacking steps for one element, edit text for an element that has text, and delete, each running what its shortcut runs.

#### Scenario: Duplicate in the menu copies the selection

- **GIVEN** a selected shape
- **WHEN** the owner chooses Duplicate in the menu
- **THEN** the shape is copied and the copy is selected

#### Scenario: Delete in the menu asks first

- **GIVEN** a selected shape
- **WHEN** the owner chooses Delete in the menu
- **THEN** the delete confirmation opens
- **AND** the shape is still on the board

#### Scenario: Stacking is listed for one element only

- **GIVEN** two selected elements
- **WHEN** the owner opens the menu on one of them
- **THEN** the stacking steps are not listed

#### Scenario: Edit text opens the editor over the element

- **GIVEN** a selected shape
- **WHEN** the owner chooses Edit text in the menu
- **THEN** the text of the shape opens for editing in place

### Requirement: The canvas menu lists the board's commands

The menu over empty canvas SHALL list paste, select all, zoom to fit and reset zoom, each running what its shortcut runs.

#### Scenario: Select all in the menu selects every element

- **GIVEN** a board of two elements and nothing selected
- **WHEN** the owner chooses Select all in the menu
- **THEN** both elements are selected

#### Scenario: Paste in the menu adds the clipboard's elements

- **GIVEN** the clipboard holds a copied shape
- **WHEN** the owner chooses Paste in the menu
- **THEN** a copy of the shape is added and selected

#### Scenario: A refused clipboard read says so

- **GIVEN** the browser refuses to let the page read the clipboard
- **WHEN** the owner chooses Paste in the menu
- **THEN** an alert says the clipboard could not be read
- **AND** nothing is pasted
