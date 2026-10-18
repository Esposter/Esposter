## Purpose

Candace's kit as built, with Sacred Rite: Heron's Sanctum's tap and charged hold and their shields, Sacred Rite: Wagtail's Tide's Prayer of the Crimson Crown with its waves, Constellations 1 and 6, and what is left to build, which includes Constellations 2 and 4.

## Requirements

### Requirement: Basic attacks

Candace's normal attacks SHALL be four strikes, a charged attack, a collision attack and two plunging attacks, with the charged attack costing 25 stamina.

#### Scenario: Strike chain plays four strikes in order

- **GIVEN** Candace is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her four strikes play in order and each deals its own hit

#### Scenario: Charged attack costs stamina

- **GIVEN** Candace has at least 25 stamina
- **WHEN** the player performs her charged attack
- **THEN** the charged attack deals its hit and costs 25 stamina

### Requirement: Heron's Sanctum tap shield

Heron's Sanctum's tap SHALL set a Hydro shield on the team and deal a share of Candace's Max HP as flat damage, and the tap SHALL go on cooldown for 6 seconds.

#### Scenario: Tapping Heron's Sanctum sets the shield and deals its damage

- **GIVEN** Candace is the character on the field and the tap is ready
- **WHEN** the player taps Heron's Sanctum
- **THEN** a Hydro shield is set on the team, with health that is a share of her Max HP plus a flat amount
- **AND** the skill's hit deals a share of her Max HP as flat damage

#### Scenario: The tap's shield ends when its hit lands

- **GIVEN** the tap's shield stands on the team
- **WHEN** the tap's hit lands
- **THEN** the shield ends

#### Scenario: Tapping again during the cooldown is refused

- **GIVEN** the tap was used less than 6 seconds ago
- **WHEN** the player taps Heron's Sanctum again
- **THEN** the tap does not activate

### Requirement: Heron's Sanctum charged hold shield

Heron's Sanctum's charged hold SHALL set a larger Hydro shield on the team after the player holds the skill for at least half a second, with the threshold provisional until a recording settles it, and the hold SHALL go on cooldown for 9 seconds.

#### Scenario: Holding Heron's Sanctum sets the charged shield

- **GIVEN** Candace is the character on the field and the charged hold is ready
- **WHEN** the player holds Heron's Sanctum for half a second and releases it
- **THEN** a Hydro shield is set on the team, with health that is a share of her Max HP plus a flat amount
- **AND** the hold's hit deals a share of her Max HP as flat damage

#### Scenario: Releasing the hold early plays the tap

- **GIVEN** the player holds Heron's Sanctum for less than half a second
- **WHEN** the player releases it
- **THEN** the tap plays instead of the charged hold

### Requirement: Prayer of the Crimson Crown from Wagtail's Tide

Sacred Rite: Wagtail's Tide SHALL set the Prayer of the Crimson Crown going on its initial hit, and the Prayer SHALL last 9 seconds, or 12 seconds at constellation 1.

#### Scenario: The burst starts the Prayer

- **GIVEN** Candace has 60 energy and the burst is ready
- **WHEN** the player casts Sacred Rite: Wagtail's Tide and its initial hit lands
- **THEN** the Prayer of the Crimson Crown starts and lasts 9 seconds

#### Scenario: Constellation 1 lengthens the Prayer

- **GIVEN** Candace is at constellation 1
- **WHEN** the Prayer starts
- **THEN** it lasts 12 seconds

#### Scenario: The burst is refused without enough energy

- **GIVEN** Candace has less than 60 energy
- **WHEN** the player tries to cast Sacred Rite: Wagtail's Tide
- **THEN** the burst does not activate

### Requirement: Hydro infusion on the character on the field

While the Prayer stands, the Prayer SHALL infuse the party member on the field with Hydro for 1 second every half second, when that member wields a sword, claymore or polearm.

#### Scenario: A sword, claymore or polearm wielder is infused

- **GIVEN** the Prayer stands and the character on the field wields a sword, claymore or polearm
- **WHEN** the half-second infusion ticks
- **THEN** that character's weapon is infused with Hydro for 1 second

#### Scenario: A swap infuses the incoming member at once

- **GIVEN** the Prayer stands and the member on the field wields a sword, claymore or polearm
- **WHEN** the player swaps to that member
- **THEN** that member is infused with Hydro immediately

### Requirement: Waves on each swap while the Prayer stands

While the Prayer stands, each swap SHALL set off a Hydro wave round Candace's body, at most three waves per burst.

#### Scenario: A swap sets off a wave

- **GIVEN** the Prayer stands and fewer than three waves have been set off by this burst
- **WHEN** the player swaps characters
- **THEN** a Hydro wave is set off round Candace's body, dealing 6.6% of her Max HP as flat damage in a circle of radius 3.5 metres

#### Scenario: A fourth swap sets off no wave

- **GIVEN** the Prayer stands and three waves have already been set off by this burst
- **WHEN** the player swaps characters
- **THEN** no wave is set off

### Requirement: Constellation 6 waves on elemental normal attacks

At constellation 6, while the Prayer stands, an elemental normal attack by the character on the field, other than Candace, SHALL set off a Hydro wave dealing 15% of Candace's Max HP, at most once every 2.3 seconds.

#### Scenario: An elemental normal attack by the character on the field sets off a wave

- **GIVEN** Candace is at constellation 6 and the Prayer stands
- **WHEN** the character on the field, not Candace, lands an elemental normal attack
- **THEN** a Hydro wave is set off dealing 15% of her Max HP

#### Scenario: An off-field party member's attack sets off no wave

- **GIVEN** Candace is at constellation 6 and the Prayer stands
- **WHEN** a party member off the field lands an elemental normal attack
- **THEN** no wave is set off

#### Scenario: A second attack within 2.3 seconds sets off no wave

- **GIVEN** a constellation 6 wave was set off less than 2.3 seconds ago
- **WHEN** another elemental normal attack lands
- **THEN** no wave is set off

### Requirement: Constellations 2 and 4 are not built

Candace's Constellations 2 and 4 SHALL NOT take effect: Constellation 2's Max HP buff is not read back into her Max HP, and Constellation 4's shorter hold cooldown needs a cooldown that differs per hold, which a hold's cooldown does not carry.

#### Scenario: Constellation 2 and 4 do nothing

- **GIVEN** Candace has Constellation 2 or Constellation 4
- **WHEN** the player fights with Candace
- **THEN** that constellation has no effect
