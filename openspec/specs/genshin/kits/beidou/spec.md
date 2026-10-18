## Purpose

Beidou's kit as built: her strikes, charged attack and plunges, Tidecaller's press and shield, and Stormbreaker with the Thunderbeast's Targe and its discharges, with Tidecaller's hold, Constellations 1, 2 and 4 and her passives left unbuilt.

## Requirements

### Requirement: Basic attacks

Beidou's normal attacks SHALL be five strikes, a charged attack, a collision attack and two plunging attacks.

#### Scenario: Strike chain plays five strikes in order

- **GIVEN** Beidou is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her five strikes play in order and each deals its own hit

#### Scenario: Charged attack drains stamina as it plays

- **GIVEN** Beidou has stamina
- **WHEN** the player holds the attack button to charge
- **THEN** her charged attack plays its slashes
- **AND** stamina drains while the charged attack plays

#### Scenario: Plunge hits the area around its landing point

- **WHEN** the player plunges from the air
- **THEN** the plunge hits the enemies inside its area around her landing point

### Requirement: Provisional charged attack and plunge timings

Beidou's charged attack and plunge timings SHALL be treated as provisional until a recording of the game settles them.

#### Scenario: Timings are checked against a recording

- **GIVEN** a recording of Beidou's charged attack or plunge exists
- **WHEN** its timings are compared with the kit's
- **THEN** the kit's timings stay provisional until the comparison settles them

### Requirement: Tidecaller shield

Tidecaller SHALL press an Electro shield onto Beidou that stands until the skill's hit lands.

#### Scenario: Pressing Tidecaller raises the shield

- **GIVEN** Beidou is the character on the field
- **WHEN** the player presses Tidecaller
- **THEN** an Electro shield of 14.4% of her Max HP plus 1386 appears on her
- **AND** the shield stands until the skill's hit lands 23 frames later

#### Scenario: The shield ends when Tidecaller's hit lands

- **GIVEN** Tidecaller's shield stands on Beidou
- **WHEN** the skill's hit lands
- **THEN** the hit applies 2 units of Electro to the enemies it strikes
- **AND** the shield ends

#### Scenario: Holding Tidecaller plays it as a press

- **GIVEN** Beidou is the character on the field
- **WHEN** the player holds Tidecaller instead of pressing it
- **THEN** the skill starts on release, with the same shield and hit as a press

### Requirement: Thunderbeast's Targe after Stormbreaker

Stormbreaker SHALL summon the Thunderbeast's Targe, which stands for 15 seconds and moves with whichever member stands on the field.

#### Scenario: Casting Stormbreaker summons the Targe

- **GIVEN** Beidou is the character on the field
- **WHEN** the player casts Stormbreaker
- **THEN** the Thunderbeast's Targe appears and stands for 15 seconds

#### Scenario: The Targe follows the character on the field

- **GIVEN** the Targe stands
- **WHEN** the player switches to another member
- **THEN** the Targe stands where that member's body is on the field

#### Scenario: The Targe outlasts Beidou's fall

- **GIVEN** the Targe stands
- **WHEN** Beidou falls
- **THEN** the Targe keeps standing until its 15 seconds run out

### Requirement: Discharges from Beidou's attacks

While the Thunderbeast's Targe stands, Beidou's strikes and charged attack SHALL cast a lightning discharge at most once a second.

#### Scenario: A strike casts a discharge

- **GIVEN** the Targe stands and a discharge has not been cast in the last second
- **WHEN** one of Beidou's strikes or her charged attack starts its hit
- **THEN** a discharge of 1 unit of Electro lands on each enemy inside the strike's reach
- **AND** the discharge lands even when the strike misses

#### Scenario: A second hit within a second casts no discharge

- **GIVEN** a discharge was cast less than a second ago
- **WHEN** another of Beidou's hits starts within that second
- **THEN** no discharge is cast

### Requirement: Bane of Evil's Electro cut

From constellation six, the Targe SHALL lower the Electro RES of each enemy within 5 metres of the character on the field by 15%.

#### Scenario: An enemy near the character loses Electro RES

- **GIVEN** Beidou is at constellation six and the Targe stands
- **WHEN** an enemy is within 5 metres of the body on the field
- **THEN** that enemy's Electro RES is lowered by 15%
- **AND** the cut is renewed every half second while the enemy stays within 5 metres, lasting 1.5 seconds after each renewal

### Requirement: Fourth constellation adds an Electro hit to normal attacks after she takes damage

From constellation four, a hit Beidou takes while she is on the field SHALL give her normal attacks an extra Electro hit of 20% of her ATK after each hit they land, for 10 seconds.

#### Scenario: A normal attack hit gains the extra hit after damage is taken

- **GIVEN** Beidou is at constellation four and is on the field
- **WHEN** an enemy's strike costs her HP and then a normal attack hit lands within 10 seconds
- **THEN** an Electro hit of 20% of her ATK follows that hit

#### Scenario: Damage taken off the field gives no extra hit

- **GIVEN** Beidou is at constellation four and another character is on the field
- **WHEN** an enemy's strike costs her HP
- **THEN** no extra hit is given to her normal attacks

#### Scenario: Below the fourth constellation no extra hit is given

- **GIVEN** Beidou is at constellation three
- **WHEN** an enemy's strike costs her HP and a normal attack hit lands
- **THEN** no extra hit follows that hit
