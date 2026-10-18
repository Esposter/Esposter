## Purpose

Amber's kit as built: her five arrows, fully charged aimed shot, Explosive Puppet's Baron Bunny and Fiery Rain, with Ascension 1 built, Constellations 1, 4 and 6 built, and Ascension 4, Constellation 2 and the unlit Aimed Shot left out.

## Requirements

### Requirement: Amber's fully charged aimed shot is her Pyro attack and turns to the aim

Only Amber's fully charged aimed shot SHALL deal Pyro damage, under a charged attack cooldown, and while the aim key is held the shot SHALL follow the camera's direction.

#### Scenario: The aimed shot follows the camera while aiming

- **GIVEN** the aim key is held
- **WHEN** Amber fires an aimed shot
- **THEN** the shot travels along the camera's direction

#### Scenario: The aimed shot turns to its enemy when not aiming

- **GIVEN** the aim key is not held
- **WHEN** Amber fires an aimed shot
- **THEN** Amber turns to the enemy the aim is scored on

#### Scenario: Only the fully charged shot deals Pyro

- **GIVEN** Amber fires a shot that is not fully charged
- **WHEN** the shot strikes
- **THEN** it deals no Pyro damage

### Requirement: Explosive Puppet's Baron Bunny taunts and explodes where Amber stands

Baron Bunny SHALL be summoned at Amber's position with hit points set as a share of her Max HP, and SHALL taunt and then explode.

#### Scenario: The bunny explodes where Amber stands

- **GIVEN** Amber uses Explosive Puppet
- **WHEN** the bunny explodes
- **THEN** the explosion strikes enemies round Amber's body

### Requirement: Fiery Rain summons eighteen arrows over an area

Fiery Rain SHALL summon eighteen arrows that land at random points within an area round its centre.

#### Scenario: Eighteen arrows fall over the area

- **GIVEN** Amber uses Fiery Rain
- **WHEN** the summon runs
- **THEN** eighteen arrows fall at random points within its area

### Requirement: Ascension 1 adds Crit Rate and widens Fiery Rain's area

At Ascension 1 Amber SHALL gain ten percent Crit Rate, and Fiery Rain's area SHALL widen by thirty percent.

#### Scenario: Ascension 1 widens Fiery Rain

- **GIVEN** Amber is at Ascension 1
- **WHEN** Fiery Rain is cast
- **THEN** its area is thirty percent wider than at base

### Requirement: Constellation 1 second arrow

From Constellation 1, each aimed shot SHALL fire a second arrow dealing 20% of the first arrow's DMG, once per shot.

#### Scenario: Constellation 1 fires a second arrow per aimed shot

- **GIVEN** Amber has Constellation 1
- **WHEN** she fires an aimed shot that strikes opponents
- **THEN** one second arrow of 20% of the first arrow's DMG lands

#### Scenario: Below Constellation 1 no second arrow lands

- **GIVEN** Amber has Constellation 0
- **WHEN** she fires an aimed shot
- **THEN** no second arrow lands

### Requirement: Constellation 6 Movement SPD and ATK during Fiery Rain

From Constellation 6, Fiery Rain SHALL give each deployed party member 15% Movement SPD and 15% ATK for 10 seconds.

#### Scenario: Constellation 6 raises each party member's Movement SPD and ATK

- **GIVEN** Amber has Constellation 6
- **WHEN** Fiery Rain is cast
- **THEN** each deployed member has 15% Movement SPD and 15% ATK for 10 seconds

#### Scenario: Below Constellation 6 no party member gains the buff

- **GIVEN** Amber has Constellation 5
- **WHEN** Fiery Rain is cast
- **THEN** no party member gains Movement SPD or ATK
