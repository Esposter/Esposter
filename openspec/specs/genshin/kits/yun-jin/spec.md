## Purpose

Yun Jin's kit as built, with Opening Flourish's tap and its two charge levels, each with a shield of a share of her Max HP and a flat share, and Cliffbreaker's Banner's initial hit, her Ascension 1 counter window, and what is left to build.

## Requirements

### Requirement: Five strikes, charged attack and plunges

Yun Jin's normal attack SHALL be five strikes, followed by a charged attack, a collision and two plunges.

#### Scenario: Normal attack lands five strikes

- **WHEN** the player strikes with Yun Jin's normal attack
- **THEN** five strikes land in order

### Requirement: Opening Flourish shields

Opening Flourish's tap and its two charge levels SHALL each give a shield of a share of Yun Jin's Max HP plus a flat share, each lasting until its hit, and the tap and both charges SHALL deal damage that scales with her Defense.

#### Scenario: Tap gives a shield

- **WHEN** the player taps Opening Flourish
- **THEN** a shield is given that lasts until its hit

#### Scenario: First charge level

- **GIVEN** the skill is held
- **WHEN** it reaches half a second
- **THEN** the first charge level gives a larger shield

#### Scenario: Second charge level

- **GIVEN** the skill is held
- **WHEN** it reaches a second
- **THEN** the second charge level gives the largest shield

### Requirement: Cliffbreaker's Banner initial hit

Cliffbreaker's Banner's initial hit SHALL land on the enemies in its circle as the burst is cast.

#### Scenario: Burst cast

- **WHEN** the player casts Cliffbreaker's Banner
- **THEN** its initial hit lands on the enemies in its circle

### Requirement: Constellation 4 DEF on Crystallize

From Constellation 4, a Crystallize or Lunar-Crystallize reaction of Yun Jin's SHALL give her 20% DEF for 12 seconds.

#### Scenario: Constellation 4 raises DEF on her Crystallize

- **GIVEN** Yun Jin has Constellation 4
- **WHEN** her own hit triggers a Crystallize or Lunar-Crystallize reaction
- **THEN** she gains 20% DEF for 12 seconds

#### Scenario: Constellation 3 changes nothing

- **GIVEN** Yun Jin has Constellation 3
- **WHEN** her own hit triggers a Crystallize reaction
- **THEN** no DEF is gained

### Requirement: Ascension 1 counter window

From Ascension 1, a hit that lands on Yun Jin while her skill is held SHALL open a counter window of 0.5 seconds on her, and a release while the window stands SHALL play Opening Flourish's top level, whatever seconds the skill was held.

#### Scenario: A hit on her in the hold opens the window

- **GIVEN** Yun Jin has Ascension 1 and her skill is held
- **WHEN** an enemy's strike costs her HP, or a shield takes one for her
- **THEN** the counter window opens for 0.5 seconds

#### Scenario: A release inside the window plays the top level

- **GIVEN** the counter window stands
- **WHEN** her skill is released after 0.2 seconds held
- **THEN** Opening Flourish plays its Level 2 Charged form

#### Scenario: A release after the window closed plays the level its seconds reach

- **GIVEN** the counter window has closed
- **WHEN** her skill is released after 0.6 seconds held
- **THEN** Opening Flourish plays its Level 1 Charged form

#### Scenario: A hit outside the hold opens nothing

- **GIVEN** Yun Jin has Ascension 1 and her skill is not held
- **WHEN** an enemy's strike costs her HP
- **THEN** no counter window opens

#### Scenario: Below Ascension 1 nothing opens

- **GIVEN** Yun Jin has Ascension 0
- **WHEN** an enemy's strike costs her HP while her skill is held
- **THEN** no counter window opens

### Requirement: Cliffbreaker's Banner's DMG Increase on her normal attacks

While Cliffbreaker's Banner stands, each hit of Yun Jin's normal attack SHALL deal flat base damage equal to 0.3216 of her DEF, and each enemy one of her normal attacks damages SHALL spend one of the banner's 30 stacks. The banner SHALL stand for 12 seconds from its hit.

#### Scenario: Burst sets the banner

- **WHEN** the player casts Cliffbreaker's Banner
- **THEN** a following normal attack's hit gains the increase

#### Scenario: Increase scales with her DEF

- **GIVEN** the banner stands and Yun Jin's DEF is buffed
- **WHEN** her normal attack strikes
- **THEN** the increase is 0.3216 of her buffed DEF

#### Scenario: Stacks run out

- **GIVEN** the banner stands with 30 stacks
- **WHEN** her normal attacks have damaged 30 enemies
- **THEN** no increase applies

#### Scenario: Banner ends twelve seconds after its hit

- **WHEN** 12 seconds pass from the burst's hit
- **THEN** no increase applies

#### Scenario: Charged attack and skill get none

- **GIVEN** the banner stands
- **WHEN** Yun Jin's charged attack or Opening Flourish strikes
- **THEN** no increase applies

### Requirement: Party increase, Ascension 4 and Constellations 1, 2 and 6 not built

The banner's DMG Increase on each party member's normal attacks, Yun Jin's Ascension 4 passive and her Constellations 1, 2 and 6 SHALL have no effect yet.

#### Scenario: Party attacks under the banner

- **GIVEN** the banner stands
- **WHEN** a party member strikes with a normal attack
- **THEN** no DMG Increase from the banner applies
