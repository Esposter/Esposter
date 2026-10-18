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

### Requirement: A Polestar Field on a Stellar-Conduct

A Stellar-Conduct triggered by any party member SHALL leave a Polestar Field of radius 15 at the body, for 7 seconds, and a standing field SHALL be refreshed rather than doubled. The reaction path places it for any enabler's Stellar-Conduct, so no kit carries a copy of it. While it stands, an enemy inside it has its Physical RES lowered by 40%. A Cryo or Electro applied to an enemy inside it is a recorded hit, and each 4 seconds the body standing inside has its Cryo and Electro DMG Bonus set to 20%, or to 28% and 1% for each recorded hit (up to 12) of the last 4 seconds.

#### Scenario: Stellar-Conduct places a Polestar Field

- **WHEN** a Stellar-Conduct is triggered and no Polestar Field stands
- **THEN** a Polestar Field stands at the body for 7 seconds

#### Scenario: Stellar-Conduct refreshes a standing field

- **WHEN** a Stellar-Conduct is triggered while a Polestar Field stands
- **THEN** the field's time is set back to 7 seconds, and no second field stands

#### Scenario: an enemy inside a standing field loses 40% Physical RES

- **WHEN** a Polestar Field stands and an enemy is inside it
- **THEN** the enemy's Physical RES is 40% lower, and an enemy outside the field is unchanged

#### Scenario: a recorded hit raises the next 4 seconds' DMG Bonus

- **WHEN** a Cryo is applied to an enemy inside a Polestar Field, and the field's next tick passes with the body inside it
- **THEN** the body's Cryo and Electro DMG Bonus is 29% for the 4 seconds that follow

#### Scenario: an application outside the field, or of another element, is not recorded

- **WHEN** a Cryo is applied to an enemy outside the field, or a Pyro is applied to an enemy inside it, and a tick passes with the body inside
- **THEN** the body's Cryo and Electro DMG Bonus stays at 20% for the 4 seconds that follow

### Requirement: A Stellar Vortex on a Stellar Swirl

While Odette is deployed, a Stellar Swirl triggered by any party member SHALL leave one Stellar Vortex, for 181 frames, and a standing vortex SHALL NOT be doubled.

#### Scenario: Stellar Swirl places a Stellar Vortex

- **WHEN** a Stellar Swirl is triggered while Odette is deployed and no Stellar Vortex stands
- **THEN** a Stellar Vortex stands for 181 frames

#### Scenario: Other reactions place nothing

- **WHEN** a Melt, or a Swirl of another element, is triggered while Odette is deployed
- **THEN** no Polestar Field and no Stellar Vortex is placed

### Requirement: A Stellar Jubilee enables both Stellar reactions

While Odette is deployed, her Stellar Jubilee passive SHALL enable Stellar-Conduct and Stellar Swirl for her party, each once however many passives enable it.

#### Scenario: a Stellar Jubilee passive enables both reactions for its party

- **WHEN** Odette is deployed
- **THEN** a Superconduct becomes a Stellar-Conduct and a Cryo Swirl becomes a Stellar Swirl for the party

### Requirement: Recast, Dance Double and Stellar Glimmer not built

Odette's skill recast, her Dance Double and her burst's extra Stellar Glimmer damage SHALL NOT take effect.

#### Scenario: Skill summons no Dance Double

- **WHEN** the player presses Odette's elemental skill
- **THEN** no Dance Double is summoned, and no hit beyond the press lands
