## Purpose

Layla's kit as built, with her strikes, charged attack, plunges, Nights of Formal Focus's hit and shield, and Starlight Slug's field, and what is left of her Night Stars and passives.

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

### Requirement: Night Stars and passives not yet built

Layla's Night Stars and her Ascension and constellation passives SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Layla has Night Stars or a passive unlocked
- **WHEN** the player fights with Layla
- **THEN** that effect has no effect
