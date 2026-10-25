## ADDED Requirements

### Requirement: A displayed count holds its value until the write that changes it settles

A count the server derives SHALL keep its displayed value until the write that changes it has settled, and the count SHALL then show the value the server reads back. The viewer's own mark MAY change at once, since the client holds it exactly.

#### Scenario: A count stays put while its write is in flight

- **GIVEN** a post whose like count is shown with a value
- **WHEN** the viewer likes the post and the server has not answered
- **THEN** the like count shows its previous value

#### Scenario: The count shows the read-back value once the write settles

- **GIVEN** a like write that has been sent for a post
- **WHEN** the write settles
- **THEN** the like count shows the value the server reads back for the post

#### Scenario: The viewer's own mark changes at once

- **GIVEN** a post the viewer has not liked
- **WHEN** the viewer likes it and the server has not answered
- **THEN** the viewer's own like mark shows as set

### Requirement: A read in a test settles without waiting for a read sent alongside it

A read made in a test SHALL settle without waiting for another read sent in the same tick, so a test that holds one read open does not hold the others.

#### Scenario: A held read does not hold a read sent in the same tick

- **GIVEN** a test that holds one read open with a deferred answer
- **WHEN** a second read is sent in the same tick
- **THEN** the second read settles while the first is still held
