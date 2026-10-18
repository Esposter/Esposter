## Purpose

Genshin's ley line outcrops as built — each region's Blossom of Revelation and Blossom of Wealth read from the game's tables into genshin-world, opened by Adventure Rank and by a nation's unlocked area, started at a drawn section's first place and moved along the places each names. Touching, fighting and claiming them is the proposal's still.

## Requirements

### Requirement: Two kinds per region

Each region's ley line SHALL offer two outcrop kinds, the Blossom of Revelation, which gives Character EXP materials, and the Blossom of Wealth, which gives Mora.

#### Scenario: Seven cities each have both kinds

- **WHEN** the regions from Mondstadt to Snezhnaya are read
- **THEN** each has both kinds

#### Scenario: Other challenges read no kind

- **WHEN** the Dragonspine, Blitz Rush and Blossom Island refreshes are read
- **THEN** none of them yields a ley line kind

### Requirement: Opening by rank and nation

Each kind SHALL open at the Adventure Rank its game table gives, and in every region except Mondstadt and Liyue it SHALL also need a nation's area unlocked.

#### Scenario: Mondstadt's Revelation opens at rank 8

- **WHEN** a player in Mondstadt reaches Adventure Rank 8
- **THEN** the Blossom of Revelation opens

#### Scenario: Mondstadt's Wealth opens at rank 12

- **WHEN** a player in Mondstadt reaches Adventure Rank 12
- **THEN** the Blossom of Wealth opens

#### Scenario: Liyue opens both kinds at rank 18

- **WHEN** a player in Liyue reaches Adventure Rank 18
- **THEN** both kinds open with no area condition

#### Scenario: Other regions wait for a nation's area

- **GIVEN** no nation's area is unlocked in Inazuma
- **WHEN** a player in Inazuma reaches Adventure Rank 18
- **THEN** its kinds stay closed

### Requirement: Start at a drawn section's first place

Each kind SHALL start, each daily draw, at the lowest numbered place of a section drawn at random from its region's sections.

#### Scenario: Draw starts each kind

- **WHEN** the daily draw runs for a region with sections
- **THEN** each kind starts at the lowest numbered place of a drawn section

#### Scenario: Region without sections

- **WHEN** the daily draw runs for Fontaine, Natlan or Snezhnaya
- **THEN** no outcrop starts

### Requirement: Moving on along the named places

A claimed outcrop SHALL move to the next place its place names, or to the place after when the other kind stands there, and SHALL stay where it is when neither is free or no next place is named.

#### Scenario: Next place is free

- **WHEN** an outcrop is claimed and its next place is free
- **THEN** it moves to that place

#### Scenario: Other kind stands at the next place

- **WHEN** an outcrop is claimed and the other kind stands at its next place
- **THEN** it moves to the place after that

#### Scenario: Neither place is free

- **WHEN** an outcrop is claimed and neither its next place nor the place after is free
- **THEN** it stays where it is until the daily reset

### Requirement: Daily reset at 04:00

The outcrops SHALL start over at the daily reset at 04:00 in the game's day.

#### Scenario: Reset starts the kinds over

- **WHEN** the game's day reaches 04:00
- **THEN** each kind starts over

### Requirement: Not yet placed in the world

Ley line outcrops SHALL not be placed, fought or claimed in the world yet.

#### Scenario: Entering a region

- **WHEN** a player enters a region with ley line kinds
- **THEN** no outcrop is drawn and no claim is offered
