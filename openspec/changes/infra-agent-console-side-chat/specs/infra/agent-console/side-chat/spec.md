## ADDED Requirements

### Requirement: Ctrl+; opens a side chat beside the conversation

The console SHALL open a side chat drawer beside the conversation when the reader presses Ctrl+;, with its own composer.

#### Scenario: The chord opens the side chat

- **GIVEN** the reader has a session open in the Code tab
- **WHEN** the reader presses Ctrl+;
- **THEN** a side chat drawer opens beside the conversation
- **AND** the drawer has its own composer

#### Scenario: A side chat question leaves the main conversation unchanged

- **GIVEN** a side chat is open
- **WHEN** the reader asks it a question
- **THEN** the main conversation has no new message

### Requirement: The side chat's first question starts from the session's latest message

The console SHALL start a side chat from the session's latest message, so that its answers use the whole conversation as context.

#### Scenario: The first question is answered with the conversation as context

- **GIVEN** the session has earlier work in its conversation
- **WHEN** the reader asks the side chat's first question about that work
- **THEN** the answer refers to the earlier work

### Requirement: The side chat asks and never acts

The console SHALL open a side chat in plan mode so that a question cannot change files.

#### Scenario: A side chat question cannot become edits

- **GIVEN** a side chat is open
- **WHEN** the reader asks it to change a file
- **THEN** no file is changed

### Requirement: A side chat is never saved

The console SHALL keep a side chat out of the saved sessions, and SHALL keep it out of the sessions list while it is open.

#### Scenario: A closed side chat leaves no saved session

- **GIVEN** the reader has asked a side chat questions
- **WHEN** the reader closes the drawer
- **THEN** the sessions list shows no entry for the side chat

#### Scenario: An open side chat is hidden from the sessions list

- **GIVEN** a side chat drawer is open
- **WHEN** the reader views the sessions tab
- **THEN** the side chat is not listed

### Requirement: Closing the drawer discards the side chat

The console SHALL discard a side chat's answers when its drawer closes, and SHALL NOT write any of them to the main conversation.

#### Scenario: Closing the drawer discards its answers

- **GIVEN** a side chat has given answers
- **WHEN** the reader closes the drawer
- **THEN** the side chat's answers are gone
- **AND** the main conversation is unchanged
