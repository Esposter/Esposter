## Purpose

Yumemizuki Mizuki's kit as built, with her three strikes, charged attack, plunges, the skill's activation hit and the burst's hit, and what is left waiting on the Dreamdrifter state and the snack pick-ups.

## Requirements

### Requirement: Mizuki's three strikes

Mizuki's three strikes SHALL each deal Anemo damage on the primary target, landing ten frames after their hitmarks.

#### Scenario: Three strikes in sequence

- **WHEN** the player uses normal attack three times in a row
- **THEN** each strike lands on the primary target 10 frames after its hitmark
- **AND** each strike deals Anemo damage

### Requirement: Mizuki's charged attack

Mizuki's charged attack SHALL land an 8.5-metre Anemo circle on the primary target at 39 frames and SHALL need 50 stamina to start.

#### Scenario: Charged attack with enough stamina

- **GIVEN** Mizuki has at least 50 stamina
- **WHEN** the player uses the charged attack
- **THEN** the Anemo circle lands on the primary target at 39 frames

#### Scenario: Charged attack refused without stamina

- **GIVEN** Mizuki has less than 50 stamina
- **WHEN** the player uses the charged attack
- **THEN** the charged attack does not start

### Requirement: Activation hit and cooldown

Mizuki's skill SHALL deal an Anemo hit within a 5.5-metre circle round her at 2 frames, and SHALL go on a 15-second cooldown.

#### Scenario: Skill activation hits the circle

- **WHEN** the player presses Mizuki's skill
- **THEN** the Anemo hit lands within the 5.5-metre circle round her at 2 frames
- **AND** the skill goes on a 15-second cooldown

#### Scenario: Skill refused during cooldown

- **GIVEN** Mizuki's skill is on cooldown
- **WHEN** the player presses it
- **THEN** the press is not used

### Requirement: Burst hit and energy cost

Mizuki's burst SHALL cost 60 energy and SHALL deal an Anemo hit within an 8-metre circle on the primary target at 93 frames.

#### Scenario: Burst with enough energy

- **GIVEN** Mizuki has at least 60 energy
- **WHEN** the player casts the burst
- **THEN** the Anemo hit lands within the 8-metre circle on the primary target at 93 frames

#### Scenario: Burst refused without enough energy

- **GIVEN** Mizuki has less than 60 energy
- **WHEN** the player casts the burst
- **THEN** the burst does not start

### Requirement: Mizuki's plunge attacks

Mizuki's collision and two plunges SHALL land on the enemies within reach, with their timing provisional.

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the collision and the plunge hits land on the enemies within reach

### Requirement: Dreamdrifter state from the skill's press

Mizuki's skill press SHALL enter the Dreamdrifter state for five seconds, and a press in the state SHALL cancel it.

#### Scenario: The press enters the Dreamdrifter state, which lasts five seconds

- **GIVEN** Mizuki is out of the Dreamdrifter state
- **WHEN** the player presses her skill
- **THEN** the Dreamdrifter state holds for five seconds and then ends

#### Scenario: A press in the Dreamdrifter state cancels it

- **GIVEN** Mizuki is in the Dreamdrifter state
- **WHEN** the player presses her skill
- **THEN** the Dreamdrifter state ends

### Requirement: Clouds, snacks and constellations not yet built

Mizuki's Dreamdrifter clouds, the state's restriction of her actions, the snack pick-ups, the charged attack's out-of-air windup and Mizuki's Ascension and constellation effects that read them SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Mizuki has a cloud, snack or constellation effect unlocked
- **WHEN** the player fights with Mizuki
- **THEN** those effects have no effect
