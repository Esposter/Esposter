## Purpose

Xiangling's kit as built, with Guoba and its breaths, the following Pyronado and Oil Meets Fire's Implode, and what is left of Guoba's aura, its particles and her other passives.

## Requirements

### Requirement: Xiangling's strikes, charged attack and plunges

Xiangling's five strikes SHALL land in order, her charged attack SHALL cost 25 stamina to start, and her plunges SHALL land on the enemies within reach.

#### Scenario: Five strikes in sequence

- **WHEN** the player uses normal attack five times in a row
- **THEN** the five strikes land in order, the third being two hits and the fourth four hits

#### Scenario: Charged attack refused without stamina

- **GIVEN** Xiangling has less than 25 stamina
- **WHEN** the player uses the charged attack
- **THEN** the charged attack does not start

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the plunge lands on the enemies within reach

### Requirement: Guoba's breaths

Guoba Attack SHALL place Guoba 1.3 metres ahead of Xiangling for 438 frames, breathing four times at 126, 226, 326 and 426 frames, each breath a 60-degree fan of 5 metres, or 6 metres with Crossfire.

#### Scenario: Guoba breathes four times

- **WHEN** the player casts Guoba Attack
- **THEN** Guoba stands 1.3 metres ahead of Xiangling
- **AND** it breathes at 126, 226, 326 and 426 frames

#### Scenario: Crossfire widens the breath

- **GIVEN** Xiangling has Ascension 1
- **WHEN** Guoba breathes
- **THEN** each breath reaches 6 metres

#### Scenario: Constellation 1 cuts Pyro RES

- **GIVEN** Xiangling has Constellation 1
- **WHEN** a Guoba breath strikes an enemy
- **THEN** that enemy's Pyro RES drops by 15% for 6 seconds

### Requirement: The Pyronado

The Pyronado SHALL follow Xiangling's body on the field and tick every 73 frames from 56 frames for 10 seconds, nine times, or fourteen seconds, twelve times, from Slowbake at four constellations.

#### Scenario: Pyronado follows the body

- **WHEN** the player casts the burst
- **THEN** the Pyronado follows whichever character stands on the field

#### Scenario: Pyronado ticks nine times

- **WHEN** the Pyronado is cast without Slowbake
- **THEN** it ticks nine times, each 73 frames apart from 56 frames

#### Scenario: Slowbake extends the Pyronado

- **GIVEN** Xiangling has four constellations
- **WHEN** the Pyronado is cast
- **THEN** it lasts 14 seconds and ticks twelve times

### Requirement: Condensed Pyronado

From six constellations, the Pyronado's start SHALL give every member of the deployed team a 15% Pyro DMG Bonus for the Pyronado's seconds.

#### Scenario: Team bonus from the Pyronado

- **GIVEN** Xiangling has six constellations
- **WHEN** the Pyronado starts
- **THEN** every deployed team member gains a 15% Pyro DMG Bonus for its duration

### Requirement: Beware, It's Super Hot! chili pepper

From Ascension 4, Guoba SHALL leave a chili pepper field where it stood when its seconds end, lasting 10 seconds, and the character on the field who stands within a metre of it SHALL gain 10% of Xiangling's base ATK as flat ATK for 10 seconds, after which the pepper is gone.

#### Scenario: Character picks up the pepper

- **GIVEN** Xiangling has Ascension 4 and the chili pepper stands
- **WHEN** the character on the field stands within a metre of it
- **THEN** that character gains 10% of Xiangling's base ATK as flat ATK for 10 seconds
- **AND** the pepper is gone

### Requirement: Oil Meets Fire's Implode

From Constellation 2, the fifth strike's start SHALL cast an Implode where Xiangling stands, landing 75% of her ATK as Pyro 120 frames after the strike's hit on the enemies its reach holds then.

#### Scenario: Implode lands after the fifth strike

- **GIVEN** Xiangling has Constellation 2
- **WHEN** the fifth strike is used
- **THEN** an Implode is cast where Xiangling stands
- **AND** it lands 120 frames after the strike's hit

### Requirement: Unbuilt Xiangling effects

Guoba's aura, its particles, Chef de Cuisine, Deepfry and Guoba Mad SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Xiangling has Guoba's aura, Deepfry or Guoba Mad unlocked
- **WHEN** the player fights with Xiangling
- **THEN** that effect has no effect
