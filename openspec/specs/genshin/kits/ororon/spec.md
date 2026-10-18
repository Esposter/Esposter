## Purpose

Ororon's kit as built: his three strikes, fully charged Aimed Shot, Spirit Orb's first hit, Dark Voices' Echo with its soundwave field, the plunges, Ascension 4's energy and Constellations 2 and 4. Hypersense, the Spirit Orb's bounce and the rest wait on the Nightsoul hook and a chained hit.

## Requirements

### Requirement: Ororon's strikes and fully charged Aimed Shot

Ororon's three strikes SHALL land in order, and his fully charged Aimed Shot SHALL land on the enemies within reach, each hit landing ten frames after its hitmark.

#### Scenario: Three strikes in sequence

- **WHEN** the player uses normal attack three times in a row
- **THEN** the three strikes land in order on the enemies within reach, each ten frames after its hitmark

#### Scenario: Fully charged Aimed Shot lands

- **WHEN** the player fully charges and fires the Aimed Shot
- **THEN** the arrow lands ten frames after its hitmark on the enemies within reach

### Requirement: Spirit Orb's first hit

Ororon's Spirit Orb SHALL deal its first hit on the enemies within its targeted area, ten frames after its hitmark.

#### Scenario: Spirit Orb hits its area

- **WHEN** the player uses the Spirit Orb
- **THEN** its first hit lands ten frames after its hitmark on the enemies within its targeted area

### Requirement: Dark Voices' Echo soundwave field

Dark Voices' Echo SHALL cast a ritual and leave a soundwave field that first ticks 60 frames after the burst starts, each tick striking the enemies it reaches, and from Constellation 4 the ticks SHALL come 45 frames apart.

#### Scenario: First tick comes 60 frames after the burst

- **WHEN** the player casts Dark Voices' Echo
- **THEN** the soundwave field's first tick lands 60 frames after the burst starts

#### Scenario: Constellation 4 shortens the interval

- **GIVEN** Ororon has Constellation 4
- **WHEN** the soundwave field ticks
- **THEN** each tick comes 45 frames after the one before

### Requirement: Constellation 2 stacks

From Constellation 2, the burst SHALL give an 8% buff that gains 8% for each enemy the ritual or a soundwave strikes, up to 32%, and each hit SHALL refresh the one buff rather than start a new one.

#### Scenario: Buff grows with each enemy struck

- **GIVEN** Ororon has Constellation 2
- **WHEN** the ritual or a soundwave strikes an enemy
- **THEN** the buff gains 8% up to 32%

### Requirement: Ascension 4 energy

From Ascension 4, the Spirit Orb's status SHALL last 15 seconds, and each of its three triggers SHALL give 3 energy to the active character and to Ororon, with a one-second cooldown between triggers.

#### Scenario: Trigger gives energy with a cooldown

- **GIVEN** Ororon has Ascension 4 and the Spirit Orb's status is standing
- **WHEN** a trigger fires
- **THEN** the active character and Ororon each gain 3 energy
- **AND** the next trigger waits one second

### Requirement: Plunge attacks

Ororon's collision and two plunges SHALL land the moment their action starts, with a zero animation.

#### Scenario: Plunge lands at once

- **WHEN** the player starts a plunge attack
- **THEN** the collision and plunge hits land as the action starts

### Requirement: Zero poise

Ororon's strikes, Aimed Shot, Spirit Orb, burst and plunges SHALL deal no poise damage, provisionally.

#### Scenario: No poise damage

- **WHEN** any of Ororon's hits lands on an enemy
- **THEN** no poise damage is dealt

### Requirement: Unbuilt Ororon effects

Hypersense, the Spirit Orb's bounce, Constellation 4's energy on the burst's hit and Ororon's Nightsoul-based Ascension 1 and Constellations 1 and 6 SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Ororon has one of these effects unlocked
- **WHEN** the player fights with Ororon
- **THEN** that effect has no effect
