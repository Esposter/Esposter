## Purpose

The login door, as built: it forms at the walkway's far end as the glide carries it, lights when clicked, and the camera rushes to it as the screen whitens. The click waits until the door has formed.

## Requirements

### Requirement: Door rises as the glide carries it

The door SHALL rise on the walkway's far copy as the glide carries that copy within reach, with its blocks and the door moving exactly as the glide moves.

#### Scenario: Far copy comes within reach

- **WHEN** the glide carries the walkway's far copy within reach of the door
- **THEN** the door rises on that copy

### Requirement: Door forms from 13 pieces

The door SHALL be built from 13 pieces, each rising from about 6 metres below into place, the first settling after 0.4 seconds and the last after 1.33 seconds, and it SHALL count as formed once the last piece has settled.

#### Scenario: Pieces settle

- **WHEN** the door rises
- **THEN** its pieces settle between 0.4 and 1.33 seconds
- **AND** the door is formed once the last piece settles

### Requirement: Door not drawn until it rises

The door SHALL be drawn at no size until it rises.

#### Scenario: Door waits to rise

- **WHEN** the login scene loads before the door is due
- **THEN** the door is not visible

### Requirement: Click waits for the formed door

A click SHALL open the door only once the door has formed, and a click made while the door is still rising SHALL be missed.

#### Scenario: Click while rising

- **WHEN** the player clicks while the door is still rising
- **THEN** the click is missed

#### Scenario: Click after forming

- **WHEN** the player clicks a formed door
- **THEN** the door lights and the four corner buttons appear 0.3 seconds later

### Requirement: Camera rush to the door

When the door is clicked, the camera SHALL close 41% of its distance to the door in the first third of a second, gathering speed as it goes, and SHALL stop short of the door under the white.

#### Scenario: Click rushes the camera

- **WHEN** the player clicks the formed door
- **THEN** the camera closes 41% of its distance to the door in the first third of a second
- **AND** it stops short of the door under the white

### Requirement: Door lights from its middle

The door SHALL light from its middle, with a bright line down its panel over a glow across the whole door.

#### Scenario: Door lights on click

- **WHEN** the door is clicked
- **THEN** a bright line runs down its panel over a glow across the door

#### Scenario: Line rides a piece's rise

- **WHEN** a piece of the door rises
- **THEN** the line on that piece sits on its own slit, carried with the piece's lift, not on the door's rest x

### Requirement: Door casts no shadow

The door SHALL cast no shadow onto the walkway.

#### Scenario: Scene is lit

- **WHEN** the scene is lit
- **THEN** the door casts no shadow
