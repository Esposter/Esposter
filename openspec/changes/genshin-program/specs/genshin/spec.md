## ADDED Requirements

### Requirement: The Genshin world replaces the console's voxel world

The agent console's Genshin page SHALL show the Genshin world in place of the voxel world, with no voxel option offered.

#### Scenario: The Genshin page opens the Genshin world

- **GIVEN** the reader opens the Genshin page of the agent console
- **WHEN** the page loads
- **THEN** the Genshin world is shown
- **AND** no voxel world or voxel option is offered

### Requirement: Console sessions keep working over the Genshin world

The agent console's Claude sessions SHALL remain reachable and usable while the Genshin world is shown.

#### Scenario: A console session stays reachable over the world

- **GIVEN** a Claude session is running in the agent console
- **WHEN** the reader views the Genshin world
- **THEN** the session remains reachable from the console
- **AND** its messages continue to arrive

### Requirement: The recreation is labelled as an unofficial fan work

The Genshin world's pages SHALL label the recreation as an unofficial, non-commercial fan work that does not present itself as HoYoverse's.

#### Scenario: The world's page carries the fan-made label

- **GIVEN** the reader opens the Genshin world's page
- **WHEN** the page loads
- **THEN** the page states that the recreation is an unofficial, non-commercial fan work
- **AND** the page does not claim to be HoYoverse's product

### Requirement: The app serves no game asset

The app SHALL serve no model, texture, sound or image file taken from the game, and its geometry and textures SHALL be generated from parameters and procedural nodes.

#### Scenario: A visitor cannot retrieve a game asset from the app

- **GIVEN** the app is deployed
- **WHEN** a visitor requests the files the world draws from
- **THEN** no file taken from the game is served

#### Scenario: The world's geometry is generated rather than loaded

- **GIVEN** the world is shown
- **WHEN** a region is drawn
- **THEN** its geometry is generated in the app from parameters
- **AND** its textures are procedural

### Requirement: Characters are drawn only from an official model the reader holds

A character SHALL be drawn only from an official HoYoverse model that the reader holds, and the app SHALL serve that model to no one but the reader who supplied it.

#### Scenario: A reader with the official model sees the character drawn

- **GIVEN** the reader holds an official model for a character
- **WHEN** the character is shown in the world
- **THEN** the character is drawn from that model

#### Scenario: A reader without the official model sees no character

- **GIVEN** the reader does not hold an official model for a character
- **WHEN** the character is shown in the world
- **THEN** the character is not drawn
- **AND** the rest of the world still works

### Requirement: A region is laid out from the game's own terrain

Each region SHALL be laid out from the game's own terrain tiles and streaming records, and fitted against the game's own exports.

#### Scenario: A region's layout matches its game's terrain

- **GIVEN** a region has been rebuilt from its game data
- **WHEN** the player views the region from its reference camera
- **THEN** its layout matches the game's reference of that view

### Requirement: A pass is accepted only by its score

A recreation pass SHALL be accepted only when its frame scores within its gate against the game's references.

#### Scenario: A pass is accepted when its frame scores within its gate

- **GIVEN** a pass's frame has been scored against its game references
- **WHEN** the score is within the pass's gate
- **THEN** the pass is accepted and frozen

#### Scenario: A frame outside its gate is not accepted

- **GIVEN** a pass's frame has been scored against its game references
- **WHEN** the score misses the pass's gate
- **THEN** the pass is not accepted
- **AND** the pass stays open for another round

### Requirement: The world's frame cost follows what the camera sees

The world's per-frame cost SHALL depend on what the camera can see, and SHALL NOT grow with the size of the whole continent.

#### Scenario: Regions out of view do not raise the frame cost

- **GIVEN** the camera views a fixed area of the world
- **WHEN** further regions lie beyond the camera's view
- **THEN** the frame cost of the view does not change

### Requirement: The world is single-player with no payment or branding

The Genshin world SHALL show only the reader's own world, with no other player present, no payment offered and no HoYoverse branding in its chrome.

#### Scenario: Another player is not shown in the world

- **GIVEN** the reader is in the Genshin world
- **WHEN** the reader looks across the world
- **THEN** no other player is shown

#### Scenario: The world's chrome shows no payment or HoYoverse mark

- **GIVEN** the reader is in the Genshin world
- **WHEN** the reader views the world's interface
- **THEN** no payment is offered
- **AND** no HoYoverse branding is shown
