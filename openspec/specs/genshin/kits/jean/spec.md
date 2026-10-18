## Purpose

Jean's kit as built: five strikes, a charged attack, a collision and two plunges, Gale Blade's press and its hold, and Dandelion Breeze's blast. Her other constellations, the hold's pull and the off-field members' activation heal are not built.

## Requirements

### Requirement: Five strikes and charged attack

Jean's five strikes and charged attack SHALL be her normal attacks.

#### Scenario: Strike chain plays five strikes in order

- **GIVEN** Jean is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her five strikes play in order and each deals its own hit

#### Scenario: The charged attack strikes a fan ahead of her

- **GIVEN** Jean is the character on the field
- **WHEN** the player holds the attack button to charge
- **THEN** the charged attack strikes the enemies in a 160-degree fan ahead of her

### Requirement: Gale Blade releases on the release of its press or hold

Gale Blade SHALL release its blast when the player lets go, and a held Gale Blade SHALL release itself after five seconds.

#### Scenario: A tap of Gale Blade releases its blast

- **GIVEN** Jean is the character on the field
- **WHEN** the player taps Gale Blade
- **THEN** its blast plays on release
- **AND** the blast lands 21 frames after the release

#### Scenario: A hold of at least one second releases at its hold level

- **GIVEN** Jean is the character on the field
- **WHEN** the player holds Gale Blade for at least one second and releases it
- **THEN** the blast plays at that hold level

#### Scenario: A hold of five seconds releases itself

- **GIVEN** the player holds Gale Blade
- **WHEN** five seconds pass
- **THEN** Gale Blade releases on its own

### Requirement: Spiraling Tempest adds Anemo DMG Bonus to a held blast

From her first constellation, a Gale Blade held for at least one second SHALL raise Jean's Anemo DMG Bonus for the blast's 46 frames.

#### Scenario: A held blast raises Anemo DMG Bonus

- **GIVEN** Jean is at constellation 1
- **WHEN** a Gale Blade held for at least one second lands its blast
- **THEN** Jean's Anemo DMG Bonus rises by 40% for the 46 frames of the blast
- **AND** any other Anemo hit of hers that lands in those frames takes the bonus too

### Requirement: Dandelion Breeze's field heals and regenerates

Dandelion Breeze SHALL open a field round Jean for 10 seconds that heals the character on the field when it opens and regenerates that character on ten later ticks.

#### Scenario: The activation heal lands on the character on the field

- **GIVEN** Jean is the character on the field
- **WHEN** the player casts Dandelion Breeze
- **THEN** 40 frames after the cast, the character on the field is healed by 251.2% of Jean's ATK plus 1,540
- **AND** the activation heal reaches only the character on the field, not the other members

#### Scenario: Regeneration ticks run to 640 frames

- **GIVEN** Dandelion Breeze's field is open
- **WHEN** its ticks come due from 100 frames to 640 frames, every 60 frames
- **THEN** the character on the field regenerates 25.12% of Jean's ATK plus 154 on each of the ten ticks

#### Scenario: Enemies inside the field take damage as it opens and ends

- **GIVEN** Dandelion Breeze is cast with enemies inside its 6-metre reach
- **WHEN** the field opens at 40 frames and when it dissipates at 640 frames
- **THEN** every enemy inside the reach takes Anemo damage of 78.4% of Jean's ATK at each moment
- **AND** each applies 2 units of Anemo gauge with 50 poise

#### Scenario: An enemy that moves in or out between those moments is not struck

- **GIVEN** Dandelion Breeze's field is open
- **WHEN** an enemy walks in or out of the field between its opening and its dissipation
- **THEN** that enemy is not struck by the field's entering or exiting damage

### Requirement: Let the Wind Lead gives energy at activation

From her fourth ascension, the field's activation SHALL give Jean energy up to the burst's cost.

#### Scenario: Activation gives 16 energy

- **GIVEN** Jean has her fourth ascension
- **WHEN** Dandelion Breeze's activation heal lands
- **THEN** Jean gains 16 energy, a fifth of the burst's 80 energy
- **AND** her energy stops at the burst's cost

### Requirement: Wind Companion heals on each strike's rolls

From her first ascension, each of Jean's strikes SHALL roll for a party heal, rolling on each enemy it reaches until one roll passes.

#### Scenario: A passing roll heals the party

- **GIVEN** Jean has her first ascension
- **WHEN** a strike reaches an enemy and its 50% roll passes
- **THEN** every party member is healed by 15% of Jean's ATK
- **AND** the strike stops rolling on the enemies it has yet to reach

#### Scenario: Failed rolls heal nothing

- **GIVEN** Jean has her first ascension
- **WHEN** every roll the strike makes fails
- **THEN** no party heal is dealt

### Requirement: Provisional plunges

Jean's collision and two plunges SHALL keep provisional reaches until a recording settles them.

#### Scenario: A plunge deals its hit within its provisional reach

- **GIVEN** Jean is in the air
- **WHEN** the player plunges
- **THEN** the plunge deals its hit within its provisional reach
- **AND** the reach stays provisional until a recording settles it
