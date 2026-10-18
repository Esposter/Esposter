## Purpose

Nicole's kit as built: her three strikes, charged attack, plunges, Pyro skill and Pyro burst's hit, with her burst's projections and passives left waiting on their hooks.

## Requirements

### Requirement: Nicole's three strikes, charged attack and plunges

Nicole's three strikes SHALL land in order, and her charged attack and plunges SHALL land on the enemies within reach.

#### Scenario: Three strikes in sequence

- **WHEN** the player uses normal attack three times in a row
- **THEN** the three strikes land in order on the enemies within reach

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the collision and the plunge hits land on the enemies within reach

### Requirement: Nicole's Pyro skill

Nicole's elemental skill SHALL deal Pyro damage in a 5-metre circle round her body and SHALL go on a 16-second cooldown.

#### Scenario: Skill hits the circle round Nicole

- **WHEN** the player presses Nicole's skill
- **THEN** Pyro damage lands within a 5-metre circle round her body
- **AND** the skill goes on a 16-second cooldown

### Requirement: Nicole's Pyro burst

Nicole's burst SHALL deal Pyro damage in a 6.5-metre circle on the primary target and SHALL cost 60 energy with a 15-second cooldown.

#### Scenario: Burst with enough energy

- **GIVEN** Nicole has at least 60 energy
- **WHEN** the player casts the burst
- **THEN** Pyro damage lands in a 6.5-metre circle on the primary target
- **AND** the burst goes on a 15-second cooldown

#### Scenario: Burst refused without enough energy

- **GIVEN** Nicole has less than 60 energy
- **WHEN** the player casts the burst
- **THEN** the burst does not start

### Requirement: Nicole's skill shields the team and buffs its ATK

Nicole's elemental skill SHALL shield the team with a Pyro shield scaled by her attack, and SHALL give each deployed member an ATK buff scaled by her attack and capped, both 8 frames after the cast and each lasting 20 seconds.

#### Scenario: Shield lands 8 frames after the cast

- **WHEN** the player presses Nicole's skill
- **THEN** a Pyro shield of 2.21184 times her attack plus 1386.6697, at level 1, covers the team 8 frames later, for 20 seconds

#### Scenario: Team ATK buff is capped

- **WHEN** the skill's buff lands on a deployed member at level 1
- **THEN** the member gets 8.25% of Nicole's attack as ATK, up to 330, for 20 seconds

### Requirement: Nicole's burst projections

Nicole's burst SHALL project a copy of each hit the active character lands on an enemy while its status lasts, physical hits included. A projection SHALL land 30 frames after its hit, at most four times and once each 3 seconds.

#### Scenario: Projection lands 30 frames after the hit that starts it

- **GIVEN** Nicole's burst has started and 109 frames have passed
- **WHEN** the active character's hit lands on an enemy
- **THEN** a projection lands on that enemy 30 frames later

#### Scenario: No projection before the status starts

- **GIVEN** Nicole's burst has started
- **WHEN** a hit lands 108 frames into the burst
- **THEN** no projection lands

#### Scenario: One projection each 3 seconds

- **GIVEN** Nicole's burst is active
- **WHEN** two hits land 1 second apart
- **THEN** only one projection lands

#### Scenario: Projections stop at four

- **GIVEN** Nicole's burst is active
- **WHEN** five hits land 3.1 seconds apart
- **THEN** four projections land

#### Scenario: Physical hit is projected at her element

- **GIVEN** Nicole's burst has started and 109 frames have passed
- **WHEN** the active character's physical hit lands on an enemy
- **THEN** a projection lands on that enemy 30 frames later, dealt as Nicole's element

#### Scenario: Only the active character's hit projects

- **GIVEN** Nicole's burst is active and another character is active
- **WHEN** that other character's hit lands on an enemy
- **THEN** no projection lands

### Requirement: Nicole's passives not yet built

Nicole's passives SHALL NOT take effect.

#### Scenario: Passives do nothing

- **GIVEN** Nicole has a passive unlocked
- **WHEN** the player fights with Nicole
- **THEN** no passive effect applies
