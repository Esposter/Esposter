## Purpose

The third-person camera behind the character, as the game's follows its own — an orbit round a pivot above the body, turned by the mouse or the right stick and zoomed by the wheel, pulled in wherever the ground, the water's surface or a landmark stands between it and the character, and run once a frame on the body's place blended between its last two steps. A click locks the pointer, Left Alt shows the cursor, and photo mode holds the body and orbits the view round it.

## Requirements

### Requirement: The camera orbits the character from behind

The follow camera SHALL orbit a pivot above the character, turned by the mouse or the right stick and zoomed by the wheel within the game's nearest and furthest distances.

#### Scenario: Mouse turns the view round the character

- **GIVEN** the pointer is locked
- **WHEN** the player moves the mouse
- **THEN** the view turns round the character by the amount of the movement

#### Scenario: Wheel zooms within the game's range

- **GIVEN** the camera is at some distance from the character
- **WHEN** the player scrolls the wheel toward the furthest distance past it
- **THEN** the camera stops at the furthest distance

#### Scenario: Zoom in stops at the nearest distance

- **GIVEN** the camera is at some distance from the character
- **WHEN** the player scrolls the wheel toward the nearest distance past it
- **THEN** the camera stops at the nearest distance

### Requirement: Pitch stops short of straight up and straight down

The camera's pitch SHALL be clamped so the view never reaches straight up or straight down.

#### Scenario: Looking up stops at the limit

- **GIVEN** the view is already at its upward limit
- **WHEN** the player keeps turning the view upward
- **THEN** the pitch stays at the upward limit

### Requirement: The camera is pulled in by anything between it and the character

The camera SHALL pull in toward the character as soon as the ground, the water's surface or a landmark stands between them, and SHALL ease back out at a steady pace once the way clears.

#### Scenario: Wall between camera and character pulls the camera in at once

- **GIVEN** a wall stands between the camera and the character
- **WHEN** the camera is placed
- **THEN** the camera moves in at once so nothing stands between it and the character

#### Scenario: Camera eases back out once the way clears

- **GIVEN** the camera was pulled in by a wall
- **WHEN** the wall no longer stands between the camera and the character
- **THEN** the camera eases back out at a steady pace

#### Scenario: Camera never closes onto the character

- **GIVEN** the player looks up from below the character
- **WHEN** the camera is pulled in
- **THEN** the camera stays at its minimum distance from the pivot and does not collapse onto the body

### Requirement: Reset swings the camera behind the character

The reset input SHALL swing the camera level behind the way the character faces, at its default distance.

#### Scenario: Middle mouse button resets the view

- **GIVEN** the camera is turned away from behind the character
- **WHEN** the player presses the middle mouse button
- **THEN** the camera swings level behind the character at its default distance

#### Scenario: Right stick press resets the view on a pad

- **GIVEN** the camera is turned away from behind the character
- **WHEN** the player presses the right stick
- **THEN** the camera swings level behind the character at its default distance

### Requirement: The camera follows the character between steps without stutter

The camera SHALL follow the character's place blended between its last two steps by how far the frame has come into the next step.

#### Scenario: Character moving at a fixed step rate is followed smoothly

- **GIVEN** the character moves in fixed steps
- **WHEN** the display renders a frame between two steps
- **THEN** the camera's pivot sits between the character's last two steps, so the motion does not stutter

### Requirement: A click locks the pointer and Left Alt shows the cursor

A click on the world SHALL lock the pointer, and Left Alt SHALL release it to show the cursor without opening the menu.

#### Scenario: Click locks the pointer

- **GIVEN** the pointer is free
- **WHEN** the player clicks the world
- **THEN** the pointer is locked and turns the view

#### Scenario: Left Alt shows the cursor without opening the menu

- **GIVEN** the pointer is locked
- **WHEN** the player presses Left Alt
- **THEN** the cursor shows and the menu does not open

#### Scenario: Escape releases the lock and opens the menu

- **GIVEN** the pointer is locked
- **WHEN** the player presses Escape
- **THEN** the lock is released and the Paimon menu opens

#### Scenario: First pointer move after a lock is ignored

- **GIVEN** the pointer has just been locked
- **WHEN** the player makes the first pointer move
- **THEN** that first move does not turn the view

### Requirement: Photo mode holds the character and orbits the view round it

Photo mode SHALL hold the character where it stands and keep the camera orbiting it, and SHALL leave the world clock running as the game's does.

#### Scenario: Entering photo mode holds the character in place

- **GIVEN** the player is in the world
- **WHEN** the player chooses photo mode from the Paimon menu
- **THEN** the character stays where it stands and the view orbits it

#### Scenario: Leaving photo mode returns the view to the follow camera

- **GIVEN** the player is in photo mode
- **WHEN** the player leaves photo mode
- **THEN** the follow camera resumes from where the orbit left the view and the character is where it stood

#### Scenario: World clock keeps running in photo mode

- **GIVEN** the player is in photo mode
- **WHEN** time passes
- **THEN** the world clock keeps running

#### Scenario: Tuning panel hands the view to the free camera

- **GIVEN** the tuning panel is open in photo mode
- **WHEN** photo mode is active
- **THEN** the view is handed to the free camera rather than the orbit
