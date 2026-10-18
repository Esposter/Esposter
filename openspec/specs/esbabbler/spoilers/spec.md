## Purpose

Text and attachment spoilers — marked content stays hidden until a reader reveals it. Covers how a member marks text or an attachment as a spoiler, how a reader reveals it, and how spoilers behave in notifications, search and link previews.

## Requirements

### Requirement: Text marked as a spoiler stays hidden until a reader reveals it

Text a member marks as a spoiler SHALL stay hidden until a reader reveals it.

#### Scenario: a member wraps text in spoiler bars

- **GIVEN** a member typing text wrapped in double vertical bars
- **WHEN** the member types the closing bars
- **THEN** the text is marked as a spoiler

#### Scenario: a reader reveals a spoiler by clicking it

- **GIVEN** a spoiler in a message
- **WHEN** a reader clicks it
- **THEN** the text is shown

#### Scenario: a reader reveals a spoiler from the keyboard

- **GIVEN** a spoiler in a message focused by keyboard
- **WHEN** the reader presses Enter or Space
- **THEN** the text is shown

### Requirement: A reveal is private to the reader and leaves the message unchanged

A reveal SHALL apply only to the reader who revealed it and SHALL NOT change the message for anyone else.

#### Scenario: another member views a revealed spoiler

- **GIVEN** a spoiler one reader has revealed
- **WHEN** another member views the same message
- **THEN** the spoiler is still hidden for that member
- **AND** the message text is unchanged

### Requirement: A member toggles a spoiler on selected text with the keyboard

A member SHALL be able to turn the spoiler on or off for selected text with the keyboard shortcut Ctrl+Shift+S.

#### Scenario: a member toggles a spoiler on a selection

- **GIVEN** text selected in the composer
- **WHEN** the member presses Ctrl+Shift+S
- **THEN** the selected text is marked as a spoiler

### Requirement: The spoiler command posts its text hidden

The spoiler command SHALL post the given text already hidden behind a spoiler.

#### Scenario: a member uses the spoiler command

- **GIVEN** a member typing the spoiler command with text
- **WHEN** the member sends it
- **THEN** the text is posted as a spoiler

### Requirement: An attachment whose name begins with SPOILER is hidden until revealed

An attachment whose file name begins with SPOILER_ SHALL be shown blurred behind a spoiler label, and a member SHALL be able to mark or unmark an attachment with the eye control.

#### Scenario: a reader opens a spoiler image

- **GIVEN** a spoiler image in a message
- **WHEN** the reader clicks it once
- **THEN** the image is revealed
- **AND** a second click opens the image viewer

#### Scenario: a member marks an attachment with the eye control

- **GIVEN** an attachment waiting to be sent
- **WHEN** the member toggles its eye control
- **THEN** the attachment is marked or unmarked as a spoiler

### Requirement: Attachments sent before spoilers existed stay visible

An attachment sent before the spoiler mark existed SHALL remain visible without a spoiler.

#### Scenario: a reader views an older attachment

- **GIVEN** an attachment sent before spoilers were supported
- **WHEN** a reader views the message
- **THEN** the attachment is shown without a spoiler

### Requirement: Spoiler text is hidden in notifications but still found by search

A push notification SHALL hide spoiler text, while message search SHALL still match it.

#### Scenario: a message with a spoiler is notified

- **GIVEN** a message containing spoiler text
- **WHEN** a notification for it is shown
- **THEN** the spoiler text is replaced with blocks

#### Scenario: a member searches for spoiler text

- **GIVEN** a message whose spoiler text contains a search term
- **WHEN** a member searches for that term
- **THEN** the message is found

### Requirement: Links inside a spoiler are not previewed

A link inside a spoiler SHALL NOT produce a link preview.

#### Scenario: a message holds a link inside a spoiler

- **GIVEN** a message whose link is inside a spoiler
- **WHEN** the message is sent
- **THEN** no link preview is made for that link
