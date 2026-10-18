## Purpose

Mona's kit as built: four strikes, a charged attack, Mirror Reflection of Doom's summon, Stellaris Phantasm's bubble and Omen, and A1's phantom and A4's Hydro bonus, with her plunges' reach provisional.

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

### Requirement: Mona's plunge reach

Mona's plunge reach SHALL be provisional.

#### Scenario: Plunge reach is provisional

- **WHEN** the player starts a plunge attack
- **THEN** the plunge lands within a provisional reach
