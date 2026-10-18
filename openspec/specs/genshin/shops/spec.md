## Purpose

The game's shop goods read from its shop table into slices and bought by one rule, with a buy limit restocked on its refresh and nothing for Genesis Crystals. Paimon's Bargains' Fates and the Mondstadt grocery's Mora-priced general goods are built; the screens, the rotation, the weapons and materials, and the other shops are not yet built.

## Requirements

### Requirement: A good is offered only at its Adventure Rank and within its dates

A shop good SHALL be offered only once the player's Adventure Rank reaches its rank and only within its dates.

#### Scenario: A good below the player's rank is refused

- **GIVEN** a good requires a higher Adventure Rank than the player has
- **WHEN** the player tries to buy it
- **THEN** the purchase is refused

#### Scenario: A good outside its dates is refused

- **GIVEN** a good is outside its sale dates
- **WHEN** the player tries to buy it
- **THEN** the purchase is refused

### Requirement: A buy limit counts purchases since the last refresh

A good with a buy limit SHALL be sold up to that limit between refreshes, and a limit of zero SHALL mean no limit.

#### Scenario: A good at its limit is sold out until its refresh

- **GIVEN** a good's purchases since its refresh have reached its limit
- **WHEN** the player tries to buy it
- **THEN** the purchase is refused until the refresh

#### Scenario: A refresh restores the buy limit

- **GIVEN** a good has reached its limit
- **WHEN** its refresh passes
- **THEN** the good can be bought up to its limit again

#### Scenario: A good with a limit of zero has no limit

- **GIVEN** a good's buy limit is zero
- **WHEN** the player buys it repeatedly
- **THEN** no purchase is refused for its limit

### Requirement: Refreshes happen at four in the morning game time

Daily and monthly refreshes SHALL happen at four in the morning in the game's time, and a monthly refresh SHALL fall on the first of the month.

#### Scenario: A purchase before the monthly refresh counts to the month before

- **GIVEN** a purchase is made on the first of a month before four in the morning
- **WHEN** the monthly buy limit is counted
- **THEN** the purchase counts toward the month before

### Requirement: A purchase takes its price from the wallet and gives the item's currency

A purchase SHALL take its price from the wallet and give the item's currency, and SHALL be refused when the wallet cannot pay.

#### Scenario: A purchase takes the price and gives the currency

- **GIVEN** the wallet holds a good's price
- **WHEN** the player buys the good
- **THEN** the price is taken from the wallet
- **AND** the good's item currency is given to the player

#### Scenario: A purchase the wallet cannot pay is refused

- **GIVEN** the wallet does not hold a good's price
- **WHEN** the player buys the good
- **THEN** the purchase is refused and the wallet is unchanged

#### Scenario: A good giving an item the shop does not trade in is refused

- **GIVEN** a good gives an item that is not a currency the shop trades in
- **WHEN** the player buys the good
- **THEN** the purchase is refused

### Requirement: A Mora-priced good costs its Mora price

A good priced in Mora SHALL cost the Mora amount its table gives.

#### Scenario: A general good costs its Mora price

- **GIVEN** a general good of the Mondstadt grocery is priced in Mora
- **WHEN** the player buys it
- **THEN** the good costs its table's Mora amount from the wallet
