## ADDED Requirements

### Requirement: A struck bird or beast falls and gives its drops once

A bird or beast struck down SHALL give its item drops once, where it fell, and SHALL vanish from the world, and an animal struck again after it has given its drops SHALL give nothing.

#### Scenario: A Crimson Fox gives two Raw Meat when struck

- **GIVEN** a Crimson Fox standing in the player's reach
- **WHEN** the player strikes it down
- **THEN** the fox falls
- **AND** the player gains two Raw Meat

#### Scenario: A struck animal gives nothing when struck again

- **GIVEN** a fallen animal that has already given its drops
- **WHEN** the player strikes it again
- **THEN** no drop is given

#### Scenario: A struck animal stays where it fell

- **GIVEN** an animal struck down within the player's reach
- **WHEN** the player stays near it
- **THEN** the animal does not flee

### Requirement: Wildlife is struck by the hits that strike enemies

Wildlife SHALL be struck by the hits that strike enemies, and a hit that lands outside the attack area SHALL NOT strike it.

#### Scenario: A hit in the attack area strikes a bird

- **GIVEN** a White Pigeon within the attack area of the player's hit
- **WHEN** the player attacks
- **THEN** the pigeon is struck

#### Scenario: A hit outside the attack area does not strike a bird

- **GIVEN** a White Pigeon outside the attack area of the player's hit
- **WHEN** the player attacks
- **THEN** the pigeon is not struck

### Requirement: A hit on wildlife triggers a weapon's passive and never an artifact set's

A hit on wildlife SHALL trigger a weapon's passive and SHALL NOT trigger an artifact set's.

#### Scenario: A weapon passive triggers on wildlife, an artifact set does not

- **GIVEN** a player whose weapon has a passive and whose artifacts form a set
- **WHEN** the player strikes an animal
- **THEN** the weapon's passive triggers
- **AND** the artifact set does not trigger

### Requirement: A material source is picked up as an item and vanishes

A material source SHALL be picked up as an item, and SHALL vanish once it is picked up.

#### Scenario: A crystalfly picked up gives its item and vanishes

- **GIVEN** a crystalfly within the player's reach
- **WHEN** the player picks it up
- **THEN** the player gains its item
- **AND** the crystalfly is gone

### Requirement: A startled bird or beast runs from the player within its escape radius

A bird or beast SHALL run from the player once the player is within its escape radius, and SHALL return to idle after its escape time.

#### Scenario: A White Pigeon flees when approached within its escape radius

- **GIVEN** a White Pigeon idle in the world
- **WHEN** the player comes within its escape radius
- **THEN** the pigeon runs from the player

#### Scenario: A fleeing animal returns to idle after its escape time

- **GIVEN** an animal that has fled from the player
- **WHEN** its escape time passes without the player near
- **THEN** the animal stands idle again

### Requirement: A boar charges at a player in its way

A boar SHALL charge at a player standing in its way and SHALL hurt the player it hits.

#### Scenario: A boar charges a player standing in its way

- **GIVEN** a boar with a player standing in its path
- **WHEN** the boar charges
- **THEN** the boar hits the player
- **AND** the player's health falls

### Requirement: A pet cannot be struck or picked up

A pet SHALL NOT be struck, picked up or otherwise interacted with.

#### Scenario: A pet cannot be struck or picked up

- **GIVEN** a cat or dog within the player's reach
- **WHEN** the player attacks or interacts with it
- **THEN** nothing happens to the pet

### Requirement: An animal returns on the game's refresh

A struck or picked up animal SHALL return on the refresh its kind follows.

#### Scenario: A defeated animal returns on its kind's refresh

- **GIVEN** an animal the player has struck down
- **WHEN** its kind's refresh comes round
- **THEN** the animal is back in the world
