## ADDED Requirements

### Requirement: The save keeps the Archive's opened entries and defeat counts

The save SHALL keep the ids of the Archive entries each section has opened, and the defeat count of each Living Being by its entry's id, and SHALL read both back on load.

#### Scenario: opened entries and counts survive a reload

- **GIVEN** a player with open entries and defeat counts, and the save has been acknowledged
- **WHEN** the player reloads the game
- **THEN** the same entries are open and the same counts are shown

#### Scenario: a new player starts with every entry locked

- **GIVEN** a player with no save yet
- **WHEN** the save is created
- **THEN** no Archive entry is open and no defeat is counted
