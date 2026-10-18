## Purpose

How the agent console pairs a browser with a host from one Connect button — a one-time code through the esposter-host link, a credential per device kept as a hash, the host proving itself with a signed challenge before the page sends anything, and devices listed and revoked one at a time.

## Requirements

### Requirement: Connect pairs this computer's host from one button

The Connect control SHALL pair this computer's host through a one-time code, without the reader typing an address.

#### Scenario: Connecting with no host running

- **GIVEN** no host is running on this computer
- **WHEN** the reader presses Connect and accepts the browser's open-app prompt
- **THEN** a host starts holding the code and the page pairs with it

#### Scenario: Connecting while a host already runs

- **GIVEN** a host is already running on this computer
- **WHEN** the reader presses Connect
- **THEN** the code is handed to the running host and the page pairs with it

#### Scenario: The reader answers the open-app prompt slowly

- **GIVEN** the browser's open-app prompt is still waiting for the reader
- **WHEN** the page retries the code
- **THEN** the code remains valid until it expires

### Requirement: Pairing is accepted only from the app's own origin

The host SHALL accept a pairing only from the app's own origin, so that another site cannot pair itself to a host.

#### Scenario: A pairing from another site

- **GIVEN** a page on another site with a planted code
- **WHEN** it tries to pair
- **THEN** the connection is refused and nothing is paired

#### Scenario: A pairing with no origin

- **GIVEN** a program outside a browser sending a pairing
- **WHEN** it sends no origin
- **THEN** the pairing is refused

### Requirement: Each device gets its own credential, kept as a hash

Each paired device SHALL receive its own credential, and the host SHALL keep only a hash of that credential.

#### Scenario: A successful pairing

- **GIVEN** a valid unused code from the app's origin
- **WHEN** the page pairs with it
- **THEN** the device receives its own credential and the host records the device with a hash of it

#### Scenario: A code presented a second time

- **GIVEN** a code that has already paired a device
- **WHEN** it is presented again
- **THEN** nothing is paired

### Requirement: Pairing codes are single-use and expire

A pairing code SHALL pair once and only until it expires.

#### Scenario: A code used within its lifetime

- **GIVEN** a code within its lifetime
- **WHEN** a page uses it
- **THEN** the page is paired

#### Scenario: A code used after it expires

- **GIVEN** a code past its lifetime
- **WHEN** a page tries to use it
- **THEN** the pairing is refused

### Requirement: The page sends nothing until the host proves its key

The page SHALL send its credential only after the host signs the page's fresh challenge with its paired key.

#### Scenario: A host that signs the challenge

- **GIVEN** a page holding a credential for a host
- **WHEN** the host signs the page's challenge with the key it was paired with
- **THEN** the page sends its credential and the host admits it

#### Scenario: A program on the port that cannot sign

- **GIVEN** a program holding the loopback port that does not hold the host key
- **WHEN** it answers the page's challenge
- **THEN** the page sends no credential and shows the host as not answering

#### Scenario: A proof signed for a different port

- **GIVEN** a proof for an address on this computer that names a port other than the one reached
- **WHEN** the page checks it
- **THEN** the page rejects it and sends nothing

### Requirement: A second start hands its code over only to the proven host

A second start of the host SHALL hand its pairing code to the running host only after the running host proves itself.

#### Scenario: The running host proves itself

- **GIVEN** a host already running on the port
- **WHEN** a second start challenges it and it proves its key
- **THEN** the code is handed to the running host and the second start exits

#### Scenario: Another program holds the port

- **GIVEN** a program on the port that is not the host
- **WHEN** a second start challenges it
- **THEN** the code is not handed over and the start fails, reporting that another program holds the port

### Requirement: A page with a credential connects on load

A page holding a credential SHALL connect on load without a new code.

#### Scenario: Returning to the app with a paired host running

- **GIVEN** a page holding a credential for this computer's host
- **WHEN** the page loads
- **THEN** it connects to the host without asking the reader for anything

#### Scenario: The host is stopped on this computer

- **GIVEN** a page holding a credential for this computer's host
- **WHEN** the host is not answering
- **THEN** the page offers to start the host

### Requirement: Devices are listed and revoked one at a time

Devices SHALL be listed and revoked one at a time from the host's devices command.

#### Scenario: Revoking one device

- **GIVEN** several paired devices
- **WHEN** one is revoked by its id
- **THEN** its connection closes at once and the others stay paired

#### Scenario: Connecting after revocation with the host stopped

- **GIVEN** a device revoked while the host was not running
- **WHEN** the host next starts and the device connects
- **THEN** the host refuses the device

#### Scenario: A page whose credential is refused

- **GIVEN** a page whose credential the host refuses
- **WHEN** the refusal arrives
- **THEN** the page forgets the credential and shows the first screen again

### Requirement: The host window accepts no typed commands

The host's console window SHALL accept no typed commands, so that a stray key cannot revoke or change anything.

#### Scenario: Typing into the host window

- **GIVEN** the host's console window is focused
- **WHEN** the person types a command
- **THEN** nothing is revoked or changed

### Requirement: A printed link asks before it pairs

A link printed by the host SHALL ask the reader to connect before it pairs, and SHALL warn when the link points at another computer.

#### Scenario: Opening a printed link

- **GIVEN** a printed link with a one-time code
- **WHEN** the page opens it
- **THEN** the reader is asked to Connect before the page pairs

#### Scenario: A printed link pointing at another computer

- **GIVEN** a printed link whose address is another computer
- **WHEN** the page shows it
- **THEN** a warning says the link points at another computer

### Requirement: The host keeps provider keys to itself

The host SHALL keep this computer's Claude Code login and SHALL NOT send provider keys to the page.

#### Scenario: Pairing this computer's host

- **GIVEN** this computer's host paired with a page
- **WHEN** the pairing completes
- **THEN** the page holds the credential, device id, address and public key, and no provider key
