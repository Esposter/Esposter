# ClaudeCodeConfig cleanup — plan

Proposals for cleaning up the team Claude Code configuration. Kept here, in the Esposter repository, so every machine that clones Esposter gets the same plan. The configuration itself lives in a different repository and is changed there.

| Item                     | Where it is changed                                                    |
| ------------------------ | ---------------------------------------------------------------------- |
| This plan and its ledger | Esposter, `.agents/plans/claude-code-config-cleanup/`                  |
| The configuration        | `C:\Users\jimmyc\source\repos\ClaudeCodeConfig` (remote: Azure DevOps) |

## Contents

- `LEDGER.md`: one row per change, with status, dependencies and the gate it must pass. This is what is worked from.
- `changes/<id>/`: one OpenSpec change per row (`proposal.md`, `design.md` where a decision is recorded, `specs/`, `tasks.md`, `.openspec.yaml`).

## How a change is implemented

1. Check `LEDGER.md` for the next row whose dependencies are done.
2. In `ClaudeCodeConfig`, branch from `main` (`chore/<id>`). The team guard blocks edits on `main`.
3. Copy `changes/<id>/` into `openspec/changes/<id>/` of that repository, then run `openspec validate <id> --strict --no-interactive` and the scenario lint. Both must pass before any edit.
4. Work the tasks in order. Each task names its own verification.
5. Open one pull request for the change. Update the row's status in `LEDGER.md` here, in Esposter, in its own commit.

The copy is one-way: the implemented change is the record in `ClaudeCodeConfig` once merged. The copy here stays the proposal.

## Tooling

- OpenSpec CLI pinned at 1.12.0 (`npm i -g @fission-ai/openspec@1.12.0`). Installed on this machine; every other machine needs it before implementing a row.
- `/opsx-setup` runs once per machine (team profile), per the `opsx-setup` skill.
- PowerShell 7 (`pwsh`) runs `scripts/Verify-Config.ps1`.

## Sharing

This folder is committed to Esposter's `ai/queue` and pushed. Pull Esposter on another machine to get the plan. Nothing in it depends on a local path except the `ClaudeCodeConfig` clone location above, which is a convention and not a dependency — adjust it on a machine that clones the repository elsewhere.
