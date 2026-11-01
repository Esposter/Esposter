## Purpose

The blacksmith's recipes from the game's forge table — enhancement ores and four-star weapons forged from their billets once their diagrams are learned, the Mystic Enhancement Ore drawn from its random table, each order queued in a queue the Adventure Rank opens, its units finishing over real time and collected at any blacksmith, the enhancement ores' forge points held to 400,000 a game day, the forging talents of five characters, and the Serenitea Pot's refusal of Magical Crystal Chunks. The blacksmith's place is not built yet.

## Requirements

### Requirement: A recipe is refused until its rank and diagram allow it

A forge recipe SHALL be refused an order until the player's Adventure Rank reaches it and, where a diagram opens it, that diagram is learned.

#### Scenario: Order for a recipe below the rank is refused

- **GIVEN** the player's Adventure Rank is below the rank a recipe opens at
- **WHEN** the player orders that recipe
- **THEN** the order is refused

#### Scenario: Using a diagram learns its recipe

- **GIVEN** a recipe's diagram is in the bag
- **WHEN** the player uses the diagram
- **THEN** the diagram leaves the bag and the recipe is learned

#### Scenario: Order for an unlearned recipe is refused

- **GIVEN** a recipe is opened by a diagram the player has not learned
- **WHEN** the player orders that recipe
- **THEN** the order is refused

### Requirement: Queues open by rank

The blacksmith SHALL run one queue at first, a second at rank five, a third at rank ten and a fourth at rank fifteen, each queue holding one order of up to the recipe's queue size.

#### Scenario: Second queue opens at rank five

- **GIVEN** the player's Adventure Rank reaches five
- **WHEN** the player looks at the forge queues
- **THEN** two queues are available

#### Scenario: Order is refused while every queue is busy

- **GIVEN** every queue the player's rank opens holds an order
- **WHEN** the player places another order
- **THEN** the order is refused

### Requirement: An order takes its materials and Mora as it starts

An order SHALL take its materials and Mora when it starts, and SHALL be refused, taking nothing, when they are not on hand.

#### Scenario: Order starts and takes its cost

- **GIVEN** the player has the materials and Mora for an order
- **WHEN** the order starts in a free queue
- **THEN** the materials and Mora are taken and the units begin to run

#### Scenario: Order without its materials is refused and takes nothing

- **GIVEN** the player lacks one of the materials for an order
- **WHEN** the player places the order
- **THEN** the order is refused and no materials or Mora are taken

### Requirement: Forging finishes over real time and is collected at any blacksmith

Forging units SHALL finish over real time whether or not the forge is open, and SHALL be collected at any blacksmith.

#### Scenario: Units finish while the forge is closed

- **GIVEN** an order's units are running
- **WHEN** their seconds pass with the forge closed
- **THEN** the units are finished

#### Scenario: Finished units are collected at any blacksmith

- **GIVEN** an order's units are finished
- **WHEN** the player collects them at any blacksmith
- **THEN** the results are collected

### Requirement: Forging queues do not survive a reload

Forging queues SHALL be empty after the game reloads, since the save does not hold them.

#### Scenario: Reload empties the queues

- **GIVEN** an order is running in a queue
- **WHEN** the game reloads
- **THEN** the queue is empty

### Requirement: A finished unit the bag cannot hold waits in its queue

A finished unit that the bag has no room for SHALL wait in its queue until there is room.

#### Scenario: Full bag keeps a unit waiting

- **GIVEN** a finished unit's result does not fit in the bag
- **WHEN** the queue is collected
- **THEN** the unit waits in its queue

### Requirement: Enhancement ore forge points are capped per game day

Forge points from enhancement ores SHALL be capped at 400,000 per game day, counted when an order starts, and the cap SHALL restart when the game day turns at four in the morning on the game's clock.

#### Scenario: Order passing the cap is refused

- **GIVEN** this game day's forge points would pass 400,000 with the order
- **WHEN** the player places the order
- **THEN** the order is refused until the game day turns

#### Scenario: Cap restarts at the game day's turn

- **GIVEN** the game day has turned
- **WHEN** the player places an order
- **THEN** the day's forge points start again from zero

