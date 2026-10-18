## Purpose

app/ runs in two environments, so a browser API is reached through persisted state or a client-only phase — never through a guard at the call site.

## Requirements

### Requirement: Browser-stored state is a reactive value

Browser-stored state that the interface reads and writes over time SHALL be held as a reactive value that reads its default where no browser exists.

#### Scenario: A persisted value renders its default on the server

- **WHEN** the page is rendered on the server
- **THEN** each persisted value renders its default

#### Scenario: A value that is not a plain value supplies its own serializer

- **GIVEN** a persisted value that is a map or a class instance
- **WHEN** it is stored and read back
- **THEN** it is validated on read and an invalid stored value is not loaded

### Requirement: A value is stored in one place only

A persisted value SHALL be the stored value itself, so that no second copy is kept in step with it by hand.

#### Scenario: Drafts survive a reload without a second copy

- **GIVEN** a message draft typed in a composer
- **WHEN** the page is reloaded
- **THEN** the draft is restored in the composer

### Requirement: One-shot browser reads run only in a client-only phase

A one-shot browser read that is not state SHALL run only in a client-only phase of the page, and SHALL NOT run while the page is rendered on the server.

#### Scenario: An offline save is loaded once the page is mounted

- **WHEN** the page is rendered on the server
- **THEN** no offline save is read

#### Scenario: The offline save is read after mounting

- **WHEN** the page is mounted in the browser
- **THEN** the offline save is read once

### Requirement: Direct browser storage access is refused by the checks

The repository's checks SHALL refuse direct access to browser storage from application code, except where the storage key is supplied by a caller and the exception states its reason.

#### Scenario: A new direct storage read fails the checks

- **WHEN** a change reads browser storage directly from application code
- **THEN** the repository's checks fail

### Requirement: A browser global is not read while a module loads

The repository's checks SHALL refuse a browser global read at the top level of a module, unless the fork is justified on that line.

#### Scenario: A top-level browser read fails the checks

- **WHEN** a module reads a browser global while it is first loaded
- **THEN** the repository's checks fail

#### Scenario: A justified top-level fork passes with its reason

- **GIVEN** a top-level read that is an explicit environment fork with a stated reason
- **WHEN** the repository's checks run
- **THEN** the read passes

### Requirement: A derived browser read is safe only where the server cannot reach it

A browser read inside a derived value SHALL be safe only when the value guarding it cannot exist on the server, and a guard that depends on a state SHALL use a client-only phase or a reactive value instead.

#### Scenario: A field read behind a client-side validation error is safe

- **GIVEN** a browser read made only when client-side validation produces an error
- **WHEN** the page is rendered on the server
- **THEN** the read is never reached because no validation runs there

#### Scenario: A read guarded by a closed dialog is rejected in review

- **GIVEN** a derived value that reads the browser only while a dialog is open
- **WHEN** a review finds that the dialog's state is the only guard
- **THEN** the review asks for a client-only phase or a reactive value instead

### Requirement: A genuine environment fork is decided at one place

A value that genuinely differs by environment SHALL branch on the environment at the one place the fork is decided, and no leaf SHALL ask the environment question again.

#### Scenario: A binary encoding differs between server and browser

- **WHEN** a value is serialized on the server and in the browser
- **THEN** each environment uses the encoding it has, and the branch is decided in one place

#### Scenario: A leaf that asks the environment again is a defect

- **WHEN** a browser component checks whether it is on the server before reading a value its phase has already decided
- **THEN** the review treats the check as a defect and removes it
