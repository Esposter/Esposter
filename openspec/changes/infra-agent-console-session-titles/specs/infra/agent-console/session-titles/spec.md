## ADDED Requirements

### Requirement: Enter saves a renamed session title and Escape keeps the old one

The console SHALL save a new session title when the reader presses Enter, and SHALL keep the previous title when the reader presses Escape.

#### Scenario: Enter saves the new title

- **GIVEN** the reader has opened a session's title for editing
- **WHEN** the reader types a new title and presses Enter
- **THEN** the session shows the new title in the sessions list

#### Scenario: Escape keeps the old title

- **GIVEN** the reader has opened a session's title for editing
- **WHEN** the reader types a new title and presses Escape
- **THEN** the session keeps its previous title
- **AND** nothing is saved

#### Scenario: An empty title saves nothing

- **GIVEN** the reader has opened a session's title for editing
- **WHEN** the reader clears the title and presses Enter
- **THEN** the session keeps its previous title

### Requirement: A renamed title is saved in the session's transcript

The console SHALL save a renamed title in the session's own transcript so that the sessions list reads it back.

#### Scenario: A renamed title survives a reload

- **GIVEN** the reader has renamed a session
- **WHEN** the page reloads
- **THEN** the sessions list shows the new title

### Requirement: An open session's title updates on every connected page

The console SHALL update the title of an open session on every connected page at once.

#### Scenario: A rename shows on every connected page

- **GIVEN** two pages are connected to the same host
- **WHEN** the reader renames an open session on one page
- **THEN** the other page shows the new title

### Requirement: A session with no transcript keeps its new title until its first prompt

The console SHALL show a new title for a session with no transcript yet and SHALL save that title when the session's first prompt is sent.

#### Scenario: A title is held before the first prompt

- **GIVEN** a session is opened and has not been prompted
- **WHEN** the reader renames it
- **THEN** the console shows the new title

#### Scenario: The first prompt saves the held title

- **GIVEN** the reader has renamed a session that has no transcript yet
- **WHEN** the reader sends the session's first prompt
- **THEN** the sessions list shows the renamed title
