## Purpose

The world's controls on a touch screen, as the game's mobile client lays them out. A thumb in the stick's area at the bottom left pushes the stick, which stands still where the game places it, a drag anywhere else turns the look, and the HUD's touch layout puts the attack, jump and sprint buttons at the bottom right (`~/Esposter.noindex/genshin-parity/captures/mobile-touch.png`, where the buttons stand at the bottom right). They feed the same input the keys, mouse and gamepad do (`packages/genshin-engine/src/input/createInput.ts`).

## Requirements

### Requirement: Touch in the stick area holds the stick

A finger landing in the stick's area at the bottom left SHALL hold the stick until it lifts, with its push set by how far it is moved from where it landed (`packages/genshin-world/src/components/Hud/Stick/Index.vue`).

#### Scenario: Stick pushed within its reach

- **GIVEN** a finger has landed in the stick's area
- **WHEN** it moves part of the way to the edge of the stick's reach
- **THEN** the character moves at a matching share of a full push (`packages/genshin-world/src/components/Hud/Stick/Index.vue`)

#### Scenario: Stick pushed past its reach

- **GIVEN** a finger holds the stick
- **WHEN** it moves farther than the stick's reach
- **THEN** the push is a full push in the direction of the finger (`packages/genshin-world/src/components/Hud/Stick/Index.vue`)

#### Scenario: Stick stays where the game places it

- **GIVEN** a finger holds the stick
- **WHEN** the finger moves
- **THEN** the stick's back and head stay where the game places them (`packages/genshin-world/src/components/Hud/Stick/Index.vue`, `packages/genshin-world/src/services/hud/TouchStickShapePositionMap.ts`)

### Requirement: Touch elsewhere drags the look

A finger landing anywhere outside the stick's area and the buttons SHALL turn the look by how far it moves (`packages/genshin-world/src/components/Hud/Touch/Index.vue`, `packages/genshin-engine/src/input/createInput.ts`).

#### Scenario: Drag turns the look

- **GIVEN** a finger lands on the screen outside the stick's area and the buttons
- **WHEN** it drags across the screen
- **THEN** the camera's look turns with the drag (`packages/genshin-world/src/components/Hud/Touch/Index.vue`, `packages/genshin-engine/src/input/createInput.ts`)

#### Scenario: Lifting ends the drag

- **GIVEN** a finger is dragging the look
- **WHEN** it lifts
- **THEN** the look stops turning (`packages/genshin-world/src/components/Hud/Touch/Index.vue`)

### Requirement: Action buttons at the bottom right act as their keys

The attack, jump, sprint and aim buttons SHALL stand at the bottom right and act as their key held for as long as their touch lasts (`packages/genshin-world/src/components/Hud/Actions/Index.vue`).

#### Scenario: Jump held

- **GIVEN** a finger touches the jump button
- **WHEN** it stays on the button
- **THEN** the character jumps as the jump key would (`packages/genshin-world/src/components/Hud/Actions/Index.vue`)

#### Scenario: Button released when its touch ends

- **GIVEN** a finger holds an action button
- **WHEN** the touch ends
- **THEN** the action is released as its key would be (`packages/genshin-world/src/components/Hud/Actions/Index.vue`)

### Requirement: Stick shows its push on its rim

The stick SHALL show its push as a mark on its rim toward the direction pushed, a thin arc for a walk and a cyan arc with an arrow for a run (`packages/genshin-world/src/components/Hud/Stick/Index.vue`, which draws the walk arc and the run arc with its arrow).

#### Scenario: Walking push

- **GIVEN** the stick is pushed short of a run
- **WHEN** the stick is drawn
- **THEN** a thin teal arc shows on the rim toward the push (`packages/genshin-world/src/components/Hud/Stick/Index.vue`)

#### Scenario: Running push

- **GIVEN** the stick is pushed far enough for the character to run
- **WHEN** the stick is drawn
- **THEN** a cyan arc with an arrow shows at the rim toward the push (`packages/genshin-world/src/components/Hud/Stick/Index.vue`)

### Requirement: Touch controls only on a touch screen

The touch controls SHALL be drawn only when the device's main pointer is a finger, so that a computer's clicks still reach the world (`packages/genshin-world/src/components/World/Session/Index.vue`).

#### Scenario: Computer with a mouse

- **GIVEN** the device's main pointer is a mouse
- **WHEN** the world is shown
- **THEN** no touch controls are drawn (`packages/genshin-world/src/components/World/Session/Index.vue`)
- **AND** a click reaches the world

#### Scenario: Hiding the HUD releases the touch controls

- **GIVEN** a finger is holding the stick or a button
- **WHEN** the HUD is hidden
- **THEN** the touch controls are hidden
- **AND** whatever they held is let go (`packages/genshin-world/src/components/Hud/Actions/Index.vue`, `packages/genshin-world/src/components/Hud/Stick/Index.vue`)

### Requirement: Free camera climbs on touch but cannot descend

The free camera flown by touch SHALL climb on the jump button, and the touch layout SHALL offer no control that lowers it (`packages/genshin-world/src/components/Hud/Actions/Index.vue`).

#### Scenario: Free camera climbs by touch

- **GIVEN** the free camera is flown by touch
- **WHEN** the jump button is held
- **THEN** the camera rises (`packages/genshin-world/src/components/Hud/Actions/Index.vue`)

#### Scenario: No touch control lowers the free camera

- **GIVEN** the free camera is flown by touch
- **WHEN** the player looks for a control to descend
- **THEN** no touch control lowers the camera (`packages/genshin-world/src/components/Hud/Actions/Index.vue`)

## Open

- [ ] **The stick stands still where the game places it** — no source yet: the three mobile-client recordings the design page cites are not in `~/Esposter.noindex/genshin-parity/captures/`, so the game's placement of the stick is not read back.
