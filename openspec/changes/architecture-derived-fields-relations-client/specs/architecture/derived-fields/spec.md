## Purpose

Defines how the client predicts a change to a derived value from the row a write replaces, settles each prediction on the server's answer, and displays the held value with the predictions still pending.

## ADDED Requirements

### Requirement: A write that changes a contributing row predicts each target's value at once

A write whose entry sets a row that contributes to an aggregate SHALL move each target the row names by the difference the row makes against the held row it replaces, so the viewer sees the new value before the server answers.

#### Scenario: A vote shows its count at once on the post

- **GIVEN** a post whose net count is held
- **WHEN** the viewer votes on the post and the server has not answered
- **THEN** the post's net count shows the count the vote makes

#### Scenario: A vote change moves the count by the difference from the held vote

- **GIVEN** a post with a held vote of one value
- **WHEN** the viewer changes the vote to the other value and the server has not answered
- **THEN** the post's net count moves by the difference between the two values

#### Scenario: A reply shows the counts of the posts above it at once

- **GIVEN** a reply under a post whose ancestors are held
- **WHEN** the viewer creates the reply and the server has not answered
- **THEN** each post above the reply shows its count plus one

#### Scenario: A new reply starts its own count at zero

- **GIVEN** a reply the viewer has just created and the server has not answered
- **WHEN** the reply is shown
- **THEN** its own count shows zero

#### Scenario: A prediction equals the answer it settles to

- **GIVEN** a write whose held rows equal the rows the server holds
- **WHEN** the server answers
- **THEN** the predicted count equals the count the answer carries

### Requirement: A removal predicts a target only when the value it moves from is held and current

A removal SHALL predict the change to each post above it only when the removed row's own aggregate is held at its current version, and otherwise SHALL leave the change to the server's answer.

#### Scenario: A removal with a held subtree count predicts each post above it

- **GIVEN** a comment whose own count is held at its current version
- **WHEN** the viewer removes the comment and the server has not answered
- **THEN** each post above the comment shows its count less the comment and every reply under it

#### Scenario: A removal with no held subtree count waits for its answer

- **GIVEN** a comment whose own count is not held
- **WHEN** the viewer removes the comment
- **THEN** the posts above it keep their held counts until the server answers

### Requirement: A predicted value settles on the answer and drops on a refusal

An answer SHALL replace the held value of each derived row it carries, at the version the answer carries, and the write's predictions SHALL be removed when the write settles, whether it succeeded or was refused.

#### Scenario: An answer replaces the prediction at the version it carries

- **GIVEN** a predicted count and a write that answers with the count at a newer version
- **WHEN** the write settles
- **THEN** the shown count is the answer's count and the prediction is gone

#### Scenario: A refused write drops its prediction and reads the value back

- **GIVEN** a predicted count and a write the server refuses
- **WHEN** the write settles with its error
- **THEN** the shown count is the held count without the prediction, and the count is read back from the server

#### Scenario: A settled write reads back the values it touched

- **GIVEN** a predicted count and a write the server accepted
- **WHEN** the write settles with its answer
- **THEN** the touched post's counts are read again, so another viewer's change reaches the store

### Requirement: A displayed derived value is the held value plus the predictions still pending

Every display of a derived value SHALL show the held value plus the predictions still pending for it, so that a read that lands while a write is pending keeps the prediction until the write settles.

#### Scenario: A read landing during a pending write keeps the prediction

- **GIVEN** a predicted count with its write still pending
- **WHEN** a read of the same post's counts lands before the write settles
- **THEN** the shown count still includes the prediction

### Requirement: A derived value read from the server applies under the version rule of the overlay

A derived value read from the server SHALL apply under the version rule the overlay states for its rows, so that an older read in flight never overwrites a newer value.

#### Scenario: An older read never overwrites a newer held value

- **GIVEN** a held value at a version and a read answering the same row at an older version
- **WHEN** the read lands
- **THEN** the held value is unchanged

### Requirement: A copy the client cannot take from a held source waits for its answer

A row whose inherited values come from a source row SHALL take them from the source the client holds, and SHALL wait for its answer when the source is not held, so that no inherited value is shown as fact before it is known.

#### Scenario: A reply to a parent not held shows once its answer arrives

- **GIVEN** a reply whose parent the client does not hold
- **WHEN** the viewer creates the reply
- **THEN** the reply is not shown until the server answers with its inherited values
