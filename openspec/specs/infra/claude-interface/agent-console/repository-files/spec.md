## Purpose

The agent console reaches the session's files the way the Code tab does. Typing @ in the composer opens a filterable list of the session's files and inserts the one picked as a mention, and a file can be opened in a read-only view that offers to attach it to the next prompt or copy its path.

## Requirements

### Requirement: Typing @ in the composer opens the session's files as a filterable list

Typing @ in the composer SHALL open a filterable list of the session's files, and picking one SHALL insert it as a mention.

#### Scenario: Picking a file from the @ menu

- **GIVEN** the composer with an @ typed
- **WHEN** the person picks a file from the list
- **THEN** the @ text is replaced by a mention of that file's path followed by a space

#### Scenario: Filtering a long file list

- **GIVEN** a session with more files than the menu shows
- **WHEN** the person types to filter the list
- **THEN** at most fifty matches are listed

### Requirement: The file list is fetched each time the menu opens

The file list SHALL be fetched from the session's host each time the @ menu opens, so a file created since the last open is listed.

#### Scenario: A file created after the last open

- **GIVEN** the @ menu was opened earlier in the session
- **WHEN** a new file has since been created and the menu is opened again
- **THEN** the new file is listed

### Requirement: A file opens in a read-only view with attach and copy controls

Opening a file SHALL show its text in a read-only view with its path, an Attach as context control and a Copy path control.

#### Scenario: Attaching the open file as context

- **GIVEN** a file open in its read-only view
- **WHEN** the person presses Attach as context
- **THEN** a mention of the file's path is added to the composer

#### Scenario: Copying the open file's path

- **GIVEN** a file open in its read-only view
- **WHEN** the person presses Copy path
- **THEN** the file's path is copied

### Requirement: A path in a reply opens the file only when the session lists it

A path in a reply or tool input SHALL open the file view only when it matches a path in the session's file list.

#### Scenario: A listed path in a reply

- **GIVEN** a reply naming a path in the session's file list
- **WHEN** the person clicks it
- **THEN** the file opens in the read-only view

#### Scenario: A path not in the file list

- **GIVEN** a reply naming a path the session does not list
- **WHEN** it is shown
- **THEN** the path stays plain text

### Requirement: A file too large or binary is shown with its reason and no text

A file over the limit `REPOSITORY_FILE_MAX_BYTE_LENGTH` declares, or one holding a NUL byte, SHALL be shown with its reason and no text.

#### Scenario: A file larger than the limit

- **GIVEN** a file over that limit
- **WHEN** it is opened
- **THEN** the view says the file is too large and shows no text

#### Scenario: A file holding a NUL byte

- **GIVEN** a file holding a NUL byte
- **WHEN** it is opened
- **THEN** the view says the file is binary and shows no text

### Requirement: Files are read only inside the session's working folder

The page SHALL read only files inside the session's working folder, so a path that leaves it is refused.

#### Scenario: A path that climbs out of the folder

- **GIVEN** a path with a parent-folder step that leaves the working folder
- **WHEN** the page asks to read it
- **THEN** the read is refused

#### Scenario: A symbolic link that leaves the folder

- **GIVEN** a symbolic link inside the working folder pointing outside it
- **WHEN** the page asks to read it
- **THEN** the read is refused

### Requirement: The file view does not edit files

The file view SHALL NOT offer any control that edits a file.

#### Scenario: Looking at an open file

- **GIVEN** a file open in the read-only view
- **WHEN** the person looks at its controls
- **THEN** there is no control that edits the file

### Requirement: The file list includes untracked files that are not ignored

In a repository, the file list SHALL include untracked files that are not ignored, and its paths SHALL use forward slashes on every platform.

#### Scenario: A new untracked file in a repository

- **GIVEN** a repository with a new file not yet committed and not ignored
- **WHEN** the file list is fetched
- **THEN** the new file is listed with forward slashes in its path
