## REMOVED Requirements

### Requirement: A user write applies at once and rolls back when rejected

**Reason**: Nothing restores a value any more. A refused write drops its overlay entry, and the stored row shows again.

**Migration**: A write that changes the screen applies an overlay entry, and a refused one drops it, as the requirement below states.

### Requirement: A rollback restores the stored value and not the typed form

**Reason**: The rollback closure is gone, so the stored value is the held row's, and no restore runs.

**Migration**: A refused write shows the held row, and a form keeps its typed value only while its surface is on screen, as the requirement below states.

### Requirement: Each user action has its own write queue

**Reason**: Writes queue on the rows their entries touch, across the app, and not on one queue per user action.

**Migration**: The queue requirement in the async operations capability states the rule.

### Requirement: A vote's effect on a displayed count shows at once, and every other count holds until its write settles

**Reason**: The viewer's own mark shows at once, but a count moves only to the value the server reads back, so no count is moved before the vote is kept.

**Migration**: The vote requirement below states the mark and the count separately.

## ADDED Requirements

### Requirement: A write that changes the screen shows an overlay entry until its answer confirms it

A write issued through the overlay SHALL show its change as an entry, which drops once the answer names each row the write changed and that row is held at the version named or above.

#### Scenario: A refused write drops its change and shows the server's message

- **GIVEN** a write that changes the screen at once
- **WHEN** the server refuses the write
- **THEN** the screen shows the stored value again
- **AND** an alert shows the server's message

#### Scenario: A confirmed entry stays until its row arrives at the version named

- **GIVEN** a write whose answer names a row at version 5 while the screen holds that row at version 4
- **WHEN** the answer arrives
- **THEN** the change stays on screen until the row at version 5 arrives

#### Scenario: A subscription echo of a write changes nothing further

- **GIVEN** a write that has been applied and confirmed
- **WHEN** the subscription echoes the same value back
- **THEN** the screen shows the same value and nothing changes

#### Scenario: A refused save leaves a later change standing

- **GIVEN** a save that is still in flight and a later write that changed the same setting
- **WHEN** the server refuses the first save
- **THEN** the setting shows the later write's value

#### Scenario: A blank display name shows the account's name at once

- **WHEN** a member saves a blank display name
- **THEN** the member's row shows the account's own name before the server answers

### Requirement: A row the server sends applies only at a version no older than the one held

A row an overlay table receives from the server SHALL apply only when nothing is held for its key or its version is above the one held, so a late response, a repeated event or an older echo loses to the row already on screen.

#### Scenario: An older response after a newer one leaves the newer row

- **GIVEN** a row held at version 5
- **WHEN** a response carrying the same row at version 4 arrives
- **THEN** the screen keeps the row at version 5

#### Scenario: A tombstone removes its row from every list that holds it

- **GIVEN** a list that shows a row
- **WHEN** a tombstone for that row arrives at a newer version
- **THEN** the row leaves the list

#### Scenario: A client placeholder takes the server's first row at version zero

- **GIVEN** a placeholder the client drew for a create, which holds no version
- **WHEN** the server's first row for it arrives at version zero
- **THEN** the row replaces the placeholder

### Requirement: A vote's mark shows at once and its count is the server's

A viewer's own vote SHALL show its mark at once as an overlay entry, and a count SHALL move only to the value the server reads back after the write settles, so a refused vote needs no count taken back.

#### Scenario: The viewer's own mark changes at once

- **GIVEN** a post the viewer has voted on, and a vote the other way
- **WHEN** the viewer changes the vote and the server has not answered
- **THEN** the viewer's own vote shows the new value

#### Scenario: A count holds its value until the read-back arrives

- **GIVEN** a post whose like count is shown with a value
- **WHEN** the viewer likes the post and the server has not answered
- **THEN** the like count shows the same value
- **AND** it shows the value the server reads back once the write settles

#### Scenario: A refused vote drops its mark and the count is read back

- **GIVEN** a vote the server refuses
- **WHEN** the write settles with an error
- **THEN** the viewer's mark shows its stored value
- **AND** the like count is read back from the server

## MODIFIED Requirements

### Requirement: A write waits for the server only for a reason the server alone can answer

A write SHALL wait for the server's answer before the screen changes only when what the reader sees next is a value only the server issues, an outcome the server decides, or a step that cannot be undone, and a write that carries a version token applies at once like any other.

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

A step the screen takes because of a write, such as closing a dialog, moving a row, ending an edit, clearing a field or navigating to a known place, SHALL run when the write is sent, and a refused write hands back what that step took from the reader unless the reader has typed or moved on since.

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

#### Scenario: A name a todo cannot take hands the field its name back

- **GIVEN** a todo name the field cleared as the todo was added
- **WHEN** the name is one a todo cannot take
- **THEN** the field shows the name again

#### Scenario: A refused leave brings the reader back to the room

- **GIVEN** a reader who left the room they were in and was sent to another
- **WHEN** the server refuses the leave
- **THEN** the room is listed again and the reader is back in it

### Requirement: Background and live-call operations do not raise alerts for their failures

Background bookkeeping writes and live call operations SHALL NOT raise an alert for their failures, and a rejected server flag SHALL NOT cancel local work that already succeeded.

#### Scenario: A failed background mark-read stays out of the reader's way

- **GIVEN** a background write that marks messages as read when a room is entered
- **WHEN** the write fails
- **THEN** no alert is shown

#### Scenario: A rejected camera flag keeps the local camera running

- **GIVEN** a call with a camera that has turned on locally
- **WHEN** the server rejects the camera flag
- **THEN** the local camera stays on and the flag's entry is dropped
