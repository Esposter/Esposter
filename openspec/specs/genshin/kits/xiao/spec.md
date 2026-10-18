## Purpose

Xiao's kit as built, with the Lemniscatic Wind Cycling dash, Bane of All Evil's converted attacks and drain, and Heaven Fall's stacks, Constellation 1's extra charge, and what is left of his third charge, jump and the other constellations.

## Requirements

### Requirement: Normal attack string

Xiao's normal attack SHALL be six strikes, the first and fourth of two hits each, followed by a charged attack, a collision and two plunges.

#### Scenario: Normal attack lands six strikes

- **WHEN** the player strikes with Xiao's normal attack
- **THEN** six strikes land in order, the first and fourth each landing two hits

#### Scenario: Charged attack sweeps a fan

- **WHEN** the player uses Xiao's charged attack
- **THEN** it strikes the enemies in a fan of 200 degrees and three metres round him
- **AND** its 25 stamina is spent as it starts

### Requirement: Lemniscatic Wind Cycling dash

Xiao's skill SHALL dash him forward as an Anemo hit on the enemies within 5 metres of him, provisionally, and hold two charges.

#### Scenario: Skill dash hits nearby enemies

- **WHEN** the player uses Xiao's skill
- **THEN** the dash deals Anemo damage to the enemies within 5 metres of him

#### Scenario: Skill with both charges spent

- **WHEN** the player uses Xiao's skill while both of its charges are spent
- **THEN** no dash is cast

### Requirement: Bane of All Evil converts attacks

While Bane of All Evil stands, Xiao's normal, charged and plunging attacks SHALL deal Anemo damage, and each converted hit SHALL carry the burst's 58.45% DMG Bonus.

#### Scenario: Converted attack carries the burst bonus

- **GIVEN** Bane of All Evil stands
- **WHEN** Xiao strikes with a normal attack
- **THEN** the strike deals Anemo damage with the burst's 58.45% DMG Bonus

#### Scenario: Dash carries no burst bonus

- **GIVEN** Bane of All Evil stands
- **WHEN** Xiao dashes
- **THEN** the dash does not carry the burst's DMG Bonus

### Requirement: Bane of All Evil drain and end

While Bane of All Evil stands with Xiao on the field, his current HP SHALL drain by 3% every second, and the drain SHALL never down him.

#### Scenario: Drain ticks through the burst

- **GIVEN** Xiao stays on the field during Bane of All Evil
- **WHEN** each second of the burst passes
- **THEN** 3% of his current HP drains, fourteen times, the last a second before the burst ends

#### Scenario: Drain at low HP

- **WHEN** a drain tick lands on Xiao at any amount of HP
- **THEN** the tick does not down him

#### Scenario: Swap ends the burst

- **GIVEN** Bane of All Evil stands
- **WHEN** another character takes the field
- **THEN** the infusion, its drain and the Tamer of Demons bonus end

### Requirement: Tamer of Demons bonus

From Ascension 1, Bane of All Evil SHALL raise Xiao's Anemo DMG Bonus by 5% when cast and by a further 5% every 3 seconds, reaching 25% at 12 seconds.

#### Scenario: Bonus starts at 5 percent

- **GIVEN** Xiao is at Ascension 1
- **WHEN** he casts Bane of All Evil
- **THEN** his Anemo DMG Bonus starts at 5%

#### Scenario: Bonus reaches its cap

- **GIVEN** Xiao is at Ascension 1
- **WHEN** 12 seconds of Bane of All Evil pass
- **THEN** his Anemo DMG Bonus has reached 25%

#### Scenario: Below Ascension 1

- **GIVEN** Xiao is below Ascension 1
- **WHEN** he casts Bane of All Evil
- **THEN** no Tamer of Demons bonus applies

### Requirement: Heaven Fall stacks

From Ascension 4, each dash SHALL add a stack that lasts 7 seconds, and each stack standing SHALL raise the dash by 15%, up to three stacks.

#### Scenario: Stack raises a dash

- **GIVEN** Xiao is at Ascension 4 and one stack stands
- **WHEN** he dashes
- **THEN** the dash deals 15% more damage

#### Scenario: Stacks cap at three

- **GIVEN** Xiao is at Ascension 4 and three stacks stand
- **WHEN** he dashes again
- **THEN** the bonus stays at 45%

#### Scenario: Stack runs out

- **GIVEN** a stack has stood for 7 seconds
- **WHEN** the next dash lands
- **THEN** the expired stack adds nothing to it

### Requirement: Constellation 1 charge

From Constellation 1, Lemniscatic Wind Cycling SHALL have one more charge than its base.

#### Scenario: Constellation 1 adds a charge

- **GIVEN** Xiao has Constellation 1
- **WHEN** his skill's charges are read
- **THEN** it has one more charge than the base

#### Scenario: Constellation 0 adds nothing

- **GIVEN** Xiao has no constellation
- **WHEN** his skill's charges are read
- **THEN** no charge is added

### Requirement: Unbuilt effects

Xiao's third skill charge, his jump, his Constellations 2 through 6 and his dash particles SHALL have no effect in the world yet.

#### Scenario: Constellations have no effect

- **WHEN** Xiao holds Constellation 2 through 6
- **THEN** no effect of those constellations is applied in the fight
