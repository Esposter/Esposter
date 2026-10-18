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

### Requirement: Nightsoul Blessing and Samplers not built

Xilonen's Nightsoul Blessing, its Blade Roller strikes and its Samplers SHALL have no effect in the world yet.

#### Scenario: Skill press starts no blessing

- **WHEN** the player presses Xilonen's skill
- **THEN** no Nightsoul Blessing starts and her normal strikes stay the same
