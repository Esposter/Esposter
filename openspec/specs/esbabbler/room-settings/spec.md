## Purpose

The fullscreen room settings dialog — Discord Server Settings categories, panels, and per-panel permission gating. Covers which member can open it, which panels each member sees, how destructive actions are labelled and confirmed, how a panel saves, and how the dialog behaves on a narrow screen.

## Requirements

### Requirement: A member opens a room's settings from the room list without entering the room

The room's settings SHALL open from its row in the room list without taking the member into the room.

#### Scenario: a member opens settings from a room row

- **GIVEN** a member with a management permission in a room
- **WHEN** the member opens that room's settings from its row in the room list
- **THEN** the settings dialog opens over the list
- **AND** the app stays where it was

### Requirement: The settings dialog opens only for a member with a management permission

The settings dialog SHALL open only for a member who holds at least one management permission in the room, or the administrator permission.

#### Scenario: a plain member tries to open settings

- **GIVEN** a member who holds no management permission in a room
- **WHEN** the member tries to open the room's settings
- **THEN** the settings are not offered
- **AND** the dialog does not open

#### Scenario: a member who manages only emoji

- **GIVEN** a member whose only management permission is manage emoji
- **WHEN** the member opens the room's settings
- **THEN** the dialog opens with the emoji panel as its only panel

### Requirement: A panel is shown only to members holding the permission it manages

A settings panel SHALL be shown only to members holding the permission it manages, and a category with no visible panels SHALL be hidden.

#### Scenario: a member lacking the webhook permission

- **GIVEN** a member who does not hold the manage webhooks permission
- **WHEN** the member views the settings
- **THEN** the Webhooks panel is not shown

#### Scenario: a category with no visible panels

- **GIVEN** a member who holds no permission for any panel in the Integrations category
- **WHEN** the member views the settings
- **THEN** the Integrations category is not shown

#### Scenario: the profile panel

- **GIVEN** any member of the room
- **WHEN** the member views the settings
- **THEN** the Profile panel is shown

### Requirement: The destructive action is labelled for the member's role in the room

The destructive action at the foot of the settings SHALL read Delete for the room owner and Leave for every other member.

#### Scenario: the owner deletes the room

- **GIVEN** the room owner
- **WHEN** the owner chooses Delete
- **THEN** the owner must type the room's name to confirm
- **AND** the room is deleted once confirmed

#### Scenario: a member leaves the room

- **GIVEN** a member who is not the owner
- **WHEN** the member chooses Leave and confirms
- **THEN** the member leaves the room
- **AND** the member is not asked to type the room's name

### Requirement: A panel's save changes only the fields that panel owns

A panel's save SHALL change only the fields that panel edits, and a save that is refused SHALL leave the entered values in place for another try.

#### Scenario: two panels save different fields of the room

- **GIVEN** two panels that each edit different fields of the room
- **WHEN** both panels save
- **THEN** both sets of changes are kept

#### Scenario: a save is refused

- **GIVEN** a panel whose save is refused
- **WHEN** the save fails
- **THEN** the values the member entered stay on screen
- **AND** the panel still shows them as unsaved, so the next blur tries again

### Requirement: The invites panel lists invites and can pause them for the room

The invites panel SHALL list every active invite link in the room with its inviter, uses and expiry, and SHALL pause invites for the whole room when asked.

#### Scenario: a manager pauses invites

- **GIVEN** a room with active invite links and a member holding the manage room permission
- **WHEN** the member pauses invites for the room
- **THEN** no new member can join through an invite link until invites are resumed

### Requirement: On a narrow screen the settings sidebar covers the panel until a panel is chosen

On a narrow screen the settings sidebar SHALL cover the panel while open and SHALL close when a panel is chosen.

#### Scenario: a member on a phone opens the settings menu

- **GIVEN** a member on a narrow screen with the settings open
- **WHEN** the member opens the sidebar
- **THEN** the sidebar covers the panel

#### Scenario: a member chooses a panel on a phone

- **GIVEN** the sidebar open on a narrow screen
- **WHEN** the member chooses a panel
- **THEN** the sidebar closes and the panel fills the width
