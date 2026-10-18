## Purpose

A terminal inside the agent console — a Shell tab that opens PowerShell or the person's shell under a pseudo-terminal on the host, in the session's folder with the host's environment, drawn by xterm.js, replayed on reconnect and ended with its session.

## Requirements

### Requirement: A Shell tab opens a terminal in the session's folder

The console SHALL offer a Shell tab whose terminal opens in the current session's folder with the host's environment.

#### Scenario: Opening the Shell tab

- **GIVEN** a session with a folder
- **WHEN** the person opens the Shell tab
- **THEN** a shell opens in that session's folder

#### Scenario: Opening a shell from the keyboard

- **GIVEN** the console page with nothing open over the world
- **WHEN** the person presses Ctrl+backtick
- **THEN** the Shell tab opens

#### Scenario: Opening another shell beside the first

- **GIVEN** a Shell tab with a shell running
- **WHEN** the person presses plus
- **THEN** a second shell opens beside it with its own close control

### Requirement: The shell is PowerShell on Windows and the person's shell elsewhere

On Windows the shell SHALL be PowerShell 7 when it is installed and Windows PowerShell otherwise, and elsewhere the person's own shell.

#### Scenario: A Windows host with PowerShell 7 installed

- **GIVEN** a Windows host with PowerShell 7 on its path
- **WHEN** a shell opens
- **THEN** PowerShell 7 runs

#### Scenario: A Windows host without PowerShell 7

- **GIVEN** a Windows host without PowerShell 7
- **WHEN** a shell opens
- **THEN** Windows PowerShell runs

#### Scenario: A host that is not Windows

- **GIVEN** a host on a non-Windows system
- **WHEN** a shell opens
- **THEN** the person's own shell runs

### Requirement: A shell that cannot start says so

A host that cannot start a shell SHALL say so in the Shell tab rather than fail silently.

#### Scenario: A Linux host without a usable terminal library

- **GIVEN** a Linux host where the terminal library has no prebuilt binary
- **WHEN** the person opens a shell
- **THEN** the Shell tab says no shell can start

### Requirement: A reconnecting page is replayed each running shell's recent output once

A page that reconnects SHALL be replayed each running shell with its recent output, and SHALL NOT show any output twice.

#### Scenario: Reconnecting with a running shell

- **GIVEN** a running shell with recent output
- **WHEN** the page reconnects
- **THEN** the shell's recent output is replayed and the page's earlier copy is replaced

### Requirement: A shell ends with its session or with the host

A shell SHALL end when its session closes or the host stops, and every page SHALL be told.

#### Scenario: The session closes

- **GIVEN** a session with a running shell
- **WHEN** the session closes
- **THEN** the shell ends and every page is told it closed

#### Scenario: The host stops

- **GIVEN** a host with running shells
- **WHEN** the host stops
- **THEN** every shell ends and every page is told

#### Scenario: A shell still starting when its session closes

- **GIVEN** a shell still starting
- **WHEN** its session closes
- **THEN** the shell is ended as it arrives and its opening request is answered with an error

### Requirement: Shell output stays out of the session's conversation

A shell's output SHALL NOT enter the session's conversation or its event log.

#### Scenario: Running a command in the shell

- **GIVEN** a shell in a session
- **WHEN** the command prints output
- **THEN** the output is not part of the session's conversation

### Requirement: The terminal is drawn only when the Shell tab is first shown

The terminal renderer SHALL load only when the Shell tab is first shown, so the console's first load does not carry it.

#### Scenario: Loading the console without opening the Shell tab

- **GIVEN** the console page loads
- **WHEN** the Shell tab has not been shown
- **THEN** the terminal renderer has not loaded

### Requirement: The terminal tells the shell each new size

The terminal SHALL fill its space and tell the shell each time its size changes.

#### Scenario: Resizing the terminal

- **GIVEN** a shell with its terminal shown
- **WHEN** the terminal's space changes size
- **THEN** the shell is told its new size
