## Purpose

Odette's kit as built: her five strikes, charged attack, plunges, Adagio's press and Presto's four hits, with the timings and hitmarks provisional, and the Polestar Field and the Stellar Vortex placed for the combat's Stellar reactions. Her skill's recast, her Dance Double and her burst's Stellar Glimmer damage are not built.

## Requirements

### Requirement: Odette's strikes, charged attack and plunges

Odette's five strikes, charged attack and plunges SHALL land on provisional timings on the enemies within reach.

#### Scenario: Five strikes in sequence

- **WHEN** the player uses normal attack five times in a row
- **THEN** the five strikes land in order on provisional timings

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the plunge lands on the enemies within reach at a provisional timing

### Requirement: Adagio's press

Odette's elemental skill SHALL deal its press hit on the enemies within reach.

#### Scenario: Skill deals one hit

- **WHEN** the player presses Odette's elemental skill
- **THEN** one Ice hit lands on the enemies within reach at a provisional timing

### Requirement: Presto's four hits

Odette's elemental burst SHALL deal its four hits on the enemies within reach.

#### Scenario: Burst deals four hits

- **WHEN** the player casts Odette's elemental burst
- **THEN** four hits land on the enemies within reach, the last one as Ice

### Requirement: A Polestar Field on a Superconduct

While Odette is deployed, a Superconduct triggered by any party member SHALL leave a Polestar Field of radius 15 at the body, for 6 seconds, and a standing field SHALL be refreshed rather than doubled.

#### Scenario: Superconduct places a Polestar Field

- **WHEN** a Superconduct is triggered while Odette is deployed and no Polestar Field stands
- **THEN** a Polestar Field stands at the body for 6 seconds

#### Scenario: Superconduct refreshes a standing field

- **WHEN** a Superconduct is triggered while a Polestar Field stands
- **THEN** the field's time is set back to 6 seconds, and no second field stands

### Requirement: A Stellar Vortex on a Cryo Swirl

While Odette is deployed, a Cryo Swirl triggered by any party member SHALL leave one Stellar Vortex, for 181 frames, and a standing vortex SHALL NOT be doubled.

#### Scenario: Cryo Swirl places a Stellar Vortex

- **WHEN** a Cryo Swirl is triggered while Odette is deployed and no Stellar Vortex stands
- **THEN** a Stellar Vortex stands for 181 frames

#### Scenario: Other reactions place nothing

- **WHEN** a Melt, or a Swirl of another element, is triggered while Odette is deployed
- **THEN** no Polestar Field and no Stellar Vortex is placed

### Requirement: Recast, Dance Double and Stellar Glimmer not built

Odette's skill recast, her Dance Double and her burst's extra Stellar Glimmer damage SHALL NOT take effect.

#### Scenario: Skill summons no Dance Double

- **WHEN** the player presses Odette's elemental skill
- **THEN** no Dance Double is summoned, and no hit beyond the press lands
