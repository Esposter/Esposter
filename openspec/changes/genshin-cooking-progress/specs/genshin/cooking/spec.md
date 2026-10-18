## ADDED Requirements

### Requirement: The cooking progress is kept in the save

The dishes learned, each dish's proficiency and each processing's queue SHALL be kept in the save, so they load and save with the rest of the player's game.

#### Scenario: The save keeps the learned dishes, the proficiencies and the processing queues

- **GIVEN** a player has learned a dish, reached a proficiency in another and queued a processing
- **WHEN** the save is written and read back
- **THEN** the learned dish, the proficiency and the queue are the same as before

### Requirement: Two copies of the cooking progress merge without loss

When two copies of a save are merged, each dish SHALL keep the higher proficiency, the learned dishes SHALL union, and each processing queue SHALL keep the copy started later.

#### Scenario: A dish keeps the higher proficiency of the two copies

- **GIVEN** one copy has a dish's proficiency at three and the other at five
- **WHEN** the copies are merged
- **THEN** the dish's proficiency is five

#### Scenario: The learned dishes of both copies union

- **GIVEN** one copy has learned one dish and the other a different one
- **WHEN** the copies are merged
- **THEN** both dishes are learned

#### Scenario: A processing queue keeps the copy started later

- **GIVEN** one copy's queue for a processing started earlier than the other's
- **WHEN** the copies are merged
- **THEN** the queue of the copy started later is kept

### Requirement: The stove lists the dishes the cook knows

The stove SHALL list the dishes the cook knows: those known from the start and those learned from an instruction.

#### Scenario: The stove lists the dishes known from the start and the learned ones

- **GIVEN** a dish known from the start and a dish learned from an instruction, and a third dish neither known nor learned
- **WHEN** the stove's dishes are listed
- **THEN** the first two are listed and the third is not

### Requirement: Auto Cook is offered at full proficiency

Auto Cook SHALL be offered on the cooking screen once a dish's proficiency is full.

#### Scenario: Auto Cook is offered at full proficiency

- **GIVEN** a dish whose proficiency is at its maximum
- **WHEN** the cooking screen is shown for it
- **THEN** Auto Cook is offered

#### Scenario: Auto Cook is not offered before full proficiency

- **GIVEN** a dish whose proficiency is below its maximum
- **WHEN** the cooking screen is shown for it
- **THEN** Auto Cook is not offered
