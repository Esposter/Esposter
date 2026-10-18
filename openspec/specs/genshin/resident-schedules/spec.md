## Purpose

The world's residents keep the game's day and night. Each resident has a day spot, from six in the morning to seven at night, and a night spot, or else keeps the day spot through the night; a resident the game shows only by day is marked absent at night. The clock picks the spot at each frame, and a change of spot waits while the resident is in view, so nobody is seen to jump at the turn of the hour.

## Requirements

### Requirement: Residents keep a day spot and a night spot by the clock

Each resident SHALL stand at its day spot from six in the morning to seven at night, and at its night spot for the rest of the day.

#### Scenario: A resident is at the day spot at noon

- **GIVEN** a resident has a day spot and a night spot
- **WHEN** the world's clock reads noon
- **THEN** the resident stands at its day spot

#### Scenario: A resident is at the night spot after dark

- **GIVEN** a resident has a day spot and a night spot
- **WHEN** the world's clock reads midnight
- **THEN** the resident stands at its night spot

#### Scenario: A resident with no night spot keeps its day spot through the night

- **GIVEN** a resident has a day spot and no night spot
- **WHEN** the world's clock reads midnight
- **THEN** the resident stays at its day spot

### Requirement: A resident absent at night is neither shown nor offered

A resident marked absent at night SHALL NOT be shown, offered as a talk or pointed at by a quest marker while it is night.

#### Scenario: An absent resident is hidden at night

- **GIVEN** a resident is marked absent at night
- **WHEN** the world's clock reads midnight
- **THEN** the resident is not shown in the world

#### Scenario: An absent resident gives no talk prompt or quest marker at night

- **GIVEN** a resident is marked absent at night
- **AND** the player stands near where the resident stood by day
- **WHEN** it is night
- **THEN** no talk prompt is offered for the resident
- **AND** a quest marker does not point at the resident

#### Scenario: A resident with no day spot is absent by day

- **GIVEN** a resident has a night spot and no day spot
- **WHEN** the world's clock reads noon
- **THEN** the resident is not shown in the world

### Requirement: A change of spot waits while the resident is in view

A resident SHALL keep the spot it stands at while that spot is due to change and the resident is in view, and SHALL move once the resident is out of view.

#### Scenario: The hour turns while a resident is in view

- **GIVEN** a resident is in view at its day spot
- **WHEN** the hour turns so that its night spot is due
- **THEN** the resident stays at its day spot while it remains in view

#### Scenario: The resident moves once it is out of view

- **GIVEN** a resident's spot is due to change
- **WHEN** the resident is out of view
- **THEN** the resident moves to the spot the clock gives

#### Scenario: A resident appearing or disappearing at the turn does so out of view

- **GIVEN** a resident is due to appear or disappear at the turn of the hour
- **WHEN** the turn happens while the resident is in view
- **THEN** the resident keeps its current state until it is out of view

### Requirement: Residents are generated from the scene's own records

An operator generating the residents SHALL place each named NPC that has a talk once per fitted region, and SHALL leave out any NPC with no name or no talk.

#### Scenario: An NPC placed more than once in a region is kept once

- **GIVEN** an NPC is placed more than once in the same region
- **WHEN** the residents are generated
- **THEN** only its first place is kept as its day spot

#### Scenario: An NPC with no talk is left out and counted

- **GIVEN** an NPC has neither a name nor a talk
- **WHEN** the residents are generated
- **THEN** the NPC is left out of the region's residents
- **AND** the omission is counted in the generation's report

#### Scenario: A place outside every fitted region is left out

- **GIVEN** an NPC's place is not within reach of a fitted region
- **WHEN** the residents are generated
- **THEN** the NPC is left out of every region
