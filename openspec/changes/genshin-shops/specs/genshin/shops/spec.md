## ADDED Requirements

### Requirement: A shop offers each good at its own price, limit and sale dates

A shop SHALL offer each good at its price, its buy limit and the dates it sells between, and SHALL NOT offer a good outside those dates.

#### Scenario: A good is offered at its shop's price

- **GIVEN** an open shop that sells a good for Mora
- **WHEN** the player views the good
- **THEN** the good shows the price the game gives it

#### Scenario: A good is not offered outside its sale dates

- **GIVEN** a good that sells only between two dates
- **WHEN** the player views the good after the second date
- **THEN** the good is not offered

### Requirement: A bought good comes back on its own refresh

A good the player has bought up to its limit SHALL regain its limit on its refresh and not before, and a good with no refresh SHALL stay at its limit.

#### Scenario: A daily good's limit returns at the daily refresh

- **GIVEN** a daily good the player bought up to its limit
- **WHEN** the daily refresh comes round
- **THEN** the player can buy the good again

#### Scenario: A good with no refresh stays bought

- **GIVEN** a good with no refresh that the player bought up to its limit
- **WHEN** a daily refresh comes round
- **THEN** the good is still at its limit

#### Scenario: A purchase past the limit is refused

- **GIVEN** a good the player has bought up to its limit
- **WHEN** the player tries to buy it again before its refresh
- **THEN** the purchase is refused and the wallet is unchanged

### Requirement: A grocery ingredient bought goes into the bag

A purchase of a grocery ingredient SHALL take its Mora and add the ingredient to the bag, and a purchase the bag cannot hold whole SHALL be refused with nothing spent.

#### Scenario: Buying a grocery ingredient into an empty bag adds it to the bag

- **GIVEN** an empty bag and a grocery ingredient priced in Mora
- **WHEN** the player buys the ingredient
- **THEN** the price is taken in Mora
- **AND** one of the ingredient is in the bag

#### Scenario: A purchase the bag cannot hold whole is refused

- **GIVEN** a bag with no room for a new kind of item
- **WHEN** the player buys a grocery ingredient of that kind
- **THEN** the purchase is refused
- **AND** the player's Mora is unchanged

### Requirement: Paimon's Bargains offers its rotation of characters and weapons

Paimon's Bargains SHALL offer two characters each month and a set of weapons every two months, each at its Starglitter price.

#### Scenario: Two characters are offered each month

- **GIVEN** the month of a rotation
- **WHEN** the player opens Paimon's Bargains
- **THEN** two characters are offered at their Starglitter price

#### Scenario: A character with full constellations cannot be bought

- **GIVEN** a character the player holds with all its constellations
- **WHEN** the player tries to buy it at Paimon's Bargains
- **THEN** the purchase is refused

### Requirement: A Souvenir Shop trades Sigils and never restocks

A region's Souvenir Shop SHALL trade its Sigils for materials, blueprints and Mora, and SHALL stay closed until the region's offering is at its last level.

#### Scenario: Sigils are traded for materials, blueprints and Mora

- **GIVEN** a player holding the region's Sigils and an open Souvenir Shop
- **WHEN** the player trades Sigils for a good
- **THEN** the Sigils are spent and the good is given

#### Scenario: A Souvenir Shop stays closed until its offering is at its last level

- **GIVEN** a region whose offering is below its last level
- **WHEN** the player tries to open the region's Souvenir Shop
- **THEN** the shop does not open

#### Scenario: Souvenir goods never restock

- **GIVEN** a Souvenir good the player has bought up to its limit
- **WHEN** a refresh comes round
- **THEN** the good stays at its limit

### Requirement: A city shop takes a reputation discount on its Mora prices

A city's named shop SHALL take ten percent off its Mora prices at reputation level four, rounded down to a multiple of five Mora.

#### Scenario: A discounted Mora price is rounded down to a multiple of five

- **GIVEN** a player at reputation level four and a city shop good priced at one hundred twenty Mora
- **WHEN** the player views the good
- **THEN** the good costs one hundred five Mora

#### Scenario: A price below reputation level four is not discounted

- **GIVEN** a player below reputation level four and a city shop good priced at one hundred twenty Mora
- **WHEN** the player views the good
- **THEN** the good costs one hundred twenty Mora

### Requirement: A vendor's talk opens their shop

A city's vendor SHALL open their shop when the player talks to them.

#### Scenario: Talking to a vendor opens their shop

- **GIVEN** a placed city vendor with a shop
- **WHEN** the player talks to the vendor
- **THEN** the vendor's shop opens

### Requirement: Goods paid in Genesis Crystals are never offered

A good paid in Genesis Crystals SHALL NOT be offered by any shop.

#### Scenario: Gift Shop goods are never offered

- **GIVEN** a shop that sells goods for Genesis Crystals
- **WHEN** the player opens the shop
- **THEN** none of its Genesis Crystal goods is offered
