## MODIFIED Requirements

### Requirement: A vote shows at once on every copy of the post on screen

A vote SHALL appear immediately on every copy of the post the reader is looking at, whichever list or page the copy came from, with its net count moved by the vote's prediction until the server's answer replaces it.

#### Scenario: A vote on a post page shows on its feed card

- **GIVEN** a post shown both in the feed and on its own page
- **WHEN** the reader votes on the post from its own page
- **THEN** the feed card for the same post shows the same vote without a reload
- **AND** it shows the net count the vote makes at once, which the server's answer then replaces

#### Scenario: A refused vote is dropped from every copy on screen

- **GIVEN** a post shown in more than one place with a vote applied to all of them
- **WHEN** the server refuses that vote
- **THEN** every copy of the post shows the vote it held before
- **AND** every copy shows the net count the server reads back, which replaces the prediction
