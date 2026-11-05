## ADDED Requirements

### Requirement: A landed hit shows a spark where it struck

A landed hit SHALL show a short spark at the point it struck, and a strike that misses SHALL show none.

#### Scenario: A landed hit shows a spark where it struck

- **GIVEN** a party member's strike lands on an enemy
- **WHEN** the hit lands at a point of the enemy
- **THEN** a spark shows at that point
- **AND** the spark fades within a moment

#### Scenario: A missed strike shows no spark

- **GIVEN** a party member's strike passes an enemy without landing
- **WHEN** the strike ends
- **THEN** no spark shows

### Requirement: A landed hit shows its damage as a number

A landed hit SHALL show the damage it dealt as a number that rises from the point it struck and fades.

#### Scenario: A landed hit shows its damage as a number

- **GIVEN** a strike lands on an enemy and deals damage
- **WHEN** the hit lands
- **THEN** a number equal to the damage the hit dealt shows at the struck point
- **AND** the number rises and then fades

### Requirement: A skill or burst cast shows its visual at the caster

A skill or burst cast SHALL show a visual at its caster when the cast starts, and a reaction SHALL flash at each enemy it strikes.

#### Scenario: A skill or burst cast shows its visual at the caster

- **GIVEN** a party member casts a skill or a burst
- **WHEN** the cast starts
- **THEN** a visual shows at the caster

#### Scenario: A reaction flashes at the enemy it strikes

- **GIVEN** an elemental reaction strikes an enemy
- **WHEN** the reaction is applied
- **THEN** a flash shows at that enemy

### Requirement: An enemy's energy drops fly to the party

A defeated enemy's energy drops SHALL show as drops that fly to the party member each one charges, and a drop SHALL leave the screen when it arrives.

#### Scenario: A defeated enemy's energy drops fly to the party

- **GIVEN** an enemy is defeated and leaves energy drops
- **WHEN** the drops appear
- **THEN** each drop flies to the party member it charges
- **AND** the drop leaves the screen when it arrives

### Requirement: A burst's landing shakes the camera

A burst's landing SHALL shake the camera, and the camera SHALL settle back to its place within a moment.

#### Scenario: A burst's landing shakes the camera and settles

- **GIVEN** a party member's burst lands
- **WHEN** the landing happens
- **THEN** the camera shakes
- **AND** the camera settles back to its place within a moment

### Requirement: An emitter plays its fitted rate and life

A world effect's particles SHALL be emitted at the rate and last the life its fitted record holds, and each particle SHALL fade out over its life.

#### Scenario: An emitter plays its fitted rate and life

- **GIVEN** a world effect with a fitted emitter is shown
- **WHEN** its particles are emitted
- **THEN** they are emitted at the fitted rate
- **AND** each particle fades out over the fitted life

### Requirement: An effect's surface draws with its ported shader

An effect's surface SHALL draw with the shader ported from the game's own listing for that effect, and not with a plain stand-in colour.

#### Scenario: An effect draws with its shader's port

- **GIVEN** an effect whose shader has been ported
- **WHEN** the effect is shown
- **THEN** its surface is drawn by the ported shader
