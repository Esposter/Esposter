## Purpose

Per-room display names and the getRoomMemberName resolution rule. A member may set a name that applies only inside one room, and every surface that names a member uses it, falling back to the account name when none is set.

## Requirements

### Requirement: A room display name replaces the account name inside that room

A member's name SHALL appear as their display name in every room surface where one is set, and as their account name otherwise.

#### Scenario: a member with a display name is shown in the room

- **GIVEN** a member who has set a display name in a room
- **WHEN** other members view that room's member list and messages
- **THEN** the member is shown by the display name
- **AND** the mention of that member shows the display name

#### Scenario: a message from a member with a display name

- **GIVEN** a member who has set a display name in a room
- **WHEN** the member's message is shown in that room
- **THEN** the message author is shown by the display name

### Requirement: A member's account name shows beside a display name only where they differ

A member listed by a room display name SHALL show their account name beside it, and a member the room shows by the account name SHALL NOT have a second name beside it.

#### Scenario: a member with a display name is listed with the account name

- **GIVEN** a member who has set a display name in a room
- **WHEN** another member views the room's member list, or opens the mention list and searches for the member
- **THEN** the member is shown by the display name
- **AND** the member's account name is shown beside it

#### Scenario: a member with no display name is listed once

- **GIVEN** a member who has no display name in a room
- **WHEN** another member views the room's member list
- **THEN** the member is shown once, by the account name

### Requirement: A cleared display name restores the account name

An empty display name SHALL mean no room-specific name, so the account name is shown.

#### Scenario: a member clears their display name

- **GIVEN** a member who had set a display name in a room
- **WHEN** the member clears the display name field and saves
- **THEN** the member is shown by their account name in that room

### Requirement: A member sets their own display name without a room permission

A member SHALL be able to set their own display name in a room they belong to, with no room permission required.

#### Scenario: a plain member sets a display name

- **GIVEN** a member who holds no room permission beyond membership
- **WHEN** the member saves a display name in the room's profile settings
- **THEN** the member sees the new display name, and the other members see it the next time they read the member list

### Requirement: A display name applies only in the room where it was set

A display name SHALL NOT appear in any room other than the one where it was set.

#### Scenario: the same member in another room

- **GIVEN** a member who has set a display name in one room
- **WHEN** the member's messages are shown in a different room
- **THEN** the member is shown by their account name there

### Requirement: A member's private room settings stay with that member

A room's member list SHALL show other members' names but SHALL NOT disclose their private room settings.

#### Scenario: another member reads the room's member list

- **GIVEN** a member with a private notification setting and a last-read time in a room
- **WHEN** another member reads the room's member list
- **THEN** that member's name is shown
- **AND** that member's private settings are not included

### Requirement: Direct message listings use the same names as the room

A direct message listing SHALL show each participant by the same name the room shows, falling back to the account name.

#### Scenario: a member searches for a direct message by display name

- **GIVEN** a direct message whose other participant has a display name set in the room
- **WHEN** the member searches the quick switcher by that display name
- **THEN** the direct message is listed under that display name

### Requirement: A member with the display-names permission sets another member's display name

A member who holds the display-names permission in a room SHALL be able to set the display name of a member the permission lets them manage. The moderator and the renamed member see the new display name when the change lands; the other members of the room see it the next time they read the room's member list.

#### Scenario: A moderator sets a lower-ranked member's display name

- **GIVEN** a member who holds the display-names permission and a member ranked below them
- **WHEN** the moderator saves a display name for that member from the member's menu
- **THEN** the moderator and the renamed member see the new display name, and the other members see it the next time they read the member list

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
