## Purpose

Sigewinne's kit as built: her three strikes, Fully-Charged Aimed Shot, collision and two plunges, Bolstering Bubblebalm's five bubbles, Super Saturated Syringing's six waves, Semi-Strict Bedrest and Constellation 2 built, with her healing, her hold tiers, her Surging Blade and her Constellations 1, 4 and 6 not built.

## Requirements

### Requirement: Sigewinne's strikes, shot and plunges

Sigewinne's three strikes, Fully-Charged Aimed Shot, collision and two plunges SHALL land on the enemies within reach, carrying the poise the design gives them, provisionally.

#### Scenario: Three strikes in sequence

- **WHEN** the player uses normal attack three times in a row
- **THEN** the strikes land at 12, 14 and 38 frames on the enemies within reach

#### Scenario: Fully-Charged Aimed Shot lands

- **WHEN** the player fully charges and fires the Aimed Shot
- **THEN** the shot lands at 86 frames on the enemies within reach, with no stamina cost

#### Scenario: Plunge lands at the start of its action

- **WHEN** the player starts a plunge attack
- **THEN** the plunge lands at the start of its action

### Requirement: Bolstering Bubblebalm

Bolstering Bubblebalm SHALL cast five bubbles where Sigewinne stands, the first at 35 frames and then one every 107 frames, each dealing a share of her Max HP, and its cooldown SHALL be 18 seconds.

#### Scenario: Five bubbles land on their timings

- **WHEN** the player presses Bolstering Bubblebalm
- **THEN** the first bubble lands at 35 frames
- **AND** each further bubble lands 107 frames after the one before until five have landed

#### Scenario: Press refused during cooldown

- **GIVEN** Bolstering Bubblebalm is on its 18-second cooldown
- **WHEN** the player presses it
- **THEN** the press is not used

### Requirement: Super Saturated Syringing

Super Saturated Syringing SHALL cast six waves from Sigewinne, the first at 99 frames and then one every 25 frames, each a 4-by-10-metre box dealing a share of her Max HP, and it SHALL cost 70 energy with an 18-second cooldown.

#### Scenario: Burst with enough energy

- **GIVEN** Sigewinne has at least 70 energy
- **WHEN** the player casts Super Saturated Syringing
- **THEN** the first wave lands at 99 frames
- **AND** each further wave lands 25 frames after the one before until six have landed

#### Scenario: Burst refused without enough energy

- **GIVEN** Sigewinne has less than 70 energy
- **WHEN** the player casts Super Saturated Syringing
- **THEN** the burst does not start

### Requirement: Semi-Strict Bedrest

From Ascension 1, each press of Rebound Hydrotherapy SHALL give Sigewinne an 8% Hydro DMG Bonus for 18 seconds, and below Ascension 1 the press SHALL give none.

#### Scenario: A press at Ascension 1 gives the Hydro DMG Bonus

- **GIVEN** Sigewinne is at Ascension 1
- **WHEN** the player presses Rebound Hydrotherapy
- **THEN** she gains an 8% Hydro DMG Bonus for 18 seconds

#### Scenario: A press below Ascension 1 gives no Hydro DMG Bonus

- **GIVEN** Sigewinne is at Ascension 0
- **WHEN** the player presses Rebound Hydrotherapy
- **THEN** she gains no Hydro DMG Bonus

### Requirement: Constellation 2 Hydro RES cut and Bubbly Shield

From Constellation 2, each enemy that a bubble or a wave of hers strikes SHALL lose 35% Hydro RES for 8 seconds, and the press and the burst each SHALL cast a Bubbly Shield of 30% of her Max HP for the action's seconds.

#### Scenario: A bubble or a wave cuts the enemy's Hydro RES

- **GIVEN** Sigewinne has Constellation 2
- **WHEN** a bubble or a wave strikes an enemy
- **THEN** that enemy loses 35% Hydro RES for 8 seconds

#### Scenario: The press and the burst cast a Bubbly Shield

- **GIVEN** Sigewinne has Constellation 2
- **WHEN** the player presses Rebound Hydrotherapy or casts Super Saturated Syringing
- **THEN** she gains a Hydro Bubbly Shield of 30% of her Max HP for the action's seconds

#### Scenario: Below Constellation 2 nothing is cast

- **GIVEN** Sigewinne has Constellation 1
- **WHEN** the player presses Rebound Hydrotherapy or casts Super Saturated Syringing
- **THEN** no Bubbly Shield is cast and no Hydro RES is cut

### Requirement: Unbuilt Sigewinne effects

The Mini-Stration Bubble, the bubbles' hold tiers, the bubbles' and final bounce's healing, Surging Blade, her Ascension 1 Convalescence, her Ascension 4 healing bonus, her Constellations 1, 4 and 6, and the droplets her press and burst spawn SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Sigewinne has one of these effects unlocked
- **WHEN** the player fights with Sigewinne
- **THEN** that effect has no effect
