## Purpose

Kokomi's kit as built: three strikes, a charged attack, Bake-Kurage's ripples and heal field, and Nereid's Ascension with its Ceremonial Garment stance, and Constellation 4's garment speed, with her passives, Constellations 1, 2 and 6, and Constellation 4's energy not built.

## Requirements

### Requirement: Kokomi's strikes and charged attack

Kokomi's three strikes and her charged attack SHALL each land their hits on the enemies within reach.

#### Scenario: Normal attack strikes in sequence

- **WHEN** the player uses normal attack three times in a row
- **THEN** the three strikes land in order on the enemies within reach

#### Scenario: Charged attack lands

- **WHEN** the player uses the charged attack
- **THEN** its hits land on the enemies within reach

### Requirement: Bake-Kurage's ripples and heal field

Kokomi's elemental skill SHALL summon Bake-Kurage, which sends seven ripples and leaves a field that heals the active character from her Max HP while it stands within the field's circle, lasting 12.5 seconds on a 20-second cooldown.

#### Scenario: Active character heals within the field

- **GIVEN** the active character stands within Bake-Kurage's circle
- **WHEN** the field ticks
- **THEN** the active character is healed from Kokomi's Max HP

#### Scenario: Skill refused during cooldown

- **GIVEN** Bake-Kurage is on its 20-second cooldown
- **WHEN** the player presses the skill
- **THEN** the press is not used

### Requirement: Nereid's Ascension and the Ceremonial Garment

Kokomi's burst SHALL deal damage equal to a share of her Max HP and SHALL start the Ceremonial Garment, which lasts ten seconds.

#### Scenario: Burst starts the garment

- **WHEN** the player casts Nereid's Ascension
- **THEN** the burst deals damage equal to her Max HP share
- **AND** the Ceremonial Garment begins for ten seconds

#### Scenario: Swap ends the garment

- **GIVEN** the Ceremonial Garment is standing
- **WHEN** Kokomi leaves the field
- **THEN** the garment ends

### Requirement: Ceremonial Garment bonuses and heals

While the Ceremonial Garment stands, Kokomi's normal attacks, charged attack and Bake-Kurage SHALL deal extra damage from her Max HP, and her normal and charged attacks SHALL heal the party on each enemy they strike.

#### Scenario: Attacks heal the party while the garment stands

- **GIVEN** the Ceremonial Garment is standing
- **WHEN** a normal attack or charged attack strikes an enemy
- **THEN** the party is healed by a share of Kokomi's Max HP and a flat amount

### Requirement: Constellation 4's garment speed

While Kokomi wears the Ceremonial Garment at Constellation 4, her Normal Attack SPD is raised by 10%. The energy her landed Normal Attacks give is not built.

#### Scenario: Garment raises Normal Attack SPD at Constellation 4

- **GIVEN** Kokomi has Constellation 4 and the Ceremonial Garment stands
- **WHEN** her Normal Attack SPD is read
- **THEN** it is raised by 10%

#### Scenario: No garment, no speed

- **GIVEN** Kokomi has Constellation 4 and no Ceremonial Garment stands
- **WHEN** her Normal Attack SPD is read
- **THEN** it is not raised

#### Scenario: Constellation 3 changes nothing

- **GIVEN** Kokomi has Constellation 3 and the Ceremonial Garment stands
- **WHEN** her Normal Attack SPD is read
- **THEN** it is not raised

### Requirement: Kokomi's plunge timing

Kokomi's plunge attacks SHALL land half a second after they start, provisionally.

#### Scenario: Plunge lands at half a second

- **WHEN** the player starts a plunge attack
- **THEN** the plunge lands half a second after it starts

### Requirement: Kokomi's passives, Constellations 1, 2 and 6, and Constellation 4's energy not yet built

Kokomi's passives, Constellations 1, 2 and 6, and Constellation 4's energy SHALL NOT take effect.

#### Scenario: Passives and unbuilt constellations do nothing

- **GIVEN** Kokomi has a passive or an unbuilt constellation unlocked
- **WHEN** the player fights with Kokomi
- **THEN** that passive or constellation has no effect
