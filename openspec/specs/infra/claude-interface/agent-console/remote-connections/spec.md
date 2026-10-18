## Purpose

The agent console holds several hosts at once — this computer's and any machine of the reader's own — each paired with its own credential and reached at an address with a certificate of its own, with every session listed under the host that runs it and one host stopping leaving the others as they were.

## Requirements

### Requirement: The console holds any number of paired hosts at once

The console SHALL hold any number of paired hosts at once, each with its own connection, status and credential.

#### Scenario: Pairing a second host

- **GIVEN** this computer's host already paired
- **WHEN** the reader adds another machine's host
- **THEN** both hosts are held as separate connections

### Requirement: One host's status never changes another's

A host stopping or not answering SHALL NOT change the status of any other host.

#### Scenario: One of two hosts stops

- **GIVEN** two connected hosts
- **WHEN** one host stops
- **THEN** that host is shown stopped and the other stays connected

### Requirement: A remote machine is added from the sessions tab by its address and code

A remote machine SHALL be added from the sessions tab by its encrypted address and the one-time code its host prints.

#### Scenario: Adding a machine with an encrypted address

- **GIVEN** a machine's host printing a one-time code
- **WHEN** the reader enters its https address and the code in the sessions tab
- **THEN** the machine is paired and its sessions are listed

#### Scenario: Adding a machine with an unencrypted address

- **GIVEN** a machine reached only at a plain address
- **WHEN** the reader enters that address on a secure page
- **THEN** the page cannot connect to it

### Requirement: Sessions are listed under the host that runs them

Each session SHALL be listed under the host that runs it, and a command about a session SHALL reach the host holding that session.

#### Scenario: Two hosts with sessions

- **GIVEN** sessions on two hosts
- **WHEN** the sessions tab is shown
- **THEN** each session is grouped under its own host

#### Scenario: Stopping a session on a remote host

- **GIVEN** a session on a remote host
- **WHEN** the person stops it from the page
- **THEN** the command reaches that remote host

### Requirement: A new session asks for a host only when several are reached

A new session SHALL ask which host runs it only when more than one host is reached.

#### Scenario: Several hosts reached

- **GIVEN** two reached hosts
- **WHEN** a new session is started
- **THEN** the reader is asked which host runs it

#### Scenario: One host reached

- **GIVEN** only one reached host
- **WHEN** a new session is started
- **THEN** no question is asked and the session starts on that host

### Requirement: A remote host runs its sessions inside its own process

A host listening beyond the loopback SHALL run its sessions inside its own process, and they are stopped from the page.

#### Scenario: A session on a remote host

- **GIVEN** a remote host
- **WHEN** a session is started on it
- **THEN** no session window opens on that machine and the session is stopped from the page

### Requirement: A remote host is trusted by its signature against its paired key

A remote host SHALL be trusted only when its signature verifies against the key given at pairing.

#### Scenario: A remote host signing with its paired key

- **GIVEN** a remote host reached through its certificate
- **WHEN** it signs the page's challenge with its paired key
- **THEN** the connection is used

#### Scenario: A remote host whose signature does not match

- **GIVEN** a remote host whose signature does not match the paired key
- **WHEN** the page checks it
- **THEN** the connection is not used

### Requirement: The console does not relay connections through Esposter

The console SHALL NOT route connections through a relay run by Esposter.

#### Scenario: Connecting a remote machine

- **GIVEN** a remote machine with an encrypted address
- **WHEN** the page connects to it
- **THEN** the traffic goes directly to that address

### Requirement: A connection is named by its address

A connection SHALL be named by its address, so that two hosts can be told apart.

#### Scenario: Two connections on different machines

- **GIVEN** connections to two machines
- **WHEN** they are listed
- **THEN** each is named by the address it is reached at
