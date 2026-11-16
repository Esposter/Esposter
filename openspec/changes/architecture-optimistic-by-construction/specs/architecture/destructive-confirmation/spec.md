## MODIFIED Requirements

### Requirement: An awaited delete keeps the dialog open until it settles

A confirmation SHALL wait for its delete only when the delete names a reason the server alone can answer, and then SHALL keep the dialog locked until the delete settles and keep it open when the delete is refused or fails.

#### Scenario: The dialog stays locked while the delete is pending

- **GIVEN** the reader confirms a delete that names a reason to wait on the server
- **WHEN** the delete is pending
- **THEN** the answer button shows pending
- **AND** the dialog cannot be dismissed

#### Scenario: A refused or failed delete leaves the dialog open to try again

- **GIVEN** the reader confirms a delete that names a reason to wait on the server
- **WHEN** the delete is refused or fails
- **THEN** the dialog stays open with its answer ready to try again
- **AND** a failure raises an error alert

### Requirement: An optimistic delete closes at once and rolls back on rejection

A confirmation SHALL be optimistic unless it names a reason to wait: it SHALL close at once, and a rejected write SHALL be answered by rolling back the list and showing an error.

#### Scenario: An optimistic delete closes as soon as it is confirmed

- **GIVEN** a delete that names no reason to wait
- **WHEN** the reader confirms it
- **THEN** the dialog closes at once
- **AND** the list already shows the removal

#### Scenario: A rejected optimistic delete restores the list and shows an error

- **GIVEN** an optimistic delete was confirmed and the server rejects it
- **WHEN** the rejection arrives
- **THEN** the removed item returns to the list
- **AND** the reader sees an error notice
