## Purpose

The agent console's host as one Windows file carrying its own runtime and Claude Code, downloaded unsigned from the pairing screen, installed by opening it, and started by an esposter-host:// link in a console window of its own.

## Requirements

### Requirement: The host is one Windows file that needs nothing else

The host SHALL be delivered as one downloadable Windows file carrying its own runtime and Claude Code, so that no other install is needed.

#### Scenario: Downloading the host from the pairing screen

- **GIVEN** the pairing screen with the newest release
- **WHEN** the reader downloads the host
- **THEN** they receive one executable file

#### Scenario: Platforms other than Windows

- **GIVEN** a reader on macOS or Linux
- **WHEN** they look for a downloadable host
- **THEN** none is offered, since only the Windows file is built

### Requirement: Opening the host installs it for the current user without an administrator

Opening the host file from outside its install folder SHALL install it for the current user without asking for an administrator.

#### Scenario: Opening the downloaded host

- **GIVEN** the downloaded host file outside its install folder
- **WHEN** the reader opens it
- **THEN** it installs itself into the user's own application folder, registers the link scheme, and serves from the window it was opened in

#### Scenario: An older host still running from the install folder

- **GIVEN** an older host still running from the install folder
- **WHEN** a newer download is opened
- **THEN** the install says in plain words what to do and exits

### Requirement: A link starts the host and never configures it

An esposter-host link SHALL only start the installed host and SHALL NOT pass it configuration.

#### Scenario: A link that carries extra arguments

- **GIVEN** a link launch whose arguments include anything beyond the link
- **WHEN** the host is started by it
- **THEN** the launch is refused before any argument is read

#### Scenario: A plain link

- **GIVEN** a link carrying only the link
- **WHEN** the browser's open-app prompt is accepted
- **THEN** the host starts in a console window of its own

### Requirement: The browser always asks before a link starts the host

A link SHALL cause the browser to ask the reader before the host starts.

#### Scenario: A page opens the host's link

- **GIVEN** a page opening an esposter-host link
- **WHEN** the link is followed
- **THEN** the browser asks whether to open the host before anything starts

### Requirement: The host window says what is running in plain words

The host's window SHALL say the host is running and that closing the window stops it, and SHALL show no address, port or credential.

#### Scenario: The host running in its window

- **GIVEN** the host started from its download
- **WHEN** its window is shown
- **THEN** it says the host is running, that the window should stay open, and to press Connect on the page

### Requirement: A link opened while a host runs hands over its code

A link opened while a host is already running SHALL hand its pairing code to that host, after the host proves itself, and then close.

#### Scenario: A link opened beside the running host

- **GIVEN** a host running on the port
- **WHEN** a link is opened
- **THEN** the code is handed to the running host, the window says a host is already running, and it closes

#### Scenario: Another program holds the port

- **GIVEN** a program other than the host holding the port
- **WHEN** a link is opened
- **THEN** the code is not handed over, the program is reported as holding the port, and the host exits with a failure

### Requirement: The host uninstalls on request

The host SHALL remove its link scheme and its install folder when asked to uninstall.

#### Scenario: Running the uninstall command

- **GIVEN** the installed host
- **WHEN** the uninstall command runs
- **THEN** the link scheme is removed at once and the install folder is removed after the window closes

### Requirement: A newer download replaces the older host

Installing a newer download SHALL replace the older host once the older host's window is closed.

#### Scenario: Installing over an older host that has closed

- **GIVEN** an older host whose window is closed
- **WHEN** a newer download is opened
- **THEN** the newer host installs over the older one
