## Purpose

Every shim the suite carries because a runner or its DOM lacks a feature, the probe that retires each one, and what deleting it takes with it — a blocker table gated on upstream, read on the bump that could move a row.

## Requirements

### Requirement: Every workaround in the test suite has a retirement probe

Every workaround in the test suite SHALL be listed with a probe that shows whether it is still needed, and a workaround without a listed probe SHALL NOT be added.

#### Scenario: A new workaround is added

- **GIVEN** a change that adds a workaround to the test suite
- **WHEN** the change is reviewed
- **THEN** its entry names the probe and the result that shows the workaround is still needed

### Requirement: A workaround is removed when its probe shows the gap is closed

A workaround SHALL be removed, together with its entry, once its probe shows the gap is closed and the suites that relied on it still pass without it.

#### Scenario: A dependency update closes a gap

- **GIVEN** a dependency update after which a workaround's probe passes
- **WHEN** the workaround is removed
- **THEN** the dependent suites still pass
- **AND** the workaround and its entry are deleted in the same change

#### Scenario: Dependent suites fail without the workaround

- **GIVEN** a workaround whose probe passes but whose dependent suites fail once it is removed
- **WHEN** the removal is tried
- **THEN** the workaround is restored and its entry is corrected

### Requirement: A workaround stays while its probe still shows the gap

A workaround whose probe still shows its listed result SHALL stay in place.

#### Scenario: The probe still fails with its listed result

- **GIVEN** a workaround whose probe shows the listed failure
- **WHEN** the probe is run
- **THEN** the workaround is kept

### Requirement: Probes run when the dependency that owns the gap is updated

Probes SHALL run when the dependency that could close a gap is updated, and SHALL NOT run on a schedule of their own.

#### Scenario: A dependency is updated

- **GIVEN** a dependency whose update could close a gap
- **WHEN** the dependency is updated
- **THEN** the probes for its gaps are run

#### Scenario: A dependency is not updated

- **GIVEN** a dependency that has not changed
- **WHEN** the workarounds are reviewed
- **THEN** its probes are not run again

### Requirement: A probe that cannot be run is reported as a finding

A probe that cannot be run SHALL be reported as a finding rather than as a pass.

#### Scenario: A probe that cannot be run

- **GIVEN** a probe that cannot run in the current suite
- **WHEN** the workarounds are reviewed
- **THEN** the probe is reported as an open finding and not as a pass

### Requirement: The test environment's web origin never resolves

The test environment's web origin SHALL be a host that never resolves, so that a request the test layer does not answer fails at once rather than reaching a developer's running server.

#### Scenario: A request the test layer does not answer

- **GIVEN** a suite that makes a web request the test layer does not answer
- **WHEN** the request is made
- **THEN** it fails at once with a network failure
- **AND** it does not reach a server running on the developer's machine
