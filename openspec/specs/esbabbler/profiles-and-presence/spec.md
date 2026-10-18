## Purpose

User profile card and editing, and the Online/Idle/DND/Offline presence system. Covers the status members see for each other, how a manual status expires, and what a member may change on their own profile.

## Requirements

### Requirement: A member's presence is shown to every member as it changes

A member's presence SHALL be shown to every member's app as it changes.

#### Scenario: a member goes idle

- **GIVEN** a member who has been inactive longer than their auto-idle threshold
- **WHEN** the threshold passes
- **THEN** every member sees that member as Idle

#### Scenario: a member's connection drops

- **GIVEN** a member connected to the app
- **WHEN** the connection drops
- **THEN** every member sees that member as Offline

### Requirement: A member chooses a manual status with an optional expiry

A member SHALL be able to set a manual status of Online, Idle or Do Not Disturb, and the status MAY carry an expiry.

#### Scenario: a member sets Do Not Disturb until a set time

- **GIVEN** a member choosing a manual status
- **WHEN** the member sets Do Not Disturb with an expiry in one hour
- **THEN** every member sees that member as Do Not Disturb

#### Scenario: a manual status expires

- **GIVEN** a member whose manual status has passed its expiry
- **WHEN** other members view that member
- **THEN** the member's presence is the one derived from their connection instead of the expired status

### Requirement: A member may attach a custom status message to their presence

A member SHALL be able to attach a custom status message, which is shown with their presence.

#### Scenario: a member sets a custom status

- **GIVEN** a member with a custom status message set
- **WHEN** other members view that member
- **THEN** the custom status message is shown beside the presence

### Requirement: A member edits only their own profile

A member SHALL be able to change only their own name, biography and avatar.

#### Scenario: a member saves a new name and biography

- **GIVEN** a member editing their profile
- **WHEN** the member saves a new name and biography
- **THEN** the profile card shows the new name and biography to others

#### Scenario: a member's biography is too long

- **GIVEN** a member editing their profile
- **WHEN** the biography is longer than the maximum biography length
- **THEN** the save is refused

#### Scenario: a member's name is too long

- **GIVEN** a member editing their profile
- **WHEN** the name is longer than the maximum name length
- **THEN** the save is refused

### Requirement: A profile picture is shown wherever the member appears

A member's uploaded profile picture SHALL be shown on their profile card and beside their messages.

#### Scenario: a member uploads a profile picture

- **GIVEN** a member editing their profile
- **WHEN** the member uploads a new picture and saves
- **THEN** the picture appears on the profile card and beside the member's messages
