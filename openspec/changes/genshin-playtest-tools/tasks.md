## 1. Registry

- [ ] 1.1 Build the registry: register and remove handles, parse a line into a command and its typed arguments, run it, and return its result or error, with name completion. Verify: `createDevRegistry.test.ts` with tests named after the scenarios 'Valid line runs and reports', 'Bad argument runs nothing', 'Unknown name is refused', 'Command whose state is not mounted says so' and 'Partial name completes', seen failing first.
- [ ] 1.2 Add variables (boolean, number, colour, choice; group, range) set through the registry, starting from the game's own value. Verify: tests named after the scenarios 'Control and console agree', 'Out of range is refused' and 'Reload restores the game's value', seen failing first.
- [ ] 1.3 Add scenarios as ordered command lists that stop at the first failure. Verify: tests named after the scenarios 'Scenario applies its commands in order' and 'Failure stops the scenario', seen failing first.

## 2. Surface

- [ ] 2.1 Draw the console (backtick, history in local storage, completion, results and errors) and take the keyboard from the controls while it is focused. Verify: component tests for 'Valid line runs and reports' and 'Bad argument runs nothing' through the console; the owner presses the key in the dev server.
- [ ] 2.2 Draw the panel (F2): variable tabs generated from the registry, the scenarios as buttons, the stats and the pick. Verify: a fixture renders the panel with variables, scenarios and an empty pick; the owner's eyes judge the layout.
- [ ] 2.3 Mount both from the host behind the development flag and register nothing in a browser driven by automation. Verify: tests named after the scenarios 'Production build offers neither' and 'Browser driven by automation registers nothing'; `pnpm -C apps/web build` output holds no `createDevRegistry`.

## 3. Handles

- [ ] 3.1 Register the world's commands: `teleport` (landmark, region or coordinates, through the pose the map overlay's jump uses), `time`, `timescale`, `weather`, `god`, `heal` and `noclip`. Verify: a test per command that runs it against a stubbed handle and one that calls it unmounted.
- [ ] 3.2 Register the save's commands: `give` (items by the names the game shows, Mora, primogems), `level`, `ar` and `unlock` (waypoints, map regions). Verify: tests that each writes the same save field the game's own act writes, and 'Partial name completes' over the item names.
- [ ] 3.3 Complete names from the loaded data: items, landmarks, regions, enemy kinds, weathers. Verify: tests named after 'Partial name completes' and 'No match offers nothing' per name source.

## 4. Look and stats

- [ ] 4.1 Register the look's every uniform as variables (same groups and ranges as the Inspector's Look group), then delete `attachInspector`, its call in `createGenshinRenderer`, the group in `useGenshinTuning` and the optimizer exclusion for the Inspector. Verify: `git grep attachInspector` and `git grep jsm/inspector` find nothing, and a test named after 'Look values are in the panel'.
- [ ] 4.2 Show the stats overlay and register the pass toggles (shadows, god rays, ambient occlusion, bloom, anti-aliasing) as variables. Verify: tests named after 'Overlay shows the counters' and 'Toggle hides it' over a stubbed renderer info.
- [ ] 4.3 Name the entity under the pointer on Alt-click, with enemies and interactables registering their labels. Verify: tests named after 'Entity under the pointer is named' and 'Nothing pickable under the pointer'.

## 5. Scenarios and convention

- [ ] 5.1 Write the first scenarios for the features that already exist (a boss fight, every chest tier, night at Windrise, a full bag), one file each. Verify: each scenario runs in the dev server and its commands all report success; the owner checks them in game.
- [ ] 5.2 Add the rule that a feature change registers its scenario, or states why it has none, to the `building-proposals` skill and to the openspec design rules. Verify: `git grep -n scenario .agents/skills/building-proposals` finds the rule and `openspec validate --strict` passes for this change.
