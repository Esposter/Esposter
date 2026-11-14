## Purpose

Paid telemetry is deliberately not provisioned: operators read the platform's own metrics and the live tail, dead letters are found in their dead-letter queues, and no alert is raised on either.

## Requirements

### Requirement: No paid telemetry is provisioned

The estate SHALL NOT provision a log export, an analytics dataset or an alert in any environment.

#### Scenario: Infrastructure previewed

- **GIVEN** an infrastructure change is previewed for either environment
- **WHEN** the preview lists the resources
- **THEN** no log export, analytics dataset or alert resource is listed

#### Scenario: Review suggests adding monitoring

- **GIVEN** a review suggests adding telemetry for observability
- **WHEN** the suggestion is judged
- **THEN** it is closed and not applied

### Requirement: Operational questions are answered by the platform's metrics

Operators SHALL answer request counts, error counts, queue depth and storage size from the platform's own metrics.

#### Scenario: Operator asks how many requests a Worker served

- **GIVEN** an operator wants a Worker's request count
- **WHEN** they look for it
- **THEN** it is read from the platform's metrics without any log store

### Requirement: A Worker's logs are read from the live tail

A Worker's logs SHALL be readable only while a live tail is attached to it.

#### Scenario: A handler logs an error

- **GIVEN** a handler writes an error to its log
- **WHEN** an operator attaches a live tail to the Worker
- **THEN** the error is visible there

### Requirement: Dead-letter messages raise no alert

No alert SHALL fire when a job's message is kept in its dead-letter queue, and operators SHALL find those messages by reading the dead-letter queue.

#### Scenario: A job's message fails past its retries

- **GIVEN** a job's message fails past the job's retry count
- **WHEN** the failure happens
- **THEN** the message is kept in the job's dead-letter queue
- **AND** no alert is raised

### Requirement: The no-telemetry decision is revisited only on a changed need

The decision not to provision telemetry SHALL be revisited only when a paid tier, an on-call rotation or an incident-investigation need makes retained telemetry worth its spend.

#### Scenario: Proposal to add telemetry without a changed need

- **GIVEN** no paid tier, on-call rotation or incident need has changed
- **WHEN** a proposal to add telemetry is raised
- **THEN** the decision is not reopened
