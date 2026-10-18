## Purpose

A judgement whose answer is one of a fixed set is read by a typed-decision model before anything spawns a Claude Code session, because every session in the pipeline is drawn from the one window a person's session also draws on.

## Requirements

### Requirement: Code answers what it can verify before any model

A judgement SHALL be answered in code when repository, git or API state can settle it, and SHALL reach a typed decision only when its answer is one of a fixed set over state already in hand.

#### Scenario: Judgement that code can settle

- **GIVEN** the repository or API state settles a judgement
- **WHEN** the judgement is needed
- **THEN** it is answered in code and no typed decision is asked

#### Scenario: Judgement with no fixed answer set

- **GIVEN** a judgement's answer is not one of a fixed set
- **WHEN** the judgement is needed
- **THEN** it goes to a Claude Code session and no typed decision is asked

### Requirement: Typed decisions return a fixed value and a probability

A typed decision SHALL return a value from its fixed set together with a probability, and SHALL never return free text.

#### Scenario: Typed decision answers

- **GIVEN** a typed decision is asked a judgement
- **WHEN** it answers
- **THEN** the answer is one value from the fixed set
- **AND** the answer carries a probability

### Requirement: An answer is acted on only above its confidence threshold

An answer SHALL be acted on only when its probability reaches the threshold for its action, which is 0.6 in general and 0.85 for a decision that writes outside the checkout.

#### Scenario: Low-confidence answer

- **GIVEN** a typed decision's answer is below its threshold
- **WHEN** the answer is considered
- **THEN** it is not acted on

#### Scenario: Label write below the write threshold

- **GIVEN** a decision would write a label outside the checkout at 0.7
- **WHEN** the answer is considered
- **THEN** it is not acted on

### Requirement: Answers below threshold escalate rather than fail

An answer below its threshold SHALL escalate to a Claude Code session or to the needs-triage state, and SHALL NOT be treated as an error.

#### Scenario: Escalation to needs-triage

- **GIVEN** a triage answer is below its threshold
- **WHEN** the escalation runs
- **THEN** the issue is marked needs-triage

### Requirement: Without a key every gate escalates

Where no typed-decision key is set, every gate SHALL answer nothing and its caller SHALL escalate, so the pipeline behaves as it did before the gates existed.

#### Scenario: Fork or local run with no key

- **GIVEN** no typed-decision key is set
- **WHEN** any gate is asked
- **THEN** it answers nothing
- **AND** its caller escalates

### Requirement: The typed-decision key never reaches a spawned session

A spawned Claude Code session SHALL NOT receive the typed-decision key, and SHALL receive only the credential that authenticates itself.

#### Scenario: Session spawned

- **GIVEN** a Claude Code session is spawned by the pipeline
- **WHEN** its environment is prepared
- **THEN** the typed-decision key is absent from it

### Requirement: Triage role is decided by the typed tier, conflicts are not

Triage SHALL assign one of the five triage roles to an issue through a typed decision, and a merge conflict SHALL NOT be asked of the typed tier.

#### Scenario: Issue awaiting a triage role

- **GIVEN** an issue has no triage role
- **WHEN** triage runs
- **THEN** one of the five triage roles is assigned by a typed decision

#### Scenario: Merge conflict

- **GIVEN** a merge conflict needs editing
- **WHEN** it is routed
- **THEN** it goes to a Claude Code session and not to a typed decision
