## Purpose

The store panel — building tiers, price scaling, upgrade unlock conditions, and the buying flow.

## Requirements

### Requirement: Every building is always listed

The store SHALL list every building tier at all times, whatever the player owns.

#### Scenario: Buildings listed in a new game

- **GIVEN** a player with no bought items
- **WHEN** the store panel is opened
- **THEN** every building tier is listed with its current price
- **AND** no building tier is hidden

### Requirement: Upgrades appear only once unlocked

The store SHALL show an upgrade only while every unlock condition it names is met.

#### Scenario: Locked upgrade stays hidden

- **GIVEN** a player who owns fewer of the required building than the upgrade asks for
- **WHEN** the store panel is opened
- **THEN** the upgrade is not listed

#### Scenario: Upgrade unlocks after its prerequisite upgrade is bought

- **GIVEN** a player who has bought the upgrade that the new upgrade requires
- **WHEN** the store panel is opened
- **THEN** the new upgrade is listed

#### Scenario: One unmet condition keeps an upgrade hidden

- **GIVEN** an upgrade with two unlock conditions where only one is met
- **WHEN** the store panel is opened
- **THEN** the upgrade is not listed

### Requirement: Unlocked upgrades are sorted by price

The store SHALL list unlocked upgrades in order of their price.

#### Scenario: Unlocked upgrades in price order

- **GIVEN** two unlocked upgrades with different prices
- **WHEN** the store panel is opened
- **THEN** the upgrades are listed in order of price

### Requirement: Bought upgrades leave the store

The store SHALL remove an upgrade from its list once the player has bought it.

#### Scenario: Bought upgrade moves to the inventory

- **GIVEN** an unlocked upgrade in the store list
- **WHEN** the player buys it
- **THEN** the upgrade is no longer listed in the store
- **AND** the upgrade appears in the inventory

### Requirement: Building prices grow with the number owned

The store SHALL price each building at its base price multiplied by one point one five raised to the number of that building already owned, rounded down.

#### Scenario: Price rises after each purchase

- **GIVEN** a player who owns three units of a building
- **WHEN** the player views the price of that building
- **THEN** the price is its base price multiplied by one point one five cubed, rounded down

#### Scenario: Upgrade price stays fixed

- **GIVEN** an upgrade with a set price
- **WHEN** the player buys more buildings
- **THEN** the price of the upgrade is unchanged

### Requirement: Bought items cannot be sold

The store SHALL offer no way to sell a bought building or upgrade.

#### Scenario: Owned building has no sell action

- **GIVEN** a player who owns a building
- **WHEN** the player opens that building in the store
- **THEN** no sell action is offered

### Requirement: Purchases the player cannot afford or repeats are refused

The store SHALL refuse any purchase the player cannot afford and any upgrade the player has already bought.

#### Scenario: Affordable purchase is completed

- **GIVEN** a player whose points are at least the price of an item
- **WHEN** the player presses Buy on that item
- **THEN** the item is added to the player's bought items
- **AND** the price is taken from the player's points

#### Scenario: Unaffordable item is shown as such

- **GIVEN** a player whose points are below the price of an item
- **WHEN** the item is viewed in the store
- **THEN** its price is shown as unaffordable
- **AND** its Buy button is disabled

#### Scenario: Unaffordable purchase leaves the game unchanged

- **GIVEN** a player whose points are below the price of an item
- **WHEN** a purchase of that item is requested anyway
- **THEN** the purchase is refused
- **AND** the player's points and bought items are unchanged

#### Scenario: Repeat purchase of an upgrade is refused

- **GIVEN** an upgrade the player has already bought
- **WHEN** a purchase of that upgrade is requested
- **THEN** the purchase is refused
- **AND** the player's points are unchanged

### Requirement: Buildings can be bought in batches of one, ten or one hundred

The store SHALL let the player buy one, ten or one hundred buildings of a tier in a single purchase.

#### Scenario: Batch purchase costs the sum of each unit's price

- **GIVEN** the buy quantity is set to ten
- **WHEN** the player presses Buy on a building
- **THEN** ten units of that building are added
- **AND** the total cost is the sum of the price of each unit at the count it was bought

#### Scenario: Batch purchase above the player's points is refused

- **GIVEN** a buy quantity whose total cost is more than the player's points
- **WHEN** the player presses Buy on a building
- **THEN** the purchase is refused
- **AND** the player's points and bought items are unchanged

#### Scenario: Upgrades ignore the buy quantity

- **GIVEN** the buy quantity is set to ten
- **WHEN** the player buys an upgrade
- **THEN** exactly one upgrade is bought

### Requirement: Bought buildings show their statistics

The store SHALL show each bought building's power per unit, its share of total production and the points it has produced in its lifetime.

#### Scenario: Statistics for an owned building

- **GIVEN** a player who owns at least one unit of a building
- **WHEN** the building's row is opened
- **THEN** its power per unit is shown
- **AND** its share of total production is shown
- **AND** the points it has produced in its lifetime are shown

### Requirement: Each owned building produces points every second

Each owned building SHALL produce points per second in proportion to the number of its units the player owns.

#### Scenario: Production grows with owned units

- **GIVEN** a player who owns units of a building
- **WHEN** a second of play passes
- **THEN** the player's points increase by the building's production for that many units

### Requirement: Bought upgrades change the power they name

A bought upgrade SHALL change the production or click power of the buildings or clicks its effects name.

#### Scenario: Click upgrade raises the value of a click

- **GIVEN** a player who has bought an upgrade that affects clicks
- **WHEN** the player clicks the central item
- **THEN** the points added by the click are higher than they were before the upgrade

### Requirement: Large point counts use long-word notation

The store SHALL show large point counts with a long word for their magnitude, such as thousand or million.

#### Scenario: A million points is shown with a long word

- **GIVEN** a player with one million points
- **WHEN** the point count is displayed
- **THEN** the count is shown with the word million
