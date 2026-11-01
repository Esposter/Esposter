## Purpose

The world's controls on a touch screen, as the game's mobile client lays them out, feeding the same input the keys, mouse and gamepad do.

## Requirements

### Requirement: Touch on the left half holds the stick

A finger landing on the screen's left half SHALL bring the stick up centred where it landed and hold it until it lifts, with its push set by how far it is moved from where it landed.

#### Scenario: Stick appears where the finger lands

- **GIVEN** no finger is on the left half
- **WHEN** a finger lands on the left half
- **THEN** the stick's ring is drawn centred on the landing point, pulled in from the screen's edges so the whole ring stays on the screen

#### Scenario: Stick pushed within its reach

- **GIVEN** a finger has landed on the left half
- **WHEN** it moves part of the way to the edge of the stick's reach
- **THEN** the character moves at a matching share of a full push

#### Scenario: Stick pushed past its reach

- **GIVEN** a finger holds the stick
- **WHEN** it moves farther than the stick's reach
- **THEN** the push is a full push in the direction of the finger

#### Scenario: Head moves within the ring

- **GIVEN** a finger holds the stick
- **WHEN** the finger moves
- **THEN** the head moves within the ring toward the push, and the ring stays where the finger landed

#### Scenario: Stick fades out when the finger lifts

- **GIVEN** a finger holds the stick
- **WHEN** it lifts, or its touch is cancelled or loses its capture
- **THEN** the stick fades out with nothing pushed, and the left half takes the next landing

#### Scenario: A second finger does not take the stick

- **GIVEN** a finger holds the stick
- **WHEN** a second finger lands on the left half
- **THEN** the stick stays with the first finger

### Requirement: Touch on the right half drags the look

A finger landing on the screen's right half, outside the HUD's pieces and buttons, SHALL turn the look by how far it moves.

#### Scenario: Drag turns the look

- **GIVEN** a finger lands on the right half outside the HUD's pieces and buttons
- **WHEN** it drags across the screen
- **THEN** the camera's look turns with the drag

#### Scenario: Lifting ends the drag

- **GIVEN** a finger is dragging the look
- **WHEN** it lifts
- **THEN** the look stops turning

### Requirement: Action buttons at the bottom right act as their keys

The attack, jump, sprint and aim buttons SHALL stand at the bottom right and act as their key held for as long as their touch lasts.

#### Scenario: Jump held

- **GIVEN** a finger touches the jump button
- **WHEN** it stays on the button
- **THEN** the character jumps as the jump key would

#### Scenario: Button released when its touch ends

- **GIVEN** a finger holds an action button
- **WHEN** the touch ends
- **THEN** the action is released as its key would be

### Requirement: Stick shows its push on its rim

The stick SHALL show its push as a mark on its rim toward the direction pushed, a thin arc for a walk and a cyan arc with an arrow for a run.

#### Scenario: Walking push

- **GIVEN** the stick is pushed short of a run
- **WHEN** the stick is drawn
- **THEN** a thin teal arc shows on the rim toward the push

#### Scenario: Running push

- **GIVEN** the stick is pushed far enough for the character to run
- **WHEN** the stick is drawn
- **THEN** a cyan arc with an arrow shows at the rim toward the push

### Requirement: Touch controls only on a touch screen

The touch controls SHALL be drawn only when the device's main pointer is a finger, so that a computer's clicks still reach the world.

#### Scenario: Computer with a mouse

- **GIVEN** the device's main pointer is a mouse
- **WHEN** the world is shown
- **THEN** no touch controls are drawn
- **AND** a click reaches the world

#### Scenario: Hiding the HUD releases the touch controls

- **GIVEN** a finger is holding the stick or a button
- **WHEN** the HUD is hidden
- **THEN** the touch controls are hidden
- **AND** whatever they held is let go

### Requirement: Free camera climbs on touch but cannot descend

The free camera flown by touch SHALL climb on the jump button, and the touch layout SHALL offer no control that lowers it.

#### Scenario: Free camera climbs by touch

- **GIVEN** the free camera is flown by touch
- **WHEN** the jump button is held
- **THEN** the camera rises

#### Scenario: No touch control lowers the free camera

- **GIVEN** the free camera is flown by touch
- **WHEN** the player looks for a control to descend
- **THEN** no touch control lowers the camera

## Open

- [ ] **The recordings' fixed placement of the stick** — contradicted by the owner's account of the mobile client (2026-11-02): the stick is not fixed, it appears where a thumb lands on the left half, so a recording's placement is not the game's at every landing. `{data-root}/genshin-parity/captures/touch-controls-mobile.mkv` at about 40, 50 and 60 s shows the ring at one lower-left spot, with a push arc at 50 s, which the owner's account contradicts as the game's placement; `{data-root}/genshin-parity/captures/mobile-touch.png` shows one finger over the stick's area with no stick ring readable.
- [ ] **The stick's rest look, and its head that never travels, on the mobile client's three recordings** — contradicted by the owner's account of the mobile client (2026-11-02): the stick is not drawn at rest, and its head moves within the ring as the thumb drags. The held look, a faint ring with four chevrons and a push's mark on a quarter of the rim, is not contradicted and is kept.
- [ ] **The margin a wider phone's stick keeps from the screen's edges** — no source yet: the owner's account gives where the stick appears, not its margin on a 19.5:9 or a 20:9 screen; a recording of a landing near such an edge would measure it.
