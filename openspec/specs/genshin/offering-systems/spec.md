## Purpose

The offering rule on the world. Every offering item the bag holds is offered at once and its rewards paid in, each level its items cover is reached and its reward paid once. The Frostbearing Tree stands in Dragonspine, its prompt offers on F, and its held count and level are saved.

## Requirements

### Requirement: Every offering item in the bag is offered at once

An offering SHALL take every offering item the bag holds out of the bag in one offer and count those items into the offering.

#### Scenario: Bag holds several offering items

- **GIVEN** the bag holds several items the tree's levels take
- **WHEN** the player offers at the tree
- **THEN** all of those items leave the bag together
- **AND** their count joins the offering's held count

### Requirement: Each level the held count covers is reached once

An offering SHALL reach each next level its held count covers, taking that level's items off the count and paying its rewards once.

#### Scenario: Held count covers two levels

- **GIVEN** the held count covers the items of two levels in turn
- **WHEN** the offer is made
- **THEN** both levels are reached in order
- **AND** each reached level's Adventure EXP is returned and its other rewards are paid once

#### Scenario: Offering has reached its last level

- **GIVEN** the offering has reached its last level
- **WHEN** more offering items are offered
- **THEN** the items stay held with no further level to reach

### Requirement: Items the bag cannot hold drop at the tree

An offering SHALL drop at the tree, as pick ups lying there, any items the bag has no room for.

#### Scenario: Bag has no room for the leftover

- **GIVEN** an offer leaves items the bag has no room for
- **WHEN** the offer completes
- **THEN** those items are dropped at the tree as pick ups lying at its place

### Requirement: The first offer starts the tree

The tree SHALL reach its first level on the first offer whatever the bag holds, paying that level's reward once.

#### Scenario: First offer with no offering items

- **GIVEN** the bag holds no offering items
- **WHEN** the player makes the first offer at the tree
- **THEN** the first level is reached
- **AND** its reward is paid once

### Requirement: The offer is made on F in reach of the tree

The tree SHALL show an Activate prompt named by the game's own text while the character is in reach, and SHALL offer the bag when the player presses F there.

#### Scenario: Pressing F in reach

- **GIVEN** the character is in reach of the tree
- **WHEN** the player presses F
- **THEN** the bag's offering items are offered at the tree

#### Scenario: Out of reach

- **GIVEN** the character is out of reach of the tree
- **WHEN** the world is shown
- **THEN** the tree shows no prompt

### Requirement: Offering progress is saved and resumed

The save SHALL keep the tree's held count and level so that a reload resumes the offering where it stood.

#### Scenario: Reload after offering

- **GIVEN** the player has offered items at the tree
- **WHEN** the game is reloaded
- **THEN** the held count and level are restored

#### Scenario: Save that predates the offering

- **GIVEN** a save holding no progress for the tree
- **WHEN** the save is loaded
- **THEN** the save is refused until it is backfilled

#### Scenario: Guest save merges into an account

- **GIVEN** a guest has offered items at the tree
- **WHEN** the guest's save merges into an account
- **THEN** the further level and the held count are kept

### Requirement: Statues follow the same offering rule

A statue's Oculi SHALL follow the same offering rule as the tree, reaching each level their count covers.

#### Scenario: Oculi offered at a statue

- **GIVEN** a statue with its own levels
- **WHEN** Oculi are offered to it
- **THEN** each level their count covers is reached by the same rule the tree follows

### Requirement: Items picked up while the levels load are offered

The offer SHALL count the bag's offering items once the tree's levels have arrived, so an item picked up while they load is offered too.

#### Scenario: Item picked up while the levels load

- **GIVEN** the tree's levels are still arriving
- **WHEN** the player picks up an offering item and then offers at the tree once the levels have arrived
- **THEN** the picked up item is offered too

### Requirement: The tree stands in at its place until its model lands

The world SHALL draw the Frostbearing Tree as a stand-in at its place in Mondstadt's region until its model and landmark are placed.

#### Scenario: Tree drawn at its place

- **GIVEN** the tree's place is published in the game's data
- **WHEN** the world shows Mondstadt's region
- **THEN** the tree is drawn as a stand-in at that place
