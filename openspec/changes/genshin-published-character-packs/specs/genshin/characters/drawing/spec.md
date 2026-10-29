## ADDED Requirements

### Requirement: The player's character is drawn from its published pack

The player's character SHALL be drawn on the character body from its published pack, and no stand-in shape SHALL be drawn for a character.

#### Scenario: Held pack draws the character's model

- **GIVEN** the character's pack is downloaded
- **WHEN** the world starts
- **THEN** the character's model is drawn on the body at Windrise

#### Scenario: Character outside the index loads the Traveler

- **GIVEN** a save names a character the index does not list
- **WHEN** the world starts
- **THEN** the Traveler's model is drawn on the body

#### Scenario: Missing pack stops the loading and draws no capsule

- **GIVEN** the character's pack could not be downloaded
- **WHEN** the loading stops
- **THEN** the failure is shown
- **AND** no capsule is drawn in its place

## REMOVED Requirements

### Requirement: The Traveler is drawn on the body at Windrise's start

**Reason**: replaced by the requirement above, which draws the player's character from its published pack and keeps no capsule for a missing one.
