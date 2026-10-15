## Purpose

Deprecated plugin aliases keep older installs working for a stated period, then are removed so the marketplace lists only the plugins that exist. This lets teams move to the current names before the removal, and makes the removal date visible in the status report.

## ADDED Requirements

### Requirement: Aliases resolve until the removal date

The marketplace SHALL keep each deprecated alias resolving to its replacement plugin until the announced removal date.

#### Scenario: Old alias still installs before the date

- **GIVEN** a repository that enables `team-claude-code-config@team-claude-code-config`
- **WHEN** Claude Code loads the plugins before the removal date
- **THEN** the alias resolves to `team-core`

### Requirement: Aliases are removed on the removal date

The marketplace SHALL NOT list a deprecated alias after its removal date.

#### Scenario: Removed alias does not resolve

- **GIVEN** a repository that enables `dotnet-vue-stack@team-claude-code-config` after the removal date
- **WHEN** Claude Code loads the plugins
- **THEN** the alias is reported as unavailable and no plugin is loaded under its name

#### Scenario: Status reports a remaining alias

- **GIVEN** a machine whose settings still enable an alias after the removal date
- **WHEN** `Show-ClaudeConfigStatus` runs
- **THEN** the status names the alias and the one-line fix
