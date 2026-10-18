## Purpose

Layla's kit as built, with her strikes, charged attack, plunges, Nights of Formal Focus's hit and shield, and Starlight Slug's field, her Night Stars with the Shooting Stars they fire, Ascension 4 and Constellation 2, and what is left of her passives.

## Requirements

### Requirement: Layla's strikes and charged attack

Layla's three strikes SHALL land in order, and her charged attack SHALL land two slashes, each hitting the enemies within reach.

#### Scenario: Three strikes in sequence

- **WHEN** the player uses normal attack three times in a row
- **THEN** the three strikes land in order on the enemies within reach

#### Scenario: Charged attack slashes

- **WHEN** the player uses the charged attack
- **THEN** both slashes land on the enemies within reach

### Requirement: Layla's plunge attacks

Layla's plunge attacks SHALL land a collision and two plunges at provisional timings on the enemies within reach.

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the collision and the plunge hits land on the enemies within reach

### Requirement: Nights of Formal Focus

Nights of Formal Focus SHALL deal a Cryo hit and SHALL set a shield on the team.

#### Scenario: Skill hits and shields the team

- **WHEN** the player casts Nights of Formal Focus
- **THEN** a Cryo hit lands on the enemies in reach
- **AND** the team gains a shield

### Requirement: Constellation 1 Curtain absorption

From Constellation 1, the Curtain of Slumber that Nights of Formal Focus sets SHALL absorb 20% more than its base.

#### Scenario: Constellation 1 raises the Curtain's absorption

- **GIVEN** Layla has Constellation 1
- **WHEN** she uses Nights of Formal Focus
- **THEN** its shield's health is 20% above the base

#### Scenario: Constellation 0 changes nothing

- **GIVEN** Layla has no constellations
- **WHEN** she uses Nights of Formal Focus
- **THEN** its shield's health is the base

### Requirement: Starlight Slug's field

Starlight Slug SHALL strike from Layla's place every 1.5 seconds for twelve seconds, reaching every enemy within 13.5 metres of her body.

#### Scenario: Field strikes on each tick

- **WHEN** the player casts Starlight Slug
- **THEN** the field strikes every 1.5 seconds for twelve seconds
- **AND** each tick reaches every enemy within 13.5 metres of Layla

### Requirement: Burst strike

Layla's burst SHALL deal a share of her Max HP as flat damage, which her talent multiplier does not scale.

#### Scenario: Burst deals flat damage

- **WHEN** the player casts Layla's burst
- **THEN** the strike deals damage equal to a share of Layla's Max HP

### Requirement: Night Stars fire Shooting Stars

Layla's shield SHALL build Night Stars, up to four, from its tick, her skill and her burst, and four Night Stars SHALL fire one Shooting Star each at the nearest living enemy within 10 metres, or when none is within 10 metres, at the one the search or the star before it aimed at.

#### Scenario: Four Night Stars fire four Shooting Stars

- **GIVEN** Layla has her shield up and four Night Stars
- **WHEN** an enemy is within 10 metres
- **THEN** four Shooting Stars fire, the first 0.6 seconds later and the rest 0.45 seconds apart, and the Night Stars reset to zero

#### Scenario: The shield's tick adds a Night Star

- **GIVEN** Layla's shield is up and she has fewer than four Night Stars
- **WHEN** 1.5 seconds pass
- **THEN** one more Night Star is built

#### Scenario: Night Stars clear when the shield runs out

- **GIVEN** Layla has Night Stars and no Shooting Star is firing
- **WHEN** her shield runs out
- **THEN** the Night Stars clear

### Requirement: Ascension 4 and Constellation 2

Ascension 4 SHALL add 1.5% of Layla's Max HP as flat damage to each Shooting Star, and Constellation 2 SHALL give her 1 Energy on each Shooting Star's first hit.

#### Scenario: Ascension 4 adds damage to a Shooting Star

- **GIVEN** Layla is at Ascension 4
- **WHEN** a Shooting Star hits
- **THEN** it deals 1.5% of her Max HP as additional flat damage

#### Scenario: Constellation 2 gives Energy on a Shooting Star's first hit

- **GIVEN** Layla has Constellation 2
- **WHEN** a Shooting Star hits an enemy twice
- **THEN** she gains 1 Energy once

### Requirement: Ascension 1, Constellations 4 and 6, and Constellation 1's team shields not yet built

Layla's Ascension 1, her Constellations 4 and 6, and Constellation 1's team shields SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Layla has Ascension 1, Constellation 4 or Constellation 6 unlocked
- **WHEN** the player fights with Layla
- **THEN** that effect has no effect
