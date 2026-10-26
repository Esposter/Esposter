## Purpose

Yanfei's kit as built, with her Scarlet Seals spent by the charged attack, Signed Edict and Done Deal, her Ascension 4 Blazing Eye, Constellation 2's CRIT Rate, and Constellation 4's Pyro shield on Done Deal.

## Requirements

### Requirement: Normal attack and collision

Yanfei's normal attack SHALL be three strikes, followed by a charged attack that spends her Scarlet Seals, a collision and two plunges.

#### Scenario: Normal attack lands three strikes

- **WHEN** the player strikes with Yanfei's normal attack
- **THEN** three strikes land in order (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/yanfei/attack.go` line 17)

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
- **THEN** one seal is added each second for 15 seconds (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/yanfei/burst.go` lines 35 and 85)

#### Scenario: Seals cap at the maximum

- **GIVEN** Yanfei holds the maximum number of seals
- **WHEN** another seal is gained
- **THEN** no further seal is added (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/yanfei/yanfei.go` line 33)

### Requirement: Charged attack spends seals

Yanfei's charged attack SHALL spend her held Scarlet Seals as it starts, and each seal spent SHALL widen its circle (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/yanfei/charge.go` line 15), raise its multiplier and cut its stamina cost (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/yanfei/yanfei.go` lines 36 to 38).

#### Scenario: Charged attack with seals held

- **GIVEN** Yanfei holds Scarlet Seals
- **WHEN** she uses her charged attack
- **THEN** each seal spent widens its circle and raises its damage
- **AND** each seal cuts its stamina cost

#### Scenario: Charged attack timing

- **WHEN** Yanfei starts her charged attack
- **THEN** it lands 63 frames after it starts (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/yanfei/charge.go` line 18)

### Requirement: Seal damage bonus

From Ascension 1, each seal spent SHALL give Yanfei 5% Pyro DMG Bonus for 6 seconds (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/yanfei/asc.go` lines 21 to 22), and while Done Deal stands its DMG Bonus SHALL apply to her charged attack (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/yanfei/burst.go` line 41).

#### Scenario: Pyro bonus from spent seals

- **GIVEN** Yanfei is at Ascension 1
- **WHEN** she spends seals
- **THEN** she gains 5% Pyro DMG Bonus per seal for 6 seconds

#### Scenario: Done Deal bonus on the charged attack

- **GIVEN** Done Deal stands
- **WHEN** Yanfei uses her charged attack
- **THEN** Done Deal's DMG Bonus applies to it (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/yanfei/burst.go` line 41)

### Requirement: Constellation 2 Charged Attack CRIT Rate

From Constellation 2, Yanfei's Charged Attacks SHALL have 20% more CRIT Rate against enemies below 50% HP (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/yanfei/cons.go` lines 15 to 35).

#### Scenario: Constellation 2 raises CRIT Rate below half HP

- **GIVEN** Yanfei has Constellation 2
- **WHEN** a Charged Attack strikes an enemy below 50% HP
- **THEN** its CRIT Rate is raised by 20% (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/yanfei/cons.go` lines 28 and 31)

#### Scenario: Constellation 1 changes nothing

- **GIVEN** Yanfei has Constellation 1
- **WHEN** a Charged Attack strikes an enemy below 50% HP
- **THEN** its CRIT Rate is unchanged

### Requirement: A CRIT charged attack sets off Blazing Eye from Ascension 4

From Ascension 4, the first CRIT hit each charged attack of Yanfei's lands while she is on the field SHALL set off 80% of her ATK as Pyro Charged Attack DMG round the enemy struck (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/yanfei/asc.go` lines 58 to 67).

#### Scenario: Blazing Eye on a CRIT charged attack

- **GIVEN** Yanfei has reached Ascension 4 and is on the field
- **WHEN** her charged attack lands a CRIT hit on an enemy
- **THEN** a Pyro hit of 80% of her ATK strikes a circle of 3.5 metres round that enemy (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/yanfei/asc.go` line 67)
- **AND** a further CRIT hit of the same charged attack sets off none

### Requirement: Constellation 4 shields Done Deal

From Constellation 4, Done Deal SHALL cast a Pyro shield absorbing up to 45% of Yanfei's Max HP for 15 seconds (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/yanfei/cons.go` lines 52 and 54), which absorbs Pyro DMG at 250% (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/yanfei/cons.go` lines 39 to 41).

#### Scenario: Constellation 4 shield

- **GIVEN** Yanfei has Constellation 4
- **WHEN** she casts Done Deal
- **THEN** a Pyro shield of 45% of her Max HP is cast for 15 seconds (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/yanfei/cons.go` lines 52 and 54)

#### Scenario: No shield below Constellation 4

- **GIVEN** Yanfei has Constellation 3 or lower
- **WHEN** she casts Done Deal
- **THEN** no shield is cast
