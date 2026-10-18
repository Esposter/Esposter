## Purpose

The game's F prompts over the world, the list of what is in reach beside the character. The drops lying in the world, the residents with a talk and the locked Statues of The Seven are the things in reach: F picks a drop up into the wallet or the bag, begins a resident's talk, or resonates with a statue to unlock it, and a defeated enemy's drops lie where it fell. A pure selector rows what is in reach nearest first, keeps the selection on its thing, scrolls a window to keep it in view and steps it with the mouse wheel while more than one row shows; a held F repeats its pick up. F is the input's Interact action, and the list is drawn in the HUD by genshin-interface's prompt list.

## Requirements

### Requirement: The prompt list offers each thing in reach as a row of one of five kinds

The prompt list SHALL offer a row for each thing within reach of the character, and each row SHALL be one of five kinds: pick up, open, talk, read or activate, named by the thing's own name in the reader's language.

#### Scenario: A thing in reach gets a row

- **GIVEN** a drop, a resident with a talk, or a locked statue lies within reach of the character
- **WHEN** the prompt list is drawn
- **THEN** the thing has a row named by its own name in the reader's language

#### Scenario: A thing out of reach gets no row

- **GIVEN** a thing lies beyond reach of the character
- **WHEN** the prompt list is drawn
- **THEN** no row is shown for it

#### Scenario: A resident with no talk gets no row

- **GIVEN** a resident has neither a talk held nor a quest talk open to them
- **WHEN** the prompt list is drawn
- **THEN** no row is shown for that resident

### Requirement: Rows run from the nearest thing and keep their order between frames

The rows SHALL run from the nearest thing to the farthest, with two things at the same distance ordered by id, so that rows never swap places between frames.

#### Scenario: The nearest thing is the first row

- **GIVEN** several things are in reach at different distances
- **WHEN** the rows are listed
- **THEN** the nearest thing is the first row

#### Scenario: Two things at one distance keep a fixed order

- **GIVEN** two things lie at the same distance
- **WHEN** the rows are listed in consecutive frames
- **THEN** they keep the same order in each frame

### Requirement: The selection stays on its thing

The selection SHALL stay on the thing that was selected as rows come and go, and when that thing leaves reach the first row SHALL be selected.

#### Scenario: The selection holds while other rows change

- **GIVEN** a thing is selected
- **WHEN** other things enter or leave reach
- **THEN** the same thing stays selected

#### Scenario: The first row is selected when the selected thing leaves reach

- **GIVEN** the selected thing leaves reach
- **WHEN** the rows are next listed
- **THEN** the first row is selected

### Requirement: The list shows a fixed window of rows that scrolls only as far as needed

The prompt list SHALL show a fixed number of rows and SHALL scroll only as far as needed to keep the selected row in view.

#### Scenario: The window scrolls only to reveal the selection

- **GIVEN** the selection moves below the visible window
- **WHEN** the next frame is drawn
- **THEN** the window scrolls just far enough to show the selected row

### Requirement: The mouse wheel steps the selection while more than one row shows

While more than one row is shown the mouse wheel SHALL move the selection one row per notch without wrapping, and otherwise the wheel SHALL zoom the camera.

#### Scenario: The wheel moves the selection through several rows

- **GIVEN** more than one row is shown
- **WHEN** the player turns the wheel one notch
- **THEN** the selection moves one row in that direction
- **AND** the camera does not zoom

#### Scenario: The selection stops at the ends of the list

- **GIVEN** the selection is on the first or last row
- **WHEN** the wheel turns past that end
- **THEN** the selection stays on that row

#### Scenario: With one row or none the wheel zooms the camera

- **GIVEN** one row or no row is shown
- **WHEN** the player turns the wheel
- **THEN** the camera zooms

### Requirement: F acts once on the selected row

Pressing F SHALL act once on the selected row: a drop is picked up, a resident's talk begins, and a locked statue is unlocked.

#### Scenario: F picks up a drop into the wallet or the bag

- **GIVEN** the selected row is a drop
- **WHEN** the player presses F
- **THEN** a currency goes into the wallet and any other item into the bag

#### Scenario: F on a drop the bag cannot hold leaves the rest on the ground

- **GIVEN** the bag has no room for the selected drop's item
- **WHEN** the player presses F
- **THEN** the part the bag cannot take is left on the ground as a smaller drop

#### Scenario: F on a resident begins their talk

- **GIVEN** the selected row is a resident with a talk
- **WHEN** the player presses F
- **THEN** the talk begins

#### Scenario: F on a locked statue unlocks it

- **GIVEN** the selected row is a locked statue
- **WHEN** the player presses F
- **THEN** the statue is unlocked and no longer has a row

### Requirement: A held F repeats its pick up

While F stays held after its press, the player's pick up SHALL repeat at a fixed interval, and a repeat SHALL NOT open, talk, read or activate anything.

#### Scenario: A held F picks up items again

- **GIVEN** the player holds F after pressing it
- **WHEN** each repeat interval passes
- **THEN** one item is picked up

#### Scenario: A repeat does not start a talk or open a chest

- **GIVEN** the selected row is a resident or a chest
- **WHEN** F is held and a repeat interval passes
- **THEN** no talk begins and no chest is opened

### Requirement: A defeated enemy's drops lie where it fell

When an enemy is defeated its drops SHALL lie where it fell, with its Mora as one pile and each material on its own.

#### Scenario: Mora falls as one pile

- **GIVEN** a defeated enemy drops Mora
- **WHEN** its drops are placed
- **THEN** all its Mora lies as one pile at the point where it fell

#### Scenario: Each material falls on its own

- **GIVEN** a defeated enemy drops several materials
- **WHEN** its drops are placed
- **THEN** each material lies on its own at the point where the enemy fell

### Requirement: A row can be pressed to act on it

Pressing a row SHALL select its thing and act on it as F would, with a touch screen showing no key cap and no selected row.

#### Scenario: Tapping a row acts on it on a touch screen

- **GIVEN** the player is on a touch screen
- **WHEN** the player taps a row
- **THEN** its thing is selected and acted on as F would act on it

#### Scenario: Clicking a row acts on it with the cursor shown

- **GIVEN** the cursor is shown
- **WHEN** the player clicks a row
- **THEN** its thing is selected and acted on as F would act on it

### Requirement: F is the interact key on every platform

The pick up and interact action SHALL be bound to F on a keyboard, to the X button on an Xbox controller and to the Square button on a PlayStation controller.

#### Scenario: The interact action is bound on each device

- **GIVEN** the player uses a keyboard, an Xbox controller or a PlayStation controller
- **WHEN** the interact button is pressed
- **THEN** the interact action runs
