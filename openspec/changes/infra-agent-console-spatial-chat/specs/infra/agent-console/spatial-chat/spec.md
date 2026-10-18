## ADDED Requirements

### Requirement: Each spoken line is one bubble above the character, in order

The console SHALL show each spoken line of a reply as one bubble above the character, in the order the reply carries the lines, with each new line replacing the one before it.

#### Scenario: A new spoken line replaces the bubble before it

- **GIVEN** a reply's first spoken line is shown as a bubble
- **WHEN** the reply's second spoken line arrives
- **THEN** the bubble shows the second line
- **AND** the first line is no longer shown

#### Scenario: Spoken lines appear in the order the reply carries them

- **GIVEN** a reply carries two spoken lines
- **WHEN** the reply is shown
- **THEN** the lines appear in the order the reply carries them

### Requirement: Each answer sent through the reply tool is a selectable panel

The console SHALL show each answer sent through the reply tool as a panel in the scene whose text the reader can select and copy.

#### Scenario: An answer appears as a panel in front

- **GIVEN** the Genshin theme is in the scene view
- **WHEN** the reply tool sends an answer
- **THEN** a panel shows the answer in front

#### Scenario: The answer's text can be copied

- **GIVEN** a panel shows an answer
- **WHEN** the reader selects part of the text and copies it
- **THEN** the copied text matches the selected text of the answer

### Requirement: Older panels stack and a click brings one forward

The console SHALL slide the panel in front into a stack when a newer answer arrives, and SHALL bring a stacked panel forward when the reader clicks it.

#### Scenario: A new answer pushes the previous panel into the stack

- **GIVEN** a panel is in front
- **WHEN** a newer answer arrives
- **THEN** the previous panel moves into the stack

#### Scenario: A click brings a stacked panel forward

- **GIVEN** a panel is in the stack
- **WHEN** the reader clicks it
- **THEN** that panel comes to the front

### Requirement: The text box and the list view work as in the default theme

The console SHALL keep the text box working as it does in the default theme, and SHALL show the list view again when the reader turns the toggle to it.

#### Scenario: Typing in the scene view still sends a message

- **GIVEN** the Genshin theme is in the scene view
- **WHEN** the reader types a message and sends it
- **THEN** the message is sent as it is in the default theme

#### Scenario: The toggle returns the list view

- **GIVEN** the Genshin theme is in the scene view
- **WHEN** the reader turns the toggle to the list view
- **THEN** the conversation shows as a list of messages
