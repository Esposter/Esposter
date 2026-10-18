## Purpose

Qiqi's kit as built: five strikes, a charged attack, Herald of Frost with its swipes and regeneration, Fortune-Preserving Talisman's damage and heal, Life-Prolonging Methods, and Constellations 1, 2, 4 and 6.

## Requirements

### Requirement: Qiqi's strikes, charged attack and plunges

Qiqi's five strikes and charged attack of two slashes SHALL land on the enemies within reach, and her collision and two plunges SHALL land on the enemies within reach.

#### Scenario: Five strikes in sequence

- **WHEN** the player uses normal attack five times in a row
- **THEN** the five strikes land in order on the enemies within reach

#### Scenario: Charged attack slashes

- **WHEN** the player uses the charged attack
- **THEN** both slashes land on the enemies within reach

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the collision and plunge hits land on the enemies within reach

### Requirement: Herald of Frost

Herald of Frost SHALL be a summon that follows Qiqi on the field, dealing initial damage and swipes, and while it stands each Normal and Charged Attack hit SHALL heal the party, and a continuous field SHALL heal the active character every 4.5 seconds.

#### Scenario: Herald follows Qiqi

- **WHEN** the player casts Herald of Frost
- **THEN** the summon follows Qiqi on the field

#### Scenario: Attacks heal the party while the Herald stands

- **GIVEN** Herald of Frost is standing
- **WHEN** a Normal Attack or Charged Attack hit lands
- **THEN** the party is healed

#### Scenario: Continuous heal every 4.5 seconds

- **GIVEN** Herald of Frost is standing
- **WHEN** 4.5 seconds have passed
- **THEN** the active character is healed

### Requirement: Fortune-Preserving Talisman

Fortune-Preserving Talisman SHALL deal damage and mark each enemy it strikes with a Talisman before the damage lands, and damage the active character deals an enemy holding the Talisman SHALL heal that character, at most once a second for each enemy.

#### Scenario: Talisman marks enemies struck by the burst

- **WHEN** the player casts Fortune-Preserving Talisman
- **THEN** each enemy the burst strikes gains a Talisman before the damage lands

#### Scenario: Hit on a marked enemy heals at most once a second

- **GIVEN** an enemy holds a Talisman
- **WHEN** the active character deals damage to that enemy twice within one second
- **THEN** the active character is healed only once in that second

### Requirement: A Glimpse into Arcanum keeps a longer Talisman

From Ascension 4, a Talisman with six seconds or more left SHALL NOT be replaced by a new cast, and the new cast SHALL spend no cooldown.

#### Scenario: Long Talisman is kept

- **GIVEN** Qiqi has Ascension 4 and a Talisman with six seconds or more left
- **WHEN** the player casts Fortune-Preserving Talisman
- **THEN** the existing Talisman is kept
- **AND** no cooldown is spent

### Requirement: Qiqi's constellations

Qiqi's Ascetics of Frost, Frozen to the Bone, Divine Suppression and Rite of Resurrection SHALL take effect from her first, second, fourth and sixth constellations.

#### Scenario: Frozen to the Bone on a Cryo enemy

- **GIVEN** Qiqi has Constellation 2 and the enemy is Cryo or Frozen
- **WHEN** Qiqi deals damage
- **THEN** the DMG Bonus applies

#### Scenario: Rite of Resurrection revives on the step after the burst

- **GIVEN** Qiqi has Constellation 6
- **WHEN** the player casts her burst
- **THEN** a defeated party member is revived on the step after the burst starts, at most once every 15 minutes

### Requirement: Life-Prolonging Methods

From Ascension 1, a reaction the character on the field triggers SHALL give that character 20% Healing Bonus for 8 seconds, unless Herald of Frost stands.

#### Scenario: A reaction gives the character on the field Healing Bonus

- **GIVEN** Qiqi has Ascension 1 and Herald of Frost is not standing
- **WHEN** the character on the field triggers a reaction
- **THEN** that character gains 20% Healing Bonus for 8 seconds
