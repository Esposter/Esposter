## Purpose

The monster/attack/item content maps, the party and details scenes, and the inventory. The content is fixed data for the monster roster, its attacks, and its items, and the scenes show it to the player.

## Requirements

### Requirement: Distinct monster species

The monster roster SHALL consist of five species, each playing a distinct role in battle.

#### Scenario: New games start with the balanced starter

- **WHEN** a new game begins
- **THEN** the player's first party monster is Iguanignite

#### Scenario: The tank has the highest defense

- **WHEN** the player compares species in the monster details view
- **THEN** Aquavalor shows the highest defense and the highest maximum health

#### Scenario: The fast monster is fragile

- **WHEN** the player compares species in the monster details view
- **THEN** Carnodusk shows the highest attack and the lowest defense and maximum health

#### Scenario: The rare prize species gives the most experience

- **WHEN** the player defeats a Frostsaber
- **THEN** the defeat awards more experience than defeating any other species

### Requirement: New monsters start fresh and independent

A newly obtained monster SHALL start at full health with no experience, and each caught monster SHALL be an independent instance whose stats grow on its own.

#### Scenario: A caught monster starts at full health

- **WHEN** the player catches a monster
- **THEN** the monster starts at full health with no experience

#### Scenario: Leveling one monster leaves others unchanged

- **GIVEN** the player has two monsters of the same species
- **WHEN** one of them levels up
- **THEN** the other keeps its own stats and experience

### Requirement: Rebalanced species stats reach only new monsters

Caught monsters SHALL keep their stored stats when a species' base stats are rebalanced, and only newly encountered monsters SHALL take the new base stats.

#### Scenario: A caught monster keeps its stored stats

- **GIVEN** a species' base stats have been rebalanced
- **WHEN** the player loads a save containing a caught monster of that species
- **THEN** the caught monster keeps its stored stats

#### Scenario: A new encounter uses the rebalanced stats

- **GIVEN** a species' base stats have been rebalanced
- **WHEN** the player encounters a monster of that species for the first time
- **THEN** the monster starts from the rebalanced base stats

### Requirement: Each species has its own attacks

Each monster species SHALL know two or three attacks, and each attack SHALL carry its own power and its own sound.

#### Scenario: The strongest attack belongs to the prize species

- **WHEN** a Frostsaber uses Frost Fang
- **THEN** the attack is the strongest attack in the game

#### Scenario: Attacks differ in damage

- **WHEN** a monster uses two different attacks against the same defender
- **THEN** the two attacks can deal different damage

### Requirement: Items are usable only where their effect allows

An item SHALL be usable only from the scenes its effect type allows, so capture balls work only in battle.

#### Scenario: A capture ball cannot be used outside battle

- **WHEN** the player selects a capture ball in the inventory outside battle
- **THEN** the capture ball is not used

#### Scenario: A capture ball can be used in battle

- **WHEN** the player selects a capture ball during battle
- **THEN** the capture ball is used

### Requirement: Healing potions restore health

A healing potion SHALL restore 30 health to the monster the player chooses.

#### Scenario: A potion restores health to the chosen monster

- **WHEN** the player uses a potion on a party monster
- **THEN** that monster's health rises by 30

### Requirement: Inventory quantities persist without altering item definitions

Inventory quantities SHALL persist with the player's save, and using an item SHALL reduce only that player's quantity, never the shared item definition.

#### Scenario: Using an item lowers its quantity

- **WHEN** the player uses a potion from the inventory
- **THEN** the potion's quantity in the player's inventory drops by one

#### Scenario: The quantity survives saving

- **GIVEN** the player has used a potion
- **WHEN** the player saves and returns to the game
- **THEN** the potion's reduced quantity is still shown

### Requirement: Party scene serves switching, healing, and reordering

The party scene SHALL list each party monster with its health and level, and SHALL serve battle switching, item healing, and reordering.

#### Scenario: Switching in battle picks from the party

- **WHEN** the player chooses Switch during battle
- **THEN** the party scene lists the party monsters to bring out

#### Scenario: Healing from the inventory picks a target from the party

- **WHEN** the player uses a healing item from the inventory
- **THEN** the party scene lists the party monsters to choose as the target

#### Scenario: Reordering changes the party order

- **WHEN** the player moves a party monster to another slot
- **THEN** the party order changes to match

### Requirement: Monster details show statistics and attacks

The monster details scene SHALL show one monster's statistics and attacks.

#### Scenario: Viewing a monster's details

- **WHEN** the player opens the details of a party monster
- **THEN** its statistics and its attacks are shown
