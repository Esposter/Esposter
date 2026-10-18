## Purpose

Failed async work recovers itself — event-triggered retry with an attempt cap and a quarantine, never an operator running a script.

## Requirements

### Requirement: Failed async work recovers without an operator

Asynchronous work that fails past its retries SHALL be recovered by the system, and no operator SHALL have to run a command for it.

#### Scenario: An event fails past its retries

- **GIVEN** delivery of an event has failed past its retries
- **WHEN** the failed event is written to the durable failure store
- **THEN** the recovery handler starts because of that write
- **AND** no schedule or operator is needed to start it

### Requirement: Retries stop at an attempt cap and quarantine the work

Automatic recovery SHALL stop after a fixed attempt cap, and work past the cap SHALL be moved to a quarantine and logged.

#### Scenario: A unit of work reaches the attempt cap

- **GIVEN** a unit of work has failed as many times as the cap allows
- **WHEN** it fails again
- **THEN** it is moved to quarantine
- **AND** a poison-case error is logged
- **AND** it is not retried again

#### Scenario: A payload can never pass validation

- **GIVEN** a payload fails validation so that it can never succeed
- **WHEN** the recovery handler receives it
- **THEN** it is moved to quarantine without any retry

### Requirement: The attempt count survives each round trip

The attempt count SHALL travel with the unit of work so that it continues across every replay through the failure store.

#### Scenario: A unit of work is replayed several times

- **GIVEN** a unit of work has already been replayed twice
- **WHEN** it is replayed again through the failure store
- **THEN** its attempt count continues from two rather than restarting at zero

### Requirement: Redelivery is normal input

A redelivered event or batch SHALL be handled as normal input, never rejected as corrupt.

#### Scenario: A replayed batch repeats an event id

- **GIVEN** a replayed batch contains an event id it has already carried
- **WHEN** the batch is handled
- **THEN** the healthy events in the batch are processed
- **AND** none of them is quarantined for the repeated id

#### Scenario: The same unit is delivered again after a partial failure

- **GIVEN** a unit of work was partly handled before a failure
- **WHEN** it is delivered again
- **THEN** the outcome matches a single delivery
- **AND** the poison-case log is written once for the payload

### Requirement: The attempt cap applies to each unit of work

The attempt cap SHALL apply to each unit of work separately, so that one failing unit cannot hold back the retries of the others in its batch.

#### Scenario: A batch holds one unit over the cap and transient failures

- **GIVEN** a batch contains one unit past the cap and several units with transient failures
- **WHEN** the batch is recovered
- **THEN** only the unit past the cap is quarantined
- **AND** the other units are retried

### Requirement: An oversized input is split before it is quarantined

An input the pipeline cannot take as it is SHALL be split into pieces it can take, and only an input still failing past the cap SHALL be quarantined.

#### Scenario: A change is too large for one review window

- **GIVEN** a queue commit changes more files than one review window holds
- **WHEN** the recovery handler receives it
- **THEN** it is split into smaller inputs that fit
- **AND** those inputs are processed under the same attempt cap

#### Scenario: Splitting still fails past the cap

- **GIVEN** the split pieces keep failing past the attempt cap
- **WHEN** the cap is reached
- **THEN** the input is quarantined
- **AND** the work queued behind it continues

### Requirement: Manual scripts are not the recovery path

A manual operations script SHALL be used only for work that is a human decision, never as the recovery for a failure the system can observe.

#### Scenario: A failure the system can see recurs

- **GIVEN** a failure the system can observe keeps recurring
- **WHEN** the failure is addressed
- **THEN** the fix is an automatic handler rather than a script an operator runs
