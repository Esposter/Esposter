## Purpose

Charlotte's kit as built, with her three strikes, charged attack and Spiritbreath Thorn, plunges, Framing's press and its Snappy Silhouette marks, and Still Photo's cast heal and Kamera, with her hold and passives not built.

## Requirements

### Requirement: Basic attacks and Spiritbreath Thorn

Charlotte's normal attacks SHALL be three Cryo strikes, a charged attack, a collision attack and two plunging attacks, and her charged attack SHALL set off Spiritbreath Thorn.

#### Scenario: Strike chain plays three strikes in order

- **GIVEN** Charlotte is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her three Cryo strikes play in order and each deals its own hit

#### Scenario: Charged attack sets off Spiritbreath Thorn

- **GIVEN** Charlotte is the character on the field
- **WHEN** the player performs her charged attack
- **THEN** Spiritbreath Thorn strikes 30 frames after the charged attack's hit, in a circle of radius 2.5 metres round the target's position at that moment

#### Scenario: Spiritbreath Thorn goes on cooldown when it strikes

- **GIVEN** Spiritbreath Thorn has just struck
- **WHEN** the player performs her charged attack again within 6 seconds
- **THEN** Spiritbreath Thorn does not strike again until the 6 seconds have passed

### Requirement: Framing press marks enemies

Framing's press SHALL strike a Cryo box 4 metres wide and 8 metres long from Charlotte's body, and each enemy it strikes SHALL be marked with Snappy Silhouette for 6.8 seconds.

#### Scenario: Pressing Framing marks the enemies it strikes

- **GIVEN** Charlotte is the character on the field and Framing is ready
- **WHEN** the player presses Framing and its box strikes an enemy
- **THEN** that enemy is marked with Snappy Silhouette for 6.8 seconds

#### Scenario: A marked enemy takes a Cryo hit every 1.5 seconds

- **GIVEN** an enemy is marked with Snappy Silhouette
- **WHEN** 1.5 seconds pass
- **THEN** the mark deals a single-target Cryo hit to that enemy

#### Scenario: A press marks no more than five enemies

- **GIVEN** Framing strikes more than five enemies
- **WHEN** the press resolves
- **THEN** only five of the struck enemies are marked

### Requirement: Still Photo heals the party and Kamera heals the character on the field

Still Photo SHALL heal every party member by a flat amount and a share of Charlotte's ATK when cast, and Kamera SHALL heal the character on the field on each of its eight ticks while that character stands within 7 metres of the cast point.

#### Scenario: Casting Still Photo heals the whole party

- **GIVEN** Charlotte is the character on the field
- **WHEN** the player casts Still Photo
- **THEN** every party member is healed by a flat amount plus a share of Charlotte's ATK
- **AND** a circle of radius 6 metres strikes 4.5 metres ahead of her body at 53 frames

#### Scenario: Kamera heals the character standing near the cast point

- **GIVEN** Kamera is standing from a Still Photo cast
- **WHEN** one of its eight ticks lands and the character on the field stands within 7 metres of the cast point
- **THEN** that character is healed by a flat amount plus a share of Charlotte's ATK

#### Scenario: Kamera does not heal a character outside its reach

- **GIVEN** Kamera is standing from a Still Photo cast
- **WHEN** one of its ticks lands and the character on the field stands farther than 7 metres from the cast point
- **THEN** that character is not healed by that tick

### Requirement: Ascension 4 adds Healing Bonus and Cryo DMG Bonus by region

From Ascension 4 Charlotte SHALL gain 5% Healing Bonus for each other member of the deployed team from Fontaine, and 5% Cryo DMG Bonus for each other member from outside Fontaine.

#### Scenario: Ascension 4 counts each other member by region

- **GIVEN** Charlotte is at Ascension 4 with a Fontaine member and a Mondstadt member in the deployed team
- **WHEN** her hits are priced
- **THEN** her Healing Bonus is 5% higher and her Cryo DMG Bonus is 5% higher

#### Scenario: Ascension 4 is not reached below Ascension 4

- **GIVEN** Charlotte is at Ascension 3 with a Fontaine member in the deployed team
- **WHEN** her hits are priced
- **THEN** her Healing Bonus is not raised

### Requirement: Provisional timings and values

Charlotte's strikes, charged attack and plunges SHALL keep their damage and poise provisional until a recording of the game settles them.

#### Scenario: Strikes deal no poise until a recording settles them

- **GIVEN** Charlotte's strikes, charged attack or plunges are used
- **WHEN** the hit lands on an enemy
- **THEN** the hit deals no poise
- **AND** the values stay provisional until a recording settles them
