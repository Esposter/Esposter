## ADDED Requirements

### Requirement: The direction the pointer points toward picks its entry

The wheel SHALL pick the entry in the direction the pointer or stick points toward, and no entry when the pointer is at the centre.

#### Scenario: A pointer pushed to the right picks the entry to its right

- **GIVEN** the wheel in its 8-direction layout
- **WHEN** the pointer is pushed to the right of the centre
- **THEN** the entry on the right of the wheel is picked

#### Scenario: A pointer at the centre picks no entry

- **GIVEN** the wheel with its pointer at the centre
- **WHEN** the pointer's direction is read
- **THEN** no entry is picked

### Requirement: Holding Tab opens the wheel

Holding Tab or the left bumper SHALL show the Shortcut Wheel over the world, and releasing on an entry SHALL open that entry's screen.

#### Scenario: Holding Tab opens the wheel

- **GIVEN** the player is in the world with no screen open
- **WHEN** the player holds Tab
- **THEN** the Shortcut Wheel is shown over the world

#### Scenario: Releasing on an entry opens its screen

- **GIVEN** the Shortcut Wheel is shown with an entry picked
- **WHEN** the player releases Tab
- **THEN** that entry's screen opens

#### Scenario: Holding Tab stops the character walking

- **GIVEN** the Shortcut Wheel is shown over the world
- **WHEN** the player pushes the move toward an entry
- **THEN** the character holds still, and the wheel picks the entry the move points at
