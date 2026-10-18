## ADDED Requirements

### Requirement: An edit changes the form's value once

An edit to any field of a schema form SHALL change the form's value once, at the field's own path.

#### Scenario: Editing a field nested in a list

- **GIVEN** a form whose value holds a list of objects
- **WHEN** the reader edits a field of the second item
- **THEN** the form's value changes once
- **AND** only that item's field holds the new value

### Requirement: A node no renderer draws does not stop the form

A schema form SHALL draw every node a renderer ranks, and SHALL skip a node no renderer ranks without stopping the rest of the form.

#### Scenario: A schema with a node nothing draws

- **GIVEN** a form schema holding one node no renderer ranks beside fields that are ranked
- **WHEN** the form is shown
- **THEN** the ranked fields are drawn
- **AND** the unranked node is not

### Requirement: Every reported issue of the upstream bindings has a recorded verdict

Every reported issue of the upstream form bindings SHALL have a recorded verdict, and each in-scope defect SHALL have a regression check or a construction that rules it out.

#### Scenario: An in-scope defect is checked

- **GIVEN** an upstream defect that the bindings fix
- **WHEN** the test suite runs
- **THEN** a regression check names that issue
- **AND** the check fails against the upstream behaviour
