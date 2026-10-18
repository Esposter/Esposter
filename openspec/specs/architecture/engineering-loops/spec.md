## Purpose

How work moves through the repository — the product, change, code-health and knowledge loops, what each one hands the next, where each piece of work enters, how each loop stops, and what a session takes up when nothing is asked.

## Requirements

### Requirement: Every loop has a stop rule

Each engineering loop SHALL have a stop rule its owner states, so that each pass finds less than the one before and the loop converges.

#### Scenario: A pass finds as much as the one before

- **GIVEN** a loop whose latest pass found as much as the pass before it
- **WHEN** its owner reviews the loop
- **THEN** the change is made to the owner's questions rather than by running another pass

#### Scenario: A review round with only minor findings

- **GIVEN** a code review round whose confirmed findings are all minor
- **WHEN** the round ends
- **THEN** the review stops

#### Scenario: A product review pass with nothing new

- **GIVEN** a full product review pass over an area
- **WHEN** the pass finds nothing new and changes no decision
- **THEN** the review of that area stops until something moves under it

### Requirement: No loop runs on a schedule

Each loop SHALL start from a person's ask or from the output of another loop, and no loop SHALL run on a timer.

#### Scenario: No ask and no output from another loop

- **GIVEN** no person has asked for a loop and no other loop has produced work for it
- **WHEN** time passes
- **THEN** the loop does not start

### Requirement: Work enters at the place its kind names

Each piece of work SHALL enter at the single entry point its kind names, and a defect SHALL be fixed in the change that finds it.

#### Scenario: A defect found during a change

- **GIVEN** a change in progress that uncovers a defect
- **WHEN** the defect is handled
- **THEN** it is fixed in that change with a regression test that fails without the fix

#### Scenario: A ready-for-agent issue

- **GIVEN** a GitHub issue triaged as ready for an agent
- **WHEN** an agent builds it
- **THEN** it is built like a proposal and closed when it ships

#### Scenario: An issue that needs a design decision

- **GIVEN** a GitHub issue triaged as needing a design decision
- **WHEN** the next product review of its area runs
- **THEN** the review reads the issue

### Requirement: Each loop hands its output to the loop that consumes it

A loop's output SHALL be handed to the loop that consumes it, never kept in a side list.

#### Scenario: A proposal ships

- **GIVEN** a proposal has shipped
- **WHEN** the area it changed is checked
- **THEN** the area is owed a product review pass

#### Scenario: A sweep fix that would change behaviour

- **GIVEN** a sweep has found a fix that would change behaviour
- **WHEN** the fix is recorded
- **THEN** it becomes a proposal and leaves the sweep

#### Scenario: A finding a change does not fix

- **GIVEN** a change has surfaced a finding it does not fix
- **WHEN** the change is finished
- **THEN** the finding becomes a proposal

### Requirement: Every change passes the finishing audit

Every change SHALL pass the same finishing audit before it is reported done, covering its reviews, tests, docs, skills, ledgers and enforcers.

#### Scenario: A change is ready to report

- **GIVEN** a change whose code does what it should
- **WHEN** the session prepares to report it done
- **THEN** the audit checks its reviews, tests, docs, skills, ledgers and enforcers
- **AND** each one receives a verdict

#### Scenario: A session pushes a change

- **GIVEN** a change ready to push
- **WHEN** the session pushes it
- **THEN** only the tests of the touched paths run locally
- **AND** the full checks run in CI on the push

### Requirement: A session takes up the next work without being asked

A session that finishes a unit of work SHALL take up the first remaining item of the fixed order without asking, until the order is empty or the user redirects it.

#### Scenario: Leftovers from an earlier session

- **GIVEN** an earlier session left uncommitted or unpushed work on this machine
- **WHEN** a new session starts
- **THEN** that work is finished, recorded or released before any new work

#### Scenario: A failing review run

- **GIVEN** a review run on the shared queue is failing
- **WHEN** the session chooses its next work
- **THEN** the failing run is handled before any other queued item

#### Scenario: Work that spends outside the queue

- **GIVEN** an action would open a pull request or spend on a paid service
- **WHEN** the session reaches that action
- **THEN** it asks the user first

#### Scenario: The closing pass before a session stops

- **GIVEN** a session is about to stop
- **WHEN** the closing pass runs
- **THEN** the main branch is brought up to everything the session landed, through the review, before the session stops
