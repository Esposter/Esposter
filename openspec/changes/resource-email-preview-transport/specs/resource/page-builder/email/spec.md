## ADDED Requirements

### Requirement: Preview shows an email of any length

Preview SHALL show the compiled email for an email of any length the editor allows, and SHALL NOT fail to show it because the email is long.

#### Scenario: a long email previews as a short one

- **GIVEN** an email long enough that its compile request is larger than a request line can carry
- **WHEN** the owner views Preview
- **THEN** the compiled email is shown
- **AND** no request-size error is shown

### Requirement: Preview compiles once per settled edit

Preview SHALL compile the email once after a run of edits settles, and SHALL NOT send one compile per edit in the run.

#### Scenario: a run of edits compiles once

- **GIVEN** an email open in the editor with Preview shown
- **WHEN** the owner types several characters in a row and stops
- **THEN** one compile is requested once the edits settle
