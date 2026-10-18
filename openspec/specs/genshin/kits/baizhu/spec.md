## Purpose

Baizhu's kit as built, with his strikes, charged attack, plunges, Universal Diagnosis's first hit, and Holistic Revivification's seamless shield with its Spiritvein explosions, with Five Fortunes Forever's Dendro DMG Bonus from Ascension 1, and what is left of his bounces, heals and passives.

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

### Requirement: Baizhu's Dendro hits deal more DMG while the field is healthy from Ascension 1

From Ascension 1, each Dendro hit of Baizhu's SHALL deal 25% more DMG while the character on the field is at half their HP or more.

#### Scenario: A healthy character on the field raises his Dendro DMG

- **GIVEN** Baizhu has reached Ascension 1 and the character on the field is at half their HP or more
- **WHEN** a Dendro hit of his strikes
- **THEN** it takes a 25% DMG Bonus

#### Scenario: A hurt character on the field gives nothing

- **GIVEN** Baizhu has reached Ascension 1 and the character on the field is below half their HP
- **WHEN** a Dendro hit of his strikes
- **THEN** it takes no bonus from Five Fortunes Forever

### Requirement: Constellation 2 queues a Gossamer Sprite: Splice on each enemy his active member hits

From Constellation 2, each enemy the active member hits SHALL be struck by a Gossamer Sprite: Splice from Baizhu: a Dendro hit of 250% of his ATK, dealt as Elemental Skill DMG, at most once every five seconds. Its heal is not built.

#### Scenario: an active constellation's switch queues a Splice on an enemy his active member hits

- **GIVEN** Baizhu has Constellation 2
- **WHEN** his active member hits an enemy
- **THEN** a Splice is queued on that enemy

#### Scenario: an inactive constellation changes nothing

- **GIVEN** Baizhu has Constellation 1
- **WHEN** his active member hits an enemy
- **THEN** no Splice is queued

#### Scenario: a hit Baizhu lands himself while he is on the field also queues a Splice

- **GIVEN** Baizhu has Constellation 2 and is on the field
- **WHEN** he hits an enemy
- **THEN** a Splice is queued on that enemy

#### Scenario: the Splice fires once every five seconds

- **GIVEN** a Splice was queued less than five seconds ago
- **WHEN** his active member hits an enemy
- **THEN** no Splice is queued, and one is queued once five seconds have passed
