## Purpose

Bennett's kit as built: his strikes, charged attack and plunges, Passion Overload's press and Charge Levels, and Fantastic Voyage's field with its heal, ATK bonus, constellations 1 and 6 and his Ascension 1 and 4 cooldown cuts, with his self infusion left unbuilt.

## Requirements

### Requirement: Basic attacks

Bennett's normal attacks SHALL be five strikes, a charged attack, a collision attack and two plunging attacks.

#### Scenario: Strike chain plays five strikes in order

- **GIVEN** Bennett is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** his five strikes play in order and each deals its own hit

#### Scenario: Plunge hits the area around its landing point

- **WHEN** the player plunges from the air
- **THEN** the plunge hits the enemies inside its area around his landing point

### Requirement: Passion Overload press and Charge Levels

Passion Overload SHALL strike when pressed and SHALL reach Charge Level 1 or Charge Level 2 when held for longer, with the hold's thresholds provisional until a recording settles them.

#### Scenario: Pressing Passion Overload strikes once

- **GIVEN** Bennett is the character on the field and the skill is ready
- **WHEN** the player presses Passion Overload
- **THEN** the skill's strike lands on the enemies in its area

#### Scenario: Holding Passion Overload reaches Charge Level 2

- **GIVEN** Bennett is the character on the field and the skill is ready
- **WHEN** the player holds Passion Overload for about 1 second
- **THEN** the skill reaches Charge Level 2 and its hits and explosion land

#### Scenario: Using Passion Overload during its cooldown is refused

- **GIVEN** Passion Overload was used less than its cooldown ago
- **WHEN** the player presses Passion Overload again
- **THEN** the skill does not activate

### Requirement: Fantastic Voyage field heals and buffs the character inside it

Fantastic Voyage SHALL heal the character standing inside its circle and give that character an ATK bonus while she is under 70% of her HP.

#### Scenario: The character inside the field is healed and buffed

- **GIVEN** Fantastic Voyage is deployed and a character under 70% of her HP stands inside its circle
- **WHEN** the field ticks
- **THEN** that character is healed
- **AND** that character gains the field's ATK bonus

#### Scenario: A character outside the field gets nothing

- **GIVEN** Fantastic Voyage is deployed
- **WHEN** the field ticks and a character stands outside its circle
- **THEN** that character is neither healed nor buffed

#### Scenario: Grand Expectation widens the ATK bonus at constellation 1

- **GIVEN** Bennett is at constellation 1 and Fantastic Voyage is deployed
- **WHEN** the field ticks and the character inside its circle has any HP above zero
- **THEN** that character gains the ATK bonus with 20% of Bennett's base ATK added to it

### Requirement: Constellation 6 infuses and buffs the character on the field

At constellation 6, each tick of Fantastic Voyage SHALL give the character on the field a 15% Pyro DMG Bonus and a Pyro infusion for 2.1 seconds.

#### Scenario: A sword, claymore or polearm wielder gets Pyro on its weapon

- **GIVEN** Bennett is at constellation 6 and the character on the field wields a sword, claymore or polearm
- **WHEN** the field ticks
- **THEN** that character gains a 15% Pyro DMG Bonus
- **AND** that character's weapon is infused with Pyro for 2.1 seconds

#### Scenario: A wielder of another weapon gets only the damage bonus

- **GIVEN** Bennett is at constellation 6 and the character on the field wields a weapon other than a sword, claymore or polearm
- **WHEN** the field ticks
- **THEN** that character gains a 15% Pyro DMG Bonus
- **AND** no weapon infusion is applied

#### Scenario: The field infuses nobody below constellation 6

- **GIVEN** Bennett is below constellation 6
- **WHEN** the field ticks
- **THEN** no character is infused by the field

### Requirement: Ascension 4 shortens the Level 2 hold inside the field

At Ascension 4, Passion Overload's Level 2 hold inside Fantastic Voyage's field SHALL play a shorter animation with the same two hits and explosion.

#### Scenario: Level 2 hold inside the field plays the shorter animation

- **GIVEN** Bennett is at Ascension 4 and Fantastic Voyage is deployed
- **WHEN** the player holds Passion Overload to Charge Level 2 inside the field
- **THEN** the hold's animation plays shorter than outside the field
- **AND** both hits and the explosion still land before it ends

### Requirement: Ascension 1 and Ascension 4 cut cooldowns

Ascension 1 and Ascension 4 SHALL each shorten Bennett's skill cooldowns.

#### Scenario: A cooldown is shorter once the ascension is reached

- **GIVEN** Bennett has reached Ascension 1 or Ascension 4
- **WHEN** a cooldown starts after one of his skills is used
- **THEN** the cooldown is shorter than it is below that ascension
