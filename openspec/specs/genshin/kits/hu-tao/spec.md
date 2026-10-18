## Purpose

Hu Tao's kit as built: her string, charged attack, Guide to Afterlife's Paramita stance with its HP cost, and Spirit Soother's half-HP hit with Blood Blossom, with Spirit Soother's heal and her Constellations 2, 4 and 6 left unbuilt, her Constellation 1 built, and her Flutter By and Sanguine Rouge passives built.

## Requirements

### Requirement: String of six strikes and a seventh hit

Hu Tao's string SHALL be six strikes followed by a seventh hit, as her normal attacks.

#### Scenario: The string plays through to its seventh hit

- **GIVEN** Hu Tao is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** the six strikes play in order
- **AND** the string ends with its seventh hit

### Requirement: Guide to Afterlife's Paramita stance

Guide to Afterlife SHALL start the Paramita Papilio stance, which infuses Hu Tao's normal attacks, charged attack and plunges with Pyro and raises her ATK by a share of her Max HP for the stance's seconds.

#### Scenario: The stance infuses and buffs her attacks

- **GIVEN** Hu Tao is the character on the field
- **WHEN** the player casts Guide to Afterlife
- **THEN** her normal attacks, charged attack and plunges are infused with Pyro
- **AND** her ATK rises by a share of her Max HP while the stance lasts

#### Scenario: The stance ends when she leaves the field

- **GIVEN** the Paramita Papilio stance stands
- **WHEN** Hu Tao leaves the field
- **THEN** the infusion and the ATK rise both end

### Requirement: Guide to Afterlife costs HP without going below 1

Guide to Afterlife SHALL cost 30% of Hu Tao's current HP as the stance starts, and the cost SHALL never take her below 1 HP.

#### Scenario: The HP cost is paid as the stance starts

- **GIVEN** Hu Tao has HP above 1
- **WHEN** the player casts Guide to Afterlife
- **THEN** 30% of her current HP is paid from her HP as the stance starts

#### Scenario: The HP cost stops at 1 HP

- **GIVEN** Hu Tao's HP would fall below 1 from the cost
- **WHEN** the player casts Guide to Afterlife
- **THEN** her HP is left at 1

### Requirement: Spirit Soother's half-HP hit

Spirit Soother SHALL use its half-HP multiplier only when Hu Tao's HP is at or under half of her Max HP as the burst starts.

#### Scenario: Low HP applies the half-HP multiplier

- **GIVEN** Hu Tao's HP is at or under half of her Max HP
- **WHEN** the player casts Spirit Soother
- **THEN** its hit uses the half-HP multiplier

#### Scenario: Higher HP does not apply the half-HP multiplier

- **GIVEN** Hu Tao's HP is above half of her Max HP
- **WHEN** the player casts Spirit Soother
- **THEN** the half-HP multiplier does not apply

### Requirement: Blood Blossom on enemies her charged attack hits

Blood Blossom SHALL be applied to each enemy the Paramita charged attack hits and SHALL tick a Pyro hit on that enemy every four seconds for 9.5 seconds.

#### Scenario: The charged attack applies Blood Blossom

- **GIVEN** Hu Tao is in the Paramita Papilio stance
- **WHEN** her charged attack hits an enemy
- **THEN** Blood Blossom is applied to that enemy

#### Scenario: Blood Blossom ticks for 9.5 seconds

- **GIVEN** Blood Blossom is on an enemy
- **WHEN** four seconds pass
- **THEN** that enemy takes a Pyro tick of 1 unit of gauge
- **AND** the ticks continue every four seconds for 9.5 seconds

### Requirement: Provisional plunge timings

Hu Tao's plunge frames and poise SHALL stay provisional until a recording settles them.

#### Scenario: A recording settles the plunges

- **GIVEN** a recording of Hu Tao's plunges exists
- **WHEN** its frames and poise are compared with the kit's
- **THEN** the plunges stay provisional until the comparison settles them

### Requirement: First constellation makes charged attacks free of stamina while Paramita Papilio holds her

From constellation 1, Hu Tao's charged attacks SHALL cost no stamina while a stance is on her.

#### Scenario: A charged attack during the Paramita stance costs no stamina

- **GIVEN** Hu Tao is at constellation 1 and holds a stance
- **WHEN** her charged attack's stamina multiplier is read
- **THEN** it is zero

#### Scenario: Below constellation 1 the multiplier is unchanged

- **GIVEN** Hu Tao is at constellation 0 and holds a stance
- **WHEN** her charged attack's stamina multiplier is read
- **THEN** it is one
