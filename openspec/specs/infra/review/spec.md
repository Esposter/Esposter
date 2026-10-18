## Purpose

How what lands on ai/queue is reviewed — every window owed read in one pool of small batches by read-only haiku reviewers, each passed window's findings opened as review issues, one fixer per issue, and a settle job that settles whatever the fixers left open — with every limit set by amount, never by time.

## Requirements

### Requirement: Every finding reaches a terminal state

Every review finding SHALL end as fixed, as refuted with its reason recorded, or as recorded in the owning page for later build.

#### Scenario: Finding not yet resolved

- **GIVEN** a finding has been raised by a review
- **WHEN** no fix, refutation or record has been made for it
- **THEN** the finding stays in an open review issue

### Requirement: Each finding is held in an open review issue

Each finding SHALL be held in an open review issue until its settlement closes that issue, so that no finding is lost when a job ends early.

#### Scenario: Job crashes mid-fix

- **GIVEN** a fix job crashes while working on its issue
- **WHEN** the run ends
- **THEN** the issue stays open and whole for the settle job

#### Scenario: Issue opened by a person

- **GIVEN** a person opened a review issue themselves
- **WHEN** the settle job runs
- **THEN** that issue is not held back

### Requirement: Main advances only through fully reviewed windows

The review SHALL advance main by fast-forward only through windows whose findings were all opened as issues, and SHALL stop advancing for the run when a push is rejected.

#### Scenario: Window passed and its issues opened

- **GIVEN** a window has passed review and its issues are open
- **WHEN** the run advances the passed prefix
- **THEN** main is fast-forwarded to the end of that window

#### Scenario: Push rejected because main moved

- **GIVEN** main has moved since the run began
- **WHEN** the run tries to fast-forward main
- **THEN** the run stops advancing for the rest of the run
- **AND** the issues it opened stay open

#### Scenario: Window whose issues did not open

- **GIVEN** a window passed review but its issues did not open
- **WHEN** the passed prefix is computed
- **THEN** the prefix ends before that window for the rest of the run

### Requirement: Windows hold bounded commits

Each window SHALL hold commits whose changed files together stay within the file cap, or a single commit that alone exceeds the cap.

#### Scenario: Commit over the file cap

- **GIVEN** a single commit changes more files than the window cap
- **WHEN** windows are planned
- **THEN** that commit forms a window of its own
- **AND** it is reviewed whole, in batches

### Requirement: Reviewers are read-only and cannot reach GitHub

A reviewer SHALL be read-only, SHALL be unable to change the code, and SHALL NOT reach GitHub.

#### Scenario: Reviewer attempts an edit

- **GIVEN** a reviewer session is running
- **WHEN** it attempts to edit a file
- **THEN** the edit is denied

### Requirement: A failed batch is retried once

A batch that fails SHALL be retried once, and a window whose batch still fails SHALL be marked failed.

#### Scenario: Batch fails twice

- **GIVEN** a batch has failed once
- **WHEN** its retry also fails
- **THEN** the batch's window is marked failed

### Requirement: Usage limit stops the run cleanly

When the account's usage limit runs out during a run, the windows after the limited one SHALL NOT pass, main SHALL move only through the windows before it, and the run SHALL exit successfully with a notice naming where it stopped.

#### Scenario: Limit reached mid-run

- **GIVEN** a reviewer session reports the account's usage limit
- **WHEN** the run reaches that window
- **THEN** the windows after it do not pass
- **AND** the run exits successfully with a notice naming where it stopped

### Requirement: Deadline stops new batches and queues one next run

The run SHALL start no new batch after its deadline, and SHALL dispatch one next run when the deadline alone left windows unreviewed.

#### Scenario: Deadline reached with windows owed

- **GIVEN** the deadline passes with windows still unreviewed
- **WHEN** the run stops
- **THEN** no new batch starts
- **AND** one next run is dispatched

#### Scenario: Stopped by a usage limit

- **GIVEN** the run was stopped by a usage limit
- **WHEN** the run ends
- **THEN** no next run is dispatched

### Requirement: Fixes land only when their checks pass

Each issue SHALL get one fix job, and a fix SHALL land on the queue only when the checks its files require have passed.

#### Scenario: Fix would break a check

- **GIVEN** a fix would fail a check its files require
- **WHEN** the fixer tries to commit it
- **THEN** the fix is not made

#### Scenario: Fix commit does not land

- **GIVEN** a fixer's commit does not land on the queue
- **WHEN** the landing fails
- **THEN** the finding is deferred again and the issue stays open

### Requirement: Settle job settles every open issue oldest first

The settle job SHALL settle every open review issue, oldest first, and SHALL leave alone an issue whose run still has a fixer on it.

#### Scenario: Issue still held by a live run

- **GIVEN** an issue's run has a fix job that has not completed
- **WHEN** the settle job reaches that issue
- **THEN** the issue is left open

#### Scenario: Settler answer omits a finding

- **GIVEN** a settler's answer leaves a finding out
- **WHEN** the answer is validated
- **THEN** the issue fails and stays open

### Requirement: Issues past the fix matrix limit are left to settle

Issues beyond the fix matrix limit SHALL stay open for the settle job rather than being lost.

#### Scenario: More issues than the matrix takes

- **GIVEN** a run opened more issues than the matrix limit
- **WHEN** the fix matrix is built
- **THEN** the extra issues stay open
- **AND** the settle job takes them

### Requirement: Dry run plans without spending

The dry run SHALL print every window and batch the run would plan, and SHALL run no session and push nothing.

#### Scenario: Dry run of a range

- **GIVEN** a dry run is requested for a range of commits
- **WHEN** it finishes
- **THEN** each planned window and its batches are printed
- **AND** no session runs and nothing is pushed

### Requirement: Review does not wait for CI

A review SHALL NOT wait for CI, and a red main SHALL be fixed on the queue first.

#### Scenario: CI red on a queue push

- **GIVEN** a push to the queue is red in CI
- **WHEN** the review runs
- **THEN** the review does not wait for CI

### Requirement: Review reads commits and opens no pull requests

The review SHALL read commits rather than pull requests and SHALL open no pull requests.

#### Scenario: Commit pushed to the queue

- **GIVEN** a commit is pushed to the queue
- **WHEN** the review runs
- **THEN** the commit is read as part of a window
- **AND** no pull request is opened

### Requirement: Every limit is an amount, and the deadline is the only time bound

Every limit in the review SHALL be bounded by an amount read or held, and the run deadline SHALL be its only time bound.

#### Scenario: Limit reached on a run

- **GIVEN** a limit on files, lines, issues or sessions is reached
- **WHEN** the run plans or holds work
- **THEN** it stops at that amount rather than at a time

### Requirement: Sessions receive only their own credential

Every review session SHALL receive only its own Claude credential, with every other credential-like variable removed.

#### Scenario: Session starts

- **GIVEN** a review session is launched
- **WHEN** its environment is prepared
- **THEN** no credential-like variable is passed to it other than its own Claude credential
