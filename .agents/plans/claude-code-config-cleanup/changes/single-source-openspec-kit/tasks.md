## 1. Authored sources

- [ ] 1.1 Record in `openspec/config.yaml` operations and the `openspec` skill which copy is authored for the lint and for the schema — verify by grep that each names one authored path.
- [ ] 1.2 Add a Verify-Config check that the schema under `openspec/schemas/` and under `templates/openspec/schemas/` are byte-identical, and see it fail on a one-character edit — verify the failure names both paths, then restore.

## 2. Setup

- [ ] 2.1 Change `/opsx-setup` to copy the schema from the template and stop on a differing customised copy — verify the two scenarios of the setup requirement with a scratch repository.

## 3. Close-out

- [ ] 3.1 Run `.\scripts\Verify-Config.ps1` — verify GREEN.
- [ ] 3.2 Run `openspec validate single-source-openspec-kit --strict --no-interactive` and the scenario lint — verify both exit 0.
