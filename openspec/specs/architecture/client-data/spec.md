## Purpose

useQuery and useMutation are the two primitives for every user-facing tRPC read and write — non-blocking fetch, optimistic apply, staleness guarding, and error surfacing in one place.

## Requirements

### Requirement: Ancillary reads render the surface at once and fill it when data arrives

A read that loads ancillary data SHALL render its surface at once in an empty state and fill it when the data arrives, without suspending the page.

#### Scenario: A slow ancillary read does not block the page

- **GIVEN** an ancillary read that takes a long time
- **WHEN** the page is opened
- **THEN** the surface renders at once and fills when the data arrives

#### Scenario: A failed ancillary read shows the real error as an alert

- **GIVEN** an ancillary read that the server rejects
- **WHEN** the read fails
- **THEN** the surface stays empty and an alert shows the server's message

#### Scenario: A surface that reports its own errors shows a retry

- **GIVEN** a surface that renders its own failure panel
- **WHEN** the read fails
- **THEN** the panel shows the error with a retry and no alert is raised

### Requirement: A page whose data is its reason to render blocks on failure

A page whose data is the reason to render SHALL block rendering and show not-found or redirect when its read fails.

#### Scenario: A missing resource shows not-found

- **GIVEN** a page for a resource that does not exist
- **WHEN** the page is opened
- **THEN** the not-found page is shown

### Requirement: A user write applies at once and rolls back when rejected

Every user write SHALL apply its change to the screen when it is sent, and SHALL restore the previous state when the server rejects it.

#### Scenario: A rejected write reverts the screen and shows the server's message

- **GIVEN** a write that changes the screen at once
- **WHEN** the server rejects the write
- **THEN** the screen reverts and an alert shows the server's message

#### Scenario: A subscription echo of a write changes nothing further

- **GIVEN** a write that has been applied and confirmed
- **WHEN** the subscription echoes the same value back
- **THEN** the screen shows the same value and nothing changes

### Requirement: A write waits for the server only where the server decides the result

A write SHALL skip applying its change before the server answers only when the result is computed by the server, is a version conflict, is an outcome decided by the server, is off screen, or would be an integrity hazard if repeated.

#### Scenario: A create whose row needs server-computed fields waits for the server

- **GIVEN** a create whose row carries counts and relations the client cannot know
- **WHEN** the create is sent
- **THEN** the row appears only once the server has answered

#### Scenario: A stale version prompts a refresh instead of a silent overwrite

- **GIVEN** a save that carries the content version it was made against
- **WHEN** the server reports that version is stale
- **THEN** the reader is asked to refresh and the save is not applied

#### Scenario: A rapid second click on a like creates only one like

- **GIVEN** a like that is already being created
- **WHEN** the reader clicks the like again
- **THEN** no second like is created

### Requirement: A visible create shows a placeholder that becomes the real row in place

A create whose row the client can build faithfully and that is visible when created SHALL show a placeholder row that becomes the real row where it stands.

#### Scenario: A sent message keeps its place when the server confirms it

- **GIVEN** a message the reader sends
- **WHEN** the server confirms it
- **THEN** the placeholder becomes the real message in the same position in the list

### Requirement: A control that fires a write shows pending until the write settles

A control that fires a write that does not change the screen first SHALL show a pending state and be disabled while the write is in flight, and no surface SHALL draw its own pending indicator.

#### Scenario: A save button shows a spinner while saving

- **GIVEN** a save button for a write that does not change the screen first
- **WHEN** the save is in flight
- **THEN** the button shows a spinner and cannot be pressed again

#### Scenario: One row's pending write does not disable its neighbours

- **GIVEN** a table where each row has its own button
- **WHEN** one row's button is pending
- **THEN** only that row's button is disabled

#### Scenario: An optimistic toggle takes no guard

- **GIVEN** a favourite toggle that changes the screen at once
- **WHEN** the reader presses it twice
- **THEN** each press changes the state and neither is blocked

### Requirement: A rollback restores the stored value and not the typed form

A rollback SHALL restore the stored value, and a form SHALL keep the entered value only while its surface is still on screen.

#### Scenario: A settings panel keeps the value after a rejected save

- **GIVEN** a settings panel whose save is rejected
- **WHEN** the rejection arrives
- **THEN** the panel keeps the entered value and stays marked as unsaved

