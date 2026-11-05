## ADDED Requirements

### Requirement: A screen plays its own music from its first segment

A screen with its own music playlist SHALL play that music from the playlist's first segment while the screen shows, and SHALL loop the playlist when it ends.

#### Scenario: A screen plays its own music from its first segment

- **GIVEN** a screen with its own music playlist is opened
- **WHEN** the screen shows
- **THEN** the playlist plays from its first segment

#### Scenario: The playlist loops back to its first segment

- **GIVEN** a screen's playlist is playing its last segment
- **WHEN** that segment ends
- **THEN** the playlist begins again from its first segment

### Requirement: A near Oculus plays the game's own chime

A near Oculus SHALL sound the game's own chime once that chime has been matched to the game and fitted, and SHALL sound no other tone in its place.

#### Scenario: A near Oculus plays the game's own chime

- **GIVEN** the player comes near an Oculus that the minimap marks
- **WHEN** the mark appears
- **THEN** the game's own chime sounds once

### Requirement: A screen's matched sound plays at its trigger

A sound matched to a screen SHALL play when the trigger that sets it off fires, and a screen with no matched sound SHALL play none.

#### Scenario: A matched sound plays at its screen's trigger

- **GIVEN** a screen has a sound matched to one of its triggers
- **WHEN** the trigger fires
- **THEN** the matched sound plays

#### Scenario: A screen with no matched sound plays none

- **GIVEN** a screen has no sound matched to any of its triggers
- **WHEN** each of its triggers fires
- **THEN** no sound plays
