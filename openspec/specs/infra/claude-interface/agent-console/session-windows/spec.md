## Purpose

On Windows, each agent console session a loopback host opens runs in a console window of its own that logs the conversation, so a session is seen and stopped from its window or from the page, either end shows the other's change at once, and a host killed without stopping takes no session with it.

## Requirements

### Requirement: Each session runs in a window of its own on Windows

On Windows, a session on a loopback host SHALL run in a console window of its own, so that closing that window stops only that session.

#### Scenario: Closing one session's window

- **GIVEN** two sessions running in their own windows
- **WHEN** the person closes one window
- **THEN** only that session stops and the other keeps running

#### Scenario: A session on a host that is not on the loopback

- **GIVEN** a host listening beyond the loopback
- **WHEN** a session is opened
- **THEN** no session window opens and the session stays inside the host

### Requirement: Ending a session from either end ends it at both

Ending a session from the page or from its window SHALL end it at both ends at once, and each end SHALL show the change.

#### Scenario: Closing the session from the page

- **GIVEN** a session with its window open
- **WHEN** the person closes the session on the page
- **THEN** the window closes its session and exits

#### Scenario: Closing the session's window

- **GIVEN** a session with its window open
- **WHEN** the person closes the window
- **THEN** the session's agent process ends and every page shows the session closed

#### Scenario: A session whose agent process ends on its own

- **GIVEN** a session whose agent process ends by itself
- **WHEN** it ends
- **THEN** its window closes and every page shows the session closed

### Requirement: The session window logs the conversation and accepts no typed input

Each session window SHALL print each prompt, reply, tool call, permission request and error as it happens, and SHALL accept no typed input for the session.

#### Scenario: A tool call during a session

- **GIVEN** a session window open
- **WHEN** the agent makes a tool call
- **THEN** the window prints the call as it happens

#### Scenario: Typing into the session window

- **GIVEN** a session window with focus
- **WHEN** the person types into it
- **THEN** nothing is sent to the session

### Requirement: A session keeps running when the host is killed without stopping

A session SHALL keep running when its host is killed without stopping, and a later host SHALL take it back.

#### Scenario: The host killed while sessions run

- **GIVEN** a host with sessions running in windows
- **WHEN** the host is killed without stopping
- **THEN** each session keeps running, its window says so, and it tries to reconnect every second

#### Scenario: A new host started within the minute

- **GIVEN** windows waiting to reconnect after their host was killed
- **WHEN** a new host starts within a minute
- **THEN** it takes each session back with its whole log and every page resets and replays it

#### Scenario: A new host started after the minute

- **GIVEN** windows waiting to reconnect after their host was killed
- **WHEN** a new host starts after the minute has passed
- **THEN** each window refuses the new host and ends its session

### Requirement: A window is admitted by a secret that works once and expires

A session window SHALL be admitted by a secret that works once and expires after thirty seconds.

#### Scenario: A window connecting with its secret

- **GIVEN** a freshly started window holding its secret
- **WHEN** it connects within thirty seconds
- **THEN** the host admits it

#### Scenario: A secret used a second time

- **GIVEN** a secret already used to admit a window
- **WHEN** it is presented again
- **THEN** the host refuses it

#### Scenario: A secret presented after thirty seconds

- **GIVEN** a secret that has not been used
- **WHEN** it is presented after thirty seconds
- **THEN** the host refuses it

### Requirement: The session cannot read the window's secret

The session's agent process and the tools it runs SHALL NOT be able to read the secret that admitted its window.

#### Scenario: A tool in the session reading the environment

- **GIVEN** a session running a tool that reads its environment
- **WHEN** the tool looks for the window's secret
- **THEN** the secret is not there

### Requirement: The host's window logs each session opened and closed

The host's window SHALL log each session opened and closed, with the folder it runs in.

#### Scenario: Opening and closing sessions

- **GIVEN** the host's window
- **WHEN** a session is opened and later closed
- **THEN** the window logs both, each with its folder

### Requirement: Resuming a session opens a new window

Resuming a session, or resuming it at an earlier message, SHALL open a new window for it.

#### Scenario: Resuming a closed session

- **GIVEN** a closed session
- **WHEN** it is resumed
- **THEN** a new window opens for it