#### Scenario: The Mystic Enhancement Ore from Magical Crystal Chunks counts no forge points

- **GIVEN** an order for Mystic Enhancement Ore built from Magical Crystal Chunks
- **WHEN** the order starts
- **THEN** it adds nothing to the day's forge points

### Requirement: A unit yields a result drawn by weight

A forge unit SHALL yield one result drawn by the weight each of its recipe's results holds, and a recipe with one result SHALL always yield it.

#### Scenario: Single-result recipe always yields its result

- **GIVEN** a recipe has one result
- **WHEN** a unit is collected
- **THEN** the unit yields that result

#### Scenario: Mystic Enhancement Ore unit yields one of two results at equal weight

- **GIVEN** a Mystic Enhancement Ore unit is collected
- **WHEN** its result is drawn
- **THEN** it yields either six Mystic Enhancement Ores or one hundred Adventure EXP at equal weight

### Requirement: A forged weapon enters the bag as a weapon at level one

A forged weapon SHALL enter the bag as a weapon of its own at level one.

#### Scenario: Forged weapon is added to the weapons

- **GIVEN** a weapon recipe's unit is collected
- **WHEN** the weapon enters the bag
- **THEN** it appears among the weapons at level one

### Requirement: Adventure EXP from a queue is gained at the Adventure Rank

Adventure EXP from a finished queue SHALL be gained at the Adventure Rank, with EXP past rank sixty paid as Mora into the wallet.

#### Scenario: EXP past rank sixty is paid as Mora

- **GIVEN** the player is at rank sixty and a queue yields Adventure EXP
- **WHEN** the queue is obtained
- **THEN** the EXP past rank sixty is paid as Mora into the wallet

### Requirement: Party talents change forging by the forge type they name

The forging talents of the party's characters SHALL apply to the forge types they name: a faster enhancement ore, an extra copy of an enhancement ore, and a refund of ore from weapons.

#### Scenario: Reduce time talent shortens an enhancement ore unit

- **GIVEN** a party member with the reduce time talent is in the party
- **WHEN** an enhancement ore order starts
- **THEN** each unit takes a fifth less time

#### Scenario: Extra result talent may add a copy of a unit's result

- **GIVEN** a party member with the extra result talent is in the party
- **WHEN** an enhancement ore unit is collected
- **THEN** the unit has a one in five chance of yielding an extra copy of its result

#### Scenario: Refund talent gives back ore from weapons of its type

- **GIVEN** a party member with the refund talent is in the party
- **WHEN** a weapon of the talent's type is forged
- **THEN** fifteen per cent of the ores its units take are refunded when the order starts

#### Scenario: Refund the bag cannot hold is lost

- **GIVEN** a refund talent applies to an order
- **WHEN** the refunded ore has no room in the bag
- **THEN** the refund is lost

### Requirement: The Serenitea Pot refuses recipes that take a Magical Crystal Chunk

A recipe that takes a Magical Crystal Chunk SHALL be refused inside the Serenitea Pot's realm and forged anywhere else.

#### Scenario: Order inside the realm for a Chunk recipe is refused

- **GIVEN** the player is in the Serenitea Pot's realm
- **WHEN** the player orders a recipe that takes a Magical Crystal Chunk
- **THEN** the order is refused

#### Scenario: Same recipe outside the realm is forged

- **GIVEN** the player is outside the Serenitea Pot's realm
- **WHEN** the player orders a recipe that takes a Magical Crystal Chunk
- **THEN** the order is accepted

### Requirement: A refused enhancement ore order shows the game's own line

A refused enhancement ore order SHALL show the game's own refusal line for that ore.

#### Scenario: Refusal shows the game's line for the ore

- **GIVEN** an enhancement ore order is refused
- **WHEN** the forge shows the refusal
- **THEN** the game's own refusal line for that ore is shown

### Requirement: The blacksmith has no place on the map yet

The forge SHALL NOT yet show a blacksmith's place on the map.

#### Scenario: Map shows no blacksmith

- **GIVEN** the player views the official map
- **WHEN** the map is shown
- **THEN** no blacksmith is marked
