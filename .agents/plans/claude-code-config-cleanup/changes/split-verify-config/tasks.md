## 1. Baseline

- [ ] 1.1 Run `.\scripts\Verify-Config.ps1` on the pre-split tree and save the full output and the exit code — verify the saved output lists every group with its pass count.

## 2. Split

- [ ] 2.1 Move each numbered section into `scripts/checks/<group>.ps1` as a function returning its failures, in the order of the baseline — verify each file parses (`pwsh -NoProfile -Command` parse check).
- [ ] 2.2 Rewrite `scripts/Verify-Config.ps1` as the runner that calls the groups in order and prints the same report — verify the output diff against the baseline is empty apart from the file names in any path.

## 3. Equivalence

- [ ] 3.1 Break one check on purpose (a bad JSON file in a scratch copy) and confirm the runner exits 1 and names the same group as before — verify the exit code and message match the pre-split run.
- [ ] 3.2 Confirm `azure-pipelines.yml` still calls the same entry point — verify by grep.

## 4. Close-out

- [ ] 4.1 Run `.\scripts\Verify-Config.ps1` — verify GREEN and the report matches the baseline.
