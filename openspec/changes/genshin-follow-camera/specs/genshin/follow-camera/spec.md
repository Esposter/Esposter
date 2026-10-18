## ADDED Requirements

### Requirement: The wheel moves the eye by a measured step within the game's range

A wheel notch SHALL move the eye by the measured distance per notch, and the wheel SHALL stop at the game's nearest and furthest distances.

#### Scenario: Turning the wheel one notch moves the eye one step

- **GIVEN** the player stands on flat ground
- **WHEN** the player turns the wheel in one notch
- **THEN** the eye moves by the measured step for one notch

#### Scenario: The wheel stops at the nearest and furthest distances

- **GIVEN** the eye is at the game's nearest distance
- **WHEN** the player turns the wheel further in
- **THEN** the eye stays at the nearest distance

### Requirement: The eye eases back out after a pull-in

After the camera is pulled in by the ground, the eye SHALL ease back out at the measured rate once the character walks away.

#### Scenario: The eye eases back after a pull-in

- **GIVEN** the character has walked into a wall and the camera is pulled in
- **WHEN** the character walks away from the wall
- **THEN** the eye eases back out over the measured time

### Requirement: A reset returns the camera to the game's default elevation

A camera reset SHALL level or tilt the camera to the game's default elevation, and tilting SHALL stop at the game's pitch limits.

#### Scenario: Reset returns the camera to the default elevation

- **GIVEN** the camera has been turned away from the default elevation
- **WHEN** the player resets the camera with the middle mouse button
- **THEN** the camera returns to the game's default elevation

#### Scenario: Tilting stops at the game's pitch limits

- **GIVEN** the camera is tilted toward straight down
- **WHEN** the player keeps tilting
- **THEN** the pitch stops at the game's limit

### Requirement: The camera takes its sensitivity and default distance from Settings

The camera SHALL take its horizontal and vertical sensitivity and its default distance from the Settings screen, and SHALL return to its default distance after a zoom, after combat and after a teleport.

#### Scenario: Sensitivity from Settings sets the turn speed

- **GIVEN** the player has set the horizontal sensitivity in Settings
- **WHEN** the player turns the camera horizontally
- **THEN** the camera turns at that sensitivity

#### Scenario: Zoom, combat or a teleport returns the camera to its default distance

- **GIVEN** the camera has been zoomed away from its default distance
- **WHEN** the player zooms, enters combat or teleports
- **THEN** the camera returns to its default distance set in Settings

### Requirement: Pitch follows the slope only when Settings turns it on

The camera's pitch SHALL follow the slope as the character climbs or descends only when Settings turns that on.

#### Scenario: Pitch follows the slope when enabled

- **GIVEN** the slope pitch setting is on
- **WHEN** the character climbs a slope
- **THEN** the camera's pitch follows the slope

#### Scenario: Pitch stays level when disabled

- **GIVEN** the slope pitch setting is off
- **WHEN** the character climbs a slope
- **THEN** the camera's pitch does not follow the slope

### Requirement: Photo mode moves the camera within the game's range

Photo mode's horizontal and vertical sliders and its zoom SHALL move the camera within the game's range.

#### Scenario: Photo mode's sliders reach their ends

- **GIVEN** photo mode is open over a framed spot
- **WHEN** the player moves each slider to both of its ends
- **THEN** the camera reaches the game's end position of each slider

#### Scenario: Photo mode's zoom stops at its nearest and furthest

- **GIVEN** photo mode is open over a framed spot
- **WHEN** the player zooms past the nearest or furthest distance
- **THEN** the zoom stops at that distance
