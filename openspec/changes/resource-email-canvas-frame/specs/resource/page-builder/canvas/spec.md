## ADDED Requirements

### Requirement: The canvas runs no script in its frame

The canvas SHALL draw its content without running a script inside its frame, and SHALL NOT log a blocked script for its own content.

#### Scenario: the canvas runs no script in its frame

- **GIVEN** an email open on the design canvas
- **WHEN** the owner edits a text and views the console
- **THEN** no blocked-script message is logged for the canvas frame

### Requirement: The canvas holds its scroll position while an email is edited

The canvas SHALL keep its scroll position steady while the owner edits the email, and SHALL NOT toggle its scrollbars as the content changes size.

#### Scenario: the scroll position holds while an email is edited

- **GIVEN** an email longer than the canvas pane, scrolled to its middle
- **WHEN** the owner edits a text in the middle of the email
- **THEN** the canvas keeps the same scroll position
- **AND** the scrollbars do not appear, disappear or move
