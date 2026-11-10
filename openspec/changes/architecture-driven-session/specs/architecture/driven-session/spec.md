## ADDED Requirements

### Requirement: A dev server signs the driven user in

A development server SHALL answer the session route by signing the driven user in, with the session cookie the app reads for that user, and by no other user.

#### Scenario: A dev server mints a signed-in session

- **GIVEN** a development server whose database holds the seeded driven user
- **WHEN** a driven browser posts to the session route
- **THEN** the browser holds a session cookie
- **AND** a request from that browser reads the driven user as signed in

### Requirement: A production build carries no session route

A production build SHALL register no session route, so a request to that route on a deployed server finds nothing.

#### Scenario: A production build carries no session route

- **GIVEN** a production build of the app
- **WHEN** a request is made to the session route on a server started from that build
- **THEN** the server answers not found

### Requirement: The session route refuses unless the server is local and seeded

The session route SHALL refuse every request unless the server is not in production, the database it reads is on the local machine and the seed has written the driven user, and a refused request SHALL write no session.

#### Scenario: A non-local database is refused

- **GIVEN** a development server whose database address is not the local machine
- **WHEN** a driven browser posts to the session route
- **THEN** the request is refused
- **AND** no session row is written

#### Scenario: A production server refuses the session route

- **GIVEN** a development server started with the production environment flag
- **WHEN** a driven browser posts to the session route
- **THEN** the request is refused
- **AND** no session row is written

#### Scenario: A session route with no seeded user is refused

- **GIVEN** a local development server whose database holds no seeded driven user
- **WHEN** a driven browser posts to the session route
- **THEN** the request is refused
- **AND** no session row is written

### Requirement: The seed writes only to a database of its own

The seed SHALL write its dataset only to a database other than the one the owner's dev server reads, and SHALL stop before any write when the two are the same.

#### Scenario: The seed leaves the dev database untouched

- **GIVEN** the owner's dev database holds rows
- **WHEN** the seed runs against its own database
- **THEN** the owner's rows are unchanged
- **AND** the seeded rows are in the seed's own database

#### Scenario: A seed aimed at the dev database is refused

- **GIVEN** a seed whose target database is the owner's dev database
- **WHEN** the seed runs
- **THEN** the seed stops before any write

### Requirement: The seed writes messages only to a storage emulator of its own

The seed SHALL write message entities only to a storage emulator that its run starts for itself, and SHALL stop before any write when its storage connection is the default development emulator or an endpoint that is not the local machine.

#### Scenario: A seed aimed at the default storage emulator is refused

- **GIVEN** a seed whose storage connection is the default development emulator or a non-local endpoint
- **WHEN** the seed runs
- **THEN** the seed stops before any write

### Requirement: A driven page shows the seeded user's data

A page a driven browser opens after the session route signs the driven user in SHALL show the rows the seed wrote for that user.

#### Scenario: A driven page reads seeded data

- **GIVEN** a development server signed in through the session route with the seed in place
- **WHEN** a driven browser opens the messages, friends, drafts, resources and achievements pages
- **THEN** each page lists the rows the seed wrote for the driven user
- **AND** no page records an uncaught error or a console error
