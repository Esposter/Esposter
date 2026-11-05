## 1. The classification

- [ ] 1.1 Add the phase to the change metadata: a Genshin change names one phase in its `.openspec.yaml`, the metadata model reads it, and the change-metadata reference page documents it. Verify: a test named after the scenario 'A genshin change names its phase', written first and seen failing, in `scripts/src/services/fleet/parseProposalMetadata.test.ts` and the workspace test that holds the open changes' metadata.
- [ ] 1.2 Read a task's phase: a task line of a change's `tasks.md` may carry `[phase <n>]` after its number, a task without one holds its change's `x-phase`, and a change's pick phase is the lowest phase among its open tasks. The marker and the rule are documented on the change-metadata reference page, and the sentence there that names a Genshin change's lowest failing phase is replaced by the rule that its `x-phase` is the phase its tasks hold. Verify: tests named after the scenarios 'A task holds its change's phase unless it names another' and 'A change's pick phase is its lowest open task's', written first and seen failing.
- [ ] 1.3 Classify every open Genshin change into a phase by the one question in the design: set `x-phase` to the phase most of its open tasks hold, and mark the tasks of another phase. Verify: the metadata test from 1.1 passes over every open Genshin change.
- [ ] 1.4 Regroup the Genshin roadmap under one heading per phase, every open item under its phase's heading and in its pass's order inside it. Verify: a test named after the scenario 'An open roadmap item sits in a phase section', written first and seen failing.
- [ ] 1.5 Give each compute page's area the phase its items hold, in one table the fleet reads, so a compute item takes its area's phase. Verify: a test named after the scenario 'A compute item takes its area's phase'.

## 2. The progress report

- [ ] 2.1 Build `pnpm ai:genshin:progress`, which prints each phase's units by kind as done, runnable on this machine, waiting on a named blocker, or blocked on the other machine, computed from the checkboxes, the compute pages and the needs of each unit. Verify: a test named after the scenario 'A phase's progress counts its units by kind', written first and seen failing.
- [ ] 2.2 Add the exit checks a command can read today to the report: a region's passes frozen, a screen's ids under their bars, a dataset's lock current. A check with no command prints as not measurable. Verify: tests named after the scenarios 'A screen is done when every id is under its bar' and 'A check with no command is not measurable'.

## 3. The pick

- [ ] 3.1 Make `pnpm ai:fleet:next` take the lowest phase's first unit the machine can run and no claim holds, and group `pnpm ai:proposals:report` by phase. Verify: tests named after the scenarios 'The lowest phase with a runnable unit is taken first' and 'A phase whose units wait on the other machine is passed over'.

## 4. The definitions of done

- [ ] 4.1 Build the scripted-session harness a quest's and the playable core's gate need: a session that plays the opening, a walk, a fight, a pickup, a menu, a save and a load from a script. Verify: a test named after the scenario 'A scripted session plays a quest to its end across a save and a load'. Open: it is the first unit of the playable core's gate and is built in phase 0 because that gate cannot be checked without it.
- [ ] 4.2 Build the check that a system is reachable through a finished screen. Verify: a test named after the scenario 'A system with no finished screen is not done'.
- [ ] 4.3 Turn each asset family's gap list from the inventory into a recipe-following unit in phase 0 or the phase of the region it serves, and write the conversion recipe into the derived-assets design. Verify: the derived-assets design carries the recipe, and every family's inventory gap is a roadmap item or a change task.

## 5. The program page

- [ ] 5.1 Replace the program page's four phase tables with the phases and gates here, keeping its pages as the units each phase holds. Verify: `pnpm exec openspec validate genshin-program --strict --no-interactive` passes and the program's table of pages names each page's phase.
