## Purpose

A todo holds a flat checklist of steps, added and ticked in its dialog and counted on its row as "1 of 3", so a larger task breaks down without becoming a nested tree.

## Requirements

### Requirement: A todo holds a flat checklist of steps

A todo SHALL hold a flat checklist of steps, each with a name and a tick, and a step SHALL NOT hold steps of its own.

#### Scenario: Steps on a todo

- **GIVEN** a todo with steps
- **WHEN** the owner opens its dialog
- **THEN** each step is shown as a checkbox with its name
- **AND** no step has steps nested under it

### Requirement: Steps are added from the dialog

The dialog SHALL add a step from its Add step field when Enter is pressed, or from its Add step button, and the field SHALL stay focused for the next step.

#### Scenario: Enter adds a step

- **GIVEN** the owner has typed a step name in the Add step field
- **WHEN** the owner presses Enter
- **THEN** the step is added
- **AND** focus stays in the Add step field

#### Scenario: Button adds a step

- **GIVEN** the owner has typed a step name in the Add step field
- **WHEN** the owner chooses Add step
- **THEN** the step is added

### Requirement: The step count has a limit

At the maximum number of steps the Add step control SHALL be disabled and the field SHALL show why.

#### Scenario: Maximum reached

- **GIVEN** a todo at the maximum number of steps
- **WHEN** the owner views the Add step field
- **THEN** the Add step button is disabled
- **AND** the field shows why no more steps can be added

### Requirement: Pressing Enter in the step field does not save the dialog

Pressing Enter in the Add step field SHALL NOT save the dialog.

#### Scenario: Enter in the step field

- **GIVEN** the Add step field holds a step name
- **WHEN** the owner presses Enter
- **THEN** the step is added
- **AND** the dialog stays open

### Requirement: Steps save with the dialog

Steps SHALL be saved with the dialog's Save, and discarding the dialog SHALL discard them.

#### Scenario: Dialog discarded

- **GIVEN** the owner has added a step
- **WHEN** the owner discards the dialog
- **THEN** the step is not kept

### Requirement: A row counts its completed steps

A todo with steps SHALL show on its row how many of its steps are ticked out of the total.

#### Scenario: Row count

- **GIVEN** a todo with three steps, one of them ticked
- **WHEN** the list is shown
- **THEN** its row reads one of three

### Requirement: Steps and completion are independent

Ticking a step SHALL NOT complete its todo, and completing a todo SHALL leave its steps as they were.

#### Scenario: Last step ticked

- **GIVEN** a todo whose only step is unticked
- **WHEN** the owner ticks the step
- **THEN** the todo is still open

#### Scenario: Todo completed

- **GIVEN** a todo with some steps ticked
- **WHEN** the owner completes the todo
- **THEN** its steps keep their ticks

### Requirement: Removing the last step removes the checklist

Removing the last step of a todo SHALL remove its checklist.

#### Scenario: Last step removed

- **GIVEN** a todo with one step
- **WHEN** the owner removes the step and saves
- **THEN** the todo has no steps
