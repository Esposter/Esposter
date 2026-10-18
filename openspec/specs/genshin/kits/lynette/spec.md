## Purpose

Lynette's kit as built, with her strikes, charged attack, plunges, Enigmatic Feint's press, and Magic Trick: Astonishing Shift's initial hit and Bogglecat Box ticks, and what is left of her Hold E, her vivid shots, her heal, her Ascension 4 passive and her constellations.

## Requirements

### Requirement: Lynette's physical strikes and plunges

Lynette's four strikes, charged attack of two slashes and plunges SHALL deal Physical damage to the enemies within reach.

#### Scenario: Four strikes in sequence

- **WHEN** the player uses normal attack four times in a row
- **THEN** the four strikes land in order and deal Physical damage

#### Scenario: Charged attack slashes

- **WHEN** the player uses the charged attack
- **THEN** both slashes land on the enemies within reach and deal Physical damage

### Requirement: Enigmatic Feint's press

Enigmatic Feint's press SHALL strike the enemies within its reach, dealing Anemo damage.

#### Scenario: Press strikes the enemies in reach

- **WHEN** the player presses Enigmatic Feint
- **THEN** the press strikes the enemies within its reach

### Requirement: Magic Trick's initial hit and Bogglecat Box

Magic Trick: Astonishing Shift SHALL land an initial hit and place a Bogglecat Box 1.8 metres ahead of Lynette, which ticks eleven times, the first tick 122 frames after the cast and then every 59 frames, each tick striking the enemies within six metres of the box.

#### Scenario: Initial hit lands

- **WHEN** the player casts Magic Trick: Astonishing Shift
- **THEN** the initial hit lands on the enemies within reach

#### Scenario: Box ticks in sequence

- **GIVEN** the Bogglecat Box has been placed
- **WHEN** 122 frames have passed and then every 59 frames after
- **THEN** each tick strikes the enemies within six metres of the box
- **AND** the box ticks eleven times in all

### Requirement: Constellation 4 skill charge

From Constellation 4, Enigmatic Feint SHALL have one more charge than its base.

#### Scenario: Constellation 4 adds a charge

- **GIVEN** Lynette has Constellation 4
- **WHEN** her skill's charges are read
- **THEN** it has one more charge than the base

#### Scenario: Constellation 3 adds nothing

- **GIVEN** Lynette has Constellation 3
- **WHEN** her skill's charges are read
- **THEN** no charge is added

### Requirement: Unbuilt Lynette effects

Lynette's Hold E, the Bogglecat Box's vivid shots, her heal on Enigmatic Feint, her Ascension 4 passive, and Constellations 1, 2 and 6 SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Lynette has her Ascension 4 passive or Constellation 1, 2 or 6 unlocked, or holds Enigmatic Feint
- **WHEN** the player fights with Lynette
- **THEN** those effects have no effect
