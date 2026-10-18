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

### Requirement: Unbuilt Lynette effects

Lynette's Hold E, the Bogglecat Box's vivid shots, her heal on Enigmatic Feint, and her Ascension 4 passive and constellations SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Lynette has her Ascension 4 passive or a constellation unlocked, or holds Enigmatic Feint
- **WHEN** the player fights with Lynette
- **THEN** those effects have no effect
