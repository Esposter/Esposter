## Purpose

Xingqiu's kit as built, with the Rain Swords, Raincutter's sword rain and Fatal Rainscreen, and what is left of his particles, his other constellations and the burst's knockback.

## Requirements

### Requirement: Normal attack and charged attack

Xingqiu's normal attack SHALL be five strikes, the third and fifth of two hits each, followed by a two-hit charged attack, a collision and two plunges.

#### Scenario: Normal attack lands five strikes

- **WHEN** the player strikes with Xingqiu's normal attack
- **THEN** five strikes land in order, the third and fifth each landing two hits

#### Scenario: Charged attack slashes round him

- **WHEN** the player uses Xingqiu's charged attack
- **THEN** two slashes of 2.2 metres land round his body

### Requirement: Fatal Rainscreen hits

Xingqiu's skill SHALL cast Rain Swords that land two Hydro hits, the first 12 frames and the second 31 frames after the skill starts.

#### Scenario: Skill lands both hits

- **WHEN** the player presses Xingqiu's skill
- **THEN** two Hydro hits land at 12 and 31 frames
- **AND** both land even if the skill is cancelled

#### Scenario: Skill press during its cooldown

- **WHEN** the player presses Xingqiu's skill while its cooldown is still running
- **THEN** no hit lands

### Requirement: Rain Swords

The Rain Swords SHALL follow Xingqiu on the field, putting Hydro on the enemies within 1.2 metres of the character on the field every 2.25 seconds.

#### Scenario: Rain Swords tick

- **WHEN** the Rain Swords are cast
- **THEN** Hydro lands on the enemies within 1.2 metres of the character on the field every 2.25 seconds for 15 seconds

#### Scenario: Recast that outlasts the swords

- **GIVEN** the Rain Swords stand
- **WHEN** they are recast with more seconds than they have left
- **THEN** they stand for the recast's seconds

#### Scenario: Recast that does not outlast the swords

- **GIVEN** the Rain Swords stand
- **WHEN** they are recast with fewer seconds than they have left
- **THEN** they keep their remaining seconds

#### Scenario: Burst holds the swords

- **WHEN** the burst is cast
- **THEN** the Rain Swords stand for the burst's 15 seconds

### Requirement: Hydropathic heal

From Ascension 1, as the Rain Swords end, the character on the field SHALL be healed by 6% of Xingqiu's Max HP for each sword.

#### Scenario: Heal as the swords end

- **GIVEN** Xingqiu is at Ascension 1
- **WHEN** the Rain Swords end
- **THEN** the character on the field is healed for each sword

#### Scenario: Prolonged swords heal nothing at the earlier end

- **GIVEN** Xingqiu is at Ascension 1
- **WHEN** a recast prolongs the Rain Swords
- **THEN** the earlier end heals nothing

### Requirement: Raincutter sword waves

The burst SHALL cast Raincutter, which casts a wave of swords where the character who starts a normal attack stands, unless a wave was cast within the last second.

#### Scenario: Normal attack casts a wave

- **GIVEN** Raincutter stands
- **WHEN** the character on the field starts a normal attack
- **THEN** a wave of swords lands 20 frames later where that character stands, with the waves running 2, 3, 2, 3 swords

#### Scenario: Wave within the last second

- **GIVEN** a wave was cast within the last second
- **WHEN** another normal attack starts
- **THEN** no wave is cast

#### Scenario: Charged attack and plunges cast no wave

- **GIVEN** Raincutter stands
- **WHEN** Xingqiu uses his charged attack or a plunge
- **THEN** no wave is cast

#### Scenario: Fall does not end Raincutter

- **GIVEN** Raincutter stands
- **WHEN** Xingqiu falls
- **THEN** Raincutter keeps standing

### Requirement: Constellation effects on the swords

From two constellations, each sword SHALL cut 15% from the Hydro RES of each enemy it strikes for 4 seconds, and from six, a wave of five swords SHALL give Xingqiu 3 energy up to his burst's cost.

#### Scenario: Sword cuts Hydro RES

- **GIVEN** Xingqiu has two constellations
- **WHEN** a sword strikes an enemy
- **THEN** the enemy's Hydro RES is cut by 15% for 4 seconds

#### Scenario: Five-sword wave gives energy

- **GIVEN** Xingqiu has six constellations
- **WHEN** a wave of five swords lands
- **THEN** Xingqiu gains 3 energy up to his burst's cost

### Requirement: Unbuilt effects

The Rain Swords SHALL not shatter when struck and take no damage reduction, and Xingqiu's particles, his other constellations and the burst's knockback SHALL have no effect yet.

#### Scenario: A strike does not shatter a sword

- **WHEN** an enemy strikes a Rain Sword
- **THEN** the sword is not shattered
