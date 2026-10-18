## Purpose

The persona plugin's slash commands, one per verb, the script behind them, and the genshin skill that routes a request in words to the right verb.

## Requirements

### Requirement: Each control is its own slash command

The persona plugin SHALL offer each control as its own slash command named for its verb, so that every verb appears in the command menu.

#### Scenario: Command menu lists every verb

- **GIVEN** the persona plugin is installed
- **WHEN** the command menu is opened
- **THEN** each verb appears as its own command with the line the menu shows for it

### Requirement: Verb output reaches the model as the command result

A verb's command SHALL return the lines its script prints to the model as the command's output.

#### Scenario: Verb that prints a card

- **GIVEN** a verb prints a character card
- **WHEN** the verb's command runs
- **THEN** the model is told to answer as the character on the card

### Requirement: Requests in words route to the matching verb

The model SHALL route a request made in words to the verb that fulfils it, and a request that states no duration SHALL route to the use verb rather than the pin verb.

#### Scenario: Request for a character with no duration

- **GIVEN** a person asks to be a named character without saying how long
- **WHEN** the request is routed
- **THEN** the use verb runs
- **AND** no pin is written

#### Scenario: Request for a lasting change

- **GIVEN** a person asks for a character to stay for every later session
- **WHEN** the request is routed
- **THEN** the pin verb runs

### Requirement: Roster facts come from the game data read

Facts about the roster SHALL come from the script's read of the game data and never from the model's memory.

#### Scenario: Person asks about a roster character

- **GIVEN** a person asks about a character on the roster
- **WHEN** the model answers
- **THEN** the answer is taken from the script's output

#### Scenario: A change reports when it lands

- **GIVEN** a verb changes a setting
- **WHEN** the verb finishes
- **THEN** the script's last line says when the change takes effect

### Requirement: Status reports each setting with its source

The status verb SHALL report each setting together with where it came from, and SHALL change no setting.

#### Scenario: Character read from the pin

- **GIVEN** this session has no record of its own
- **WHEN** the status verb runs
- **THEN** the character is reported as read from the pin

#### Scenario: Reply language cascaded from the interface

- **GIVEN** the reply language was never set on its own
- **WHEN** the status verb runs
- **THEN** the reply language is reported as cascaded from the interface language

#### Scenario: Status writes nothing

- **GIVEN** any settings exist
- **WHEN** the status verb runs
- **THEN** no setting file is created or changed
