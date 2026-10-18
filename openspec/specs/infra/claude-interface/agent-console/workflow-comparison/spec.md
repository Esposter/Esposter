## Purpose

The terminal workflow set against the agent console's, as flows and task by task, so each claimed gain is a step the console removes and each cost is a step it adds — the ground truth the console is judged against.

## Requirements

### Requirement: Each claimed gain is a step the console removes

Each claimed gain of the console SHALL be a task it completes in fewer steps than the terminal, and SHALL be timed in a real session.

#### Scenario: A task the console is claimed to speed up

- **GIVEN** a task listed in the comparison
- **WHEN** it is timed in a real session in each of the two surfaces
- **THEN** the console completes it in fewer steps than the terminal

### Requirement: Each cost the console adds is written beside the gains

Each cost the console adds SHALL be written beside the gains, so the comparison shows both columns.

#### Scenario: Reading the cost section

- **GIVEN** the comparison page
- **WHEN** a reader looks for what the console costs
- **THEN** the process, tab, maintenance and billing costs are each listed

### Requirement: Each time the terminal is opened in the console is recorded

Every time the terminal had to be opened during a working day in the console SHALL be recorded as a row with its reason.

#### Scenario: Opening the terminal during a session

- **GIVEN** a working day done in the console
- **WHEN** the terminal has to be opened
- **THEN** a row is added recording the reason

#### Scenario: The console is extended while such rows exist

- **GIVEN** a non-empty list of terminal openings
- **WHEN** someone proposes a new theme or view for the console
- **THEN** the console is not extended until the list is empty

### Requirement: The deployed page asks the browser for local network access once

The deployed page reaching a host on the loopback SHALL trigger one browser prompt for local network access per site.

#### Scenario: The first connection from the deployed page

- **GIVEN** the deployed page connecting to a loopback host for the first time
- **WHEN** the connection is attempted
- **THEN** the browser asks once to allow local network access

### Requirement: A new session shows defaults until its first turn

A session opened and not yet prompted SHALL show the default model and mode until its first turn reports them.

#### Scenario: Opening a session and not prompting it

- **GIVEN** a session opened but not yet prompted
- **WHEN** its header is read
- **THEN** it shows the default model and mode until the first turn runs

### Requirement: A session resumes in the terminal with the same id

A console session SHALL resume in the terminal under the same session id, losing nothing either way.

#### Scenario: Handing a session to the terminal

- **GIVEN** a console session
- **WHEN** it is resumed in the terminal by its id
- **THEN** the terminal continues the same conversation
