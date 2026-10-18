## ADDED Requirements

### Requirement: A code attachment keeps its text while it leaves

A code attachment SHALL keep its text shown until the element holding it has left the page.

#### Scenario: A dialog closes around a code attachment

- **GIVEN** a code attachment is open in a dialog
- **WHEN** the reader closes the dialog
- **THEN** the attachment's text stays shown while the dialog's leave transition runs

### Requirement: A code attachment releases its view when it is removed

A code attachment SHALL release its view when the attachment is removed from the page.

#### Scenario: The attachment is removed

- **GIVEN** a code attachment is shown
- **WHEN** the attachment is removed from the page
- **THEN** its view is destroyed

### Requirement: A grammar that loads late highlights the shown text in place

A code attachment SHALL highlight its text when its grammar finishes loading, without reloading the text or moving the reader's scroll position.

#### Scenario: The grammar arrives after the text

- **GIVEN** a code attachment is shown before its language's grammar has loaded
- **WHEN** the grammar finishes loading
- **THEN** the text is highlighted in that language
- **AND** the scroll position is where the reader left it

### Requirement: Every reported issue of the upstream wrapper has a recorded verdict

Every reported issue of the upstream code editor wrapper SHALL have a recorded verdict, and each in-scope defect SHALL have a regression check or a construction that rules it out.

#### Scenario: An in-scope defect is checked

- **GIVEN** an upstream defect that the code view fixes
- **WHEN** the test suite runs
- **THEN** a regression check names that issue
- **AND** the check fails against the upstream behaviour
