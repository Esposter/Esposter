## Purpose

Shenhe's kit as built: Spring Spirit Summoning's press and hold and Divine Maiden's Deliverance field with its DoT, with Constellation 1's extra charge built and her Quill, other passives and Constellations 2, 4 and 6 left unbuilt.

## Requirements

### Requirement: Shenhe's strikes, charged attack and plunges

Shenhe's five strikes, charged attack, collision and two plunges SHALL land on the enemies within reach, dealing no poise damage, provisionally.

#### Scenario: Five strikes in sequence

- **WHEN** the player uses normal attack five times in a row
- **THEN** the five strikes land in order on the enemies within reach

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the collision and plunge hits land on the enemies within reach

### Requirement: Spring Spirit Summoning's press and hold

Spring Spirit Summoning SHALL deal its press on tap, and holding it past half a second SHALL release its hold, provisionally.

#### Scenario: Tap plays the press

- **WHEN** the player taps Spring Spirit Summoning
- **THEN** the press's hit lands on the enemies within reach

#### Scenario: Hold past half a second plays the hold

- **WHEN** the player holds Spring Spirit Summoning past half a second and releases it
- **THEN** the hold's hit lands on the enemies within reach

### Requirement: Divine Maiden's Deliverance field

Divine Maiden's Deliverance SHALL deal an initial hit and leave a field 2 metres ahead of Shenhe, whose DoT ticks summon two hits there, and each tick SHALL hold an RES Decrease on the enemies it strikes for one tick interval.

#### Scenario: Initial hit and field

- **WHEN** the player casts Divine Maiden's Deliverance
- **THEN** the initial hit lands
- **AND** a field stands 2 metres ahead of Shenhe

#### Scenario: DoT tick holds the RES Decrease

- **GIVEN** Divine Maiden's Deliverance's field is standing
- **WHEN** a DoT tick strikes an enemy
- **THEN** that enemy's RES is decreased for one tick interval

### Requirement: Ascension 1 Cryo DMG Bonus in the field

From Ascension 1, the active character standing in Divine Maiden's Deliverance field SHALL gain a Cryo DMG Bonus.

#### Scenario: Active character in the field gets the bonus

- **GIVEN** Shenhe has Ascension 1 and the active character stands in the field
- **WHEN** that character deals Cryo damage
- **THEN** the Cryo DMG Bonus applies

### Requirement: Constellation 1 charge

From Constellation 1, Spring Spirit Summoning SHALL have one more charge than its base.

#### Scenario: Constellation 1 adds a charge

- **GIVEN** Shenhe has Constellation 1
- **WHEN** her skill's charges are read
- **THEN** it has one more charge than the base

#### Scenario: Constellation 0 adds nothing

- **GIVEN** Shenhe has no constellation
- **WHEN** her skill's charges are read
- **THEN** no charge is added

### Requirement: Unbuilt Shenhe effects

Shenhe's Quill, her other passives and her Constellations 2, 4 and 6 SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Shenhe has the Quill, a passive or Constellation 2, 4 or 6 unlocked
- **WHEN** the player fights with Shenhe
- **THEN** that effect has no effect
