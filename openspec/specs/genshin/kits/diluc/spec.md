## Purpose

Diluc's kit as built: his strikes, charged attack, collision and plunges, Searing Onslaught's three presses and Dawn with its infusion, phoenix and A4, with his A1 and phase-0 passive left unbuilt.

## Requirements

### Requirement: Basic attacks

Diluc's normal attacks SHALL be four strikes, a charged attack, a collision attack and two plunging attacks.

#### Scenario: Strike chain plays four strikes in order

- **GIVEN** Diluc is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** his four strikes play in order

### Requirement: Provisional charged attack

Diluc's charged attack SHALL be provisional, its slashes timed at half a second and one second within an attack lasting one and a fifth seconds, until a recording of the game settles them.

#### Scenario: Charged attack timings stay estimates

- **GIVEN** Diluc charges his attack
- **WHEN** the charged attack plays
- **THEN** the slashes land at half a second and one second
- **AND** the attack ends at one and a fifth seconds, and these values stay provisional until a recording settles them

### Requirement: Searing Onslaught chain

Searing Onslaught SHALL chain up to three presses, each pressed within four seconds of the one before, and its ten-second cooldown SHALL start on the first press.

#### Scenario: A follow-up press plays inside the window

- **GIVEN** Searing Onslaught was pressed less than four seconds ago
- **WHEN** the player presses it again
- **THEN** its next press plays even while the cooldown runs

#### Scenario: A press after the chain lapses waits out the cooldown

- **GIVEN** the chain has lapsed and the first press was less than ten seconds ago
- **WHEN** the player presses Searing Onslaught
- **THEN** it does not cast

### Requirement: Dawn phoenix

Dawn's phoenix SHALL launch from the slash, strike eight ticks at intervals of a fifth of a second, and explode 1.7 seconds after its launch.

#### Scenario: The phoenix strikes eight ticks and then explodes

- **GIVEN** Dawn's slash has launched the phoenix
- **WHEN** the phoenix runs its course
- **THEN** it strikes eight ticks, one every fifth of a second
- **AND** it explodes 1.7 seconds after its launch

### Requirement: Dawn stamina drain

While Dawn plays, stamina SHALL drain at 40 a second, 48 in all over its 1.2 seconds.

#### Scenario: Dawn drains stamina as it plays

- **GIVEN** Diluc has stamina
- **WHEN** Dawn plays
- **THEN** stamina drains at 40 a second until the slash ends

### Requirement: Poise from the skill, burst and collision

Searing Onslaught SHALL deal 120 poise, Dawn SHALL deal 100 poise, and Diluc's collision attack SHALL deal 35 poise.

#### Scenario: Searing Onslaught deals 120 poise

- **GIVEN** Diluc is the character on the field
- **WHEN** Searing Onslaught hits an enemy
- **THEN** the enemy takes 120 poise damage

#### Scenario: The collision attack deals 35 poise

- **GIVEN** Diluc is the character on the field
- **WHEN** his collision attack hits an enemy
- **THEN** the enemy takes 35 poise damage

### Requirement: Dawn infusion

Dawn SHALL infuse Diluc's attacks for as long as it lasts.

#### Scenario: Diluc's attacks are infused while Dawn lasts

- **GIVEN** Diluc casts Dawn
- **WHEN** Diluc attacks while Dawn lasts
- **THEN** his attacks are infused

### Requirement: First constellation adds 15% DMG to enemies above half HP

From constellation 1, each strike Diluc makes SHALL deal 15% more DMG to an enemy whose HP is above half.

#### Scenario: A strike on an enemy above half HP gains the bonus

- **GIVEN** Diluc is at constellation 1
- **WHEN** a strike hits an enemy whose HP is above half
- **THEN** the strike's DMG bonus is raised by 15%

#### Scenario: Below the first constellation a strike gains nothing

- **GIVEN** Diluc is at constellation 0
- **WHEN** a strike hits an enemy whose HP is above half
- **THEN** the strike's DMG bonus is unchanged
