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

### Requirement: Unbuilt Navia effects

Crystal Shrapnel from shards and Lunar-Crystallize, pulling shards during a hold, the Shrapnel's extra damage, pellets and CRIT past three stacks, Ascension 1 and 4, Constellations 1, 2 and 6 CRIT, the shot's Geo particles and the Surging Blade's placement on an enemy SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Navia has one of these effects unlocked
- **WHEN** the player fights with Navia
- **THEN** that effect has no effect
