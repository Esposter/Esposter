## Purpose

Navia's kit as built, with Rosula Shardshot's press and hold and Surging Blade, As the Sunlit Sky's Singing Salute with its cannon, and Crystal Shrapnel, and what is left to build.

## Requirements

### Requirement: Navia's strikes and charged attack

Navia's four strikes SHALL land in order, and her charged attack SHALL land two hits on the enemies round her, provisionally timed.

#### Scenario: Four strikes in sequence

- **WHEN** the player uses normal attack four times in a row
- **THEN** the four strikes land in order on the enemies within reach

#### Scenario: Charged attack lands two hits

- **WHEN** the player uses the charged attack
- **THEN** two hits land on the enemies round Navia, provisionally timed

### Requirement: Rosula Shardshot fires five pellets

Rosula Shardshot's press SHALL fire five pellets landing on the target, and the shot SHALL spend the Crystal Shrapnel Navia holds.

#### Scenario: Press fires five pellets

- **WHEN** the player presses Rosula Shardshot
- **THEN** five pellets land on the target

#### Scenario: Shot spends the Shrapnel

- **GIVEN** Navia holds Crystal Shrapnel
- **WHEN** the player fires Rosula Shardshot
- **THEN** the Crystal Shrapnel is spent

### Requirement: Surging Blade placed ahead of Navia

Each Rosula Shardshot shot SHALL fire a Surging Blade placed 3.6 metres ahead of Navia.

#### Scenario: Blade lands 3.6 metres ahead

- **WHEN** the player fires Rosula Shardshot
- **THEN** a Surging Blade is placed 3.6 metres ahead of Navia

### Requirement: Rosula Shardshot hold

Holding Rosula Shardshot SHALL charge the hold and fire on release.

#### Scenario: Hold fires on release

- **WHEN** the player holds Rosula Shardshot and releases it
- **THEN** the shot fires on release

### Requirement: As the Sunlit Sky's Singing Salute

As the Sunlit Sky's Singing Salute SHALL fire a blast and a cannon whose ticks each strike every enemy within 13 metres of Navia, and the cannon's hits SHALL gain Navia Crystal Shrapnel up to six.

#### Scenario: Cannon ticks strike every enemy in range

- **WHEN** a cannon tick comes due
- **THEN** every enemy within 13 metres of Navia is struck

#### Scenario: Cannon hits gain Shrapnel up to six

- **GIVEN** Navia holds five Crystal Shrapnel
- **WHEN** the cannon's hits land on enemies
- **THEN** Navia holds six Crystal Shrapnel
- **AND** no more is gained beyond six

### Requirement: Crystal Shrapnel lasts 300 seconds

Crystal Shrapnel SHALL last 300 seconds, and each gain SHALL restart that duration.

#### Scenario: Gain restarts the duration

- **GIVEN** Navia holds Crystal Shrapnel
- **WHEN** Navia gains more Crystal Shrapnel
- **THEN** the duration restarts at 300 seconds

### Requirement: Constellations 4 and 6

Constellation 4 SHALL take effect, and Constellation 6 SHALL keep Crystal Shrapnel past three stacks.

#### Scenario: Constellation 6 keeps Shrapnel past three

- **GIVEN** Navia has Constellation 6
- **WHEN** Navia holds more than three Crystal Shrapnel
- **THEN** the Shrapnel above three is kept

### Requirement: Navia's shot infuses her attacks with Geo from Ascension 1

From Ascension 1, for four seconds after Rosula Shardshot fires, Navia's normal attacks, charged attack and plunges SHALL deal Geo DMG and 40% more DMG.

#### Scenario: A shot at Ascension 1 infuses her attacks

- **GIVEN** Navia has reached Ascension 1
- **WHEN** Rosula Shardshot fires
- **THEN** her normal attacks, charged attack and plunges deal Geo DMG with 40% more DMG for four seconds

### Requirement: Navia's Ascension 4 raises her ATK for each Pyro, Electro, Cryo or Hydro member

From Ascension 4 Navia's ATK SHALL raise her ATK percentage by 20% for each Pyro, Electro, Cryo or Hydro member of the deployed team, two members at most, and no other member's ATK SHALL rise.

#### Scenario: Ascension 4 counts each Pyro, Electro, Cryo or Hydro member

- **GIVEN** Navia is at Ascension 4 with a Pyro and a Hydro member in the deployed team
- **WHEN** her attack is priced
- **THEN** her ATK percentage is raised by 40%

#### Scenario: Ascension 4 stops at two members

- **GIVEN** Navia is at Ascension 4 and three Pyro, Electro, Cryo or Hydro members stand in the deployed team
- **WHEN** her attack is priced
- **THEN** her ATK percentage is raised by 40%, not 60%

#### Scenario: Ascension 4 is not reached below Ascension 4

- **GIVEN** Navia is at Ascension 3 with a Pyro member in the deployed team
- **WHEN** her attack is priced
- **THEN** her ATK percentage is not raised

### Requirement: Unbuilt Navia effects

Crystal Shrapnel from shards and Lunar-Crystallize, pulling shards during a hold, the Shrapnel's extra damage, pellets and CRIT past three stacks, Constellations 1, 2 and 6 CRIT, the shot's Geo particles and the Surging Blade's placement on an enemy SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Navia has one of these effects unlocked
- **WHEN** the player fights with Navia
- **THEN** that effect has no effect
