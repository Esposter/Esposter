## Purpose

The world's map on M, and the jumps it makes. The game's open map at full screen: one drawing of the catalogue (the outlines of its filled areas and every unlocked landmark a jump lands at) placed on the player, north up, with each area's name, the player as a pointer, and the game's close button and zoom slider, which the map is dragged to pan and the wheel or the slider zooms. Choosing a landmark, on the map or in the keyboard's jump list, fades the world to the loading screen, places the view in front of it facing it, and fades back in.

## Requirements

### Requirement: M opens the full-screen map

M SHALL open the full-screen map over the held world, hiding the HUD, and M, Escape or the map's close button SHALL close it.

#### Scenario: Opening the map

- **WHEN** the player presses M
- **THEN** the full-screen map opens and the HUD is hidden

#### Scenario: Closing the map

- **WHEN** the player presses Escape while the map is open
- **THEN** the map closes back to the world

### Requirement: Map drawing placed on the player

The map SHALL draw the filled areas' outlines and the unlocked landmarks north up, with the player's pointer placed on the player, and each filled area's name at the middle of its outline.

#### Scenario: Map shows the player's place

- **WHEN** the map is open
- **THEN** the drawing is placed north up with the player's pointer on the player

#### Scenario: Blank area

- **WHEN** an area has no unlocked statue standing in it
- **THEN** the area is blank on the map

### Requirement: Pan and zoom

Dragging SHALL pan the map by the metres its pixels cover, and the wheel and the zoom slider SHALL zoom it on a logarithmic track between the map's view limits.

#### Scenario: Drag pans the view

- **WHEN** the player drags the map
- **THEN** the view moves by the metres the drag covers at the shown zoom

#### Scenario: Wheel zooms

- **WHEN** the player turns the wheel on the map
- **THEN** the view zooms by one notch along the track

#### Scenario: Drag does not choose a landmark

- **WHEN** a drag travels beyond the drag threshold and ends on a landmark
- **THEN** that landmark is not chosen

### Requirement: Choosing a landmark jumps the character

Choosing a landmark on the map or in the jump list SHALL fade the screen to the loading screen's pale grey, place the character in front of the landmark facing it, and fade back in.

#### Scenario: Jump to a statue

- **WHEN** the player chooses a statue on the map
- **THEN** the screen fades to pale grey, the character is placed in front of the statue facing it, and the screen fades back in

#### Scenario: Cross-region fade durations

- **WHEN** a cross-region jump fades
- **THEN** the fade out takes 801 milliseconds and the fade in takes 200 milliseconds

### Requirement: Arrival stands in front of the landmark

A jump SHALL arrive a fixed distance in front of the landmark, facing back at it, clear of the statue's plinth.

#### Scenario: Arrival view

- **WHEN** the character arrives at a landmark
- **THEN** it stands in front of the landmark facing back at it

### Requirement: Jump list for the keyboard and screen readers

The jump list SHALL be visually hidden and reachable by keyboard and screen readers, each landmark a button named by its area and kind, grouped under its region's name.

#### Scenario: Keyboard reaches a jump

- **WHEN** a keyboard user moves through the map's jump list
- **THEN** each landmark is a button named by its area and kind, grouped by region

### Requirement: Every region's landmarks read once

The map SHALL offer the jump landmarks of every region, and a region whose data fails to load SHALL be logged and left off the map.

#### Scenario: Region fails to load

- **WHEN** a region's data fails to load
- **THEN** the failure is logged and that region's landmarks are left off the map

### Requirement: Only statues are jump landmarks

Only Statues of The Seven SHALL be jump landmarks, and a tree SHALL never be a jump, with Teleport Waypoints joining once the regions' data holds them.

#### Scenario: Tree in a region

- **WHEN** a tree is in a region's data
- **THEN** it is not offered as a jump
