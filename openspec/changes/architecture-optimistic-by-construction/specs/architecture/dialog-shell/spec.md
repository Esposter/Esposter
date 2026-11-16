## MODIFIED Requirements

### Requirement: Confirming closes the dialog itself after its answer

Confirming SHALL close the dialog as its write is sent, and the write's rollback SHALL answer a refusal. A dialog that names a reason to wait SHALL close after its answer instead, and SHALL stay open with its draft intact when the answer is refused.

#### Scenario: A confirmed dialog closes while its write is in flight

- **GIVEN** a dialog that names no reason to wait
- **WHEN** the reader confirms it
- **THEN** the dialog closes before the server answers

#### Scenario: A refused answer keeps the draft

- **GIVEN** the reader confirms a dialog that names a reason to wait, and the write is refused
- **WHEN** the refusal arrives
- **THEN** the dialog stays open
- **AND** the draft the reader entered is still there
