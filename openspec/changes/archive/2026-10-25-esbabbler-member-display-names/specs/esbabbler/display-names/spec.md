## ADDED Requirements

### Requirement: A member with the display-names permission sets another member's display name

A member who holds the display-names permission in a room SHALL be able to set the display name of a member the permission lets them manage. Every member of the room sees the new display name.

#### Scenario: A moderator sets a lower-ranked member's display name

- **GIVEN** a member who holds the display-names permission and a member ranked below them
- **WHEN** the moderator saves a display name for that member from the member's menu
- **THEN** every member of the room sees the new display name

### Requirement: A member cannot set the display name of a member who outranks them

A member SHALL NOT set the display name of a member ranked equal to or above them, or of the room's owner, even when they hold the display-names permission.

#### Scenario: An equal-rank target is refused

- **GIVEN** a member who holds the display-names permission and a member with the same top role position
- **WHEN** the member saves a display name for that member
- **THEN** the save is refused
- **AND** the target's display name does not change

#### Scenario: The owner is refused

- **GIVEN** a member who holds the display-names permission
- **WHEN** the member saves a display name for the room's owner
- **THEN** the save is refused
- **AND** the owner's display name does not change

### Requirement: The display name action is shown only where it can be taken

The member menu SHALL offer the display name action only to a member who holds the display-names permission and may manage the member it is opened on.

#### Scenario: A plain member sees no display name action

- **GIVEN** a member who holds no room permission beyond membership
- **WHEN** the member opens another member's menu
- **THEN** no display name action is offered
