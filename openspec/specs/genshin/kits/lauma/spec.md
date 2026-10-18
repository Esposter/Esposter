## Purpose

Lauma's kit as built, with her three strikes, charged attack, provisional plunges, Hymn of Hunting's press and Hymn of Eternal Rest's hold with the Frostgrove Sanctuary each plants, her Lunar-Bloom hit and Moonsign Benediction, and what is left waiting on the Spirit Envoy and Pale Hymn hooks.

## Requirements

### Requirement: Lauma's three strikes

Lauma's three strikes SHALL each land at their own frame, hitting the enemies within reach.

#### Scenario: Three strikes land in sequence

- **WHEN** the player uses normal attack three times in a row
- **THEN** each strike lands at its own frame on the enemies within reach

### Requirement: Spiritcall Prayer

Lauma's charged attack, Spiritcall Prayer, SHALL land its hit five frames after its animation ends and SHALL cost no stamina.

#### Scenario: Charged attack costs no stamina

- **GIVEN** Lauma has no stamina
- **WHEN** the player uses Spiritcall Prayer
- **THEN** the charged attack starts

#### Scenario: Hit lands after the animation

- **WHEN** Spiritcall Prayer's animation ends
- **THEN** its hit lands five frames later

### Requirement: Frostgrove Sanctuary and the RES shred

Hymn of Hunting SHALL plant a Frostgrove Sanctuary where Lauma stands, which ticks eight times over 15 seconds, and each press or tick SHALL lower the Dendro and Hydro RES of the enemies it strikes by 2.5% for 10 seconds.

#### Scenario: Sanctuary ticks after the press

- **WHEN** the player presses Hymn of Hunting
- **THEN** a Frostgrove Sanctuary is planted where Lauma stands
- **AND** it ticks eight times over 15 seconds, dealing Dendro damage

#### Scenario: Enemy RES is shredded

- **WHEN** a Hymn of Hunting press or sanctuary tick strikes a Dendro or Hydro enemy
- **THEN** that enemy's Dendro and Hydro RES drops by 2.5% for 10 seconds

### Requirement: Hymn of Eternal Rest hold

While the party holds Verdant Dew, holding Hymn of Hunting SHALL start Hymn of Eternal Rest, which spends up to three Dew on a Lunar-Bloom hit and plants the same sanctuary.

#### Scenario: Hold with Verdant Dew

- **GIVEN** the party holds Verdant Dew
- **WHEN** the player holds Hymn of Hunting
- **THEN** Hymn of Eternal Rest starts
- **AND** up to three Dew are spent on a Lunar-Bloom hit

#### Scenario: Hold without Verdant Dew plays the press

- **GIVEN** the party holds no Verdant Dew
- **WHEN** the player holds Hymn of Hunting
- **THEN** the press plays instead

### Requirement: Moonsign Benediction

Lauma's Moonsign Benediction SHALL add a Base DMG Bonus to the party's Lunar-Bloom for each point of her Elemental Mastery, at most 14%.

#### Scenario: Benediction raises Lunar-Bloom

- **GIVEN** Lauma has Elemental Mastery
- **WHEN** a Lunar-Bloom hit lands for the party
- **THEN** the hit gains a Base DMG Bonus for each Elemental Mastery point

#### Scenario: Benediction is capped

- **GIVEN** Lauma's Elemental Mastery is high enough to pass 14%
- **WHEN** a Lunar-Bloom hit lands
- **THEN** the Base DMG Bonus stops at 14%

### Requirement: Lauma's plunge attacks

Lauma's plunge attacks SHALL land a collision and two plunges on the enemies within reach, with their timing provisional.

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the collision and the plunge hits land on the enemies within reach

### Requirement: Burst deals no hit of its own

Lauma's elemental burst SHALL deal no damage of its own.

#### Scenario: Burst deals no damage

- **WHEN** the player casts the elemental burst
- **THEN** no damage is dealt

### Requirement: Pale Hymn, Spirit Envoy and her other passives not yet built

Pale Hymn, the Spirit Envoy state and Lauma's other passives and constellations SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Lauma has Pale Hymn, the Spirit Envoy state or another passive or constellation unlocked
- **WHEN** the player fights with Lauma
- **THEN** that effect has no effect
