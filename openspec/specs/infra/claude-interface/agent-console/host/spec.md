## Purpose

agent-console-server, the process the agent console pairs with. It runs with one command on the machine that holds the code and listens on the loopback, admitting only pages paired with it. It answers the browser's private-network preflight, prints a one-time link that pairs a page, and replays each open session's event log to a page that connects mid-session.

## Requirements

### Requirement: The host starts with one command and listens on the loopback by default

The host SHALL start with one command and listen on the loopback address at a fixed default port, so its printed address is predictable.

#### Scenario: Starting the host with its defaults

- **GIVEN** a machine with the host installed
- **WHEN** the host is started with its one command
- **THEN** it listens on the loopback address at its fixed default port

#### Scenario: Starting the host to be reachable from the network

- **GIVEN** the host started with a network hostname option
- **WHEN** another machine connects to its port
- **THEN** the host accepts the connection, encrypted or not as the reader arranged

### Requirement: Only paired pages are admitted

The host SHALL admit a connection only when it presents a known credential and its key is proved, so that unpaired pages are refused.

#### Scenario: A connection with an unknown credential

- **GIVEN** a connection presenting a credential the host does not know
- **WHEN** it attempts to connect
- **THEN** the socket is closed

#### Scenario: A connection with a known credential

- **GIVEN** a connection presenting a known credential
- **WHEN** the host admits it
- **THEN** the page is authenticated and receives the replayed log

### Requirement: The host answers the browser's preflight and refuses other plain requests

The host SHALL answer the browser's private-network preflight and SHALL refuse every other plain request, with no cross-origin headers.

#### Scenario: A browser sends the private-network preflight

- **GIVEN** a browser preflight request
- **WHEN** the host receives it
- **THEN** the host answers it with the private-network permission

#### Scenario: A plain request that is not a preflight

- **GIVEN** a plain request to the host
- **WHEN** it arrives
- **THEN** the host refuses it and sends no cross-origin headers

### Requirement: The printed link pairs one page within ten minutes

The host SHALL print a one-time pairing link whose code pairs one page within ten minutes.

#### Scenario: Pairing from the printed link

- **GIVEN** a printed link and its code
- **WHEN** a page uses the code within ten minutes
- **THEN** the page is paired

#### Scenario: Using the printed link after ten minutes

- **GIVEN** a printed link past ten minutes
- **WHEN** a page uses its code
- **THEN** the pairing is refused

### Requirement: A connecting page receives every open session's log first

A page that connects or reconnects SHALL receive every open session's event log before any live event.

#### Scenario: Connecting mid-session

- **GIVEN** an open session with events logged
- **WHEN** a page connects
- **THEN** it receives the whole log before live events

#### Scenario: A session reopened under the same id

- **GIVEN** an open session reopened under the same id, as a rewind does
- **WHEN** the reopening happens
- **THEN** every page drops what it held for that session

### Requirement: Each command is answered to the page that sent it

Each command SHALL be answered to the page that sent it, carrying the id the page chose.

#### Scenario: A command that opens a session

- **GIVEN** a page that asks to open a session
- **WHEN** the session opens
- **THEN** the page receives the session it opened under the command's id

#### Scenario: A command that fails

- **GIVEN** a page sending a command that fails
- **WHEN** the failure occurs
- **THEN** the page is answered with why it failed

#### Scenario: A message that is not a command

- **GIVEN** a page sending a message that is not a command
- **WHEN** the host receives it
- **THEN** the answer carries an empty id

### Requirement: A stopping host tells every page before it closes sessions

When the host stops, every connected page SHALL be told before its sessions close.

#### Scenario: Stopping the host with Ctrl+C

- **GIVEN** a host with connected pages and open sessions
- **WHEN** the person presses Ctrl+C or closes its window
- **THEN** every page is told the host is stopping before the sessions are closed

#### Scenario: A host that goes without a word

- **GIVEN** a host that disappears without telling its pages
- **WHEN** the page loses the connection
- **THEN** the page shows the host as not answering and retries

### Requirement: A page retries a dropped connection with growing waits

A page whose socket drops SHALL retry with growing waits up to thirty seconds until the host answers.

#### Scenario: The host restarts after a drop

- **GIVEN** a page whose connection dropped
- **WHEN** the host is down for a while and then answers
- **THEN** the page reconnects without the reader acting

### Requirement: The page sends nothing to the loopback before the reader presses Connect

The page SHALL send no request to the loopback port until the reader presses Connect.

#### Scenario: Loading the console page before pairing

- **GIVEN** a page with no host paired
- **WHEN** it loads
- **THEN** it sends no request to the loopback port
