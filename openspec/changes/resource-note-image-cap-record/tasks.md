# Tasks

## 1. Decide whether the cap is specified

- [ ] 1.1 Choose one of the two options in `proposal.md`. Verified by a recorded decision in `note-images/design.md`, "Notes", naming the option and its reason.

## 2. Make the spec and the design agree

- [ ] 2.1 Once 1.1 is recorded, write the chosen option as a spec delta at `specs/resource/note-images/spec.md` in this change, and remove `skip_specs` from `.openspec.yaml`, since the change now carries a delta. `openspec archive` merges the delta into `openspec/specs/resource/note-images/spec.md`, so the spec of record is not edited here. Under option 1 there is no requirement to write: apply the owner's Purpose choice from `proposal.md`'s "What Changes" instead, and leave `skip_specs` in place unless that choice is a delta. Update `openspec/specs/resource/note-images/design.md` in place in this change, and under option 2 only after 2.2's test runs, so the design never states a test that does not exist. Verified by a read of the delta and the design against `apps/web/app/assets/css/globals.css`.
- [ ] 2.2 If the option restores a scenario, add the test named for it, and confirm the test fails when the rule is removed. Verified by that run recorded in the change.
