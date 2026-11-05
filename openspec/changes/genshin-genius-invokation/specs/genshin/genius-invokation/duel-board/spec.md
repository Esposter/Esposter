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

### Requirement: Seated challengers offer their duel from their talk

A seated challenger's talk SHALL offer its duel as a reply that opens the duel screen with the challenger's own deck.

#### Scenario: A seated challenger's talk opens the duel

- **GIVEN** a challenger is seated at its estimated place
- **WHEN** the player talks to the challenger and chooses the duel reply
- **THEN** the duel screen opens
- **AND** the challenger plays the deck the game gives its duel

### Requirement: Challenger games open at the Player Level

A challenger SHALL offer each game once the player's Player Level reaches the level that game's week row names.

#### Scenario: A game opens once the Player Level reaches its level

- **GIVEN** the player's Player Level is at or above a game's level
- **WHEN** the player asks the challenger for a duel
- **THEN** the challenger offers that game

#### Scenario: A game above the Player Level is not offered

- **GIVEN** the player's Player Level is below a game's level
- **WHEN** the player asks the challenger for a duel
- **THEN** the challenger does not offer that game

### Requirement: The card game opens at Adventure Rank 32

The card game SHALL open with its tutorial quest once the player reaches Adventure Rank 32.

#### Scenario: Reaching Adventure Rank 32 opens the card game

- **GIVEN** the player's Adventure Rank is 32
- **WHEN** the player is in the world
- **THEN** the card game and its tutorial quest are offered

#### Scenario: Below Adventure Rank 32 the card game stays closed

- **GIVEN** the player's Adventure Rank is below 32
- **WHEN** the player is in the world
- **THEN** the card game is not offered
