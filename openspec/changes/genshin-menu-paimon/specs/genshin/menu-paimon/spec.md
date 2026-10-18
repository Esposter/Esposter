## ADDED Requirements

### Requirement: Paimon floats beside the menu only from a held official model

Paimon SHALL float to the right of the menu with her idle animations only when the reader holds her official model, and the menu SHALL work whole without her.

#### Scenario: Paimon appears beside the menu once an official model is held

- **GIVEN** the reader holds Paimon's official model
- **WHEN** the reader opens the Paimon menu
- **THEN** Paimon is drawn to the right of the menu with her idle animations

#### Scenario: The menu opens without Paimon when no official model is held

- **GIVEN** the reader does not hold Paimon's official model
- **WHEN** the reader opens the Paimon menu
- **THEN** the menu opens and works in full
- **AND** Paimon is not drawn

### Requirement: The links out to web pages are drawn disabled and Training Guide is left out

The Paimon menu SHALL draw Community, Version Highlights, Feedback and Survey as disabled entries, and SHALL leave Training Guide out of its contents.

#### Scenario: Community and Feedback show as disabled entries

- **GIVEN** the reader opens the Paimon menu
- **WHEN** the contents are drawn
- **THEN** Community and Feedback are shown as disabled entries

#### Scenario: Version Highlights and Survey show as disabled entries

- **GIVEN** the reader opens the Paimon menu
- **WHEN** the contents are drawn
- **THEN** Version Highlights and Survey are shown as disabled entries

#### Scenario: Training Guide is absent from the contents

- **GIVEN** the reader opens the Paimon menu
- **WHEN** the contents are drawn
- **THEN** Training Guide is not among the contents

### Requirement: The profile card shows the account's name and avatar

The profile card SHALL show the signed-in account's name and avatar, and SHALL show the default name Traveler when no account is signed in.

#### Scenario: A signed-in reader sees the account's name and avatar

- **GIVEN** the reader is signed in
- **WHEN** the Paimon menu opens
- **THEN** the profile card shows the account's name and avatar

#### Scenario: A signed-out reader sees the default name

- **GIVEN** the reader is not signed in
- **WHEN** the Paimon menu opens
- **THEN** the profile card shows the name Traveler

### Requirement: A profile field appears once its system is built

A profile card field SHALL appear once the system behind it is built, and SHALL stay out until then.

#### Scenario: A profile field appears once its system is built

- **GIVEN** a profile field's system has been built
- **WHEN** the Paimon menu opens
- **THEN** the profile card shows that field

#### Scenario: A profile field stays out until its system is built

- **GIVEN** a profile field's system is not yet built
- **WHEN** the Paimon menu opens
- **THEN** the profile card does not show that field

### Requirement: The Traveler's birthday is set once from the profile card

The profile card SHALL offer the Traveler's birthday to be set once, and SHALL show it with no setter once it is set.

#### Scenario: A birthday not yet set offers the button that sets it

- **GIVEN** the Traveler's birthday is not set
- **WHEN** the profile card is shown
- **THEN** the Birthday row stands over a Set Birthday button

#### Scenario: Confirming the dialog sets the birthday once

- **GIVEN** the Set Birthday dialog is open with a month and a day picked
- **WHEN** the player confirms the date
- **THEN** the date is set as the Traveler's birthday, and the row shows it with no button to set it again

#### Scenario: A birthday already set shows its date and no button to set it

- **GIVEN** the Traveler's birthday is set
- **WHEN** the profile card is shown
- **THEN** the Birthday row shows its month and day and no Set Birthday button

### Requirement: The side bar opens the Time, Settings and quit screens

The Paimon menu's side bar SHALL open the Time screen, the Settings screen and the quit prompt when the reader chooses each.

#### Scenario: Choosing Time opens the Time screen

- **GIVEN** the reader has the Paimon menu open
- **WHEN** the reader chooses Time in the side bar
- **THEN** the Time screen opens

#### Scenario: Choosing Quit Game opens the quit prompt

- **GIVEN** the reader has the Paimon menu open
- **WHEN** the reader chooses Quit Game in the side bar
- **THEN** the quit prompt opens
