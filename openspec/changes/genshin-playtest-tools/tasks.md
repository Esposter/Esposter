## 1. Registry

- [x] 1.1 Build the registry: register and remove handles, parse a line into a command and its zod-checked arguments, run it, and return `{ ok, value }` or `{ ok: false, error, usage }`. Verify: `createDevRegistry.test.ts` with tests named after the scenarios 'Valid line runs and reports', 'Bad argument runs nothing', 'Unknown name is refused', 'Command whose state is not mounted says so' and 'Failure returns its usage', seen failing first.
- [ ] 1.2 Add variables (boolean, number, colour, choice; group, range) set through the registry, starting from the game's own value. Verify: tests named after the scenarios 'Control and console agree', 'Out of range is refused' and 'Reload restores the game's value', seen failing first.
- [x] 1.3 Add scenarios as ordered command lines that stop at the first failure. Verify: tests named after the scenarios 'Scenario applies its commands in order' and 'Failure stops the scenario', seen failing first.
- [x] 1.4 Expose the registry as `window.__dev.run(line)` in a browser driven by automation. Verify: a test named after the scenario 'Automation receives data', seen failing first.

## 2. Surface

- [x] 2.1 Draw the console (backtick, history in local storage, results and errors) and take the keyboard from the controls while it is focused. Verify: component tests for 'Valid line runs and reports' and 'Bad argument runs nothing' through the console.
- [x] 2.2 Draw the panel (F2): variable tabs generated from the registry, the scenarios as buttons and the stats. Verify: a fixture renders the panel with variables, scenarios and the stats.
- [ ] 2.3 Mount both from the host behind the development flag and mount neither in a browser driven by automation. Verify: tests named after the scenarios 'Development build offers the console and the panel', 'Production build offers neither' and 'Browser driven by automation registers commands and mounts no surface'; `pnpm -C apps/web build` output holds no `createDevRegistry`.

## 3. Handles

- [x] 3.1 Register the world's commands: `state`, `teleport` (a landmark, a region or coordinates, through the pose the map overlay's jump uses), `time`, `timescale` and `heal`; `weather`, `god` and `noclip` wait for the state they need (design, Notes). Verify: a test per command that runs it against a stubbed handle and one that calls it unmounted.
- [x] 3.2 Register the save's commands: `give` (items by the names the game shows, Mora, primogems), `level`, `ar` and `unlock` (waypoints, map regions). Verify: tests that each writes the same save field the game's own act writes.

## 4. Look and stats

- [x] 4.1 Register the look's every uniform as variables (same groups and ranges as the Inspector's Look group), then delete `attachInspector`, its call in `createGenshinRenderer` and the group in `useGenshinTuning`. The Vite optimizer exclusion stays, since the fluid simulator page, which is not a Genshin scene, keeps its own Inspector. Verify: a grep for `attachInspector` over `packages/genshin-world` and `apps/web/app/components/Genshin` finds nothing, which is the check for 'Development scene has no inspector' made by grep rather than by a test; the look's values are in the panel (the test named 'Look values are in the panel' in `createLookVariables.test.ts`), and `git grep jsm/inspector -- apps/web` finds only the fluid simulator page and its exclusion.
- [x] 4.2 Show the stats overlay and register `stat` and the pass switches the world's chain draws (temporal anti-aliasing, shadows) as variables; bloom, god rays and occlusion have no switch, as the chain draws none of them (design, Stats). Verify: tests named after 'Overlay shows the counters' and 'Toggle hides it' over a stubbed renderer info.

## 5. Scenarios and convention

- [x] 5.1 Write the first scenarios for the features that already exist (a boss fight, every chest tier, night at Windrise, a full bag), one file each. Verify: `services/dev/scenarios/constants.test.ts` runs each scenario's lines through `createDevRegistry` against stubbed handles and every line reports success.
- [x] 5.2 Add the rule that a feature change registers its scenario, or states why it has none, to the `building-proposals` skill and to the openspec design rules. Verify: `git grep -n scenario .agents/skills/building-proposals` finds the rule and `openspec validate --strict` passes for this change.

## 6. Held keys from the console

- [ ] 6.1 Decide how a `hold` typed into the console reaches the controls while the console's field keeps focus. `createHoldCommand` dispatches its keys on the window, and `createInput` ignores every key while a field is focused (the design's "Keys do not reach the game while the console is focused"), so `hold forward 2` answers ok and the Traveler does not move. The options are: blur the console's field on submit, which takes focus from the console after each line; have `createInput` ignore only keys whose event target is a field, which changes the `InputTarget` seam; or leave `hold` out of the console's handles. Verify: a test that a `hold` run from the console moves the Traveler, seen failing first, in the file the chosen option changes.
