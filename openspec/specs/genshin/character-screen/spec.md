## Purpose

The game's character screen on C, its layout measured off the English client's own frame at 21:9 — the player's characters across the top, the six tabs down the left in the game's words, and the chosen character's Attributes panel down the right with its level and attributes by group from the game's own sums. Its look is provisional until its passes measure it. A frame in genshin-interface knows no words or data; the world's screen fills it.

## Requirements

### Requirement: The character screen opens over the world and closes on cancel

The character screen SHALL open over the held world with C or from the Paimon menu, and SHALL close with Escape, a pad's cancel or C again.

#### Scenario: C opens the screen on the character on the field

- **GIVEN** the player is in the open world
- **WHEN** C is pressed
- **THEN** the character screen opens over the held world
- **AND** it shows the character on the field on the Attributes tab

#### Scenario: Paimon menu opens the screen

- **GIVEN** the Paimon menu is open
- **WHEN** Character is chosen
- **THEN** the character screen opens

#### Scenario: Escape, cancel or C closes the screen

- **GIVEN** the character screen is open
- **WHEN** Escape, the pad's cancel or C is pressed
- **THEN** the screen closes back to the world

### Requirement: Characters are listed across the top and chosen by name

The screen SHALL list the player's characters across its top, each named, and SHALL show the chosen character's name at its top left.

#### Scenario: Choosing a character in the top row

- **GIVEN** the screen lists the player's characters
- **WHEN** a character is chosen
- **THEN** that character becomes the chosen one
- **AND** its name is shown at the top left
- **AND** the open tab's panel shows that character

#### Scenario: Roster names are the game's own

- **GIVEN** a character appears in the roster
- **WHEN** its name is shown
- **THEN** the name is the game's own name for that character

### Requirement: Six tabs down the left in the game's order

The screen SHALL show six tabs down its left in the game's order, Attributes, Weapons, Artifacts, Constellation, Talents and Profile, each named in the game's own words, with the open tab lit.

#### Scenario: Attributes is lit when the screen opens

- **GIVEN** the character screen opens
- **WHEN** its tabs are shown
- **THEN** the tabs read Attributes, Weapons, Artifacts, Constellation, Talents and Profile from top to bottom
- **AND** the Attributes tab is lit

#### Scenario: Choosing a tab opens its panel

- **GIVEN** the character screen is open
- **WHEN** a tab is chosen
- **THEN** that tab is lit
- **AND** its panel replaces the panel of the previous tab

### Requirement: The Attributes tab shows level, attributes by group and the game's sums

The Attributes tab SHALL show the character's name, its level over its phase's cap, its experience bar, and its attributes by group, each taken from the game's own sums.

#### Scenario: Base five attributes shown whole

- **GIVEN** the Attributes tab is open for a character
- **WHEN** the panel is read
- **THEN** Max HP, ATK, DEF, Elemental Mastery and Max Stamina are shown as whole numbers

#### Scenario: Advanced attributes shown as percentages

- **GIVEN** the Attributes tab is open
- **WHEN** the advanced group and each element's DMG Bonus are read
- **THEN** each is shown as a percentage to one decimal place under its title

#### Scenario: Level shown over its phase's cap

- **GIVEN** a character is at its phase's level cap
- **WHEN** the Attributes tab is shown
- **THEN** its level is shown over that cap

### Requirement: Weapons, Artifacts, Constellation and Talents panels show the character's own record

Each of the Weapons, Artifacts, Constellation and Talents panels SHALL show the chosen character's own weapon, worn artifacts, activated constellations or talent levels.

#### Scenario: Weapons panel shows the weapon at its level and phase

- **GIVEN** the Weapons tab is open for a character
- **WHEN** the panel is read
- **THEN** it shows the character's weapon's name, rarity, base ATK and secondary attribute at its level and phase
- **AND** its refinement rank and ascension phase

#### Scenario: Artifacts panel shows the five slots in order

- **GIVEN** the Artifacts tab is open
- **WHEN** the panel is read
- **THEN** the five slots are listed in the game's order
- **AND** each shows whether an artifact is worn in it

#### Scenario: Constellation panel lights the activated constellations

- **GIVEN** the Constellation tab is open for a character
- **WHEN** the panel is read
- **THEN** six rings are shown
- **AND** only the activated constellations are lit

#### Scenario: Talents panel shows the three combat talent levels

- **GIVEN** the Talents tab is open for a character
- **WHEN** the panel is read
- **THEN** it shows the levels of the normal attack, the Elemental Skill and the Burst

### Requirement: Labels without decoded game text are left off

The screen SHALL leave out any label whose game text has not been decoded yet, rather than write a word of its own in its place.

#### Scenario: Undecoded label is not drawn

- **GIVEN** a panel's label has no decoded game text
- **WHEN** the panel is shown
- **THEN** that label is not drawn
