## Purpose

Sethos's kit as built, with his three strikes, the fully-charged Aimed Shot, Ancient Rite: Thunderous Roar of Sand and the plunges, and what is left of Shadowpiercing Shot, Secret Rite's Dusk Bolts, his energy refunds and his constellations.

## Requirements

### Requirement: Sethos's strikes

Sethos's three strikes SHALL land in order, the second strike being two hits, each hitting the enemies within reach with no poise damage.

#### Scenario: Three strikes in sequence

- **WHEN** the player uses normal attack three times in a row
- **THEN** the three strikes land in order on the enemies within reach
- **AND** the second strike lands two hits

### Requirement: Fully-charged Aimed Shot

Sethos's charged attack SHALL be the fully-charged Aimed Shot, which lands 74 frames into an 83-frame animation with Electro gauge, and the body SHALL turn to the camera's aim while it is held.

#### Scenario: Fully-charged shot lands

- **WHEN** the player fully charges and fires the Aimed Shot
- **THEN** the shot lands at 74 frames of an 83-frame animation

### Requirement: Ancient Rite's skill

Ancient Rite: Thunderous Roar of Sand SHALL strike an Electro circle of radius 4.5 metres round Sethos at 13 frames of a 38-frame animation.

#### Scenario: Skill strikes the circle round Sethos

- **WHEN** the player presses Ancient Rite: Thunderous Roar of Sand
- **THEN** the Electro circle of radius 4.5 metres round Sethos is struck at 13 frames

### Requirement: Sethos's burst

Sethos's burst SHALL deal no damage itself and SHALL cost energy and go on a cooldown.

#### Scenario: Burst deals no damage

- **WHEN** the player casts Sethos's burst
- **THEN** no damage is dealt
- **AND** the burst goes on its cooldown

### Requirement: Sethos's plunge attacks

Sethos's plunge attacks SHALL land on the enemies within reach as their action starts, with no poise, provisionally.

#### Scenario: Plunge lands as it starts

- **WHEN** the player starts a plunge attack
- **THEN** the plunge lands on the enemies within reach as its action starts

### Requirement: Unbuilt Sethos effects

Shadowpiercing Shot, the plain Aimed Shot, Secret Rite's Dusk Bolts, Ancient Rite's energy refund on a reaction, and Sethos's ascension and constellation passives SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Sethos has Shadowpiercing Shot, Dusk Bolts or a passive unlocked
- **WHEN** the player fights with Sethos
- **THEN** that effect has no effect
