## Purpose

Sigewinne's kit as built: her three strikes, Fully-Charged Aimed Shot, collision and two plunges, Bolstering Bubblebalm's five bubbles and Super Saturated Syringing's six waves, with her healing, her hold tiers and her Surging Blade not built.

## Requirements

### Requirement: Sigewinne's strikes, shot and plunges

Sigewinne's three strikes, Fully-Charged Aimed Shot, collision and two plunges SHALL land on the enemies within reach, carrying no poise, provisionally.

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

### Requirement: Unbuilt Sigewinne effects

The Mini-Stration Bubble, the bubbles' hold tiers, the bubbles' and final bounce's healing, Surging Blade, her Ascension 1 Convalescence, her Ascension 4 healing bonus, her constellation passives and the droplets her press and burst spawn SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Sigewinne has one of these effects unlocked
- **WHEN** the player fights with Sigewinne
- **THEN** that effect has no effect
