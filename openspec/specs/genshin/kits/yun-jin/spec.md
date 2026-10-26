## Purpose

Yun Jin's kit as built, with Opening Flourish's tap and its two charge levels, each with a shield of a share of her Max HP and a flat share, Cliffbreaker's Banner's initial hit, its DMG Increase on her normal attacks with Ascension 4's share, her Ascension 1 counter window, Constellations 1, 2 and 4, and what is left to build.

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

### Requirement: Cliffbreaker's Banner's DMG Increase on normal attacks

While Cliffbreaker's Banner stands, each hit of a deployed member's normal attack SHALL deal flat base damage equal to 0.3216 of Yun Jin's DEF plus Ascension 4's share of it, and each enemy a normal attack of any member damages SHALL spend one of the banner's 30 stacks. The banner SHALL stand for 12 seconds from its hit.

#### Scenario: Burst sets the banner

- **WHEN** the player casts Cliffbreaker's Banner
- **THEN** a following normal attack's hit gains the increase

#### Scenario: Increase scales with her DEF

- **GIVEN** the banner stands and Yun Jin's DEF is buffed
- **WHEN** her normal attack strikes
- **THEN** the increase is 0.3216 of her buffed DEF

#### Scenario: A teammate's normal attack gets the increase

- **GIVEN** the banner stands
- **WHEN** a teammate strikes with a normal attack
- **THEN** the increase is 0.3216 of Yun Jin's DEF

#### Scenario: Stacks run out

- **GIVEN** the banner stands with 30 stacks
- **WHEN** the normal attacks of the team have damaged 30 enemies
- **THEN** no increase applies

#### Scenario: Banner ends twelve seconds after its hit

- **WHEN** 12 seconds pass from the burst's hit
- **THEN** no increase applies

#### Scenario: Charged attack and skill get none

- **GIVEN** the banner stands
- **WHEN** Yun Jin's charged attack or Opening Flourish strikes
- **THEN** no increase applies

### Requirement: Ascension 4 adds the team's Elemental Types' share

From Ascension 4, the banner's increase SHALL add a share of Yun Jin's DEF by the number of distinct Elemental Types on the deployed team: 2.5% for one, 5% for two, 7.5% for three and 11.5% for four.

#### Scenario: Four Elemental Types on the team

- **GIVEN** Yun Jin has Ascension 4, the banner stands and the deployed team holds four Elemental Types
- **WHEN** her normal attack strikes
- **THEN** the increase is 0.3216 plus 0.115 of her DEF

#### Scenario: One Elemental Type on the team

- **GIVEN** Yun Jin has Ascension 4, the banner stands and the deployed team holds one Elemental Type
- **WHEN** her normal attack strikes
- **THEN** the increase is 0.3216 plus 0.025 of her DEF

#### Scenario: Below Ascension 4 adds nothing

- **GIVEN** Yun Jin has Ascension 3 and the banner stands
- **WHEN** her normal attack strikes
- **THEN** the increase is 0.3216 of her DEF

### Requirement: Constellation 1 cuts Opening Flourish's cooldown

From Constellation 1, Opening Flourish's cooldown SHALL be 82% of its base.

#### Scenario: Constellation 1 shortens the cooldown

- **GIVEN** Yun Jin has Constellation 1
- **WHEN** the player presses Opening Flourish
- **THEN** its cooldown is 7.38 seconds

#### Scenario: Constellation 0 keeps the cooldown

- **GIVEN** Yun Jin has no constellation
- **WHEN** the player presses Opening Flourish
- **THEN** its cooldown is 9 seconds

### Requirement: Constellation 2 raises the party's Normal Attack DMG

From Constellation 2, once Cliffbreaker's Banner is unleashed, every deployed member's normal attacks SHALL deal 15% more DMG for 12 seconds.

#### Scenario: Constellation 2 raises a teammate's normal attack

- **GIVEN** Yun Jin has Constellation 2 and the banner is unleashed
- **WHEN** a teammate's normal attack strikes
- **THEN** its Normal Attack DMG Bonus includes 15% from the banner

#### Scenario: Constellation 2 ends 12 seconds after the unleash

- **GIVEN** Yun Jin has Constellation 2 and the banner was unleashed 12 seconds ago
- **WHEN** a teammate's normal attack strikes
- **THEN** no Constellation 2 bonus applies

### Requirement: Constellation 6 not built

Yun Jin's Constellation 6 SHALL give no effect yet.

#### Scenario: Constellation 6 changes nothing

- **GIVEN** Yun Jin has Constellation 6 and the banner stands
- **WHEN** a deployed member's normal attack speed is read
- **THEN** no Constellation 6 bonus applies
