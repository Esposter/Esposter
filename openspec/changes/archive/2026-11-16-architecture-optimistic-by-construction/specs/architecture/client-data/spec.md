## REMOVED Requirements

### Requirement: A write waits for the server only where the server decides the result

**Reason**: A version token and a row the server fills in are no longer reasons to wait. The requirement is replaced by one whose reasons are the closed set the client's write primitive holds.

**Migration**: A content save applies at once and rolls back on a stale version, and a create draws its row at once, under the client's id where the server keys the row by a text id.

### Requirement: A visible create shows a placeholder that becomes the real row in place

**Reason**: A row the server keys by a text id is drawn under the id the client generated, so only a message, which its room numbers, still swaps a placeholder for the server's row.

**Migration**: A visible create draws its row at once, as the requirement below states.

## ADDED Requirements

### Requirement: A visible create draws its row at once and keeps its place when the server confirms it

A create whose row is visible when created SHALL draw its row at once, and the server's confirmation SHALL leave the row where it stands. A row the server keys by a text id SHALL be drawn under the id the client gave it. A message, which its room numbers, SHALL be drawn as a placeholder that becomes the real message in place.

#### Scenario: A new category is drawn under the id the client gave it

- **WHEN** the reader creates a room category
- **THEN** the category is listed at once under the id the client gave it
- **AND** the server stores it under that id

#### Scenario: A sent message keeps its place when the server confirms it

- **GIVEN** a message the reader sends
- **WHEN** the server confirms it
- **THEN** the placeholder becomes the real message in the same position in the list

### Requirement: A write waits for the server only for a reason the server alone can answer

A write SHALL wait for the server's answer before the screen changes only when what the reader sees next is a value only the server issues, an outcome the server decides, or a step that cannot be rolled back. A write that carries a version token SHALL apply at once like any other.

#### Scenario: A create whose link only the server mints waits for the server

- **GIVEN** a create whose result is a link only the server mints
- **WHEN** the create is sent
- **THEN** the link appears only once the server has answered

#### Scenario: A stale version rolls the save back and prompts a refresh

- **GIVEN** a save that carries the content version it was made against, already shown on screen
- **WHEN** the server reports that version is stale
- **THEN** the screen reverts to the content before the save
- **AND** the reader is asked to refresh

#### Scenario: A rapid second click on a like creates only one like

- **GIVEN** a like that is already being created
- **WHEN** the reader clicks the like again
- **THEN** no second like is created

### Requirement: Nothing the screen does because of a write waits for the server's answer

A step the screen takes because of a write, such as closing a dialog, moving a row, ending an edit, clearing a field or navigating to a known place, SHALL run when the write is sent. Only the rollback and its alert SHALL follow the server's answer.

#### Scenario: A ticked todo moves under Completed while its save is in flight

- **GIVEN** an open todo and a save that has not answered
- **WHEN** the reader ticks it and its hold ends
- **THEN** the todo is under Completed

#### Scenario: An edited comment leaves edit mode while its save is in flight

- **GIVEN** a comment in edit mode and an update that has not answered
- **WHEN** the reader saves the edit
- **THEN** the comment shows its new text outside edit mode

#### Scenario: A refused write puts the screen back

- **GIVEN** an edit that has left edit mode with its new text shown
- **WHEN** the server refuses the update
- **THEN** the comment shows its text from before the edit
- **AND** an alert shows the server's message
