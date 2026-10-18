## Purpose

What the persona plugin prints at session start and gives the model: the card, the welcome's two voices, the output style that keeps the voice out of code, and the authored persona cards.

## Requirements

### Requirement: The session opens with a card that is also given to the model

At session start the session SHALL print a welcome card with the character's name, title, element and region, and SHALL give the model the card as context.

#### Scenario: A session starting with a character

- **GIVEN** a session with a character picked
- **WHEN** the session starts
- **THEN** the welcome shows the name, title, element and region, and the model is given the card

#### Scenario: A card switched mid-session

- **GIVEN** a card printed later in the conversation by a switch command
- **WHEN** the reply relaying it is written
- **THEN** that card replaces the session's card from that reply onward

### Requirement: The authored persona card is short and typed

An authored persona card SHALL hold three speech habits, a greeting and a sign-off, about fifty tokens in all.

#### Scenario: An authored card

- **GIVEN** an authored persona card for a character
- **WHEN** it is read
- **THEN** it holds three speech habits, a greeting and a sign-off

### Requirement: The welcome keeps the plugin's captions apart from the character's own line

The welcome SHALL keep the plugin's captions apart from the character's own greeting, so the two readers are never confused.

#### Scenario: The welcome at session start

- **GIVEN** a welcome with a nameplate, a bracketed note, remarks and a greeting
- **WHEN** it is shown
- **THEN** the nameplate, note and remarks are captions and only the greeting is in the character's voice

### Requirement: The welcome's remarks never reach the model as facts

The remarks in the welcome SHALL NOT reach the model as facts it answers from.

#### Scenario: The model's context at session start

- **GIVEN** a welcome with remarks
- **WHEN** the model is given its context
- **THEN** the remarks are absent from it

### Requirement: The voice remark appears only once a voice is set up

The welcome SHALL show a voice remark only once the voice has been set up.

#### Scenario: A person who has never set up a voice

- **GIVEN** a person who has not set up a voice
- **WHEN** the welcome is shown
- **THEN** no voice remark appears

#### Scenario: A person who has set up a voice

- **GIVEN** a person who has set up a voice
- **WHEN** the welcome is shown
- **THEN** the voice remark shows the dub and the volume or mute

### Requirement: The model never announces the birthday, and answers plainly when asked

The model SHALL never announce the character's birthday, and when asked about the character it SHALL answer plainly rather than in character.

#### Scenario: A question about the character's birthday

- **GIVEN** a person asking when the character's birthday is
- **WHEN** the model answers
- **THEN** it answers plainly with the date as the note states it

#### Scenario: A session with no question about the character

- **GIVEN** a session where no question about the character is asked
- **WHEN** the model replies
- **THEN** the birthday is never announced

### Requirement: While the plugin is enabled, the character speaks only in spoken lines

While the plugin is enabled, the character SHALL speak only in spoken lines, with code, commits, commands and error text kept plain.

#### Scenario: An answer to a question

- **GIVEN** an answer a reader will use
- **WHEN** the model replies
- **THEN** one spoken line opens the answer and at most one closes it

#### Scenario: Code and commands in a reply

- **GIVEN** a reply containing code, a commit message, a command or an error
- **WHEN** it is written
- **THEN** those parts are plain and carry no spoken line

#### Scenario: A question that asks for the character's own voice

- **GIVEN** a request whose ask is the character's own
- **WHEN** the model replies
- **THEN** the whole reply is in the character's voice

### Requirement: Authored cards describe speech and never instructions to the assistant

Each authored card SHALL describe how the character speaks and SHALL NOT describe what the assistant should do.

#### Scenario: Reviewing an authored card

- **GIVEN** an authored card under review
- **WHEN** a reviewer reads it
- **THEN** it describes speech habits and holds no instruction to the assistant
