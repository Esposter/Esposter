# Proposal

## Why

A usage reserve refuses every workflow launch, whatever its agents run on. A workflow whose every agent is pinned to haiku costs what the same number of haiku `Agent` calls cost, and the reserve already allows those. So the blanket refusal gains nothing for that workflow, and it pushes the session onto many separate agent launches where one workflow would run them in a single script.

## What Changes

- While a reserve holds and the resin mod is on, a workflow launch whose script provably runs every agent on the haiku model is allowed. The script is read inline, or from the file at the launch's path.
- Any other workflow launch under a reserve is still refused with the reserve's summary and the existing instruction: a script that runs an agent off haiku, or with no model, or with no agent at all, a saved workflow named with no script, and a script path with no file behind it.
- The check is conservative. When the script cannot be read with certainty, it is refused.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `infra/claude-interface/genshin-mods/resin`: the workflow launch requirement, which now allows a workflow whose script is provably haiku-only under a reserve.

## Impact

- `packages/genshin-mods/src/services/resin/`: the gate reads the launch's script and passes it to a pure check, with the check's small helpers in their own files. The package gains no dependency and no lockfile change.
- `.agents/skills/llm-delegation/SKILL.md` and `.agents/skills/throughput/references/usage-reserve.md`: the lines that say a workflow is refused outright under a reserve are rewritten to the haiku rule.
- `openspec/specs/infra/claude-interface/genshin-mods/resin/design.md` and `openspec/specs/infra/claude-interface/genshin-mods/delegation/design.md` still describe the old refusal. They are rewritten as built when this change is archived, not here.
