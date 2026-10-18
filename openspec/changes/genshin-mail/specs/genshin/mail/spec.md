## ADDED Requirements

### Requirement: The Mail screen lists the mails a player holds

The Mail screen SHALL list each mail the player holds with its sender and title, and opening a mail SHALL show its text and the items attached to it.

#### Scenario: The Mail screen lists the held mails

- **GIVEN** the player holds a mail
- **WHEN** the player opens the Mail screen
- **THEN** the mail is listed with its sender and title

#### Scenario: Opening a mail shows its text and attachments

- **GIVEN** the player holds a mail with an attached reward
- **WHEN** the player opens the mail
- **THEN** its text and the items it holds are shown

### Requirement: Claiming a mail gives its items once

A mail's attached items SHALL reach the bag and wallet once, when the player claims them, and a claimed mail SHALL NOT be claimed again.

#### Scenario: Claiming a mail gives its items once

- **GIVEN** the player holds a mail with an unclaimed reward
- **WHEN** the player claims the mail
- **THEN** its items are added to the bag and wallet, and the mail is marked claimed

#### Scenario: A claimed mail cannot be claimed again

- **GIVEN** the player has claimed a mail
- **WHEN** the player claims it again
- **THEN** no items are added

### Requirement: The mails a player holds survive a reload

The mails a player holds, with their claim and read state, SHALL be saved with the save and restored on load.

#### Scenario: A mail's claim is kept across a reload

- **GIVEN** the player has claimed a mail
- **WHEN** the save is reloaded
- **THEN** the mail is still marked claimed

#### Scenario: A save without its mails is refused

- **GIVEN** a save with no mail list
- **WHEN** the save is loaded
- **THEN** the save is refused
