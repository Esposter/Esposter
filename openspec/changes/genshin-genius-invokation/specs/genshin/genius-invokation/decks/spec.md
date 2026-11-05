## ADDED Requirements

### Requirement: Card effects follow the game's card data

The card game SHALL play each card's effect as the game's own card data gives it, with its cost paid from the game's cost table.

#### Scenario: A played card applies its effect

- **GIVEN** the player holds a card whose cost is paid
- **WHEN** the player plays the card
- **THEN** the card's effect as the game's card data gives it takes place
- **AND** the card leaves the player's hand

#### Scenario: A card the player cannot pay for is refused

- **GIVEN** the player holds a card whose cost exceeds the dice the player has
- **WHEN** the player tries to play the card
- **THEN** the card is not played
- **AND** the board is unchanged
