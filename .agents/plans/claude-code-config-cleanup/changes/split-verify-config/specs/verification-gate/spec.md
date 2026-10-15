## Purpose

Verify-Config is the team's gate: a repository is GREEN only when it passes. Splitting it into one file per check group must not change what it reports or how it exits, so the gate means the same thing before and after the split.

## ADDED Requirements

### Requirement: The gate reports every group and exits on the first failing check

Verify-Config SHALL run every check group, report each group's result, and exit 0 only when every check passes and 1 otherwise.

#### Scenario: All groups pass

- **GIVEN** a repository where every check passes
- **WHEN** Verify-Config runs
- **THEN** it reports each group as passed
- **AND** it exits 0

#### Scenario: One failing check fails the gate

- **GIVEN** a repository with one broken JSON file
- **WHEN** Verify-Config runs
- **THEN** the report names the group that failed
- **AND** it exits 1

#### Scenario: Split gate matches the unsplit gate

- **GIVEN** the same repository run through the unsplit and the split Verify-Config
- **WHEN** both runs finish
- **THEN** the group names, pass counts and exit codes are identical
