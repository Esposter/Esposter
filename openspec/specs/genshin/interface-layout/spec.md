## Purpose

Every screen's interface laid out from the game's own RectTransform tree. A fit publishes the tree's rects as the screen's record of the hosted game data, and one nesting component, GameRect, places each piece inside its game parent, so nothing is positioned by hand. Unity's anchors, pivots and size deltas map exactly onto absolute positioning with calc, so the browser is the layout engine. Only what the tree cannot hold, a prefab loaded at run time, a layout group's spacing or a line of text inside its rect, is measured.

## Requirements

### Requirement: Each piece sits where the game's own layout places it

Each piece of a screen's interface SHALL be placed inside its game parent's box by the anchors, pivot and size the game gives it, and SHALL NOT be positioned by hand.

#### Scenario: A piece anchored to the bottom stays at the bottom

- **GIVEN** a piece is anchored to the bottom of its parent
- **WHEN** the window is resized to any shape
- **THEN** the piece stays at the bottom of its parent

#### Scenario: A piece follows its parent

- **GIVEN** a piece is nested inside a parent piece
- **WHEN** the parent moves or resizes
- **THEN** the nested piece moves and resizes with it

### Requirement: A scaled piece scales about its pivot

A piece the game scales SHALL scale about its pivot, so the corner it is pivoted on stays where the layout places it.

#### Scenario: A corner-pivoted piece keeps its corner

- **GIVEN** a piece is pivoted on a corner and scaled
- **WHEN** it is drawn
- **THEN** its pivot corner stays where the layout places it

### Requirement: A layout group's children take the group's spacing

The children of a layout group SHALL be stacked and spaced as the game's own recording shows, and SHALL NOT be placed from the layout tree.

#### Scenario: Group children are spaced as the recording shows

- **GIVEN** a piece is a layout group whose children the game places at run time
- **WHEN** its children are drawn
- **THEN** they are stacked and spaced as the game's recording shows

### Requirement: A clip that moves a piece moves everything nested in it

A game clip that moves a piece SHALL move every piece nested in it with the same effect.

#### Scenario: A fade on a parent fades its nested pieces

- **GIVEN** a clip fades a parent piece
- **WHEN** the clip plays
- **THEN** every piece nested inside the parent fades with it

### Requirement: Pieces the tree cannot hold are placed inside the piece holding them

A prefab loaded at run time and a line of text SHALL be placed inside the piece that holds them, so that they stay with their parent on any window.

#### Scenario: A run-time prefab stays with its container

- **GIVEN** a prefab is loaded at run time inside a container piece
- **WHEN** the window is resized
- **THEN** the prefab stays in its place inside the container

### Requirement: A screen places only the pieces it names

A screen SHALL keep only the pieces of its published record that it places by name, and SHALL ignore every other piece in that record.

#### Scenario: Unnamed pieces are ignored

- **GIVEN** a published record holds pieces the screen does not place by name
- **WHEN** the screen reads its record
- **THEN** only the named pieces are kept
