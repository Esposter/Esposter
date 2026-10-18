## Purpose

Nilou's kit as built, with Dance of Haftkarsvar's Pirouette and Lunar Prayer, Dance of Abzendegi's hit, Constellations 1 and 6, and what is left of Ascension, Lingering Aeon, Tranquility Aura and Constellations 2 to 5.

## Requirements

### Requirement: Nilou's strikes, charged attack and plunges

Nilou's three strikes and her charged attack of two hits SHALL land on the enemies within reach, and her charged attack SHALL need 20 stamina to start.

#### Scenario: Three strikes in sequence

- **WHEN** the player uses normal attack three times in a row
- **THEN** the three strikes land in order on the enemies within reach

#### Scenario: Charged attack refused without stamina

- **GIVEN** Nilou has less than 20 stamina
- **WHEN** the player uses the charged attack
- **THEN** the charged attack does not start

#### Scenario: Plunge lands with provisional timing

- **WHEN** the player starts a plunge attack
- **THEN** the collision and plunge hits land on the enemies within reach at a provisional timing

### Requirement: Dance of Haftkarsvar starts Pirouette

Nilou's Dance of Haftkarsvar SHALL deal damage equal to a share of her Max HP and SHALL start Pirouette, a sword dance stance lasting ten seconds in which her normal attacks are its three steps.

#### Scenario: Cast starts Pirouette

- **WHEN** the player casts Dance of Haftkarsvar
- **THEN** the damage equals a share of Nilou's Max HP
- **AND** Pirouette begins for ten seconds

#### Scenario: Recast restarts Pirouette

- **GIVEN** Pirouette is standing
- **WHEN** the player casts Dance of Haftkarsvar again
- **THEN** Pirouette restarts

### Requirement: Lunar Prayer from the third step

When the third step of Pirouette lands, the team SHALL gain Lunar Prayer, an eight-second sword dance stance, 30 frames after that step.

#### Scenario: Third step hands the team Lunar Prayer

- **GIVEN** Pirouette is standing
- **WHEN** the third step lands
- **THEN** 30 frames later the team gains Lunar Prayer for eight seconds

### Requirement: Swap ends Pirouette and Lunar Prayer

Leaving the field SHALL end Pirouette and Lunar Prayer and SHALL cancel a pending Lunar Prayer.

#### Scenario: Swap ends both stances

- **GIVEN** Pirouette or Lunar Prayer is standing
- **WHEN** Nilou leaves the field
- **THEN** the stance ends
- **AND** a pending Lunar Prayer is cancelled

### Requirement: Dance of Abzendegi's hit

Dance of Abzendegi SHALL deal damage equal to a share of Nilou's Max HP on the enemies within reach, and its second hit SHALL NOT take effect.

#### Scenario: Dance deals Max HP damage

- **WHEN** the player casts Dance of Abzendegi
- **THEN** the hit deals damage equal to a share of Nilou's Max HP

### Requirement: Constellations 1 and 6

Constellation 1 SHALL add 65% damage to the sword dance's Luminous Illusion hit alone, and Constellation 6 SHALL give 0.6% CRIT Rate and 1.2% CRIT DMG for each 1,000 of Max HP, capped at 30% CRIT Rate and 60% CRIT DMG.

#### Scenario: Constellation 1 boosts the Luminous Illusion hit

- **GIVEN** Nilou has Constellation 1
- **WHEN** the Luminous Illusion hit lands
- **THEN** that hit gains 65% damage

#### Scenario: Constellation 6 CRIT is capped

- **GIVEN** Nilou has Constellation 6 and very high Max HP
- **WHEN** her attacks are priced
- **THEN** her CRIT Rate stops at 30% and her CRIT DMG stops at 60%

### Requirement: Pirouette's later steps are blocked

A press of Nilou's skill inside Pirouette SHALL be refused by the cooldown the cast set, so the Whirling Steps are reachable only after Pirouette ends.

#### Scenario: Skill press refused during Pirouette

- **GIVEN** Pirouette is standing
- **WHEN** the player presses the skill
- **THEN** the press is refused by the cooldown

### Requirement: Unbuilt Nilou effects

Nilou's Ascension 1 and 4, Constellations 2 and 4, Lingering Aeon, Tranquility Aura and the Whirling Steps' later presses SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Nilou has one of these effects unlocked
- **WHEN** the player fights with Nilou
- **THEN** that effect has no effect
