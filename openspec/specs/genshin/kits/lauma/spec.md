## Purpose

Lauma's kit as built, with her three strikes, charged attack, provisional plunges, Hymn of Hunting's press and Hymn of Eternal Rest's hold with the Frostgrove Sanctuary each plants, her Lunar-Bloom hit, Moonsign Benediction and Pale Hymn stacks, Constellations 1, 2 and 4, and what is left waiting on the Spirit Envoy and Constellation 6.

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

While the party holds Dew, holding Hymn of Hunting SHALL start Hymn of Eternal Rest, which spends up to three Dew on a Lunar-Bloom hit and plants the same sanctuary.

#### Scenario: Hold with Dew

- **GIVEN** the party holds Dew
- **WHEN** the player holds Hymn of Hunting
- **THEN** Hymn of Eternal Rest starts
- **AND** up to three Dew are spent on a Lunar-Bloom hit

#### Scenario: Hold without Dew plays the press

- **GIVEN** the party holds no Dew
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

### Requirement: Elemental Mastery raises her Elemental Skill's DMG from Ascension 4

From Ascension 4, Lauma's Elemental Skill, its press and the Frostgrove Sanctuary's ticks, SHALL deal 0.04% more DMG for each point of her Elemental Mastery, at most 32%.

#### Scenario: A sanctuary tick takes Cleansing for the Spring

- **GIVEN** Lauma has reached Ascension 4
- **WHEN** a Frostgrove Sanctuary tick strikes
- **THEN** it takes 0.04% DMG Bonus for each point of her Elemental Mastery, at most 32%

### Requirement: Her burst gives the party Pale Hymn

Lauma's burst SHALL give the party 18 Pale Hymn 96 frames after it starts, lasting 15 seconds.

#### Scenario: The burst gives 18 Pale Hymn after 96 frames

- **WHEN** the player casts the elemental burst
- **THEN** the party holds 18 Pale Hymn 96 frames later, for 15 seconds

### Requirement: Moon Song gives Pale Hymn for a Dew spent in the burst

A Dew Hymn of Eternal Rest spends during the burst SHALL give Moon Song six Pale Hymn a Dew, once in each burst, and a Dew spent outside it SHALL wait for the burst's gain for 15 seconds.

#### Scenario: Moon Song gives one Dew's Pale Hymn once in each burst

- **GIVEN** Lauma's burst is up and its Moon Song has given Pale Hymn
- **WHEN** Hymn of Eternal Rest spends Dew
- **THEN** Moon Song gives no more Pale Hymn in that burst

### Requirement: Pale Hymn raises each Bloom the party makes by her Elemental Mastery

While the party holds Pale Hymn, each Bloom, Hyperbloom, Burgeon or Lunar-Bloom reaction the party makes SHALL take base damage of her Elemental Mastery times the burst's increase at her talent level: the Bloom increase for Bloom, Hyperbloom and Burgeon, and the Lunar-Bloom increase for Lunar-Bloom.

#### Scenario: Pale Hymn adds her Elemental Mastery to each Bloom the party makes

- **GIVEN** the party holds Pale Hymn
- **WHEN** a Bloom, Hyperbloom, Burgeon or Lunar-Bloom reaction triggers
- **THEN** its base damage takes her Elemental Mastery times the burst's increase for that reaction

### Requirement: A Bloom or Lunar-Bloom reaction spends one Pale Hymn

Each Bloom, Hyperbloom, Burgeon or Lunar-Bloom reaction SHALL spend one Pale Hymn, Moon Song's before the burst's.

#### Scenario: A reaction spends Moon Song's Pale Hymn first

- **GIVEN** the party holds Moon Song's Pale Hymn and the burst's
- **WHEN** a Bloom reaction triggers
- **THEN** one of Moon Song's stacks is spent

### Requirement: Constellation 2 adds to Pale Hymn's Bloom ratios

From Constellation 2, each Bloom, Hyperbloom and Burgeon the party makes while it holds Pale Hymn SHALL take 5 more of Lauma's Elemental Mastery ratio, and each Lunar-Bloom 4 more.

#### Scenario: Constellation 2 raises the Bloom ratio

- **GIVEN** Lauma has Constellation 2 and the party holds Pale Hymn
- **WHEN** a Bloom reaction triggers
- **THEN** its base damage adds her Elemental Mastery times the Bloom ratio plus 5

#### Scenario: Constellation 1 leaves the Bloom ratio alone

- **GIVEN** Lauma has Constellation 1 and the party holds Pale Hymn
- **WHEN** a Bloom reaction triggers
- **THEN** its base damage adds her Elemental Mastery times the Bloom ratio alone

### Requirement: Constellation 4 energy from the Sanctuary's ticks

From Constellation 4, each Frostgrove Sanctuary tick that strikes an enemy SHALL restore 5 energy to Lauma, at most once every 5 seconds.

#### Scenario: A sanctuary tick restores energy at Constellation 4

- **GIVEN** Lauma has Constellation 4 and the Frostgrove Sanctuary stands
- **WHEN** a sanctuary tick strikes an enemy
- **THEN** she gains 5 energy
- **AND** another tick striking within 5 seconds gives none

#### Scenario: Press and hold give no energy at Constellation 4

- **GIVEN** Lauma has Constellation 4
- **WHEN** her press or her hold strikes an enemy
- **THEN** she gains no energy from it

### Requirement: Constellation 1's heal on Lunar-Bloom

From Constellation 1, while the status her burst gives holds for 20 seconds, each Lunar-Bloom reaction SHALL heal the active character for 5 times Lauma's Elemental Mastery, 5 frames later, at most once every 1.9 seconds.

#### Scenario: A Lunar-Bloom heals the active character at Constellation 1

- **GIVEN** Lauma has Constellation 1 and her burst was cast within 20 seconds
- **WHEN** a Lunar-Bloom reaction triggers
- **THEN** the active character is healed for 5 times her Elemental Mastery 5 frames later

#### Scenario: Heals wait out their cooldown

- **GIVEN** a Lunar-Bloom heal was given within the last 1.9 seconds
- **WHEN** another Lunar-Bloom reaction triggers
- **THEN** no heal is given

### Requirement: Spirit Envoy, her other passives, and Constellation 6 not yet built

Lauma's Spirit Envoy state, her other passives, and Constellation 6 SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Lauma has the Spirit Envoy state, another passive, or Constellation 6 unlocked
- **WHEN** the player fights with Lauma
- **THEN** that effect has no effect

## Open

- [ ] **Spiritcall Prayer costs no stamina** — no source yet: gcsim draws stamina only in the Spirit Envoy state, and the wiki gives no stamina figure for the charged attack.
