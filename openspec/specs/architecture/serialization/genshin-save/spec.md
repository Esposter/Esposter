## Purpose

Why the Genshin save's instants are read as the schema's ISO strings with plain JSON.parse, never revived into Date objects.

## Requirements

### Requirement: Save timestamps stay as text when a save is read

Save timestamps SHALL be read as the text the save schema defines and SHALL NOT be converted to date values when a save is read, on the server or in the browser.

#### Scenario: A saved game is read on the server

- **GIVEN** a saved game with timestamps stored as text
- **WHEN** the server reads the save
- **THEN** the timestamps are validated as text
- **AND** the save is read as present

#### Scenario: A saved game is read in the browser while signed out

- **GIVEN** a guest save held in the browser
- **WHEN** the browser reads the save
- **THEN** the save is read by the same rule and is read as present

#### Scenario: Timestamps converted to dates on read

- **GIVEN** a save whose timestamps were converted to date values on read
- **WHEN** the save schema checks them
- **THEN** every save reads as absent
