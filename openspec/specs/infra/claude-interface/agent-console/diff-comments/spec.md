## Purpose

A click on a line of a file's whole diff in the agent console's changes tab leaves a comment on it, and the comments go to the session together as one prompt naming each file and line, as the Code tab's diff view sends them.

## Requirements

### Requirement: A click on a diff line opens a comment box

A click on a line of a file's whole diff SHALL open a comment box under that line.

#### Scenario: Clicking a changed line

- **GIVEN** a file's whole diff in the changes tab
- **WHEN** the person clicks a line
- **THEN** a comment box opens under it

#### Scenario: Opening a comment box from the keyboard

- **GIVEN** a diff line focused with the keyboard
- **WHEN** the person presses Enter or Space
- **THEN** the comment box opens as a click does

#### Scenario: A file shown from a single edit

- **GIVEN** a single edit to a file whose original text the session never saw
- **WHEN** the diff is shown
- **THEN** its lines take no comment boxes

### Requirement: An unchanged line takes its comment on the new side only

An unchanged line SHALL take a comment on its new side only.

#### Scenario: Commenting on an unchanged line

- **GIVEN** an unchanged line in a diff
- **WHEN** the person comments on it
- **THEN** the comment is attached to its new-side line number

### Requirement: A removed line is named on its old side

A comment on a line the change removed SHALL be named on its old side, so its number is not taken for a line still in the file.

#### Scenario: Commenting on a removed line

- **GIVEN** a line the change removed
- **WHEN** the person comments on it
- **THEN** the comment is named as the removed line on its old side

### Requirement: Saving keeps a comment under its line and an empty one is removed

Saving a comment with Ctrl+Enter SHALL keep it drawn under its line with Edit and Remove, and saving an emptied comment SHALL remove it.

#### Scenario: Saving a comment

- **GIVEN** an open comment box with text
- **WHEN** the person presses Ctrl+Enter
- **THEN** the comment stays under its line with Edit and Remove

#### Scenario: Saving an emptied comment

- **GIVEN** a saved comment
- **WHEN** the person edits it to empty and saves
- **THEN** the comment is removed

### Requirement: Comments collect across files until sent as one prompt

Comments SHALL collect across files as a draft until the person sends them, and sending SHALL place them in the composer as one prompt.

#### Scenario: Sending the comments

- **GIVEN** comments on lines in several files
- **WHEN** the person presses Send comments
- **THEN** they are placed in the composer after any existing text, separated by a blank line, and the draft is cleared

#### Scenario: Sending the composed prompt

- **GIVEN** the comments placed in the composer
- **WHEN** the person presses Enter
- **THEN** the prompt is sent as any prompt is sent

### Requirement: Each comment in the prompt names its file, line and quoted line

Each comment in the sent prompt SHALL name its file and line and quote the line it is on.

#### Scenario: A comment on a removed line in the prompt

- **GIVEN** a comment on a removed line
- **WHEN** the prompt is composed
- **THEN** the comment's line is written with the removed marker

### Requirement: The draft is kept per session and survives a reconnect

Each session SHALL show only its own draft, and a reconnect SHALL keep the drafted comments.

#### Scenario: Switching to another session

- **GIVEN** a draft in one session
- **WHEN** the person switches to another session
- **THEN** only the other session's draft is shown

#### Scenario: Reconnecting with a draft

- **GIVEN** a draft in the open session
- **WHEN** the page reconnects and replays the session
- **THEN** the drafted comments are still there

### Requirement: The draft is held in memory

The draft SHALL be held in memory only, so a page reload drops it.

#### Scenario: Reloading the page with a draft

- **GIVEN** a draft of comments
- **WHEN** the page is reloaded
- **THEN** the draft is gone
