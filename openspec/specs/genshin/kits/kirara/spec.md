## Purpose

Kirara's kit as built: four strikes, a charged attack, Tail-Flicking Flying Kick with its shield and holds, and Secret Art: Surprise Dispatch's Cat Grass Cardamoms, with her passives and constellations not built.

## Requirements

### Requirement: Kirara's four strikes

Kirara's normal attack SHALL land four strikes in order, each hitting the enemies within its reach.

#### Scenario: Four strikes in sequence

- **WHEN** the player uses normal attack four times in a row
- **THEN** the four strikes land in order
- **AND** each strike deals damage to the enemies within its reach

### Requirement: Kirara's charged attack

Kirara's charged attack SHALL land three hits on the enemies within reach.

#### Scenario: Charged attack lands three hits

- **WHEN** the player uses the charged attack
- **THEN** three hits land in turn on the enemies within reach

### Requirement: Tail-Flicking Flying Kick

Tail-Flicking Flying Kick SHALL give Kirara a shield and a Dendro infusion of her own, and holding it SHALL release Urgent Neko Parcel's cat ticks and Flipclaw Strike's kick.

#### Scenario: Short press grants the shield

- **WHEN** the player presses Tail-Flicking Flying Kick
- **THEN** Kirara gains her shield and Dendro infusion

#### Scenario: Hold releases the cat ticks and the kick

- **GIVEN** Tail-Flicking Flying Kick is held for one to ten seconds
- **WHEN** the player releases the hold
- **THEN** Urgent Neko Parcel's cat ticks land on the enemies within reach
- **AND** Flipclaw Strike's kick lands at the end of the hold

#### Scenario: Skill press refused during cooldown

- **GIVEN** Tail-Flicking Flying Kick is on cooldown
- **WHEN** the player presses it
- **THEN** the press is not used

### Requirement: Secret Art: Surprise Dispatch

Secret Art: Surprise Dispatch SHALL place six Cat Grass Cardamoms in a box, two of which detonate 180 frames after the cast and four of which detonate when it expires.

#### Scenario: Cardamoms detonate on their timings

- **GIVEN** Secret Art: Surprise Dispatch has been cast
- **WHEN** 180 frames have passed
- **THEN** two Cat Grass Cardamoms detonate
- **AND** the remaining four detonate when the box expires

### Requirement: Kirara's attacks deal no poise

Kirara's strikes, charged attack, skill and burst SHALL deal no poise damage, provisionally.

#### Scenario: Attacks leave poise untouched

- **WHEN** any of Kirara's strikes, charged attack, skill or burst hits an enemy
- **THEN** the enemy's poise is not reduced

### Requirement: Kirara's passives and constellations not yet built

Kirara's passives and constellations SHALL NOT take effect.

#### Scenario: Passives and constellations do nothing

- **GIVEN** Kirara has a passive or constellation unlocked
- **WHEN** the player fights with Kirara
- **THEN** that passive or constellation has no effect
