## ADDED Requirements

### Requirement: The page manages sessions on every paired host and runs none itself

The console page SHALL list and control the sessions on every host it has paired and SHALL NOT run a session itself.

#### Scenario: A closed tab does not end a turn

- **GIVEN** a turn is running on a host
- **WHEN** the reader closes the page
- **THEN** the turn keeps running on the host

### Requirement: Each host and session runs only in a window the reader can see and close

The console SHALL run each host and each session only in a window the reader can see and close, and SHALL leave nothing running after either window is closed.

#### Scenario: Nothing starts when the computer starts

- **GIVEN** the reader has closed every host window
- **WHEN** the computer starts again
- **THEN** no host runs

### Requirement: A view is built only while it is in view

The console SHALL build a view only while the reader has it in view.

#### Scenario: A view out of view is not built

- **GIVEN** a view is not in view
- **WHEN** the reader views the console
- **THEN** that view is not built

### Requirement: The console's look is set by a theme and the default has no character

The console SHALL show the default look, with no character, unless a theme is chosen for the session.

#### Scenario: The default theme shows the world with no character

- **GIVEN** a session uses the default theme
- **WHEN** the console is shown
- **THEN** no character, avatar or character palette is shown

### Requirement: The console ships for Windows only and costs nothing to run

The console SHALL ship its installer for Windows only, unsigned, and SHALL keep every secret it stores under a key the app already holds.

#### Scenario: The installer is offered for Windows only

- **GIVEN** the reader looks for the console's installer
- **WHEN** the reader views the download
- **THEN** the installer is offered for Windows only
- **AND** the download is not signed

### Requirement: Follow-on changes proceed in the order the program sets

The console SHALL ship the Genshin theme and the terminal-mirror driver only after the console alone covers a day's work.

#### Scenario: The Genshin theme waits for a day's work in the console

- **GIVEN** a day's work cannot be done in the console alone
- **WHEN** a reader looks for the Genshin theme
- **THEN** the Genshin theme is not offered
