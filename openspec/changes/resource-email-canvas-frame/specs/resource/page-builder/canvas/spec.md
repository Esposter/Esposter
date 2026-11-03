## ADDED Requirements

### Requirement: The canvas runs no script in its frame

The canvas SHALL draw its content without running a script inside its frame, and SHALL NOT log a blocked script for its own content.

#### Scenario: the canvas runs no script in its frame

- **GIVEN** an email open on the design canvas
- **WHEN** the owner edits a text and views the console
- **THEN** no blocked-script message is logged for the canvas frame

### Requirement: The canvas's outlines do not change the size of the page it draws

The canvas SHALL draw its hover, selection and drop outlines without changing the size of the page in its frame, so its scrollbars do not appear, disappear or move as a node is hovered or selected.

#### Scenario: the scroll position holds while an email is edited

- **GIVEN** an email longer than the canvas pane
- **WHEN** the owner hovers a node and selects it
- **THEN** the frame's scroll height is what it was before
- **AND** the scrollbars do not appear, disappear or move
