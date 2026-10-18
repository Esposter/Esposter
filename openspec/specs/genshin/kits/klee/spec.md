## Purpose

Klee's kit as built: three strikes, a charged attack, Jumpy Dumpty's bounces and mines, and Sparks 'n' Splash with its Sparkly Explosion, with her Ascension 1 Explosive Spark and her Ascension 4 Sparkling Burst built, and her other constellations and her Hexerei kit not built.

## Requirements

### Requirement: Klee's bombs from her strikes

Klee's three strikes, her charged attack and her skill SHALL each deal their damage from a bomb thrown as the action starts, reaching the enemies round her body.

#### Scenario: A strike's bomb lands

- **WHEN** the player uses a normal attack
- **THEN** the bomb lands on the enemies round Klee at the strike's own frame
- **AND** the strike ends at its own frame

#### Scenario: Charged attack bomb lands after its windup

- **WHEN** the player uses the charged attack after a first or second strike
- **THEN** the bomb lands 72 frames after the attack starts

### Requirement: Jumpy Dumpty's bounces and mines

Klee's skill SHALL throw Jumpy Dumpty, which bounces three times at 71, 111 and 140 frames, the third bounce exploding for more damage, and it SHALL hold two charges, each recovering one at a time on the skill's cooldown.

#### Scenario: Skill press with a charge

- **GIVEN** Klee holds at least one charge of her skill
- **WHEN** the player presses the skill
- **THEN** Jumpy Dumpty bounces three times at 71, 111 and 140 frames
- **AND** the third bounce deals the explosion's larger damage

#### Scenario: Skill press with no charge

- **GIVEN** Klee holds no charge of her skill
- **WHEN** the player presses the skill
- **THEN** the press is not used

#### Scenario: Mines go off

- **WHEN** Jumpy Dumpty has bounced
- **THEN** two mines go off at 240 frames, provisionally

### Requirement: Sparks 'n' Splash follows Klee

Klee's burst SHALL summon Sparks 'n' Splash, which follows her on the field and fires six waves of sparks, and it SHALL end as soon as Klee leaves the field.

#### Scenario: Waves land while Klee stays on the field

- **GIVEN** Klee has cast her burst
- **WHEN** the summon's waves come due
- **THEN** each wave lands its sparks on the enemies near Klee

#### Scenario: Summon ends on a swap

- **GIVEN** Sparks 'n' Splash is standing
- **WHEN** Klee leaves the field
- **THEN** the summon ends and lands nothing from that step

### Requirement: Sparkly Explosion from four constellations

From four constellations, Klee SHALL set off Sparkly Explosion where she left the field when Sparks 'n' Splash ends.

#### Scenario: Explosion goes off where Klee left

- **GIVEN** Klee has four or more constellations
- **AND** Sparks 'n' Splash is standing
- **WHEN** Klee leaves the field
- **THEN** Sparkly Explosion lands where she left, dealing Pyro damage

### Requirement: Blazing Delight from six constellations

From six constellations, Klee's burst SHALL give each member of the deployed team a 10% Pyro DMG Bonus for 25 seconds, restarted by the next burst.

#### Scenario: Team bonus from the burst

- **GIVEN** Klee has six or more constellations
- **WHEN** Klee casts her burst
- **THEN** each member of the deployed team gains a 10% Pyro DMG Bonus for 25 seconds

### Requirement: Klee's plunge attacks

Klee's plunge attacks SHALL land their low and high bombs at 47 and 48 frames, and a collision, on enemies within reach.

#### Scenario: Plunge bombs land

- **WHEN** the player starts a plunge attack
- **THEN** the low bomb lands at 47 frames and the high bomb at 48 frames
- **AND** the collision lands on the enemies within reach

### Requirement: A CRIT charged attack gives the party energy from Ascension 4

From Ascension 4, a CRIT hit of Klee's charged attack SHALL give each member of the deployed team 2 energy, at most once in 0.6 seconds.

#### Scenario: Sparkling Burst on a CRIT charged attack

- **GIVEN** Klee has reached Ascension 4
- **WHEN** her charged attack's bomb lands a CRIT hit
- **THEN** each member of the deployed team gains 2 energy
- **AND** another CRIT hit within 0.6 seconds gives none

### Requirement: Klee's other constellations not yet built

Klee's other constellations and her Hexerei kit SHALL NOT take effect.

#### Scenario: Unbuilt constellations do nothing

- **GIVEN** Klee has a constellation beyond the built ones or the Hexerei kit unlocked
- **WHEN** the player fights with Klee
- **THEN** that constellation has no effect
