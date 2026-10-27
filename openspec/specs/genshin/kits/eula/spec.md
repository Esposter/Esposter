## Purpose

Eula's kit as built: her strikes, charged attack and plunges, Icetide Vortex's press and hold, and Glacial Illumination with the Lightfall Sword and its Grimheart stacks, with both passives built, Ascension 4's stack and its reset of Icetide Vortex's cooldown among them, and Constellation 2's hold cooldown left unbuilt.

## Requirements

### Requirement: Basic attacks

Eula's normal attacks SHALL be five strikes, a charged attack, a collision attack and two plunging attacks.

#### Scenario: Strike chain plays five strikes in order

- **GIVEN** Eula is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her five strikes play in order

### Requirement: Provisional charged attack

Eula's charged attack SHALL be provisional, its spin landing at half a second and its final hit at one second within an attack of one and a half seconds, until a recording of the game settles them.

#### Scenario: Charged attack timings stay estimates

- **GIVEN** Eula charges her attack
- **WHEN** the charged attack plays
- **THEN** the spin lands at half a second and the final hit at one second
- **AND** these timings stay provisional until a recording settles them

### Requirement: Icetide Vortex press adds Grimheart stacks

Pressing Icetide Vortex SHALL add a Grimheart stack, up to two stacks, lasting 18 seconds, and it SHALL cool down before it can be pressed again.

#### Scenario: A press adds a Grimheart stack

- **GIVEN** Eula has fewer than two Grimheart stacks
- **WHEN** the player presses Icetide Vortex
- **THEN** a Grimheart stack is added for 18 seconds

#### Scenario: A press at the stack cap adds no stack

- **GIVEN** Eula already has two Grimheart stacks
- **WHEN** the player presses Icetide Vortex
- **THEN** no further stack is added

### Requirement: Icetide Vortex hold spends stacks

Holding Icetide Vortex SHALL spend every Grimheart stack on one Icewhirl each, shredding the enemy's Cryo and Physical RES for 7 seconds per stack, and the hold SHALL start after a half-second threshold that stays provisional.

#### Scenario: The hold spends stacks into Icewhirls

- **GIVEN** Eula has Grimheart stacks
- **WHEN** the player holds Icetide Vortex past the threshold
- **THEN** each stack becomes one Icewhirl
- **AND** the enemy's Cryo and Physical RES are shredded for 7 seconds per stack

#### Scenario: The hold without stacks makes no Icewhirl

- **GIVEN** Eula has no Grimheart stacks
- **WHEN** the player holds Icetide Vortex past the threshold
- **THEN** no Icewhirl is made

### Requirement: Glacial Illumination and the Lightfall Sword

Glacial Illumination SHALL summon the Lightfall Sword, which gains a stack every 0.1 seconds while it is lit, up to 30 stacks.

The Lightfall Sword SHALL explode 35 frames after a character swap.

#### Scenario: The Lightfall Sword gains stacks while lit

- **GIVEN** the Lightfall Sword is lit
- **WHEN** 0.1 seconds pass
- **THEN** one stack is added to it

#### Scenario: The Lightfall Sword stops gaining at 30 stacks

- **GIVEN** the Lightfall Sword has 30 stacks
- **WHEN** another 0.1 seconds pass
- **THEN** no further stack is added

#### Scenario: A swap explodes the Lightfall Sword

- **GIVEN** the Lightfall Sword is lit
- **WHEN** the player swaps characters
- **THEN** the Lightfall Sword explodes 35 frames later

### Requirement: Shattered Lightfall Sword from Ascension 1

From Ascension 1, two Grimheart stacks SHALL raise a Shattered Lightfall Sword.

#### Scenario: Two stacks raise the Shattered Lightfall Sword

- **GIVEN** Eula is at Ascension 1
- **WHEN** she has two Grimheart stacks
- **THEN** a Shattered Lightfall Sword is raised

### Requirement: Constellation 1, 4 and 6 effects

From constellation 1, Eula SHALL gain a Physical DMG Bonus.

From constellation 4, Glacial Illumination's initial hit SHALL gain a bonus against an enemy below half its HP.

From constellation 6, Eula SHALL start with five stacks.

From constellation 6, each stack the Sword gains from her strikes SHALL have a 50% chance of a second one.

#### Scenario: Constellation 1 adds a Physical DMG Bonus

- **GIVEN** Eula is at constellation 1
- **WHEN** she attacks with Physical damage
- **THEN** her Physical DMG Bonus applies

#### Scenario: Constellation 4 adds a bonus against a weakened enemy

- **GIVEN** Eula is at constellation 4
- **WHEN** Glacial Illumination's initial hit strikes an enemy below half its HP
- **THEN** the hit gains a bonus

#### Scenario: Constellation 6 starts with five stacks

- **GIVEN** Eula is at constellation 6
- **WHEN** Glacial Illumination is cast
- **THEN** the Lightfall Sword starts with five stacks

#### Scenario: Constellation 6 gives a stack a 50% chance of a second

- **GIVEN** Eula is at constellation 6 and her Lightfall Sword is lit
- **WHEN** one of her strikes gains the Sword a stack
- **THEN** that stack is a second one with a 50% chance, as gcsim v2.47.2 rolls it

## Open

- [ ] **Eula's charged attack's spin lands at half a second and its final hit at one second** — no source yet: no recording of her charged attack is on disk to settle the timings.
- [ ] **The Icetide Vortex hold starts after a half-second threshold** — no source yet: no recording of the hold's threshold is on disk to settle it.
