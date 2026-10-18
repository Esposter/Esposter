## Purpose

Mona's kit as built: four strikes, a charged attack, Mirror Reflection of Doom's summon, Stellaris Phantasm's bubble and Omen, A1's phantom, A4's Hydro bonus and Constellation 2's Charged Attack follow-up, with her plunges' reach provisional and Constellations 1, 4 and 6 left out.

## Requirements

### Requirement: Mona's strikes and charged attack

Mona's four strikes and charged attack SHALL deal Hydro damage to the enemies around her.

#### Scenario: Four strikes in sequence

- **WHEN** the player uses normal attack four times in a row
- **THEN** the four strikes land in order and deal Hydro damage to the enemies around Mona

#### Scenario: Charged attack deals Hydro damage

- **WHEN** the player uses the charged attack
- **THEN** its hits deal Hydro damage to the enemies around Mona

### Requirement: Mirror Reflection of Doom

Mona's skill SHALL summon Mirror Reflection of Doom.

#### Scenario: Skill summons the mirror

- **WHEN** the player presses Mona's skill
- **THEN** Mirror Reflection of Doom is summoned

### Requirement: Stellaris Phantasm's bubble and Omen

Stellaris Phantasm SHALL hold each enemy it strikes in a bubble for 8 seconds, and a hit with poise damage SHALL burst the bubble and start an Omen lasting 4 seconds that adds 42% damage to hits on that enemy.

#### Scenario: Bubble holds the enemy

- **WHEN** the player casts Stellaris Phantasm
- **THEN** each enemy it strikes is held in a bubble for 8 seconds

#### Scenario: Poise hit bursts the bubble into an Omen

- **GIVEN** an enemy is held in a bubble
- **WHEN** a hit with poise damage strikes it
- **THEN** the bubble bursts
- **AND** an Omen adds 42% damage to hits on that enemy for 4 seconds

### Requirement: Stellaris Phantasm's explosion

Stellaris Phantasm's explosion SHALL deal Hydro damage to a single target on the step after the burst.

#### Scenario: Explosion hits one enemy

- **WHEN** the player casts Stellaris Phantasm
- **THEN** the explosion deals Hydro damage to one target on the step after the burst
- **AND** the explosion does not spread to a neighbouring enemy

### Requirement: A1 phantom while sprinting

While Mona sprints, Ascension 1 SHALL cast a phantom every 2 seconds where she stands, and each phantom SHALL explode at its end.

#### Scenario: Sprinting casts phantoms

- **GIVEN** Mona has Ascension 1
- **WHEN** Mona sprints for 2 seconds
- **THEN** a phantom is cast where she stands
- **AND** it explodes at its end

### Requirement: A4 Hydro DMG Bonus

Mona's Ascension 4 SHALL add 20% of her Energy Recharge to her Hydro DMG Bonus on every hit she prices, including her summons' hits.

#### Scenario: Energy Recharge raises Hydro damage

- **GIVEN** Mona has Ascension 4 and Energy Recharge
- **WHEN** a Hydro hit of hers, or of her summon, lands
- **THEN** its Hydro DMG Bonus includes 20% of her Energy Recharge

### Requirement: Constellation 2's Charged Attack follow-up

From Constellation 2, a normal attack's last hit SHALL have a 20% chance to be followed by her Charged Attack's hit at that hit's hitmark, and no follow-up SHALL land within 5 seconds of the last one.

#### Scenario: A normal attack may be followed by a Charged Attack

- **GIVEN** Mona has Constellation 2
- **WHEN** a normal attack's last hit lands and the roll is under 20%
- **THEN** her Charged Attack's hit lands at that hit's hitmark

#### Scenario: Follow-up is limited to once in 5 seconds

- **GIVEN** Mona has Constellation 2 and a follow-up has just landed
- **WHEN** a normal attack's last hit lands within 5 seconds of it
- **THEN** no follow-up lands

#### Scenario: Below Constellation 2 nothing follows

- **GIVEN** Mona has Constellation 1
- **WHEN** a normal attack's last hit lands
- **THEN** no follow-up lands

### Requirement: Unbuilt Mona effects

Constellations 1, 4 and 6, and Hexerei's post-burst follow-up, SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Mona has Constellation 1, 4 or 6, or is Hexerei
- **WHEN** the player fights with Mona
- **THEN** those effects have no effect

### Requirement: Mona's plunge reach

Mona's plunge reach SHALL be provisional.

#### Scenario: Plunge reach is provisional

- **WHEN** the player starts a plunge attack
- **THEN** the plunge lands within a provisional reach
