## Purpose

The Tiled codegen pipeline, grid-engine movement, NPC interactions, chests, doors, and random encounters. The overworld is a set of tile maps the player walks across, with people to talk to, chests to open, doors to pass through, and wild monsters to meet in marked areas.

## Requirements

### Requirement: Map content is checked against the code that reads it

Map names, layer names, object groups, and object properties SHALL be turned into typed names before the game is built, so that a map edit which breaks a name or property the code relies on is caught before the game runs.

#### Scenario: A renamed map layer is caught at build time

- **GIVEN** a map layer name that the code refers to by name
- **WHEN** the layer is renamed in the map editor and the typed names are regenerated
- **THEN** code that still uses the old name fails to build

#### Scenario: Regenerated names match the current maps

- **WHEN** the typed names are regenerated after a map change
- **THEN** every map, layer, and object property the code uses is available under its typed name

### Requirement: The player moves one tile at a time

The player SHALL move across the map one tile at a time, and each NPC SHALL either stand still or walk a clockwise patrol route.

#### Scenario: A direction key moves the player one tile

- **WHEN** the player presses a direction
- **THEN** the character moves one tile in that direction

#### Scenario: A patrolling NPC walks a clockwise loop

- **GIVEN** an NPC whose movement is a patrol
- **WHEN** the NPC moves
- **THEN** it walks its route clockwise

#### Scenario: An idle NPC stays put

- **GIVEN** an NPC whose movement is idle
- **WHEN** time passes
- **THEN** the NPC stays where it is

### Requirement: Confirm acts on the object the player faces

Pressing Confirm while standing next to and facing an interactive object SHALL trigger that object's effect, and pressing it when facing nothing SHALL do nothing.

#### Scenario: Talking to an NPC plays its messages or effect

- **WHEN** the player presses Confirm facing an NPC
- **THEN** the NPC's messages play, or its effect such as healing or a scene fade takes place

#### Scenario: Reading a sign shows its message

- **WHEN** the player presses Confirm facing a sign
- **THEN** the sign's message is shown in a dialog

#### Scenario: Opening a chest grants its item

- **WHEN** the player presses Confirm facing an unopened chest
- **THEN** the chest's item is granted to the player
- **AND** the chest is marked as opened

#### Scenario: Going through a door moves the player to the linked map

- **WHEN** the player presses Confirm facing a door
- **THEN** the screen fades to the map the door leads to
- **AND** the player appears at the matching door on that map

#### Scenario: Confirm with nothing in front does nothing

- **WHEN** the player presses Confirm with no interactive object in front
- **THEN** nothing happens

### Requirement: Opened chests stay open and NPCs reset on re-entry

A chest's opened state SHALL persist with the saved run for each map, and NPC positions SHALL reset whenever the player enters a map.

#### Scenario: An opened chest stays open after saving

- **GIVEN** the player has opened a chest
- **WHEN** the player saves and returns to the game
- **THEN** that chest is still shown as opened

#### Scenario: NPCs return to their starting positions

- **GIVEN** the player has left a map after NPCs moved
- **WHEN** the player enters that map again
- **THEN** every NPC is back at its starting position

### Requirement: Encounter chance grows with steps until a battle is certain

Each step taken in an encounter area SHALL increase the chance of a wild battle, and the chance SHALL reach certainty at the step cap.

#### Scenario: Steps in an encounter area raise the chance

- **WHEN** the player takes a step in an encounter area
- **THEN** the chance of a wild battle is higher than it was before the step

#### Scenario: A battle is certain at the step cap

- **WHEN** the player has taken the maximum number of steps without a battle
- **THEN** the next step starts a wild battle

#### Scenario: A wild battle picks a monster from the area's table

- **WHEN** a wild battle starts in an encounter area
- **THEN** the monster is picked at random from that area's weighted table
- **AND** the monster appears at the level set for that area
- **AND** the screen fades into the battle

#### Scenario: A wild monster arrives stronger than its species base

- **WHEN** a wild battle starts with a monster spawned above its species' base level
- **THEN** the monster's stats are raised above its species base by the level-up rolls for each level it was spawned above base

#### Scenario: The skip-encounters setting prevents battles

- **GIVEN** the skip-encounters setting is on
- **WHEN** the player walks through an encounter area
- **THEN** no wild battle starts
