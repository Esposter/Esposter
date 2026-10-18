## Purpose

Iansan's kit as built, with her three strikes, charged attack, provisional plunges, the skill's activation hit and the burst's hit, and what is left waiting on the Nightsoul state and the party ATK buff.

## Requirements

### Requirement: Three strikes land on their own hits

Iansan's three strikes SHALL each land on their own hit: a fan ahead of her, a circle ahead of her and a box round her.

#### Scenario: Strike chain lands its three hits

- **GIVEN** Iansan is the character on the field
- **WHEN** the player presses the attack button through her three strikes
- **THEN** the first lands 14 frames into a 27-frame animation
- **AND** the second lands 7 frames into a 31-frame animation
- **AND** the third lands 22 frames into a 55-frame animation

### Requirement: Charged attack strikes a small circle

Iansan's charged attack SHALL strike a small circle on the primary target and SHALL cost 25 stamina.

#### Scenario: Charged attack strikes and spends stamina

- **GIVEN** Iansan has at least 25 stamina
- **WHEN** the player holds the attack button to charge
- **THEN** the circle strikes the primary target 21 frames into the 55-frame animation
- **AND** 25 stamina is spent

### Requirement: Provisional plunges

Iansan's plunges SHALL use the standard borrowed plunge and stay provisional until a recording of them settles it.

#### Scenario: A recording settles the plunges

- **GIVEN** a recording of Iansan's plunges exists
- **WHEN** its timings are compared with the kit's
- **THEN** the plunges stay provisional until the comparison settles them

### Requirement: Skill's activation hit

Iansan's skill SHALL deal an Electro activation hit on the primary target and SHALL cool for 16 seconds.

#### Scenario: Pressing the skill strikes the activation hit

- **GIVEN** Iansan is the character on the field and the skill is off cooldown
- **WHEN** the player presses the skill
- **THEN** the activation hit lands on the primary target 9 frames into a 137-frame animation
- **AND** it applies 1 unit of Electro gauge
- **AND** the skill cools for 16 seconds

#### Scenario: The skill cannot be pressed during its cooldown

- **GIVEN** the skill is cooling down
- **WHEN** the player presses the skill again
- **THEN** nothing happens

### Requirement: Burst's hit

Iansan's burst SHALL deal an Electro hit in a circle of 5 metres round her body, and SHALL cool for 18 seconds at 70 energy.

#### Scenario: Casting the burst strikes its circle

- **GIVEN** Iansan has 70 energy
- **WHEN** the player casts the burst
- **THEN** the hit lands 38 frames into the 45-frame animation
- **AND** it applies 1 unit of Electro gauge
- **AND** 70 energy is spent
- **AND** the burst cools for 18 seconds

#### Scenario: The burst cannot be cast during its cooldown

- **GIVEN** the burst is cooling down
- **WHEN** the player casts the burst again
- **THEN** nothing happens
