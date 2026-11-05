## ADDED Requirements

### Requirement: A character and a card are announced with their numbers

A character's and a card's accessible name SHALL carry the numbers the board shows on it, each worded by its game label, a number whose label has no text id being read alone.

#### Scenario: A character's name is read with its HP, energy and shield

- **GIVEN** a character stands on the duel board with its HP, energy and shield
- **WHEN** a screen reader reads the character's name
- **THEN** the name is read with its HP, energy and shield, each in its game label's words

#### Scenario: A card's name is read with its dice cost

- **GIVEN** a card is in the player's hand with a dice cost
- **WHEN** a screen reader reads the card's name
- **THEN** the name is read with its dice cost, in the game label's words

#### Scenario: A number whose label has no text id is read alone

- **GIVEN** a character or card shows a number whose label has no text id
- **WHEN** a screen reader reads its name
- **THEN** the number is read alone, without a label
