## ADDED Requirements

### Requirement: The Player Level follows the game's level table

The Player Level SHALL follow the game's level table, starting at level one with no EXP once the tutorial quest is finished.

#### Scenario: Finishing the tutorial quest starts the Player Level at one

- **GIVEN** the player has not yet finished the tutorial quest
- **WHEN** the player finishes the tutorial quest
- **THEN** the player's Player Level is one
- **AND** the player holds no EXP

#### Scenario: Passing a level's EXP raises the Player Level

- **GIVEN** the player's Player Level is below ten, and every level lock at or below it has its main quest done
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
- **THEN** the card is added to the player's bag
- **AND** the price in Lucky Coins is taken from the player

#### Scenario: A card the player cannot afford is not sold

- **GIVEN** the player holds fewer Lucky Coins than a card's price
- **WHEN** the player tries to buy the card at the Card Shop
- **THEN** the purchase is refused
- **AND** the player's Lucky Coins are unchanged
