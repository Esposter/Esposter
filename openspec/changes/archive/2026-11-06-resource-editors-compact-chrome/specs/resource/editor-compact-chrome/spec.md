## ADDED Requirements

### Requirement: Every palette kind is grouped and has an icon

Each editor's palette SHALL list its kinds under named categories, and every kind SHALL have an icon.

#### Scenario: Every survey kind has a category and an icon

- **GIVEN** the survey kinds the palette offers
- **WHEN** the palette's groups are built
- **THEN** each kind sits in exactly one category and has an icon

### Requirement: A palette can be searched

Each palette SHALL filter its kinds across all its groups by what the reader types, and show no group that has no match.

#### Scenario: A search hides the groups with no match

- **GIVEN** a palette with several groups
- **WHEN** the reader types a title that one kind has
- **THEN** only that kind's group is shown, holding only that kind

### Requirement: A selection never moves the canvas

A pane that opens for a selection SHALL open over the canvas and leave the canvas's size and position as they were.

#### Scenario: Selecting an element leaves the canvas where it was

- **GIVEN** an editor with nothing selected
- **WHEN** the reader selects an element
- **THEN** the canvas keeps its width

### Requirement: The survey canvas is read at a readable width

The survey canvas SHALL cap its questions at a readable width and centre them.

#### Scenario: A wide pane does not stretch a question

- **GIVEN** a survey canvas wider than the readable width
- **WHEN** a question is drawn
- **THEN** the question is no wider than the readable width

### Requirement: A toolbar folds its overflow

A toolbar that cannot fit all its controls SHALL keep the primary ones and move the rest into one menu.

#### Scenario: A narrow toolbar folds into a menu

- **GIVEN** a toolbar narrower than its controls
- **WHEN** it is drawn
- **THEN** the controls that do not fit are in one overflow menu
