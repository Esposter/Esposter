## Purpose

Mika's kit as built, with his five strikes, charged attack, plunges, Starfrost Swirl's press and held Rimestar Flare with the team's Soulwind ATK SPD bonus, Skyfeather Song's initial heal with the Eagleplume heals, and Constellation 1's shorter interval, and what is left of his Rimestar Shard, Constellations 2, 4 and 6, and his Ascension passives.

## Requirements

### Requirement: Mika's five strikes and charged attack

Mika's five strikes SHALL land in order and his charged attack SHALL land on the enemies within reach, with no poise damage.

#### Scenario: Five strikes in sequence

- **WHEN** the player uses normal attack five times in a row
- **THEN** the five strikes land in order on the enemies within reach

#### Scenario: Charged attack lands

- **WHEN** the player uses the charged attack
- **THEN** its hits land on the enemies within reach

### Requirement: Starfrost Swirl's press and held Rimestar Flare

Starfrost Swirl's press SHALL strike a Cryo box 0.4 metres behind Mika, and holding it past half a second SHALL release Rimestar Flare, a Cryo hit on the primary target.

#### Scenario: Tap presses Starfrost Swirl

- **WHEN** the player taps Starfrost Swirl
- **THEN** the Cryo box strikes the enemies within it

#### Scenario: Hold releases Rimestar Flare

- **WHEN** the player holds Starfrost Swirl past half a second and releases it
- **THEN** Rimestar Flare lands as a Cryo hit on the primary target

### Requirement: Skyfeather Song's initial heal

Skyfeather Song SHALL heal the active character once at its 51st frame.

#### Scenario: Initial heal lands

- **WHEN** the player casts Skyfeather Song
- **THEN** the active character is healed once at the 51st frame

### Requirement: Mika's plunge attacks

Mika's plunge attacks SHALL land on the enemies within reach at provisional timings.

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the plunge lands on the enemies within reach

### Requirement: Starfrost Swirl grants the party Soulwind

Starfrost Swirl's press and held Rimestar Flare SHALL grant every party member Soulwind, raising its ATK SPD by the skill's bonus for 12 seconds.

#### Scenario: Press grants Soulwind to the party

- **GIVEN** Mika presses Starfrost Swirl
- **WHEN** the press starts
- **THEN** every party member gains the ATK SPD bonus and Soulwind for 12 seconds

#### Scenario: Hold grants Soulwind to the party

- **GIVEN** Mika holds Starfrost Swirl and releases Rimestar Flare
- **WHEN** the hold starts
- **THEN** every party member gains the ATK SPD bonus and Soulwind for 12 seconds

### Requirement: Skyfeather Song's heal grants the Eagleplume state

Skyfeather Song's initial heal SHALL grant every party member the Eagleplume state for 15 seconds, and a character under it SHALL heal by Mika's flat heal and a share of his Max HP on each of its normal attacks, once per 2.5 seconds.

#### Scenario: Initial heal grants the Eagleplume state

- **GIVEN** Mika casts Skyfeather Song
- **WHEN** its initial heal lands
- **THEN** every party member is under the Eagleplume state for 15 seconds

#### Scenario: A normal attack heals once per interval

- **GIVEN** a character is under the Eagleplume state
- **WHEN** its normal attack hits an enemy
- **THEN** it heals by the flat heal and the share of Mika's Max HP, and does not heal again for 2.5 seconds

### Requirement: Constellation 1 shortens the Eagleplume interval under Soulwind

With Constellation 1, a character under Soulwind SHALL wait for its Eagleplume interval shortened by the ATK SPD bonus, and a character not under Soulwind SHALL keep the 2.5-second interval.

#### Scenario: Soulwind shortens the interval

- **GIVEN** Mika has Constellation 1 and a character is under Soulwind
- **WHEN** that character's normal attack heals it under Eagleplume
- **THEN** its next heal is due after 2.5 seconds shortened by the ATK SPD bonus

### Requirement: Unbuilt Mika effects

Rimestar Shard, Mika's Ascension passives and Constellations 2, 4 and 6 SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Mika has a passive or constellation unlocked
- **WHEN** the player fights with Mika
- **THEN** those effects have no effect
