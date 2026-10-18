## Purpose

Diona's kit as built: her strikes, charged attack and plunges, Icy Paws' tap and hold with their shields, and Signature Mix's field with Drunkards' Farce's ATK cut from Ascension 4, with her Ascension 1 passive and Constellations 4 and 6 left unbuilt.

## Requirements

### Requirement: Basic attacks

Diona's normal attacks SHALL be five strikes, a charged aimed shot, a collision attack and two plunging attacks.

#### Scenario: Strike chain plays five strikes in order

- **GIVEN** Diona is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her five strikes play in order

### Requirement: Icy Paws tap

Tapping Icy Paws SHALL cast paws that reach 5 metres and give Diona a shield set as the press starts, and it SHALL cool down before it can be used again.

#### Scenario: A tap sets a shield from Diona's max HP

- **GIVEN** Diona is the character on the field
- **WHEN** the player taps Icy Paws
- **THEN** the paws reach enemies within 5 metres
- **AND** a shield sized from her max HP is set on her as the press starts

#### Scenario: A tap during the cooldown does nothing

- **GIVEN** Icy Paws was tapped and its cooldown has not ended
- **WHEN** the player taps it again
- **THEN** it does not cast

### Requirement: Icy Paws hold

Holding Icy Paws SHALL cast paws that give Diona a larger shield, once the hold passes a half-second threshold that stays provisional.

#### Scenario: A hold sets the larger shield

- **GIVEN** Diona is the character on the field
- **WHEN** the player holds Icy Paws past the threshold
- **THEN** the paws set the larger shield on her

#### Scenario: A release before the threshold plays as a tap

- **GIVEN** Diona is the character on the field
- **WHEN** the player releases Icy Paws before the threshold
- **THEN** it plays as a tap

### Requirement: Constellation 2 shields

From constellation 2, each Icy Paws shield, whether tapped or held, SHALL be 15 percent larger.

#### Scenario: A shield at constellation 2 is larger

- **GIVEN** Diona is at constellation 2
- **WHEN** Icy Paws sets a shield on her
- **THEN** the shield is 15 percent larger than it would be otherwise

### Requirement: Signature Mix field

Signature Mix SHALL set a field of radius 7 metres round Diona that heals the active character every 2 seconds, and its six ticks of damage SHALL be dealt from the cast, and it SHALL be refused without the energy it costs.

#### Scenario: The field heals the active character

- **GIVEN** Diona has enough energy
- **WHEN** the player casts Signature Mix
- **THEN** the field starts round Diona
- **AND** the active character is healed every 2 seconds while the field stands

#### Scenario: Signature Mix is refused without enough energy

- **GIVEN** Diona has less energy than Signature Mix costs
- **WHEN** the player casts Signature Mix
- **THEN** it does not cast

### Requirement: Constellation 1 energy

From constellation 1, Signature Mix SHALL give 15 energy as its field ends.

#### Scenario: The field ends and gives energy

- **GIVEN** Diona is at constellation 1 and her Signature Mix field stands
- **WHEN** the field ends
- **THEN** 15 energy is given

### Requirement: Signature Mix cuts the ATK of the enemies it strikes from Ascension 4

From Ascension 4, each enemy Signature Mix's initial hit or one of its ticks strikes SHALL lose 10% of its ATK for 15 seconds.

#### Scenario: Drunkards' Farce weakens an enemy

- **GIVEN** Diona has reached Ascension 4
- **WHEN** Signature Mix strikes an enemy
- **THEN** that enemy strikes with 10% less ATK for 15 seconds

### Requirement: Paws deal no poise

Icy Paws' paws SHALL deal no poise, a provisional zero until the game's own values are measured.

#### Scenario: A paw deals no poise

- **GIVEN** Diona is the character on the field
- **WHEN** a paw hits an enemy
- **THEN** the enemy takes no poise damage
