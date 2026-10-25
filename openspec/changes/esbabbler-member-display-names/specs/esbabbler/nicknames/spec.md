## ADDED Requirements

### Requirement: A member with the display-names permission sets another member's nickname

A member who holds the display-names permission in a room SHALL be able to set the nickname of a member the permission lets them manage, and every member of the room SHALL see the new nickname.

#### Scenario: A moderator sets a lower-ranked member's nickname

- **GIVEN** a member who holds the display-names permission and a member ranked below them
- **WHEN** the moderator saves a nickname for that member from the member's menu
- **THEN** every member of the room sees the new nickname

### Requirement: A member cannot set the nickname of a member who outranks them

A member SHALL NOT set the nickname of a member ranked equal to or above them, or of the room's owner, even when they hold the display-names permission.

#### Scenario: An equal-rank target is refused

- **GIVEN** a member who holds the display-names permission and a member with the same top role position
- **WHEN** the member saves a nickname for that member
- **THEN** the save is refused
- **AND** the target's nickname does not change

#### Scenario: The owner is refused

- **GIVEN** a member who holds the display-names permission
- **WHEN** the member saves a nickname for the room's owner
- **THEN** the save is refused
- **AND** the owner's nickname does not change

### Requirement: The nickname action is shown only where it can be taken

The member menu SHALL offer the nickname action only to a member who holds the display-names permission and may manage the member it is opened on.

#### Scenario: A plain member sees no nickname action

- **GIVEN** a member who holds no room permission beyond membership
- **WHEN** the member opens another member's menu
- **THEN** no nickname action is offered
