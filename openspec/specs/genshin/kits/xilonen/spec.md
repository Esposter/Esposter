## Purpose

Xilonen's kit as built: her three strikes, charged attack, collision and two plunges, and Yohual's Scratch's hit, and what is left of her Nightsoul Blessing, her Samplers and Ocelotlicue Point.

## Requirements

### Requirement: Normal attack and charged attack

Xilonen's normal attack SHALL be three strikes, the second of two hits, followed by a charged attack, a collision and two plunges.

#### Scenario: Normal attack lands three strikes

- **WHEN** the player strikes with Xilonen's normal attack
- **THEN** three strikes land in order, the second landing two hits

#### Scenario: Charged attack strikes its box

- **WHEN** the player uses Xilonen's charged attack
- **THEN** it strikes the enemies inside its box, placed 1.8 metres behind her

### Requirement: Yohual's Scratch

Xilonen's skill SHALL deal Yohual's Scratch's hit to the enemies in its circle a metre ahead of her, with damage that includes a share of her Defense.

#### Scenario: Skill hit lands

- **WHEN** the player presses Xilonen's skill
- **THEN** the hit lands six frames into its animation on the enemies in its circle

#### Scenario: Skill press during its cooldown

- **GIVEN** Xilonen pressed her skill less than seven seconds ago
- **WHEN** the player presses the skill again
- **THEN** no hit is dealt

### Requirement: Plunges

Xilonen's collision and her two plunges SHALL land with their own timings and reach, with damage that includes a share of her Defense.

#### Scenario: Low plunge lands

- **WHEN** Xilonen performs the low plunge
- **THEN** it lands 47 frames after it starts on the enemies within 3 metres

#### Scenario: High plunge lands

- **WHEN** Xilonen performs the high plunge
- **THEN** it lands 50 frames after it starts on the enemies within 5 metres

#### Scenario: Plunge after Yohual's Scratch

- **WHEN** Xilonen plunges directly after Yohual's Scratch
- **THEN** the standard plunge plays, since its skill-only variant is not built

### Requirement: Burst has no hit yet

Xilonen's burst SHALL be cast without a hit or a heal until Ocelotlicue Point is built.

#### Scenario: Burst cast

- **WHEN** the player casts Xilonen's burst
- **THEN** no damage or heal is dealt

### Requirement: Nightsoul Blessing from the skill's press

Xilonen's skill press SHALL enter the Nightsoul Blessing with 45 points, which drain five a second. The Blessing SHALL last nine seconds, and a sprint in it SHALL drain five points.

#### Scenario: The press enters the Blessing with 45 points, which drain five a second

- **GIVEN** Xilonen is out of the Blessing
- **WHEN** the player presses Yohual's Scratch and two seconds pass
- **THEN** the Blessing holds 35 points

#### Scenario: The Blessing lasts nine seconds

- **GIVEN** Xilonen entered the Blessing 8.5 seconds ago
- **WHEN** another 0.6 seconds pass
- **THEN** the Blessing has ended

#### Scenario: A press inside the Blessing leaves it

- **GIVEN** Xilonen is in the Blessing
- **WHEN** the player presses Yohual's Scratch
- **THEN** the Blessing ends

#### Scenario: A sprint in the Blessing drains five points

- **GIVEN** Xilonen has just entered the Blessing with 45 points
- **WHEN** she sprints
- **THEN** the Blessing holds 40 points

### Requirement: Blade Roller strikes and Samplers not built

Xilonen's Blade Roller strikes, her charged attack's restriction in the Blessing and her Samplers SHALL have no effect yet.

#### Scenario: Her strikes stay the same in the Blessing

- **GIVEN** Xilonen is in the Blessing
- **WHEN** the player presses her normal attack
- **THEN** her normal strikes stay the same
