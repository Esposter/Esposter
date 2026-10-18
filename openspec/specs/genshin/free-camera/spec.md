## Purpose

The free camera, flown over the continent with the keyboard, the mouse and a gamepad's sticks from wherever the follow camera left the view, which the tuning panel mounts in photo mode. Its input is read once a frame and its look turns once a frame, its motion runs in fixed steps ahead of the floating origin's shift, and it is held above the ground and the water's surface.

## Requirements

### Requirement: The free camera starts from the follow camera's view

The free camera SHALL start from the view the follow camera left when photo mode mounts it, and SHALL be removed when photo mode is left.

#### Scenario: Free camera starts where the follow camera left the view

- **GIVEN** photo mode is active under the tuning panel
- **WHEN** the free camera is mounted
- **THEN** it starts from the view the follow camera left

#### Scenario: Leaving photo mode removes the free camera

- **GIVEN** the free camera is mounted
- **WHEN** the player leaves photo mode
- **THEN** the free camera is removed

### Requirement: Keys move the free camera over the ground and up and down

The free camera SHALL move forward, back, left and right with W, S, A and D, and up and down with Space and Shift, and a pair of opposing keys held together SHALL cancel.

#### Scenario: W moves the camera forward

- **GIVEN** the free camera is in the world
- **WHEN** the player holds W
- **THEN** the camera moves forward over the ground

#### Scenario: Space rises and Shift falls

- **GIVEN** the free camera is in the world
- **WHEN** the player holds Space and then Shift
- **THEN** the camera rises while Space is held and falls while Shift is held

#### Scenario: Opposing keys held together cancel

- **GIVEN** the free camera is in the world
- **WHEN** the player holds W and S together
- **THEN** the camera does not move forward or back

### Requirement: Mouse click locks the pointer and the locked pointer turns the look

A click on the canvas SHALL lock the pointer, and while it is locked the pointer's movement SHALL turn the look.

#### Scenario: Click on the canvas turns the look with the pointer

- **GIVEN** the pointer is free over the canvas
- **WHEN** the player clicks the canvas and moves the pointer
- **THEN** the pointer is locked and its movement turns the look

### Requirement: The gamepad's left stick moves and its right stick turns the look

The first connected gamepad's left stick SHALL move the free camera and its right stick SHALL turn the look at two and a half radians a second, each with a dead zone at the stick's centre.

#### Scenario: Left stick moves the camera over the ground

- **GIVEN** a gamepad is connected
- **WHEN** the player pushes the left stick away from its centre
- **THEN** the camera moves over the ground in that direction

#### Scenario: Right stick turns the look at a fixed rate

- **GIVEN** a gamepad is connected
- **WHEN** the player holds the right stick away from its centre
- **THEN** the look turns at two and a half radians a second

#### Scenario: Stick inside its dead zone does nothing

- **GIVEN** a gamepad is connected
- **WHEN** a stick rests within its dead zone
- **THEN** the camera does not move or turn

### Requirement: Touch moves and looks under the thumbs

On a touch screen a stick under the left thumb SHALL move the camera, a drag on the right half SHALL turn the look, and a button SHALL rise.

#### Scenario: Left thumb stick moves and right drag looks

- **GIVEN** a touch screen is in use
- **WHEN** the player moves a stick under the left thumb and drags on the right half
- **THEN** the camera moves with the stick and turns with the drag

#### Scenario: Touch button rises

- **GIVEN** a touch screen is in use
- **WHEN** the player presses the rise button
- **THEN** the camera rises

### Requirement: Motion is per second and the mouse look is per pixel

The free camera's motion SHALL be per second, so a key held for the same time moves it the same distance at any frame rate, and the mouse look SHALL turn by a fixed angle for each pixel the pointer moves.

#### Scenario: Same key time moves the same distance at any frame rate

- **GIVEN** a key is held for one second
- **WHEN** the frame rate is high or low
- **THEN** the camera moves the same distance

#### Scenario: Mouse look turns by a fixed angle per pixel

- **GIVEN** the pointer is locked
- **WHEN** the pointer moves a number of pixels
- **THEN** the look turns by a fixed angle for each pixel moved

### Requirement: The camera is never held below the ground or the water's surface

The free camera's height SHALL be raised, after each step, to the higher of the ground's height at its place and the water's level, plus a clearance.

#### Scenario: Camera over the ground is held above it

- **GIVEN** the camera moves low over the ground
- **WHEN** its step ends
- **THEN** its height is raised above the ground at its place

#### Scenario: Camera over water is held above the water's surface

- **GIVEN** the camera moves low over water
- **WHEN** its step ends
- **THEN** its height is raised above the water's level

### Requirement: Pitch is clamped so the view never flips

The look's pitch SHALL be clamped short of straight up and straight down so the view never flips.

#### Scenario: Looking straight up stops short of the top

- **GIVEN** the player turns the look upward
- **WHEN** the pitch reaches its limit
- **THEN** the view stops short of straight up and does not flip

### Requirement: Speed grows with the camera's height above the ground

The free camera's motion speed SHALL grow with its height above the ground, so a crossing takes seconds and a slow pass over grass stays slow.

#### Scenario: Higher camera moves faster

- **GIVEN** the camera is high above the ground
- **WHEN** the player moves it forward
- **THEN** it covers more ground per second than when it is low

### Requirement: A screen holding the world stops the free camera

While a screen holds the world, the free camera SHALL neither look nor move.

#### Scenario: Open screen freezes the camera

- **GIVEN** a screen holds the world
- **WHEN** the player moves the input
- **THEN** the camera neither looks nor moves

### Requirement: Losing focus releases every held key

Losing focus SHALL release every key held, since their releases never reach the page.

#### Scenario: Focus lost while moving releases the keys

- **GIVEN** the player holds a movement key
- **WHEN** the page loses focus
- **THEN** every held key is released and the camera stops moving
