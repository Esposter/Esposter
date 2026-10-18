## Purpose

A refusal of every subagent launch not on haiku, and a nudge after every third lookup in a row the main session makes with no decision between them, telling the model that the chain goes to a haiku agent as one bounded question, rather than reading it one hop at a time in the main context.

## Requirements

### Requirement: A subagent launch runs only on haiku

A subagent launch SHALL run only when its model is haiku.

#### Scenario: A launch on haiku

- **GIVEN** an agent launch naming the haiku model
- **WHEN** the launch is made
- **THEN** it runs

#### Scenario: A launch on another model

- **GIVEN** an agent launch naming a model other than haiku
- **WHEN** the launch is made
- **THEN** it is refused and the refusal says to pass the haiku model instead

#### Scenario: A launch naming no model

- **GIVEN** an agent launch naming no model
- **WHEN** the launch is made
- **THEN** it is refused, since it would inherit the session's model

#### Scenario: A forked launch

- **GIVEN** an agent launch marked as a fork
- **WHEN** the launch is made
- **THEN** it is refused, since a fork runs on the session's model whatever it names

### Requirement: A run of lookups is advised toward a haiku agent on every third

On the third lookup in a row, and on every third after it, the call SHALL run and its result SHALL carry a note advising a haiku agent.

#### Scenario: The third lookup in a row

- **GIVEN** two lookups in a row with no decision between them
- **WHEN** a third lookup runs
- **THEN** its result carries the note

#### Scenario: The sixth lookup in a row

- **GIVEN** five lookups in a row with no decision between them
- **WHEN** a sixth lookup runs
- **THEN** its result carries the note again

#### Scenario: The note on a lookup

- **GIVEN** a lookup owing the note
- **WHEN** it runs
- **THEN** the lookup still runs and is not blocked

### Requirement: Changing or delegating calls reset the lookup count

Calls that change files or delegate work SHALL reset the lookup count to zero, and each new prompt SHALL reset it too.

#### Scenario: An edit between lookups

- **GIVEN** two lookups followed by an edit
- **WHEN** the next lookup runs
- **THEN** the count starts again from one

#### Scenario: A new prompt from the person

- **GIVEN** a run of lookups in one prompt
- **WHEN** the person sends a new prompt
- **THEN** the count starts again from zero

### Requirement: Subagent lookups do not count toward the main session's run

A subagent's lookups SHALL NOT count toward the main session's run.

#### Scenario: A subagent reading files

- **GIVEN** a subagent making several lookups
- **WHEN** they run
- **THEN** the main session's count is unchanged

### Requirement: A failure in the guard lets the call through

A failure in the guard SHALL let the call through unchanged.

#### Scenario: The guard fails while checking a call

- **GIVEN** a call whose check fails
- **WHEN** the call is made
- **THEN** it runs unchanged
