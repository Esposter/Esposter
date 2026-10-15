## Why

The plugins carry 40-odd skills and 10 agents, and several jobs have two owners. An agent and a skill share a name and a job: `tdd-guide` and `tdd`, `security-reviewer` and `security-review`, `verifier` and `verify`. `grill-me` is a 47-word alias that only calls `grilling`. `eval-harness` is referenced from one place. Each duplicate is read into context by someone, and two copies of one job drift.

## What Changes

- Give each job one owner. When an agent and a skill cover one job, the skill holds the procedure and the agent names it as the thing it loads.
- Remove `grill-me`, and update each reference to `grilling`.
- Decide `eval-harness` by use: remove it if no stage or agent calls it, keep it if one does.
- Compare the stack skills that overlap (`coding-standards` with `csharp-standards` and `vue-standards`; `frontend-patterns` and `vue-standards`; `backend-patterns` and `csharp-standards`) and move each duplicated rule to the one that owns its language.

## Capabilities

### New Capabilities

- `skill-catalogue`: each job has one owning skill or agent, and no skill is a bare alias.

### Modified Capabilities

- none

## Impact

- `plugins/team-core/skills/` (grill-me removed; eval-harness decided; overlaps trimmed)
- `plugins/team-core/agents/` (tdd-guide, security-reviewer, verifier name their skill rather than restating it)
- `plugins/vue/skills/`, `plugins/dotnet/skills/` (overlap trimmed)
- `scripts/Verify-Config.ps1` (presence and vendored-skill checks; attribution footer for grill-me)
- `README.md` skill tables go through `readme-pointer`, not this change
