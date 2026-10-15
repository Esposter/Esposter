## Why

The scenario lint and the `team-bdd` schema each exist in more than one copy: the lint in `openspec/scripts/`, `templates/openspec/scripts/` and `plugins/team-core/hooks/scripts/lint-openspec-scenarios.js`; the schema in `openspec/schemas/` and `templates/openspec/schemas/`. They are byte-identical today. A Verify-Config hash check keeps the lint copies equal, but nothing checks the schema copies, and every new copy is another place to edit by hand.

## What Changes

- Declare one authored source for each file, and make every other copy derived from it, with a check that derived copies are byte-identical to their source.
- The lint's authored source stays in `plugins/team-core/hooks/scripts/`, because an installed plugin cannot reach outside its own folder. The schema's authored source moves to `templates/openspec/schemas/team-bdd/`, which `/opsx-setup` already copies from.
- This repo's `openspec/` copies are derived. `/opsx-setup` writes them; Verify-Config fails when they differ from their source.
- The lint copy in `templates/openspec/scripts/` is derived the same way.

## Capabilities

### New Capabilities

- `openspec-kit`: where each shipped OpenSpec file is authored, and how its copies are kept equal to it.

### Modified Capabilities

- none

## Impact

- `scripts/Verify-Config.ps1` hash check (extended to the schema, and to the template copy)
- `plugins/team-core/skills/opsx-setup/SKILL.md` (copies from source)
- `openspec/scripts/`, `openspec/schemas/` (derived)
- `templates/openspec/` (authored schema)
