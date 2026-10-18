## ADDED Requirements

### Requirement: The page manages sessions on every paired host and runs none itself

The console page SHALL list and control the sessions on every host it has paired and SHALL NOT run a session itself.

#### Scenario: A reload reconnects to every open session

- **GIVEN** the reader has sessions open on a host
- **WHEN** the page reloads
- **THEN** the page reconnects to the host
- **AND** the log of every open session is replayed to the page

#### Scenario: A closed tab does not end a turn

- **GIVEN** a turn is running on a host
- **WHEN** the reader closes the page
- **THEN** the turn keeps running on the host

#### Scenario: A host that dies without a word is shown as not answering

- **GIVEN** the page is connected to a host
- **WHEN** the host stops without telling the page
- **THEN** the page shows the host as not answering
- **AND** the page retries the host with growing delays

### Requirement: Both ends stay live and either end can act

The console SHALL show a session started, stopped or answered on the page in the host's window at once, and SHALL tell every connected page when a host stops from its own window.

#### Scenario: A session started on the page shows in the host's window

- **GIVEN** a host is running with its window open
- **WHEN** the reader starts a session on the page
- **THEN** the session shows in the host's window at once

#### Scenario: Closing a host's window tells every page

- **GIVEN** two pages are connected to a host
- **WHEN** the reader closes the host's window
- **THEN** both pages show the host as stopping
- **AND** the host's sessions are shown as closed

### Requirement: Each host and session runs only in a window the reader can see and close

The console SHALL run each host and each session only in a window the reader can see and close, and SHALL leave nothing running after either window is closed.

#### Scenario: Closing a session's window stops the session

- **GIVEN** a session is running in its own window
- **WHEN** the reader closes that window
- **THEN** the session stops
- **AND** nothing of it keeps running

#### Scenario: Nothing starts when the computer starts

- **GIVEN** the reader has closed every host window
- **WHEN** the computer starts again
- **THEN** no host runs

#### Scenario: A remote connection's session is stopped from the page

- **GIVEN** a session runs on a remote connection's host
- **WHEN** the reader stops it on the page
- **THEN** the session stops

### Requirement: A view is built only while it is in view

The console SHALL build a view only while the reader has it in view.

#### Scenario: A view out of view is not built

- **GIVEN** a view is not in view
- **WHEN** the reader views the console
- **THEN** that view is not built

### Requirement: Other tooling joins through the cheapest tier that fits

The console SHALL open an app page of the Esposter app in the side pane with no code written for it.

#### Scenario: An app page opens in the side pane

- **GIVEN** the reader is in the console
- **WHEN** the reader opens an app page
- **THEN** the page opens in the side pane

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
