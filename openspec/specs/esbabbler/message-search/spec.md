## Purpose

The right-sidebar search — one field mixing filter chips and free text, explicit-submit reads, and per-room search history.

## Requirements

### Requirement: A keyword followed by a colon becomes a filter chip

A word that names a filter followed by a colon SHALL become a filter chip as soon as the colon is typed, and any other text SHALL stay as search text.

#### Scenario: Typing a filter keyword

- **GIVEN** the search field is empty
- **WHEN** the reader types from:
- **THEN** a from chip appears with a picker for its value
- **AND** the search field is cleared

#### Scenario: Word ending in a colon that names no filter

- **GIVEN** the search field is empty
- **WHEN** the reader types a word followed by a colon that is not a filter name
- **THEN** the text stays in the search field as search text

#### Scenario: Keyword without a colon stays as text

- **GIVEN** the search field is empty
- **WHEN** the reader types from without a colon
- **THEN** from stays as search text

### Requirement: Enter runs the search on whatever is there and does nothing when there is nothing to search

Pressing Enter SHALL run the search on the current text and filters, and SHALL do nothing when there is no text and no filter with a value.

#### Scenario: Searching text

- **GIVEN** the reader has typed text in the search field
- **WHEN** they press Enter
- **THEN** the room's messages are searched for that text

#### Scenario: Searching with only a valued filter

- **GIVEN** the search field has a filter chip with a value and no text
- **WHEN** the reader presses Enter
- **THEN** the room's messages are searched with that filter

#### Scenario: Enter on an empty search

- **GIVEN** the search field is empty with no valued filter
- **WHEN** the reader presses Enter
- **THEN** no search runs

#### Scenario: A filter waiting for its value is not a search

- **GIVEN** the only thing in the search field is a filter chip waiting for its value
- **WHEN** the reader presses Enter
- **THEN** no search runs

### Requirement: A filter's value comes only from its picker

A filter's value SHALL be set only by choosing it from the filter's picker, never from typed text.

#### Scenario: Typed name does not fill a person filter

- **GIVEN** a from chip is waiting for its value
- **WHEN** the reader types a member's name and presses Enter
- **THEN** the chip still waits for its value
- **AND** the typed name is not used as the filter's value

#### Scenario: Picking a member fills the chip

- **GIVEN** a from chip is waiting for its value
- **WHEN** the reader picks a member from its picker
- **THEN** the chip shows that member as its value
- **AND** the search narrows to that member's messages

### Requirement: A filter waiting for its value narrows nothing

A filter that is waiting for its value SHALL NOT narrow results, while a value the reader chose SHALL narrow them even when it is false.

#### Scenario: Waiting filter ignored in a search

- **GIVEN** a pinned chip is waiting for its value and the reader searches for text
- **WHEN** the results are shown
- **THEN** the pending chip is ignored

#### Scenario: A false value is a real value

- **GIVEN** the reader picks false for a pinned filter
- **WHEN** the search runs
- **THEN** the chip shows false
- **AND** the results are narrowed to messages that are not pinned

### Requirement: Each filter offers its own picker

Each filter type SHALL offer a picker suited to its value: people, webhooks, rooms, media kinds, dates, or yes and no.

#### Scenario: Author type offers User and Webhook

- **GIVEN** an author type chip is waiting for its value
- **WHEN** its picker is shown
- **THEN** it offers User and Webhook

#### Scenario: Attachment filter offers media kinds

- **GIVEN** a has chip is waiting for its value
- **WHEN** its picker is shown
- **THEN** it offers the media kinds including files

#### Scenario: Date filter offers a date

- **GIVEN** a before, during or after chip is waiting for its value
- **WHEN** its picker is shown
- **THEN** it offers a date to choose

### Requirement: The author type filter separates people from webhooks

The author type filter SHALL return only messages from people when set to User, and only webhook messages when set to Webhook.

#### Scenario: User author type

- **GIVEN** the author type filter is set to User
- **WHEN** the search runs
- **THEN** the results include messages from people
- **AND** the results include room actions and calls

#### Scenario: Webhook author type

- **GIVEN** the author type filter is set to Webhook
- **WHEN** the search runs
- **THEN** only webhook messages are returned

### Requirement: Two filters of the same type narrow together and an exact repeat counts once

Two filters of the same type SHALL narrow results together, and an exact repeat SHALL NOT narrow results any further.

#### Scenario: Two attachment filters

- **GIVEN** the reader has two has chips with different values
- **WHEN** the search runs
- **THEN** the results match both filters

#### Scenario: Identical filters

- **GIVEN** the reader has two identical filter chips
- **WHEN** the search runs
- **THEN** the results are the same as with one of them

### Requirement: A search is saved to the room's history and restored from it

Each search SHALL be saved to the room's search history as the filters and text that ran, and selecting a history entry SHALL restore that search.

#### Scenario: Selecting a history entry

- **GIVEN** the room's history holds an earlier search with text and a filter
- **WHEN** the reader selects it
- **THEN** the same text and filter are restored
- **AND** the search runs again

#### Scenario: Waiting filter is not saved

- **GIVEN** a filter is waiting for its value when a search runs
- **WHEN** the search is saved to history
- **THEN** the waiting filter is not part of the saved entry

### Requirement: Results stay with the room they were searched in

Search results SHALL stay with the room they were searched in, so that results arriving after the reader moves to another room do not appear there.

#### Scenario: Reader switches rooms during a search

- **GIVEN** a search is in progress in one room
- **WHEN** the reader switches to another room before the results arrive
- **THEN** the results are kept under the room they were searched in
- **AND** they do not appear in the room the reader is now viewing

### Requirement: Browsing attachments is the file filter applied to search

Browsing a room's attachments SHALL be a search filtered to files, not a separate view.

#### Scenario: Attachments from search

- **GIVEN** the reader adds the has filter with file as its value
- **WHEN** the search runs
- **THEN** the room's messages with attachments are listed
