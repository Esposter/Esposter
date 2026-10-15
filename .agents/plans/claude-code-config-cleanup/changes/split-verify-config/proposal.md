## Why

`scripts/Verify-Config.ps1` is 766 lines in one file, with sections 1 to 8 and roughly a dozen unrelated test groups. One failing group hides the others, and every change to one area edits the same file as every other. The script is the team's only gate, so it must stay easy to read.

## What Changes

- Split the checks into one file per group under `scripts/checks/`, each a function that returns its failures.
- Keep `scripts/Verify-Config.ps1` as the runner: it calls every group in the same order, prints the same report, and exits with the same codes.
- No check is added, removed or changed in meaning. A check that moves must produce the same result on the same repository.

## Capabilities

### New Capabilities

- `verification-gate`: the gate reports every group and exits 0 only when every check passes; the split must not change either.

### Modified Capabilities

- none

## Impact

- `scripts/Verify-Config.ps1` (becomes the runner)
- `scripts/checks/` (new, one file per group)
- `azure-pipelines.yml` (runs the same entry point; no change expected)
