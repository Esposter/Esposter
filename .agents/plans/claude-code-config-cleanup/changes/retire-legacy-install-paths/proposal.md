## Why

Two legacy install paths still ship although no new install needs them. The marketplace keeps two deprecated aliases, `team-claude-code-config` (to `team-core`) and `dotnet-vue-stack` (to `dotnet`), so older installs keep working. `Deploy-ClaudeConfig.ps1` carries a migration for full installs made before v3, and Verify-Config section 3e tests it. Each costs code, a test and a status line, and serves installs that are long gone.

## What Changes

- **BREAKING:** remove the two alias entries from `.claude-plugin/marketplace.json` on the removal date below. An install that still names an alias stops resolving.
- Remove the pre-v3 full-install migration from `Deploy-ClaudeConfig.ps1` and its test in Verify-Config section 3e. A machine that still has a pre-v3 install is reported, with the manual step to clear it.
- Remove the alias lines from `Show-ClaudeConfigStatus`.
- Announce both dates now, in the README release note and to the team, so the removal is not a surprise.

## Dated plan

Dates are proposals for the user to confirm; they are not yet agreed.

| Date                  | Step                                                                                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-15            | Announce: the aliases and the pre-v3 migration are deprecated, removal 2026-12-15 (proposed).                                                             |
| Before 2026-12-15     | Team leads run `Show-ClaudeConfigStatus` on their machines and report any alias still enabled. There is no central list, so this is the only way to know. |
| 2026-12-15 (proposed) | Land this change. Aliases removed; pre-v3 migration removed.                                                                                              |

If a machine still reports an alias after 2026-12-15, the fix is `claude plugin install team-core@team-claude-code-config` and disabling the alias in that repo's `.claude/settings.json`.

## Steps

1. Post the announcement and the date table in the team channel and in the README.
2. Collect the alias reports before the date.
3. Land the change on the removal date, one PR, with Verify-Config GREEN.

## Capabilities

### New Capabilities

- none (skip_specs when the removal is merged; the behaviour is recorded in the two delta specs of this change)

### Modified Capabilities

- none

## Impact

- `.claude-plugin/marketplace.json`, `.claude-plugin/README.md`, `.claude-plugin/PLUGIN_SCHEMA_NOTES.md` (alias notes)
- `Deploy-ClaudeConfig.ps1` (pre-v3 migration and `Show-ClaudeConfigStatus` alias lines)
- `scripts/Verify-Config.ps1` sections 3e and 4 (alias checks)
- `README.md` (deprecated-alias paragraph and release note)