#### Scenario: A closed dialog shows the stored value again

- **GIVEN** a dialog that closed on submit and whose save is rejected
- **WHEN** the dialog is reopened
- **THEN** it shows the stored value rather than the refused one

### Requirement: A side effect the client cannot build is re-read after the write

A write whose side effect the client cannot construct SHALL re-read the affected state after the write, and a side effect the client can construct SHALL be mirrored locally where the write is made.

#### Scenario: Replying follows the thread so the button reads Following

- **GIVEN** a reader replies to a thread they do not follow
- **WHEN** the reply is sent
- **THEN** the follow button shows Following

#### Scenario: A moderation timeout is re-read after it is applied

- **GIVEN** a moderator applies a timeout the client cannot compute
- **WHEN** the action completes
- **THEN** the affected member's state is read again from the server

### Requirement: Background and live-call operations do not raise alerts for their failures

Background bookkeeping writes and live call operations SHALL NOT raise an alert for their failures, and a rejected server flag SHALL NOT cancel local work that already succeeded.

#### Scenario: A failed background mark-read stays out of the reader's way

- **GIVEN** a background write that marks messages as read when a room is entered
- **WHEN** the write fails
- **THEN** no alert is shown

#### Scenario: A rejected camera flag keeps the local camera running

- **GIVEN** a call with a camera that has turned on locally
- **WHEN** the server rejects the camera flag
- **THEN** the local camera stays on and the flag is rolled back

### Requirement: A message's author sees it before its attachments load

A message sent by its author SHALL render before its attachments finish loading, and a message from another person SHALL render only once its attachments are ready.

#### Scenario: The author sees their message at once

- **WHEN** a reader sends a message with an attachment
- **THEN** the message appears at once with a loading bubble

#### Scenario: Another person's message waits for its attachments

- **WHEN** a message from another person arrives with an attachment
- **THEN** the message appears only after its attachment has loaded

### Requirement: Each user action has its own write queue

Each user action SHALL have its own write queue, so that unrelated actions on the same entity never wait behind each other.

#### Scenario: Deleting a role is not held behind creating one

- **GIVEN** a role creation in flight
- **WHEN** the reader deletes a different role
- **THEN** the deletion is sent at once

### Requirement: A server-owned aggregate is re-read, never adjusted by the client

A count the server derives from many rows SHALL be re-read from the server on every change to its inputs, and the client SHALL NOT move it by a delta. Reads of one aggregate SHALL apply only the latest started.

#### Scenario: a leave re-reads the room's totals instead of decrementing them

- **GIVEN** a room whose totals the client holds
- **WHEN** a member leaves, from a page the client has loaded or not
- **THEN** the room's member total and per-role group totals are read again from the server

#### Scenario: an older read never overwrites a newer one

- **GIVEN** two reads of the same room's totals, the older still in flight
- **WHEN** the newer read finishes first
- **THEN** the older read's result, when it arrives, is not applied

### Requirement: A displayed count holds its value until the write that changes it settles

A count the server derives SHALL keep its displayed value until the write that changes it has settled. Once that write settles, the count shows the value the server reads back. The viewer's own mark MAY change at once, since the client holds it exactly. A first vote is the exception that proves the rule: its row is server-generated, so the client does not hold it until the write answers, and its mark waits for that answer.

#### Scenario: A count stays put while its write is in flight

- **GIVEN** a post whose like count is shown with a value
- **WHEN** the viewer likes the post and the server has not answered
- **THEN** the like count shows its previous value

#### Scenario: The count shows the read-back value once the write settles

- **GIVEN** a like write that has been sent for a post
- **WHEN** the write settles
- **THEN** the like count shows the value the server reads back for the post

#### Scenario: The viewer's own mark changes at once

- **GIVEN** a post the viewer has voted on, and a vote the other way
- **WHEN** the viewer changes the vote and the server has not answered
- **THEN** the viewer's own vote shows the new value

### Requirement: A read in a test settles without waiting for a read sent alongside it

A read made in a test SHALL settle without waiting for another read sent in the same tick, so a test that holds one read open does not hold the others.

#### Scenario: A held read does not hold a read sent in the same tick

- **GIVEN** a test that holds one read open with a deferred answer
- **WHEN** a second read is sent in the same tick
- **THEN** the second read settles while the first is still held
