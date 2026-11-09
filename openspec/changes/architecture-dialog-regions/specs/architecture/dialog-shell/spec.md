## ADDED Requirements

### Requirement: The base dialog owns a scrolling body

The base dialog SHALL draw its default slot inside a padded body region that scrolls when its content is taller than the room the frame leaves, with the title bar and the footer held in place. A body that is a single full-bleed child SHALL opt out of the padding with one prop and keep the scroll.

#### Scenario: A long list scrolls inside the body

- **GIVEN** a dialog whose body holds a list taller than the frame
- **WHEN** the dialog is open
- **THEN** the body scrolls and the title bar and the footer stay in view
- **AND** nothing of the dialog extends past the frame

#### Scenario: A short body does not scroll

- **GIVEN** a dialog whose body is shorter than the frame
- **WHEN** the dialog is open
- **THEN** the dialog is as tall as its content and the body has no scrollbar

#### Scenario: A bare body keeps the scroll without the padding

- **GIVEN** a dialog opted out of the body's padding whose single child is taller than the frame
- **WHEN** the dialog is open
- **THEN** the child touches the frame's edges and the body scrolls

### Requirement: The base dialog owns a pinned footer

The base dialog SHALL draw its footer slot after the body, outside the body's scroll, laid out as an actions row. A dialog with no footer content SHALL draw no footer region.

#### Scenario: The footer stays in view

- **GIVEN** a dialog with footer content and a body taller than the frame
- **WHEN** the reader scrolls the body to its end
- **THEN** the footer is still fully in view

#### Scenario: No footer content draws no region

- **GIVEN** a dialog with no footer content
- **WHEN** the dialog is open
- **THEN** no footer region exists

### Requirement: A form's submit stays in the footer

A form in a dialog's body SHALL be submitted by a button in the footer that names the form by its id, so the form scrolls with the body and the submit does not.

#### Scenario: The footer's submit submits the body's form

- **GIVEN** a form dialog with valid fields
- **WHEN** the reader presses the footer's submit
- **THEN** the form is submitted once

#### Scenario: Enter in a field submits the form

- **GIVEN** a form dialog with the cursor in a field
- **WHEN** the reader presses Enter
- **THEN** the form is submitted once

#### Scenario: The submit is disabled while a field fails

- **GIVEN** a form dialog with a failing field
- **WHEN** the dialog is open
- **THEN** the footer's submit is disabled

### Requirement: A call site supplies content, not regions

A dialog's default slot SHALL hold content only, with no padding, scroll wrapper or footer of its own, and a dialog SHALL NOT fix its body's height. A dialog that draws either fails a scan of the call sites.

#### Scenario: A call site that draws its own footer fails the scan

- **GIVEN** a dialog whose default slot holds its own footer element
- **WHEN** the scan test runs
- **THEN** the test fails and names the file

## MODIFIED Requirements

### Requirement: Every dialog with an actions row shares one shell

Every dialog that has an actions row SHALL present its title, a close control and a scrolling body through the base dialog's regions, with the actions row in the footer region.

#### Scenario: A dialog shows its title with a close control

- **GIVEN** a dialog with a title is opened
- **WHEN** the dialog is shown
- **THEN** the title bar shows the title and a close control

#### Scenario: A long body scrolls inside the dialog

- **GIVEN** a dialog's body is taller than the screen
- **WHEN** the reader scrolls the dialog
- **THEN** the body scrolls within the dialog
- **AND** the actions row stays in view
