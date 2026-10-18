## Purpose

Yanfei's kit as built, with her Scarlet Seals spent by the charged attack, Signed Edict and Done Deal, and what is left of her Ascension 4 shot and Constellations 2 and 4.

## Requirements

### Requirement: Normal attack and collision

Yanfei's normal attack SHALL be three strikes, followed by a charged attack that spends her Scarlet Seals, a collision and two plunges.

#### Scenario: Normal attack lands three strikes

- **WHEN** the player strikes with Yanfei's normal attack
- **THEN** three strikes land in order

### Requirement: Scarlet Seals

Yanfei's Scarlet Seals SHALL be set by her strikes, Signed Edict and Done Deal, and the seals held SHALL restart together for 10 seconds on each gain, so they run out together.

#### Scenario: Strike sets the seals

- **WHEN** Yanfei strikes or uses Signed Edict
- **THEN** her Scarlet Seals are set

#### Scenario: Seals run out together

- **GIVEN** Yanfei holds Scarlet Seals
- **WHEN** 10 seconds pass with no gain
- **THEN** all of the held seals run out together

#### Scenario: Done Deal adds seals over time

- **WHEN** Yanfei uses Done Deal
- **THEN** one seal is added each second for 15 seconds

#### Scenario: Seals cap at the maximum

- **GIVEN** Yanfei holds the maximum number of seals
- **WHEN** another seal is gained
- **THEN** no further seal is added

### Requirement: Charged attack spends seals

Yanfei's charged attack SHALL spend her held Scarlet Seals as it starts, and each seal spent SHALL widen its circle, raise its multiplier and cut its stamina cost.

#### Scenario: Charged attack with seals held

- **GIVEN** Yanfei holds Scarlet Seals
- **WHEN** she uses her charged attack
- **THEN** each seal spent widens its circle and raises its damage
- **AND** each seal cuts its stamina cost

#### Scenario: Charged attack timing

- **WHEN** Yanfei starts her charged attack
- **THEN** it lands 63 frames after it starts

### Requirement: Seal damage bonus

From Ascension 1, each seal spent SHALL give Yanfei 5% Pyro DMG Bonus for 6 seconds, and while Done Deal stands its DMG Bonus SHALL apply to her charged attack.

#### Scenario: Pyro bonus from spent seals

- **GIVEN** Yanfei is at Ascension 1
- **WHEN** she spends seals
- **THEN** she gains 5% Pyro DMG Bonus per seal for 6 seconds

#### Scenario: Done Deal bonus on the charged attack

- **GIVEN** Done Deal stands
- **WHEN** Yanfei uses her charged attack
- **THEN** Done Deal's DMG Bonus applies to it

### Requirement: Unbuilt effects

Yanfei's Ascension 4 shot, her Constellation 2 CRIT Rate and her Constellation 4 shield SHALL have no effect in the world yet.

#### Scenario: Constellation 4 shield absent

- **WHEN** Yanfei holds Constellation 4
- **THEN** no shield is applied
