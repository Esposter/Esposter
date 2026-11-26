## MODIFIED Requirements

### Requirement: A server-owned aggregate is re-read, never adjusted by the client

A count the server derives from many rows, and a total the server reads from the rows it returns, SHALL be re-read from the server on every change to its inputs. A declared derived value moves only by the prediction its declaration gives, and the server's answer replaces that prediction; a total the client does not predict is never moved by the client. Reads of one aggregate apply only the latest started.

#### Scenario: a leave re-reads the room's totals instead of decrementing them

- **GIVEN** a room whose totals the client holds
- **WHEN** a member leaves, from a page the client has loaded or not
- **THEN** the room's member total and per-role group totals are read again from the server

#### Scenario: an older read never overwrites a newer one

- **GIVEN** two reads of the same room's totals, the older still in flight
- **WHEN** the newer read finishes first
- **THEN** the older read's result, when it arrives, is not applied

## REMOVED Requirements

### Requirement: A vote's mark shows at once and its count is the server's

Replaced by the requirement below, which moves the count at once by its prediction instead of holding it until the read-back.

## ADDED Requirements

### Requirement: A vote's mark and its count show at once, and the server's answer settles both

A viewer's own vote SHALL show its mark at once as an overlay entry, and its count SHALL move at once by the prediction the vote's declaration gives, until the server's answer replaces it, so that a refused vote drops both.

#### Scenario: A mark of the viewer changes at once

- **GIVEN** a post the viewer has voted on, and a vote the other way
- **WHEN** the viewer changes the vote and the server has not answered
- **THEN** the viewer's own vote shows the new value

#### Scenario: A count moves at once by the vote

- **GIVEN** a post whose like count is shown with a value
- **WHEN** the viewer likes the post and the server has not answered
- **THEN** the like count shows the value the vote makes

#### Scenario: A refused vote drops its mark and the count is read back

- **GIVEN** a vote the server refuses
- **WHEN** the write settles with an error
- **THEN** the viewer's mark shows its stored value
- **AND** the like count is read back from the server
