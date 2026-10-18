## Purpose

A refusal, before a Bash git command runs, of any command over the whole index — git add ., add -A, reset with no path, stash, checkout ., clean — while another session edits the same checkout, naming the path-scoped form to use instead.

## Requirements

### Requirement: Whole-index git commands are refused while another session edits the checkout

A Bash git command over the whole index SHALL be refused while another session has recently edited a file in the same checkout.

#### Scenario: Staging everything while a peer edits

- **GIVEN** another session edited a file in this checkout within thirty minutes
- **WHEN** a git add of the whole working directory is requested
- **THEN** it is refused before it runs

#### Scenario: Stashing while a peer edits

- **GIVEN** another session editing in this checkout
- **WHEN** a git stash is requested
- **THEN** it is refused before it runs

#### Scenario: Cleaning while a peer edits

- **GIVEN** another session editing in this checkout
- **WHEN** a git clean that is not a dry run is requested
- **THEN** it is refused before it runs

### Requirement: A refusal names the path-scoped form to use instead

A refused command SHALL be denied with the form it used and the path-scoped forms to use instead.

#### Scenario: A refused whole-index add

- **GIVEN** a refused git add of the whole working directory
- **WHEN** the denial is shown
- **THEN** it names adding by path as the form to use instead

### Requirement: Path-scoped and read-only git commands are never refused

Path-scoped git forms and read-only git commands SHALL never be refused.

#### Scenario: Staging a single path while a peer edits

- **GIVEN** another session editing in this checkout
- **WHEN** a git add of one path is requested
- **THEN** it runs

#### Scenario: Reading the status while a peer edits

- **GIVEN** another session editing in this checkout
- **WHEN** a git status is requested
- **THEN** it runs

### Requirement: A dry-run clean and a soft reset are allowed

A dry-run clean and a soft reset with no path SHALL be allowed.

#### Scenario: A dry-run clean

- **GIVEN** another session editing in this checkout
- **WHEN** a git clean dry run is requested
- **THEN** it runs

#### Scenario: A soft reset with no path

- **GIVEN** another session editing in this checkout
- **WHEN** a git reset soft with no path is requested
- **THEN** it runs

### Requirement: A session alone in its checkout runs every git command

A session with no other session recently editing its checkout SHALL run every git command.

#### Scenario: A session with no peer

- **GIVEN** no other session has recently edited a file in this checkout
- **WHEN** a whole-index git command is requested
- **THEN** it runs

### Requirement: A failure in the guard lets the command through

Any failure of the guard SHALL let the git command through.

#### Scenario: The record of recent edits cannot be read

- **GIVEN** an unreadable record of recent edits
- **WHEN** a whole-index git command is requested
- **THEN** it runs
