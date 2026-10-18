## Purpose

Amber's kit as built: her five arrows, fully charged aimed shot, Explosive Puppet's Baron Bunny and Fiery Rain, with Ascension 1 built and Ascension 4 and the unlit Aimed Shot left out.

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
