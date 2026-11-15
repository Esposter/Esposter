## Purpose

Paid telemetry is deliberately not provisioned, and no alert is raised on a dead-letter message.

## Requirements

### Requirement: No paid telemetry is provisioned

The estate SHALL NOT provision a log export, an analytics dataset or an alert in any environment.

#### Scenario: Infrastructure previewed

- **GIVEN** an infrastructure change is previewed for either environment
- **WHEN** the preview lists the resources
- **THEN** no log export, analytics dataset or alert resource is listed

### Requirement: Dead-letter messages raise no alert

No alert SHALL fire when a job's message is kept in its dead-letter queue, and operators SHALL find those messages by reading the dead-letter queue.

#### Scenario: A job's message fails past its retries

- **GIVEN** a job's message fails past the job's retry count
- **WHEN** the failure happens
- **THEN** the message is kept in the job's dead-letter queue
- **AND** no alert is raised
