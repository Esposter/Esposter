## Purpose

The one exponential backoff every paced retry in the repo uses, from `@esposter/shared`: the delay formula, the wrapper that waits before an attempt, and the rule for which operations retry at all.

## Requirements

### Requirement: The delay doubles from the base and holds at the maximum

`getExponentialBackoffDelayMs` SHALL return `min(base × 2^attempt, max)` for a zero-based attempt, so the first wait after one failure is the base and no wait exceeds the maximum.

#### Scenario: Waits double from the base

- **GIVEN** a base of 1000 and a maximum of 30000
- **WHEN** the delay is read for attempts 0, 1 and 2
- **THEN** the delays are 1000, 2000 and 4000

#### Scenario: A wait is held at the maximum

- **GIVEN** a base of 1000 and a maximum of 30000
- **WHEN** the delay is read for attempt 20
- **THEN** the delay is 30000

### Requirement: The wrapper waits before an attempt that follows a failure

`createExponentialBackoff` SHALL run an operation at once when no earlier call failed, and SHALL wait the delay for the failure count before running it when an earlier call failed.

#### Scenario: A call with no failures runs at once

- **GIVEN** a wrapper that has not seen a failure
- **WHEN** an operation is run through it
- **THEN** the operation runs without scheduling a wait

#### Scenario: A call after a failure waits the base first

- **GIVEN** a wrapper whose last operation failed once
- **WHEN** another operation is run through it
- **THEN** the wait scheduled before it is the base delay

#### Scenario: A success resets the wait

- **GIVEN** a wrapper whose operations have failed twice and then succeeded
- **WHEN** an operation is run through it
- **THEN** it runs without a wait

### Requirement: A failure is rethrown to its caller

The wrapper SHALL rethrow an operation's error, so the caller decides what the failure means.

#### Scenario: The caller receives the error

- **GIVEN** an operation that rejects with an error
- **WHEN** it is run through the wrapper
- **THEN** the wrapper rejects with that same error

### Requirement: Only reads retry, and each caller bounds its own retries

A read that fails for a transient reason SHALL be retried through the wrapper, and a write SHALL NOT be retried by it. The wrapper SHALL NOT impose a cap, so a caller that needs one SHALL state it.

#### Scenario: A mutation is not retried

- **GIVEN** a mutation that the server rejects
- **WHEN** the write fails
- **THEN** it is rolled back and reported once, and no retry is scheduled

#### Scenario: A retrying read states its cap

- **GIVEN** a read that keeps failing
- **WHEN** it is retried through the wrapper
- **THEN** the caller stops after its own stated number of retries

### Requirement: Retry delays come from the one formula

Every retry that waits SHALL take its delay from `getExponentialBackoffDelayMs`, so a change to how a retry waits is made in one place.

#### Scenario: The Genshin start wait uses the shared formula

- **GIVEN** the Genshin start's attempt number and its base and maximum
- **WHEN** its next wait is computed
- **THEN** the wait is the shared formula's result for that attempt

## Non-goals

- A jitter on the wait. The retries here are single-client reads of one server, so synchronized clients are not a case the repo has.
- A shared attempt cap. Each caller's surface decides how long it can wait.
