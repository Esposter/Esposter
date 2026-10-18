## ADDED Requirements

### Requirement: A claim gives the items of a clear's stars

A claim of a clear's rewards SHALL give each item of the rewards, with wallet currencies going to the wallet and the other items to the bag.

#### Scenario: Primogems and Mora from a reward go to the wallet

- **GIVEN** a floor one reward of one hundred Primogems and twenty-five thousand Mora
- **WHEN** the player claims the reward
- **THEN** the wallet gains the one hundred Primogems and the twenty-five thousand Mora
- **AND** the bag is unchanged

#### Scenario: A material from a reward goes into the bag

- **GIVEN** a reward holding a material
- **WHEN** the player claims the reward
- **THEN** the material is in the bag

#### Scenario: A claim is refused whole when the bag has no room

- **GIVEN** a reward with items the bag has no room to hold together
- **WHEN** the player claims the reward
- **THEN** the claim is refused
- **AND** neither the wallet nor the bag changes

### Requirement: A chamber is entered with a party set

A chamber SHALL be entered by a party set, and SHALL NOT be entered without one.

#### Scenario: A chamber is entered with the party set

- **GIVEN** a party set of characters
- **WHEN** the player enters a chamber
- **THEN** the party fights in the chamber

#### Scenario: A chamber cannot be entered without a party

- **GIVEN** no party set chosen
- **WHEN** the player tries to enter a chamber
- **THEN** the chamber is not entered

### Requirement: A half of a chamber is defeated when its enemy camps are

A half of a chamber SHALL be defeated when its enemies in their camps are all defeated, and a two-team chamber's second half SHALL take its enemies from its scene.

#### Scenario: A half advances when its last enemy is defeated

- **GIVEN** a chamber's first half with its enemy camps
- **WHEN** the last enemy of the camps is defeated
- **THEN** the first half is cleared
- **AND** the second half begins

#### Scenario: A two-team chamber's second half takes its enemies from its scene

- **GIVEN** a two-team chamber with no second list of enemies
- **WHEN** the second half begins
- **THEN** its enemies are the ones placed in the chamber's scene

### Requirement: Health and energy carry from one chamber to the next

Each character's health and energy at a chamber's clear SHALL be what the character starts the next chamber with.

#### Scenario: Health and energy at a clear carry into the next chamber

- **GIVEN** a character who clears a chamber with reduced health and energy
- **WHEN** the next chamber is entered
- **THEN** the character starts it with that health and energy

### Requirement: A chamber is cleared against its clock for its stars

A chamber SHALL award its stars by the time left when it is cleared, and SHALL fail when its clock runs out before it is cleared.

#### Scenario: Clearing a chamber with time left earns its stars

- **GIVEN** a chamber cleared with time left on its clock
- **WHEN** the clear is recorded
- **THEN** the stars its time left earns are awarded

#### Scenario: A chamber not cleared before its clock runs out fails

- **GIVEN** a chamber whose clock is running
- **WHEN** the clock runs out before the chamber is cleared
- **THEN** the chamber fails and awards no stars

### Requirement: A chamber offers the blessings its period or the Corridor gives

A chamber SHALL offer the blessing its Moon Spire period names or the blessing choices of the Corridor, once their effects are read from a source.

#### Scenario: A Moon Spire chamber shows its period's blessing

- **GIVEN** a Moon Spire chamber in a period with a named blessing
- **WHEN** the player enters the chamber
- **THEN** the period's blessing is shown

#### Scenario: A Corridor chamber offers its blessing choices

- **GIVEN** a Corridor chamber
- **WHEN** the player enters the chamber
- **THEN** its blessing choices are offered

### Requirement: The wormhole at Cape Oath leads to Musk Reef

The wormhole at Cape Oath SHALL lead the player to Musk Reef, where the Abyss is.

#### Scenario: Entering the wormhole at Cape Oath leads to Musk Reef

- **GIVEN** a player at Cape Oath
- **WHEN** the player enters the wormhole
- **THEN** the player arrives at Musk Reef
