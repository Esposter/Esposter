## Context

The aliases exist so installs made against the old marketplace names keep resolving. The pre-v3 migration exists for full installs that predate the contract-only deploy. The README says a previous full install is migrated automatically, and that status reports deprecated aliases.

## Goals / Non-Goals

**Goals:**

- Fewer code paths and tests for installs that no longer exist.
- A removal that teams see coming, with a date.

**Non-Goals:**

- Removing the `team-core`, `dotnet` or `vue` plugins.
- Automatically uninstalling aliases from machines. A marketplace change cannot reach a machine it does not run on.

## Decisions

1. **Remove on a dated plan, not on the next release.** Aliases break installs silently when removed, so the date and the report step come first. Rejected: removal now, because the alias list has no central owner to confirm it is unused.
2. **The migration is removed, not kept as a silent no-op.** A no-op keeps the test and the code paths alive. Deploy reports a leftover pre-v3 install and names the manual step. Rejected: keeping the migration for one more release, which adds a second date to track.
3. **The removal date of 2026-12-15 is a proposal.** The user confirms or changes it before the announcement.

## Risks / Trade-offs

- [Silent breakage] A machine still on an alias stops resolving its plugins. Mitigation: the report step before the date, and the documented fix.
- [Unknown reach] Nothing central lists the installs. Mitigation: team leads report from `Show-ClaudeConfigStatus`; a gap is accepted and named in the PR.
