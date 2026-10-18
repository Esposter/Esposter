## ADDED Requirements

### Requirement: Effort select lists only the levels the session's model supports

The console SHALL list in the effort select only the effort levels that the session's current model supports.

#### Scenario: A model with effort support lists its levels

- **GIVEN** a session is running a model that supports effort
- **WHEN** the reader opens the effort select
- **THEN** the select lists exactly the levels the model supports

#### Scenario: A model without effort support shows no effort select

- **GIVEN** a session is running a model that supports no effort levels
- **WHEN** the composer is shown
- **THEN** no effort select is shown

#### Scenario: A model switch that drops the current level shows the level reported next

- **GIVEN** the session's current effort level is not supported by the model it switches to
- **WHEN** the reader switches to that model
- **THEN** the effort select shows the level the host reports next

### Requirement: Effort select opens on Ctrl+Shift+E in the Code tab

The console SHALL open the effort select when the reader presses Ctrl+Shift+E in the Code tab.

#### Scenario: The chord opens the effort select

- **GIVEN** the reader is in the Code tab with a session on a model that supports effort
- **WHEN** the reader presses Ctrl+Shift+E
- **THEN** the effort select opens

#### Scenario: The chord opens nothing for a model without effort support

- **GIVEN** the reader is in the Code tab with a session on a model that supports no effort levels
- **WHEN** the reader presses Ctrl+Shift+E
- **THEN** no effort select opens

### Requirement: A chosen effort level applies to that session alone

The console SHALL apply a chosen effort level to the session the reader chose it for and SHALL leave the effort level of every other session unchanged.

#### Scenario: A chosen level applies to this session only

- **GIVEN** the reader has two sessions open
- **WHEN** the reader chooses a level for one of them
- **THEN** that session runs at the chosen level
- **AND** the other session keeps its level

### Requirement: The effort select shows the level the host last reported

The console SHALL show the effort level the host last reported and SHALL NOT show a level the reader chose until the host reports it.

#### Scenario: The select keeps the reported level until the host reports the change

- **GIVEN** the effort select shows a level the host reported
- **WHEN** the reader chooses a different level
- **THEN** the select keeps showing the reported level until the host reports the new one

#### Scenario: A refused change never shows as made

- **GIVEN** the effort select shows a level the host reported
- **WHEN** the reader chooses a different level and the host refuses it
- **THEN** the select keeps showing the reported level
