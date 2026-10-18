## Purpose

Chongyun's kit as built: his strikes, charged attack and plunges, Spirit Blade Chonghua's Layered Frost field with its infusion, and Cloud-Parting Star with its blades and constellations, with the particles left unbuilt.

## Requirements

### Requirement: Basic attacks

Chongyun's normal attacks SHALL be four strikes, a charged attack of two slashes, a collision attack and two plunging attacks.

#### Scenario: Strike chain plays four strikes in order

- **GIVEN** Chongyun is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** his four strikes play in order

#### Scenario: Charged attack drains stamina as it plays

- **GIVEN** Chongyun has stamina
- **WHEN** the player holds the attack button to charge
- **THEN** his charged attack plays its two slashes
- **AND** stamina drains each second while the charged attack plays

### Requirement: Provisional charged attack

Chongyun's charged attack SHALL be provisional, its spinning and final slashes timed as estimates until a recording of the game settles them.

#### Scenario: Charged attack timings stay estimates

- **GIVEN** Chongyun charges his attack
- **WHEN** the charged attack plays
- **THEN** the spinning slash lands at half a second and the final slash at one second
- **AND** the attack ends at 1.2 seconds, and these values stay provisional until a recording settles them

### Requirement: Layered Frost infusion

Spirit Blade: Chonghua's Layered Frost SHALL infuse each sword, claymore or polearm wielder on the field with Cryo every second while the wielder stands inside its frost field.

#### Scenario: A melee wielder inside the frost field is infused

- **GIVEN** Layered Frost has created its frost field
- **WHEN** a sword, claymore or polearm wielder on the field stands inside the frost field
- **THEN** that wielder is infused with Cryo each second

#### Scenario: A bow or catalyst wielder is not infused

- **GIVEN** Layered Frost has created its frost field
- **WHEN** a bow or catalyst wielder on the field stands inside the frost field
- **THEN** that wielder receives no infusion

#### Scenario: A character swapped in during the field is infused

- **GIVEN** Layered Frost has created its frost field
- **WHEN** the player swaps to a sword, claymore or polearm wielder
- **THEN** that character is infused with Cryo wherever it stands

### Requirement: Rimechaser Blade from Ascension 4

From Ascension 4, a press that ends the frost field SHALL trigger Rimechaser Blade, which strikes 655 frames later.

#### Scenario: Ending the frost field triggers Rimechaser Blade

- **GIVEN** Chongyun is at Ascension 4 and his frost field stands
- **WHEN** a press ends the frost field
- **THEN** Rimechaser Blade strikes 655 frames later, aimed at the enemy inside the field that scores highest, or at the field's centre

### Requirement: Steady Breathing from Ascension 1

From Ascension 1, Steady Breathing SHALL raise the Normal ATK SPD of the wielder it infuses by 8 percent for as long as that infusion lasts.

#### Scenario: The infused wielder attacks faster

- **GIVEN** Chongyun is at Ascension 1 and a wielder is infused by his frost field
- **WHEN** the infused wielder performs normal attacks
- **THEN** its Normal ATK SPD is raised by 8 percent

#### Scenario: The speed ends with the infusion

- **GIVEN** the infused wielder's Normal ATK SPD is raised by Steady Breathing
- **WHEN** the infusion ends
- **THEN** the raised Normal ATK SPD ends with it

### Requirement: Cloud-Parting Star blades

Spirit Blade: Cloud-Parting Star SHALL summon three blades that strike the enemies they reach, and it SHALL cost energy and cool down before it can be cast again.

#### Scenario: The burst summons three blades

- **GIVEN** Chongyun has enough energy
- **WHEN** the player casts Cloud-Parting Star
- **THEN** three blades strike the enemies they reach

#### Scenario: The burst is refused without enough energy

- **GIVEN** Chongyun has less energy than the burst costs
- **WHEN** the player casts Cloud-Parting Star
- **THEN** it does not cast

### Requirement: Constellation effects

From constellation 1, Ice Unleashed SHALL add blades; from constellation 2, Atmospheric Revolution SHALL cost less cooldown when cast inside the frost field; from constellation 4, Frozen Skies SHALL give energy; and from constellation 6, Rally of Four Blades SHALL add a fourth blade with a DMG Bonus.

#### Scenario: Constellation 1 adds Ice Unleashed blades

- **GIVEN** Chongyun is at constellation 1
- **WHEN** Ice Unleashed is triggered
- **THEN** its blades reach what the fourth strike reaches, a provisional reach

#### Scenario: Constellation 2 shortens Atmospheric Revolution

- **GIVEN** Chongyun is at constellation 2 and his frost field stands
- **WHEN** Atmospheric Revolution is cast within the frost field
- **THEN** its cooldown is cut

#### Scenario: Constellation 4 gives energy from Cryo hits

- **GIVEN** Chongyun is at constellation 4 and stands on the field
- **WHEN** one of his hits strikes an enemy with Cryo on it
- **THEN** Chongyun gains 1 energy

#### Scenario: Constellation 6 adds a fourth Rally blade

- **GIVEN** Chongyun is at constellation 6
- **WHEN** Cloud-Parting Star casts its blades
- **THEN** a fourth blade joins them with its own DMG Bonus, a provisional reach of 5 metres
