## Purpose

The pointer helpers vue-phaserjs gives a scene — a click outside a game object, a slider thumb and a four-way virtual joystick — and the upstream phaser4-rex-plugins 4.2.0 issues each given a verdict.

## Requirements

### Requirement: A click outside is a press and a release both outside

The library SHALL report a click outside a game object only when one pointer is pressed and released outside the game object's hit area, and SHALL follow each pointer on its own.

#### Scenario: A press that starts on the game object is not a click outside

- **GIVEN** a game object listening for a click outside
- **WHEN** a pointer is pressed on it and released outside it
- **THEN** no click outside is reported

#### Scenario: A second pointer's click is reported

- **GIVEN** one pointer pressed outside the game object and still held
- **WHEN** a second pointer is pressed and released outside it
- **THEN** one click outside is reported, for the second pointer

#### Scenario: A hidden game object is never clicked outside of

- **GIVEN** a game object inside a hidden container
- **WHEN** a pointer is pressed and released outside it
- **THEN** no click outside is reported

### Requirement: The slider follows its segment in any direction

The library SHALL set the slider's value from the drag point projected onto the segment from its start to its end, clamped from 0 to 1, and SHALL report the value only for a drag.

#### Scenario: A reversed segment runs from start to end

- **GIVEN** a slider whose end lies before its start
- **WHEN** its thumb is dragged a quarter of the way from the end
- **THEN** its value is three quarters

#### Scenario: A value set through the slider is not reported

- **GIVEN** a slider with a value change listener
- **WHEN** its value is set through it
- **THEN** the thumb moves to the value and the listener is not called

### Requirement: The joystick presses one arrow key for its dominant axis

The library SHALL press the arrow key of the axis the thumb is further along once the thumb leaves the dead zone, and SHALL press no key inside it.

#### Scenario: A diagonal presses one key

- **GIVEN** a held joystick
- **WHEN** its thumb is further right than down
- **THEN** only the right key is down

#### Scenario: A pointer at the centre presses nothing

- **GIVEN** a joystick
- **WHEN** a pointer is held at its centre
- **THEN** no key is down

### Requirement: The joystick reads the pointer where the camera draws it

The library SHALL compare the pointer with the joystick's base in the camera's world, so that a zoomed or scrolled camera and a scaled base read where they are drawn.

#### Scenario: A zoomed camera

- **GIVEN** a camera zoomed to twice its size and a joystick at its centre
- **WHEN** a pointer is pressed further than the radius from the base on screen but within it in the world
- **THEN** the joystick is held

### Requirement: The joystick lets go however its pointer ends

The library SHALL release every key and return the thumb to its base when the holding pointer is released, on the canvas or off it, and when the joystick is destroyed.

#### Scenario: A release off the canvas

- **GIVEN** a held joystick
- **WHEN** its pointer is released outside the canvas
- **THEN** no key is down and the thumb is on its base
