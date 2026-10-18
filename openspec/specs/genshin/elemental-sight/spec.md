## Purpose

Elemental Sight as the world plays it: a white range spreads from the character on the middle mouse button or a pad's left bumper with the left of its pad, the world mutes outside what is lit, interactable things show white, enemies show their element's colour and their name, and it ends after a short walk.

## Requirements

### Requirement: The sight spreads from the character and holds at its reach

Pressing the sight's binding SHALL spread a white range from the place the sight was turned on, growing until it holds at its reach.

#### Scenario: A press spreads a range from the character

- **GIVEN** the sight off
- **WHEN** its binding is pressed
- **THEN** a white range begins to spread from where the character stands

#### Scenario: The range holds at its reach

- **GIVEN** the range spread to its reach
- **WHEN** time passes
- **THEN** the range holds at that reach

#### Scenario: The range stays centred where the sight was turned on

- **GIVEN** the sight on
- **WHEN** the character walks
- **THEN** the range stays centred on the place the sight was turned on

### Requirement: The sight ends after a walk past its limit or on a second press

The sight SHALL end once the character walks past its walk limit from the place it was turned on, and SHALL end at once when pressed again.

#### Scenario: A walk past the limit ends the sight

- **GIVEN** the sight on
- **WHEN** the character walks past the walk limit
- **THEN** the sight ends

#### Scenario: Standing still keeps the sight on

- **GIVEN** the sight on
- **WHEN** the character stands still
- **THEN** the sight stays on

#### Scenario: A second press ends the sight wherever the character stands

- **GIVEN** the sight on
- **WHEN** its binding is pressed again
- **THEN** the sight ends at once

### Requirement: A screen over the world ends the sight

A screen opened over the world, such as the menus, the map or a talk, SHALL end the sight.

#### Scenario: Opening a menu over the world ends the sight

- **GIVEN** the sight on
- **WHEN** a menu, the map or a talk opens over the world
- **THEN** the sight ends

### Requirement: Things that cannot be acted on are dimmed within the range

Inside the range the scene SHALL keep a quarter of its brightness with its colour gone, and things outside the range SHALL be unchanged.

#### Scenario: A thing with nothing to act on is dimmed inside the range

- **GIVEN** the sight on and a thing with nothing to act on inside the range
- **WHEN** the scene is drawn
- **THEN** the thing is drawn at a quarter of its brightness with no colour

#### Scenario: A thing outside the range is unchanged

- **GIVEN** the sight on and a thing outside the range
- **WHEN** the scene is drawn
- **THEN** the thing is drawn as it would be with the sight off

### Requirement: Interactable things show white

Drops and residents within the range SHALL show lit white.

#### Scenario: A drop within the range shows white

- **GIVEN** the sight on and a drop inside the range
- **WHEN** the scene is drawn
- **THEN** the drop is lit white

### Requirement: Enemies show the colour of their element

An enemy within the range SHALL show the colour of its strongest aura's element, else its innate element, else white.

#### Scenario: An enemy with an aura shows the aura's element

- **GIVEN** the sight on and an enemy holding an aura
- **WHEN** the scene is drawn
- **THEN** the enemy shows its strongest aura's element colour

#### Scenario: An enemy with no aura shows its innate element

- **GIVEN** the sight on and an enemy with no aura and an innate element
- **WHEN** the scene is drawn
- **THEN** the enemy shows its innate element colour

#### Scenario: An enemy with no element shows white

- **GIVEN** the sight on and an enemy with no aura and no innate element
- **WHEN** the scene is drawn
- **THEN** the enemy shows white

#### Scenario: Quicken counts for no element

- **GIVEN** the sight on and an enemy holding Quicken
- **WHEN** the enemy's colour is read
- **THEN** Quicken contributes no element

### Requirement: Enemies within the range show their name

A living enemy within the range SHALL show its name over its head, and an enemy whose name the game's text does not give SHALL show no tag.

#### Scenario: A living enemy within the range shows its name

- **GIVEN** the sight on and a living enemy within the range
- **WHEN** the scene is drawn
- **THEN** the enemy's name is shown over its head

#### Scenario: An enemy with no name in the game's text shows no tag

- **GIVEN** the sight on and an enemy whose name the game's text does not give
- **WHEN** it is within the range
- **THEN** no name tag is shown

### Requirement: A thing behind a wall stays dark

An enemy's highlight SHALL show only where it is the nearest thing the scene draws, so the sight never shows through a wall.

#### Scenario: An enemy behind a wall stays muted

- **GIVEN** the sight on and an enemy within the range behind a wall
- **WHEN** the scene is drawn
- **THEN** the enemy's highlight stays muted

### Requirement: A ring marks the reach while the sight is on

A white ring SHALL mark the edge of the range while the sight is on.

#### Scenario: The ring marks the range's edge

- **GIVEN** the sight on
- **WHEN** the scene is drawn
- **THEN** a white ring marks the edge of the reach

### Requirement: A sight trail leads from the character toward its end

While Elemental Sight is on, a sight trail SHALL run on the ground from the character toward its placed end.

#### Scenario: A Seelie's court draws a trail while the sight is on

- **GIVEN** a Seelie's court is placed in the world and Elemental Sight is on
- **WHEN** the player stands in the open world
- **THEN** a trail runs from the character toward the court

#### Scenario: No trail is drawn while the sight is off

- **GIVEN** a Seelie's court is placed in the world and Elemental Sight is off
- **WHEN** the player stands in the open world
- **THEN** no trail is drawn

### Requirement: A sight trail stops at the sight's reach

A sight trail SHALL stop at the sight's reach when its end lies beyond it, and SHALL draw nothing when its end is where the character stands.

#### Scenario: An end past the reach stops the trail at the reach

- **GIVEN** a trail's end lies beyond the sight's reach
- **WHEN** Elemental Sight is on
- **THEN** the trail ends at the reach

#### Scenario: A trail whose end is where the character stands draws nothing

- **GIVEN** a trail's end is at the character's own position
- **WHEN** Elemental Sight is on
- **THEN** no trail is drawn

### Requirement: A sight trail stays bright when the sight mutes the scene

A sight trail SHALL stay white and bright while the sight mutes the rest of the scene, since white is the colour of what no element affects.

#### Scenario: A trail stays bright while the sight mutes the scene

- **GIVEN** Elemental Sight is on and the scene is muted
- **WHEN** a trail is on screen
- **THEN** the trail is drawn white and bright
