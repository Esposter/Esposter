## MODIFIED Requirements

### Requirement: Explanatory documentation is public and the agent tree holds only machine input

Explanatory documentation SHALL live in the OpenSpec tree, which the repository host renders publicly, and the agent tree SHALL hold only what a machine consumes.

#### Scenario: A decision a person would read lives in the specs

- **WHEN** a convention needs an explanation a person reads in a browser
- **THEN** the explanation is a page in the OpenSpec tree and the skill links to it

#### Scenario: A sweep ledger lives in the agent tree

- **WHEN** a repository-wide sweep's units are recorded
- **THEN** they are kept as a ledger in the agent tree
- **AND** the sweep's progress is read from its commit trailers rather than stored there
