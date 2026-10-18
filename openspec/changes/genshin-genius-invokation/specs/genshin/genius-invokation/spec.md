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

### Requirement: The Player Level follows the game's level table

The Player Level SHALL follow the game's level table, starting at level one with no EXP once the tutorial quest is finished.

#### Scenario: Finishing the tutorial quest starts the Player Level at one

- **GIVEN** the player has not yet finished the tutorial quest
- **WHEN** the player finishes the tutorial quest
- **THEN** the player's Player Level is one
- **AND** the player holds no EXP

#### Scenario: Passing a level's EXP raises the Player Level

- **GIVEN** the player's Player Level is below ten
- **WHEN** the player's EXP reaches the EXP that passes the current level
- **THEN** the player's Player Level rises by one

#### Scenario: The tenth level passes no further

- **GIVEN** the player's Player Level is ten
- **WHEN** the player earns more EXP
- **THEN** the player's Player Level stays at ten

### Requirement: Winning a duel pays its rewards

Winning a duel SHALL pay the opponent's cards, its Lucky Coins and its EXP into the Player Level as the game gives each.

#### Scenario: A won duel pays cards, Lucky Coins and EXP

- **GIVEN** the player wins a duel against a challenger
- **WHEN** the duel ends
- **THEN** the player receives the challenger's cards and Lucky Coins
- **AND** the duel's EXP is added to the Player Level

### Requirement: The Card Shop sells cards for Lucky Coins

The Card Shop SHALL sell cards for Lucky Coins at the prices the game gives them.

#### Scenario: A card is bought with Lucky Coins

- **GIVEN** the player holds enough Lucky Coins for a card
- **WHEN** the player buys the card at the Card Shop
- **THEN** the card is added to the player's collection
- **AND** the price in Lucky Coins is taken from the player

#### Scenario: A card the player cannot afford is not sold

- **GIVEN** the player holds fewer Lucky Coins than a card's price
- **WHEN** the player tries to buy the card at the Card Shop
- **THEN** the purchase is refused
- **AND** the player's Lucky Coins are unchanged

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
