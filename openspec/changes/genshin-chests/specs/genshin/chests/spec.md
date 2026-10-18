## ADDED Requirements

### Requirement: Chest Drops

Opening a chest SHALL pour its weapons, artifacts and Character EXP materials out as drops to pick up, or send them straight to the bag where a drop would fall away.

#### Scenario: an opened chest pours its drops out on open ground

- **GIVEN** a chest standing on ground where a drop can fall
- **WHEN** the player opens the chest
- **THEN** its weapons, artifacts and materials appear as drops to pick up

#### Scenario: an opened chest sends its drops to the bag where a drop would fall away

- **GIVEN** a chest standing where a drop would fall away
- **WHEN** the player opens the chest
- **THEN** its weapons, artifacts and materials go straight to the bag

### Requirement: Adventure EXP And Sigils To The Wallet

Opening a chest SHALL add its Adventure EXP and Sigils to the player's wallet.

#### Scenario: opening a chest adds its Adventure EXP and Sigils to the wallet

- **GIVEN** a chest whose tier gives Adventure EXP and Sigils
- **WHEN** the player opens the chest
- **THEN** the Adventure EXP and Sigils are added to the player's wallet

### Requirement: Locked Chests

A chest SHALL stay locked while an enemy camp or a puzzle within its reach is not yet cleared or solved.

#### Scenario: a chest stays locked while a camp within its reach stands

- **GIVEN** a chest with a living enemy camp within its reach
- **WHEN** the player tries to open the chest
- **THEN** the chest does not open

#### Scenario: a chest opens once the camp within its reach is cleared

- **GIVEN** a chest whose camp within its reach has been cleared
- **WHEN** the player opens the chest
- **THEN** the chest opens

#### Scenario: a chest stays locked while a puzzle within its reach is unsolved

- **GIVEN** a chest with an unsolved puzzle within its reach
- **WHEN** the player tries to open the chest
- **THEN** the chest does not open

### Requirement: Buried Chests

A buried chest SHALL offer Dig at its place and appear once dug, and a dug chest SHALL pay no reward until its tier is measured.

#### Scenario: a buried chest offers Dig at its place

- **GIVEN** a buried chest's place
- **WHEN** the player stands at that place
- **THEN** the Dig prompt is offered

#### Scenario: a dug chest appears once dug

- **GIVEN** a buried chest offering Dig
- **WHEN** the player digs it
- **THEN** the chest appears at its place

#### Scenario: a dug chest pays no reward until its tier is measured

- **GIVEN** a chest dug from a buried place whose tier is not measured
- **WHEN** the player opens the dug chest
- **THEN** no reward is given

### Requirement: Sealed Chests

A sealed chest SHALL be freed by Pyro when sealed in vines or ice, and by a blunt or poise-damaging attack when sealed in rock.

#### Scenario: a chest sealed in vines is freed by Pyro

- **GIVEN** a chest sealed in Dendro vines
- **WHEN** a Pyro attack strikes the seal
- **THEN** the seal is freed

#### Scenario: a chest sealed in rock is freed by a blunt attack

- **GIVEN** a chest sealed in rock
- **WHEN** a blunt attack strikes the seal
- **THEN** the seal is freed

#### Scenario: a chest sealed in vines is not freed by an attack of another element

- **GIVEN** a chest sealed in Dendro vines
- **WHEN** a Hydro attack strikes the seal
- **THEN** the seal stays in place

### Requirement: Unsettled Chest Kinds Stay Unopened

Luxurious and Remarkable chests SHALL stay unopened until their rewards are settled.

#### Scenario: a Luxurious chest cannot be opened

- **GIVEN** a Luxurious chest in the world
- **WHEN** the player tries to open it
- **THEN** the chest does not open

### Requirement: Opened Chest Counting

An opened chest SHALL count once toward its area's exploration and its region's chest achievements.

#### Scenario: an opened chest counts once toward its area's exploration

- **GIVEN** a chest in an area the player is exploring
- **WHEN** the player opens the chest
- **THEN** the area's exploration counts the chest once

#### Scenario: reopening a chest adds nothing to the count

- **GIVEN** a chest the player has already opened
- **WHEN** the player tries to open it again
- **THEN** the area's exploration count does not change
