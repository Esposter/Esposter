## Purpose

Mika's kit as built, with his five strikes, charged attack, plunges, Starfrost Swirl's press and held Rimestar Flare, and Skyfeather Song's initial heal, and what is left of his Rimestar Shard, Eagleplume heals, the team's ATK SPD bonus, and his passives.

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

### Requirement: Unbuilt Mika effects

Rimestar Shard, Eagleplume heals, the team's ATK SPD bonus and Mika's Ascension and constellation passives SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Mika has a passive or constellation unlocked
- **WHEN** the player fights with Mika
- **THEN** those effects have no effect
