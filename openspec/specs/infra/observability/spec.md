## Purpose

Application Insights and Log Analytics are deliberately not provisioned — telemetry is not worth the spend, so the budget guard is the cost ceiling and Azure platform metrics answer operator questions.

## Requirements

### Requirement: No paid telemetry is provisioned

The estate SHALL NOT provision Application Insights or Log Analytics in any environment, and the Function Apps SHALL carry no telemetry connection settings.

#### Scenario: Infrastructure previewed

- **GIVEN** an infrastructure change is previewed for either environment
- **WHEN** the preview lists the resources
- **THEN** no telemetry or log analytics resource is listed

#### Scenario: Review suggests adding monitoring

- **GIVEN** a review suggests adding telemetry for observability
- **WHEN** the suggestion is judged
- **THEN** it is closed and not applied

### Requirement: The budget guard is the cost ceiling

The budget guard SHALL be the cost ceiling for the estate in place of telemetry.

#### Scenario: Spend registers

- **GIVEN** metered spend registers in an environment
- **WHEN** the budget guard fires
- **THEN** the Function Apps are stopped

### Requirement: Operators read platform metrics for operational questions

Operators SHALL answer invocation counts, storage size and queue depth from the platform's own metrics.

#### Scenario: Operator asks how many invocations ran

- **GIVEN** an operator wants the invocation count
- **WHEN** they look for it
- **THEN** it is read from the platform's metrics without any log workspace

### Requirement: Handler logs are kept in the live log stream

The Function App's host configuration SHALL NOT disable file logging, so that handler errors remain visible in the live log stream.

#### Scenario: Handler logs an error

- **GIVEN** a handler writes an error to its log
- **WHEN** an operator attaches to the live log stream
- **THEN** the error is visible there

### Requirement: No alert fires on dead-letter outcomes

No alert SHALL fire on a dead-letter quarantine or a replay discard, and operators SHALL find those cases by inspecting the dead-letter container.

#### Scenario: Event quarantined

- **GIVEN** an event is quarantined
- **WHEN** the quarantine happens
- **THEN** no alert is raised
- **AND** the quarantined blob is visible in the dead-letter container

### Requirement: The no-telemetry decision is revisited only on a changed need

The decision not to provision telemetry SHALL be revisited only when paid tiers, an on-call rotation or an incident-investigation need make retained telemetry worth its spend.

#### Scenario: Proposal to add telemetry without a changed need

- **GIVEN** no paid tier, on-call rotation or incident need has changed
- **WHEN** a proposal to add telemetry is raised
- **THEN** the decision is not reopened
