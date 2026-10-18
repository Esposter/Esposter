## ADDED Requirements

### Requirement: A line typed on the chat page reaches the running session as a desk line

The channel SHALL deliver each line typed on the chat page into the running session as a line from the desk.

#### Scenario: A typed line becomes a session turn

- **GIVEN** the chat page is open with its token
- **WHEN** the reader types a line and sends it
- **THEN** the session receives the line as a desk line
- **AND** the session answers it as it would any turn

#### Scenario: A line sent while the session is busy shows as sent

- **GIVEN** the session is in the middle of a turn
- **WHEN** the reader sends a line from the chat page
- **THEN** the page shows the line as sent
- **AND** the line is answered with the session's next turn

### Requirement: A line without the page's token, or from off the loopback, is dropped

The channel SHALL drop any line that is posted without the page's token or from anywhere but the loopback.

#### Scenario: A line without the token is dropped

- **GIVEN** the chat page's token is printed to the terminal
- **WHEN** a line is posted without that token
- **THEN** the session receives nothing

#### Scenario: A line from off the loopback is dropped

- **GIVEN** the chat page is running on the loopback
- **WHEN** a line is posted from another machine
- **THEN** the session receives nothing

### Requirement: The plain half of an answer returns to the page under the line that asked

The channel SHALL show the plain half of an answer to a line from the page under that line, through the reply tool.

#### Scenario: An answer is shown under the line that asked

- **GIVEN** the session received a line from the chat page
- **WHEN** the session calls the reply tool with its answer
- **THEN** the page shows the answer under that line

#### Scenario: The character's spoken lines are not repeated on the page

- **GIVEN** the character speaks a reply aloud
- **WHEN** the reply is shown on the chat page
- **THEN** the page shows only the plain half of the answer

### Requirement: A tool approval is answered by a tap on the character

The channel SHALL show a tool approval as a two-choice bubble on the character, and SHALL answer the approval with the choice the reader taps.

#### Scenario: An approval appears as a two-choice bubble

- **GIVEN** a viewer is on file
- **WHEN** the session asks to run a tool
- **THEN** a bubble shows the tool's name and input with two choices

#### Scenario: A tap on a choice answers the approval

- **GIVEN** an approval bubble is shown
- **WHEN** the reader taps one of its choices
- **THEN** the session receives that choice as the verdict

#### Scenario: No viewer on file means no approval bubble

- **GIVEN** no viewer is on file
- **WHEN** the session asks to run a tool
- **THEN** no approval bubble is shown
- **AND** the terminal asks for the approval itself

### Requirement: The channel runs only with its session and only in a session launched with its flag

The channel SHALL start with its session and end with it, and SHALL reach only a session launched with the channel flag.

#### Scenario: The chat page stops answering when the session ends

- **GIVEN** the chat page is open for a session
- **WHEN** the session ends
- **THEN** the chat page no longer takes lines

#### Scenario: A session without the channel flag takes no lines from the page

- **GIVEN** a session is launched without the channel flag
- **WHEN** a line is posted to the chat page
- **THEN** the session receives nothing
