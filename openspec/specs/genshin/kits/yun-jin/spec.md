## Purpose

Yun Jin's kit as built, with Opening Flourish's tap and its two charge levels, each with a shield of a share of her Max HP and a flat share, and Cliffbreaker's Banner's initial hit, and what is left to build.

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

### Requirement: Banner's increase and passives not built

The banner's DMG Increase on the party's normal attacks, Yun Jin's passives and her constellations SHALL have no effect yet.

#### Scenario: Party attacks under the banner

- **GIVEN** the banner stands
- **WHEN** a party member strikes with a normal attack
- **THEN** no DMG Increase from the banner applies
