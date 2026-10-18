## Purpose

The Imaginarium Theater's rules as built, read from the game's role combat tables into genshin-world. The season the Theater plays is the latest begun, each season names its difficulties and each difficulty its level floor, a Principal Cast performs a stage only with four members holding Vigor, Blessing Level and its stats, the opening character's bonus and Stella rewards. The cast's elements and guests, the acts, the events, the rewind and the screen are not built yet.

## Requirements

### Requirement: The Theater plays the latest season that has begun

The Imaginarium Theater SHALL play the latest season that began before the current moment, read in the game's time zone, and SHALL hold the last begun season after the schedule's last season ends.

#### Scenario: A season scheduled for later is not played

- **GIVEN** the schedule's final season has not yet begun
- **WHEN** the current moment is read
- **THEN** that season is not played

#### Scenario: The last begun season is held after the schedule ends

- **GIVEN** every season in the schedule has ended
- **WHEN** the Theater's season is read months later
- **THEN** the last begun season is played

#### Scenario: Seasons listed out of order still resolve by their start

- **GIVEN** the schedule lists its seasons out of order
- **WHEN** the season played is found
- **THEN** the season that began latest before now is played

### Requirement: Each season's difficulties are ordered by level and carry a level floor

A season SHALL play the difficulties its schedule names, ordered from the lowest level, and each difficulty SHALL carry a level floor of sixty for levels one and two and seventy for levels three to five.

#### Scenario: Difficulties are ordered from the lowest level

- **GIVEN** a season names several difficulties
- **WHEN** the season's difficulties are listed
- **THEN** they appear from the lowest level to the highest

#### Scenario: A low difficulty has the lower level floor

- **GIVEN** a difficulty of level one or two
- **WHEN** its level floor is read
- **THEN** the floor is sixty

#### Scenario: A season naming an unknown difficulty is refused

- **GIVEN** a season names a difficulty the difficulty table does not hold
- **WHEN** the season is built
- **THEN** the build is refused

### Requirement: A Principal Cast performs a stage only with four members holding Vigor

A Principal Cast SHALL perform a stage only when it has four members and each holds Vigor, and performing a stage SHALL spend one Vigor from each member.

#### Scenario: A full cast with Vigor performs a stage

- **GIVEN** four cast members each hold Vigor
- **WHEN** the cast performs a stage
- **THEN** the stage is performed
- **AND** one Vigor is spent from each member

#### Scenario: A cast of fewer than four performs nothing

- **GIVEN** the Principal Cast has fewer than four members
- **WHEN** the cast is asked to perform a stage
- **THEN** no stage is performed and no Vigor is spent

#### Scenario: A member out of Vigor stops the stage

- **GIVEN** one member of a four-member cast has no Vigor left
- **WHEN** the cast is asked to perform a stage
- **THEN** no stage is performed and no Vigor is spent

### Requirement: Blessing Level counts the Alternate Cast and the Brilliant Blessings

Blessing Level SHALL rise by two for each Alternate Cast member past the number a difficulty requires and by one for each level of each Brilliant Blessing, and a short Alternate Cast SHALL add nothing.

#### Scenario: Alternate Cast members past the required count add two each

- **GIVEN** the Alternate Cast has more members than its difficulty requires
- **WHEN** Blessing Level is computed
- **THEN** each member past the required count adds two levels

#### Scenario: A short Alternate Cast adds nothing

- **GIVEN** the Alternate Cast has no more members than its difficulty requires
- **WHEN** Blessing Level is computed
- **THEN** the Alternate Cast adds no levels

### Requirement: Each Blessing level adds stats to a cast member

Each Blessing level SHALL add the stats its constant gives to a cast member, and a special guest SHALL receive double those stats.

#### Scenario: A regular member gains the Blessing stats

- **GIVEN** a cast member is not a special guest
- **WHEN** one Blessing level is applied
- **THEN** the member gains the stats one Blessing level adds

#### Scenario: A special guest gains double the Blessing stats

- **GIVEN** a cast member is a special guest
- **WHEN** one Blessing level is applied
- **THEN** the member gains double the Blessing stats

### Requirement: An owned opening character gains a fifth of its Max HP, ATK and DEF

An owned opening character SHALL gain a fifth of its Max HP, ATK and DEF, rounded down to whole units, and its Elemental Mastery SHALL be unchanged.

#### Scenario: The opening bonus rounds down to whole units

- **GIVEN** an owned opening character has stats that do not divide evenly by five
- **WHEN** its bonus is applied
- **THEN** each of Max HP, ATK and DEF rises by a fifth rounded down

#### Scenario: The opening bonus leaves Elemental Mastery unchanged

- **GIVEN** an owned opening character has Elemental Mastery
- **WHEN** its bonus is applied
- **THEN** its Elemental Mastery is the same as before

### Requirement: Every three Stellas earn one reward

Every three Stellas earned in a run SHALL give one reward.

#### Scenario: Five Stellas give one reward

- **GIVEN** a run has earned five Stellas
- **WHEN** its rewards are counted
- **THEN** one reward is given

#### Scenario: Six Stellas give two rewards

- **GIVEN** a run has earned six Stellas
- **WHEN** its rewards are counted
- **THEN** two rewards are given
