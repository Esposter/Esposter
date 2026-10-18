## Purpose

The message-scoped fullscreen settings dialog and its database-backed communication settings. Covers which preferences follow a member across devices, which stay on one device, how changes apply and revert, the allowed ranges, and how the dialog is navigated.

## Requirements

### Requirement: Communication preferences follow the member across devices

A member's communication preferences SHALL be stored for the member and shown the same on every device they sign in on.

#### Scenario: a member changes a preference on one device

- **GIVEN** a member signed in on two devices
- **WHEN** the member changes a communication preference on one device
- **THEN** the other device shows the same preference

### Requirement: Hardware device choices stay on the device where they were made

A member's microphone, speaker and camera choices SHALL stay on the device where they were made.

#### Scenario: a member picks a microphone on one device

- **GIVEN** a member who picks a microphone on one device
- **WHEN** the member signs in on another device
- **THEN** the other device keeps its own microphone choice

### Requirement: A settings change applies at once and reverts if saving fails

A settings change SHALL show at once, and SHALL revert with an error shown to the member when saving it fails.

#### Scenario: a change saves

- **GIVEN** a member changing a setting
- **WHEN** the change saves
- **THEN** the new value stays in place

#### Scenario: a change fails to save

- **GIVEN** a member changing a setting while saving is failing
- **WHEN** the save fails
- **THEN** the setting returns to its previous value
- **AND** the member is shown an error

### Requirement: The auto-idle threshold is between one minute and one day

The auto-idle threshold SHALL be a value from one minute to twenty-four hours, and it defaults to ten minutes.

#### Scenario: a member sets the threshold to ten minutes

- **GIVEN** a member changing the auto-idle threshold
- **WHEN** the member sets it to ten minutes
- **THEN** the threshold is saved

#### Scenario: a threshold outside the range is refused

- **GIVEN** a member changing the auto-idle threshold
- **WHEN** the member saves a value below one minute
- **THEN** the value is refused and the previous threshold stays

### Requirement: A member who has saved no settings sees the defaults

A member who has never saved a communication setting SHALL see the default value for each one.

#### Scenario: a new member opens the settings

- **GIVEN** a member who has never changed a setting
- **WHEN** the member opens the settings dialog
- **THEN** every setting shows its default value

### Requirement: Every panel is open to every member

Every panel in the message settings dialog SHALL be open to every member, since each one edits only that member's own settings.

#### Scenario: a member opens each panel

- **GIVEN** any member
- **WHEN** the member opens each panel in the dialog
- **THEN** each panel opens

### Requirement: Choosing a section moves to it and the section on screen is highlighted

Choosing a section in the settings dialog SHALL scroll to that section, and the section currently on screen SHALL be highlighted.

#### Scenario: a member scrolls a long panel

- **GIVEN** a panel with several sections
- **WHEN** the member scrolls the panel
- **THEN** the section on screen is highlighted in the sidebar

#### Scenario: a member chooses a section

- **GIVEN** a panel with several sections
- **WHEN** the member chooses a section in the sidebar
- **THEN** the panel scrolls so that section's title sits just below the header

### Requirement: The theme switches without a flash on reload

The theme SHALL be chosen from the header rather than from the settings dialog, and the chosen theme SHALL be shown from the first paint after a reload.

#### Scenario: a member reloads the app in dark theme

- **GIVEN** a member who chose the dark theme
- **WHEN** the member reloads the app
- **THEN** the dark theme is shown from the first paint
