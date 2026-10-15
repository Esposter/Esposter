## Purpose

Deploy moves an old full install to the contract-only layout. Once pre-v3 installs are gone, the migration is dead code; a machine still in that state must be told what to clear rather than migrated silently.

## ADDED Requirements

### Requirement: Deploy reports a pre-v3 install instead of migrating it

`Deploy-ClaudeConfig` SHALL report a leftover pre-v3 full install and name the manual step, and SHALL NOT migrate it.

#### Scenario: Leftover install is reported

- **GIVEN** a machine with script-installed team agents under `~/.claude/agents` from a pre-v3 install
- **WHEN** `Deploy-ClaudeConfig` runs
- **THEN** the output names the leftover files and the manual step to remove them
- **AND** no file under `~/.claude` is removed or rewritten by the run

#### Scenario: Clean machine is unchanged

- **GIVEN** a machine with no pre-v3 files
- **WHEN** `Deploy-ClaudeConfig` runs
- **THEN** the output contains no leftover report
