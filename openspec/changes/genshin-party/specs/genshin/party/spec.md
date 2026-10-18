## ADDED Requirements

### Requirement: Party Setup opens on L over the deployed team

Party Setup SHALL open on L and show the deployed team slot by slot, with arrows that step between teams.

#### Scenario: Party Setup opens showing the deployed team

- **GIVEN** the player is in the world with a deployed team
- **WHEN** the player presses L
- **THEN** Party Setup opens showing the deployed team's four slots
- **AND** each filled slot names its member, level and element

#### Scenario: The arrows step between teams

- **GIVEN** Party Setup is open on one team
- **WHEN** the player presses an arrow
- **THEN** Party Setup shows the next team

### Requirement: Deploy puts a standing member on the field

Deploy SHALL bring the first standing member of the chosen team onto the field.

#### Scenario: Deploying a team with a standing member puts that member on the field

- **GIVEN** the chosen team has a standing member
- **WHEN** the player chooses Deploy
- **THEN** the team's first standing member takes the field

#### Scenario: Deploying a team with nobody standing is refused

- **GIVEN** every member of the chosen team is down
- **WHEN** the player chooses Deploy
- **THEN** no member takes the field
- **AND** the team stays as it was

### Requirement: Configure Team keeps the teams within their rules

Configure Team SHALL add, rename and disband teams, and SHALL keep at most fifteen teams and never disband the deployed team.

#### Scenario: A team is added and renamed

- **GIVEN** fewer than fifteen teams exist
- **WHEN** the player adds a team and renames it
- **THEN** the team is listed under its new name

#### Scenario: A sixteenth team is refused

- **GIVEN** fifteen teams exist
- **WHEN** the player tries to add a team
- **THEN** no team is added

#### Scenario: The deployed team cannot be disbanded

- **GIVEN** a team is deployed
- **WHEN** the player tries to disband it
- **THEN** the team is kept

### Requirement: Quick Setup fills a team's slots in order

Quick Setup SHALL pick members for the chosen team in the order the player's characters are listed.

#### Scenario: Quick Setup fills the four slots in order

- **GIVEN** the chosen team has empty slots
- **WHEN** the player chooses Quick Setup
- **THEN** the empty slots are filled with the next characters in order

### Requirement: The player chooses the next member after a fall

After the member on the field falls, the player SHALL choose the next member, and no switch SHALL be allowed until the fall has finished.

#### Scenario: Switching is locked while the fall plays

- **GIVEN** the member on the field has fallen
- **WHEN** the player presses 2 before the fall ends
- **THEN** no switch happens

#### Scenario: The player chooses the next member after a fall

- **GIVEN** the member on the field has fallen and other members are standing
- **WHEN** the fall ends
- **THEN** the player is asked to choose the next member

### Requirement: Game over offers a revive at the nearest waypoint

Once every member of a team is down, the game over screen SHALL offer a revive at the nearest teleport waypoint with 35% of HP.

#### Scenario: Game over offers revive at the nearest waypoint

- **GIVEN** every member of the team is down
- **WHEN** the game over screen opens
- **THEN** it offers a revive at the nearest teleport waypoint
- **AND** the revived member has 35% of HP

### Requirement: The party is kept between visits

The party's teams, deployed team, member on the field and each member's down state SHALL be kept between visits, as the account keeps them.

#### Scenario: The deployed team and member on field return after a visit

- **GIVEN** the player has deployed a team with a member on the field
- **WHEN** the player leaves and returns
- **THEN** the same team is deployed with the same member on the field

### Requirement: Afflictions last less under the matching Resonance

Under a matching Resonance, an affliction on a party member SHALL last forty percent less time.

#### Scenario: Fervent Flames shortens a Cryo affliction on a member

- **GIVEN** the team has the Fervent Flames Resonance
- **WHEN** a Cryo affliction is applied to one of its members
- **THEN** the affliction lasts 40% less time than without the Resonance

### Requirement: High Voltage drops an Electro particle on a cooldown

High Voltage SHALL drop an Electro particle on a listed reaction once five seconds have passed since its last particle.

#### Scenario: A listed reaction drops a particle once the cooldown has passed

- **GIVEN** five seconds have passed since the team's last High Voltage particle
- **WHEN** Electro-Charged occurs
- **THEN** an Electro particle drops

#### Scenario: A reaction within the cooldown drops no particle

- **GIVEN** a High Voltage particle dropped less than five seconds ago
- **WHEN** Electro-Charged occurs
- **THEN** no particle drops

### Requirement: A Moondrift gives the team a shield's defence

A Moondrift formed nearby SHALL give the team the same damage and Geo resistance a shield gives.

#### Scenario: A Moondrift formed nearby gives a shield's defence

- **GIVEN** the team stands near a Moondrift
- **WHEN** the Moondrift is formed by Lunar-Crystallize
- **THEN** the team gains the damage and Geo resistance a shield gives
