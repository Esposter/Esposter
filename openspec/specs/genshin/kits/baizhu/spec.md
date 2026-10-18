## Purpose

Baizhu's kit as built, with his strikes, charged attack, plunges, Universal Diagnosis's first hit, and Holistic Revivification's seamless shield with its Spiritvein explosions, and what is left of his bounces, heals and passives.

## Requirements

### Requirement: Baizhu's plunges land on Bennett's plunge timings

Baizhu's collision, low plunge and high plunge SHALL land on the timings and poise of Bennett's plunges, with his own multipliers.

#### Scenario: The plunges land on Bennett's timings

- **GIVEN** Baizhu performs a plunge attack
- **WHEN** the plunge lands
- **THEN** its damage is dealt on the timing Bennett's plunge uses

### Requirement: Universal Diagnosis strikes once on its first hit

Universal Diagnosis SHALL strike its first target once on its first hit.

#### Scenario: The first hit strikes its target

- **GIVEN** Baizhu uses Universal Diagnosis
- **WHEN** its first hit lands
- **THEN** its target takes one strike

### Requirement: Holistic Revivification's shield absorbs damage up to its amount

Holistic Revivification SHALL create a shield that absorbs damage up to a share of Baizhu's Max HP plus a flat amount, and the shield SHALL end at its first expiry.

#### Scenario: The shield absorbs damage up to its amount

- **GIVEN** Baizhu's shield is up
- **WHEN** damage is taken
- **THEN** the shield absorbs damage up to its amount

#### Scenario: The shield ends at its first expiry

- **GIVEN** Baizhu's shield is up
- **WHEN** its first expiry is reached
- **THEN** the shield ends

### Requirement: Each recast of the shield explodes the shield it replaces as Spiritvein

Each of the five recasts of Holistic Revivification, every 146 frames from 223 frames, SHALL explode the shield it replaces as Spiritvein, which strikes enemies in the skill's reach at its ATK multiple.

#### Scenario: A recast explodes the previous shield

- **GIVEN** Baizhu's shield is up
- **WHEN** Holistic Revivification is recast
- **THEN** the replaced shield explodes as Spiritvein
- **AND** the explosion strikes enemies within the skill's reach

#### Scenario: Recasts stop after the fifth

- **GIVEN** Holistic Revivification has been recast five times
- **WHEN** the next recast time passes
- **THEN** no further recast occurs
