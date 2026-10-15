## 1. Pre-flight (read-only)

- [ ] 1.1 Confirm each of the six changes has commits on `main` (`git log main -- openspec/changes/<id>`) and record the hashes in the PR description — verify all six list at least one commit.
- [ ] 1.2 Run `openspec validate <id> --strict --no-interactive` and the scenario lint on each of the six, and record the output — verify every run exits 0 before any archive.
- [ ] 1.3 Read the two `build-stage` deltas (`spec-driven-lifecycle`, `sequence-agents-by-role`) and confirm the archive order in proposal.md — verify the first archives as ADDED and the second as MODIFIED.

## 2. Re-point checks (same commit as the first archive)

- [ ] 2.1 Change Verify-Config sections 5d–5h and the 5g loop to read `openspec/specs/<capability>/spec.md` for behaviour, and the archive path only where the check verifies the proposal — verify Verify-Config is GREEN before the archive commit.
- [ ] 2.2 Add an assertion to each re-pointed check that it saw at least one entry (spec file or archived folder) — verify by temporarily pointing one at an empty path and seeing it fail, then restoring it.

## 3. Archive

- [ ] 3.1 `openspec archive vendored-skills --yes`, then commit by pathspec — verify `openspec/specs/` gains its capabilities and Verify-Config is GREEN.
- [ ] 3.2 `openspec archive continuous-improvement-loop --yes`, then commit — verify as 3.1.
- [ ] 3.3 `openspec archive spec-driven-lifecycle --yes`, then commit — verify `build-stage` now exists under `openspec/specs/`.
- [ ] 3.4 `openspec archive tighten-openspec-practice --yes`, then commit — verify as 3.1.
- [ ] 3.5 `openspec archive plugin-taxonomy-and-budget --yes`, then commit — verify as 3.1.
- [ ] 3.6 `openspec archive sequence-agents-by-role --yes`, then commit — verify the `build-stage` MODIFIED merged into the spec from 3.3.

## 4. Close-out

- [ ] 4.1 `openspec validate --specs --strict` (or the equivalent in 1.12) passes over `openspec/specs/` — verify exit 0 and the output lists every archived capability.
- [ ] 4.2 `openspec/changes/` contains no folder except `archive/` — verify with `ls`.
- [ ] 4.3 Run `.\scripts\Verify-Config.ps1` and the scenario lint over the archive — verify GREEN and record the output in the PR.
