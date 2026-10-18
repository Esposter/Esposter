## Purpose

Ningguang's kit as built: two strikes, a charged attack, her Star Jades, Jade Screen with Starshatter's gems, and Shock Effect's reset, with Strategic Reserve and the screen's endurance not built.

## Requirements

### Requirement: Ningguang's alternating strikes

Ningguang's two strikes SHALL alternate between Left and Twirl, each landing two gems on the enemies within reach.

#### Scenario: Strikes alternate

- **WHEN** the player uses normal attack twice in a row
- **THEN** the first strike is Left and the second is Twirl
- **AND** each strike lands two gems on the enemies within reach

### Requirement: Star Jades

A strike whose gem strikes an enemy SHALL give Ningguang a Star Jade, up to three, and the Star Jades SHALL be lost when she leaves the field.

#### Scenario: Gem hit gives a Star Jade

- **GIVEN** Ningguang holds fewer than three Star Jades
- **WHEN** a strike's gem strikes an enemy
- **THEN** Ningguang gains one Star Jade

#### Scenario: Star Jades stop at three

- **GIVEN** Ningguang holds three Star Jades
- **WHEN** another gem strikes an enemy
- **THEN** she still holds three Star Jades

#### Scenario: Leaving the field loses the jades

- **GIVEN** Ningguang holds Star Jades
- **WHEN** she leaves the field
- **THEN** the Star Jades are lost

### Requirement: Charged attack fires the Star Jades

Ningguang's charged attack SHALL fire a shot for every Star Jade she holds, beside its own gem, and spend them.

#### Scenario: Charged attack spends the jades

- **GIVEN** Ningguang holds two Star Jades
- **WHEN** the player uses the charged attack
- **THEN** a shot is fired for each jade beside its own gem
- **AND** the jades are spent

### Requirement: Jade Screen

Jade Screen SHALL place a screen 3 metres ahead of Ningguang for 30 seconds, whose hit deals Geo damage in a 5-metre circle round the screen, and recasting it SHALL shatter the standing screen.

#### Scenario: Skill places the screen

- **WHEN** the player presses Jade Screen
- **THEN** a screen is placed 3 metres ahead of Ningguang for 30 seconds
- **AND** the screen's hit deals Geo damage in a 5-metre circle round it

#### Scenario: Recast shatters the standing screen

- **GIVEN** a screen is standing
- **WHEN** the player presses Jade Screen again
- **THEN** the standing screen shatters

### Requirement: Starshatter's gems

Starshatter SHALL cast six gems and, when a screen is standing, shatter it into six more gems.

#### Scenario: Burst casts gems

- **WHEN** the player casts Starshatter
- **THEN** six gems are cast

#### Scenario: Burst shatters a standing screen

- **GIVEN** a screen is standing
- **WHEN** the player casts Starshatter
- **THEN** the screen shatters into six more gems

### Requirement: Shock Effect from two constellations

From two constellations, a shatter SHALL reset a running skill cooldown and stand as a six-second field.

#### Scenario: Shatter resets the skill cooldown

- **GIVEN** Ningguang has two or more constellations and her skill is on cooldown
- **WHEN** a shatter occurs
- **THEN** the skill cooldown is reset
- **AND** the reset field stands six seconds

### Requirement: Grandeur Be the Seven Stars from six constellations

From six constellations, Starshatter SHALL set her Star Jades to seven, which strikes do not add to, and a charged attack SHALL fire all seven.

#### Scenario: Seven jades from Starshatter

- **GIVEN** Ningguang has six or more constellations
- **WHEN** the player casts Starshatter
- **THEN** she holds seven Star Jades

### Requirement: Backup Plan from Ascension 1

From Ascension 1, Backup Plan's free charged attack SHALL take effect.

#### Scenario: Free charged attack

- **GIVEN** Ningguang has Ascension 1
- **WHEN** the player uses the charged attack
- **THEN** the free charged attack applies

### Requirement: Unbuilt Ningguang effects

Strategic Reserve, the screen's endurance, Exquisite be the Jade and Outshining All Beneath SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Ningguang has one of these effects unlocked
- **WHEN** the player fights with Ningguang
- **THEN** that effect has no effect
