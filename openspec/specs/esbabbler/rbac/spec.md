## Purpose

Room roles with a bigint permission bitfield, role hierarchy, and tRPC procedure guards. Covers who holds which permission in a room, how roles and per-member overrides combine, the rule that a member can act only on members ranked below them, and which reads are guarded.

## Requirements

### Requirement: The room owner holds every permission

The room owner SHALL hold every permission in their room, whatever roles they have.

#### Scenario: the owner uses a permission-gated action

- **GIVEN** a room owner who has no roles in the room
- **WHEN** the owner uses any permission-gated action in the room
- **THEN** the action is allowed

### Requirement: A member's permissions are the union of the everyone role and their assigned roles

A member SHALL hold every permission granted by the room's everyone role and by each role assigned to them.

#### Scenario: a member is given a role that grants a permission

- **GIVEN** a member with no roles beyond the everyone role
- **WHEN** a moderator assigns the member a role that grants manage invites
- **THEN** the member can create and manage invites

#### Scenario: a member without a granting role is refused

- **GIVEN** a member whose roles do not grant manage invites
- **WHEN** the member tries to manage invites
- **THEN** the action is refused as forbidden

### Requirement: The administrator permission passes every check except the owner's

A member holding the administrator permission SHALL pass every permission check in the room.

#### Scenario: an administrator uses a restricted action

- **GIVEN** a member holding the administrator permission
- **WHEN** the member uses an action that needs another permission
- **THEN** the action is allowed

### Requirement: A member's own overrides adjust what their roles grant

A member's own overrides SHALL add or remove permissions from those their roles grant, and SHALL NOT override the administrator permission.

#### Scenario: an override removes a permission from a member

- **GIVEN** a member whose role grants manage invites and an override that removes it
- **WHEN** the member tries to manage invites
- **THEN** the action is refused

#### Scenario: an override cannot strip the administrator permission

- **GIVEN** a member holding the administrator permission through a role
- **WHEN** an override tries to remove that permission
- **THEN** the member still passes permission checks as an administrator

### Requirement: A member may act on another member only when ranked above them

A member SHALL be able to assign, remove or moderate another member's roles only when their highest role ranks above that member's highest role.

#### Scenario: a member targets someone of equal rank

- **GIVEN** two members whose highest roles are at the same position
- **WHEN** one tries to assign a role to the other
- **THEN** the action is refused as unauthorized

#### Scenario: a member targets someone ranked below them

- **GIVEN** a member whose highest role ranks above another member's highest role
- **WHEN** the member assigns a role to the other member
- **THEN** the assignment is made

### Requirement: No member other than the owner may act against the owner

No member other than the owner SHALL be able to kick, ban or remove roles from the room's owner, and the owner MAY assign themselves a role.

#### Scenario: a moderator tries to kick the owner

- **GIVEN** a moderator with a high role and the room owner
- **WHEN** the moderator tries to kick the owner
- **THEN** the action is refused

#### Scenario: the owner assigns themselves a role

- **GIVEN** the room owner
- **WHEN** the owner assigns themselves a role
- **THEN** the role is assigned

### Requirement: A member-targeting action needs both the permission and the rank

A member-targeting action SHALL be allowed only when the caller holds the permission and ranks above the target.

#### Scenario: a member holds the permission but is ranked below the target

- **GIVEN** a member holding the kick members permission whose highest role is below the target's
- **WHEN** the member tries to kick the target
- **THEN** the action is refused as unauthorized

### Requirement: A room's sensitive reads require the permission of the panel they feed

A read whose data is sensitive to the room SHALL be refused to members lacking the permission for the panel that shows it.

#### Scenario: a member without manage room asks for the word filter list

- **GIVEN** a member who does not hold the manage room permission
- **WHEN** the member asks for the room's filtered words
- **THEN** the request is refused

#### Scenario: a member asks for the room's emoji

- **GIVEN** a member of the room
- **WHEN** the member asks for the room's emoji
- **THEN** the emoji are returned

### Requirement: A new room grants its everyone role a default set of permissions

A newly created room SHALL give its everyone role read messages, send messages, mention everyone and manage invites.

#### Scenario: a new room is created

- **GIVEN** a member creating a room
- **WHEN** the room is created
- **THEN** every member of the room can read and send messages, mention everyone, and manage invites

### Requirement: A room may hold any number of roles

A room SHALL allow as many roles as its owner creates, and a member SHALL be able to hold as many of them as are assigned.

#### Scenario: a room with many roles

- **GIVEN** a room with a large number of roles
- **WHEN** a moderator assigns several of them to a member
- **THEN** the member holds the permissions of every assigned role
