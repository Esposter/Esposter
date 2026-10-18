## Purpose

Thoma's kit as built: Blazing Blessing's hit, shield and Pyro infusion, and Crimson Ooyoroi's initial hit with its Fiery Collapses and their shield, with Flaming Assault from Ascension 4, and his Ascension 1 passive and his constellations left unbuilt.

## Requirements

### Requirement: Thoma's strikes, charged attack and plunges

Thoma's four strikes and charged attack SHALL land on the enemies within reach, and his collision and two plunges SHALL land 0.4 seconds after they start.

#### Scenario: Four strikes in sequence

- **WHEN** the player uses normal attack four times in a row
- **THEN** the four strikes land in order on the enemies within reach

#### Scenario: Plunge lands 0.4 seconds in

- **WHEN** the player starts a plunge attack
- **THEN** the plunge lands 0.4 seconds after it starts

### Requirement: Blazing Blessing

Blazing Blessing SHALL deal its hit, set a shield from a share of Thoma's Max HP plus a flat amount, and infuse Thoma with Pyro for 30 frames, and a recast SHALL replace the shield he holds.

#### Scenario: Skill sets the shield and infusion

- **WHEN** the player presses Blazing Blessing
- **THEN** its hit lands
- **AND** a shield of a share of Thoma's Max HP plus a flat amount is set
- **AND** Thoma is infused with Pyro for 30 frames

#### Scenario: Recast replaces the shield

- **GIVEN** Blazing Blessing's shield is standing
- **WHEN** the player presses Blazing Blessing again
- **THEN** the new shield replaces the old one

### Requirement: Crimson Ooyoroi and Fiery Collapse

Crimson Ooyoroi SHALL stand as a summon for 15 seconds, and each normal attack the active character starts SHALL set off a Fiery Collapse at most once a second, a box 4.5 metres wide and 8 metres long dealing 1 unit of Pyro at 11 frames.

#### Scenario: Normal attack sets off a Fiery Collapse

- **GIVEN** Crimson Ooyoroi is standing
- **WHEN** the active character starts a normal attack
- **THEN** a Fiery Collapse lands 11 frames later in the 4.5-by-8-metre box

#### Scenario: Collapses come at most once a second

- **GIVEN** a Fiery Collapse has just been set off
- **WHEN** another normal attack starts within one second
- **THEN** no second Fiery Collapse is set off

### Requirement: Fiery Collapse shield

The first enemy a Fiery Collapse strikes SHALL give the team a shield of a share of Thoma's Max HP plus a flat amount, stacked onto the shield already standing up to the most Blazing Blessing's shield may hold, for 8 seconds.

#### Scenario: Shield stacks up to the cap

- **GIVEN** a shield from Blazing Blessing is standing
- **WHEN** a Fiery Collapse strikes its first enemy
- **THEN** the team's shield grows by the collapse's amount
- **AND** the shield stops at the most Blazing Blessing's shield may hold

### Requirement: A Fiery Collapse adds a share of Thoma's Max HP to its DMG from Ascension 4

From Ascension 4, each Fiery Collapse SHALL add 2.2% of Thoma's Max HP to its base DMG.

#### Scenario: Flaming Assault raises a Fiery Collapse

- **GIVEN** Thoma has reached Ascension 4 and Crimson Ooyoroi stands
- **WHEN** a Fiery Collapse strikes
- **THEN** its base DMG gains 2.2% of Thoma's Max HP

### Requirement: Unbuilt Thoma effects

Thoma's Ascension 1 passive, his constellations and Fiery Collapse on a shielded character's damage SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Thoma has his Ascension 1 passive or a constellation unlocked
- **WHEN** the player fights with Thoma
- **THEN** that effect has no effect
