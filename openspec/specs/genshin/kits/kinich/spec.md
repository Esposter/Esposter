## Purpose

Kinich's kit as built: his three strikes outside the Nightsoul Blessing, his skill's press entering the blessing with its points, and the blessing's Loop Shots and blind spot.

## Requirements

### Requirement: Kinich's strikes outside the blessing

Kinich's three normal attacks SHALL land their strikes in order, each hitting the enemies within its reach, while he is outside the Nightsoul Blessing.

#### Scenario: Three strikes in sequence

- **GIVEN** Kinich is outside the Nightsoul Blessing
- **WHEN** the player uses normal attack three times in a row
- **THEN** the three strikes land in order, each at its own timing
- **AND** each strike deals damage to the enemies within its reach

### Requirement: Kinich's charged attack

Kinich's charged attack SHALL land three thrusts that each hit the enemies within reach, and SHALL need 50 stamina to start.

#### Scenario: Charged attack with enough stamina

- **GIVEN** Kinich has at least 50 stamina
- **WHEN** the player uses the charged attack
- **THEN** the three thrusts land in turn, each at its own timing

#### Scenario: Charged attack refused without stamina

- **GIVEN** Kinich has less than 50 stamina
- **WHEN** the player uses the charged attack
- **THEN** the charged attack does not start

### Requirement: Kinich's plunge attacks

Kinich's plunge attacks SHALL land a collision and two plunge hits on the enemies within reach, with their timing provisional until a recording confirms it.

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the collision and the plunge hits land on the enemies within reach

### Requirement: Kinich's skill press enters the blessing

Kinich's elemental skill press SHALL enter the Nightsoul Blessing with no points when he is not in it, SHALL deal no damage, and SHALL start an 18-second cooldown. In the blessing the press SHALL do nothing until the Scalespiker Cannon is built.

#### Scenario: Skill press spends its cooldown

- **WHEN** the player presses the elemental skill
- **THEN** no damage is dealt
- **AND** the skill goes on an 18-second cooldown

#### Scenario: Skill press refused during cooldown

- **GIVEN** the skill is on cooldown
- **WHEN** the player presses the elemental skill
- **THEN** the press is not used

### Requirement: Kinich's burst hit

Kinich's elemental burst SHALL cost 70 energy and SHALL deal Dendro damage to the primary target 161 frames after it starts, then go on an 18-second cooldown.

#### Scenario: Burst cast with enough energy

- **GIVEN** Kinich has at least 70 energy
- **WHEN** the player casts the elemental burst
- **THEN** the first Dendro hit lands on the primary target at 161 frames
- **AND** the burst goes on an 18-second cooldown

#### Scenario: Burst refused without enough energy

- **GIVEN** Kinich has less than 70 energy
- **WHEN** the player casts the elemental burst
- **THEN** the burst does not start

### Requirement: The Ajaw's lasers

Kinich's burst SHALL summon the Ajaw, which fires six Dendro lasers at the primary target, the first 253 frames after the burst starts and each later one 145 or 150 frames after the one before.

#### Scenario: Lasers land in sequence

- **GIVEN** Kinich's burst has been cast
- **WHEN** 253 frames have passed
- **THEN** the first laser lands on the primary target
- **AND** each following laser lands 145 or 150 frames after the one before until six have landed

### Requirement: Nightsoul effects not yet built

Kinich's Scalespiker Cannon, his Ascension 1 and 4 and Constellations 1, 2, 4 and 6 SHALL NOT take effect until they are built.

#### Scenario: Nightsoul-dependent effects do nothing

- **GIVEN** Kinich has Constellation 1 or any other Nightsoul-dependent Ascension or constellation
- **WHEN** the player fights with Kinich
- **THEN** no Nightsoul-based effect is applied

### Requirement: Blessing gains points and lasts ten and a sixth seconds

Kinich's blessing SHALL gain two Nightsoul points a second up to 20, and SHALL end ten and a sixth seconds after the press that entered it.

#### Scenario: Points gain to the maximum and the blessing ends

- **GIVEN** Kinich has just entered the Nightsoul Blessing with no points
- **WHEN** five seconds pass
- **THEN** he holds 10 points
- **AND** after a further six seconds he is no longer in the blessing

### Requirement: Loop Shots in the blessing

Kinich's Loop Shots SHALL replace his normal attacks while the Nightsoul Blessing lasts. Each Loop Shot SHALL strike twice on the enemies within a circle of radius 0.5 metres round him, and SHALL gain him three Nightsoul points as it starts, up to the blessing's maximum of twenty.

#### Scenario: A Loop Shot strikes twice and gains three points

- **GIVEN** Kinich has entered the Nightsoul Blessing with no points
- **WHEN** the player uses normal attack once in the blessing
- **THEN** the Loop Shot's two strikes land 30 and 38 frames after it starts
- **AND** Kinich holds three points

#### Scenario: Loop Shots end with the blessing

- **GIVEN** Kinich is in the Nightsoul Blessing
- **WHEN** the blessing ends or Kinich leaves the field
- **THEN** his normal attacks are his own again

### Requirement: The blind spot

When Kinich's skill press enters the Nightsoul Blessing with an enemy in reach, a blind spot SHALL appear 30 frames after the press, a quarter turn either side of his bearing from that enemy, on a side drawn at random. Kinich standing within its thirty-five degree window SHALL gain four Nightsoul points once, and only his own body fills it.

#### Scenario: Standing in the blind spot gains four points

- **GIVEN** Kinich pressed his skill at an enemy and the blind spot has appeared
- **WHEN** his body stands in the blind spot on a frame it is due
- **THEN** he gains four points on top of the blessing's

#### Scenario: Outside the blind spot gains nothing

- **GIVEN** the blind spot has appeared
- **WHEN** Kinich's body stands outside its window
- **THEN** it gives no points

#### Scenario: A blind spot gives its points once

- **GIVEN** Kinich has filled the blind spot
- **WHEN** his body stands in its place again
- **THEN** it gives no further points
