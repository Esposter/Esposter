## Purpose

Every surface is written for the least technical person who will use it — one way through, no plumbing on screen, numbered steps in the words the reader will see, and a plain next step wherever one can fail. The expert's paths live in the docs and READMEs, never beside the simple one.

## Requirements

### Requirement: Each surface offers one path to its job

Each surface SHALL offer exactly one path to its job, and any expert alternative SHALL live outside the surface in the documentation.

#### Scenario: Connecting a computer to the agent console

- **GIVEN** a reader who wants to connect the agent console to a computer
- **WHEN** the reader opens the connection screen
- **THEN** only the download and open steps are shown
- **AND** the command-line route is not shown on the screen

### Requirement: A surface shows no plumbing

A surface SHALL NOT show addresses, ports, tokens, file paths, commands, identifiers or raw data unless showing that detail is the purpose of the surface.

#### Scenario: A connection is established

- **GIVEN** a reader whose computer has just connected
- **WHEN** the connection screen updates
- **THEN** no address or token is shown on the screen

#### Scenario: A link leads to another computer

- **GIVEN** a link that opens another computer
- **WHEN** the reader sees the link
- **THEN** the screen says in plain words that the link connects to another computer

### Requirement: A multi-action task is shown as numbered steps

A task of more than one action SHALL be shown as numbered steps, one action per step, naming the exact words the reader will see on screen.

#### Scenario: A task with three actions

- **GIVEN** a task that takes the reader three actions
- **WHEN** the task is shown
- **THEN** it appears as three numbered steps
- **AND** each step names the words the reader will see on screen

### Requirement: A step that can fail tells the reader what to do next

Every step that can fail SHALL tell the reader in plain words what to do next, and SHALL NOT show an error code or a stack.

#### Scenario: A file opened while another host window is open

- **GIVEN** a host window already open on the computer
- **WHEN** the reader opens the downloaded file
- **THEN** the screen says to close the other host window and then open the file again
- **AND** no error code is shown

### Requirement: A step is removed before it is explained

A step that needs explaining SHALL first be removed, or done by the product, where the product can do it instead.

#### Scenario: A download that would need unzipping

- **GIVEN** a download that would otherwise arrive as a compressed archive the reader must unzip
- **WHEN** the download is offered
- **THEN** it is offered as one file the reader opens directly
