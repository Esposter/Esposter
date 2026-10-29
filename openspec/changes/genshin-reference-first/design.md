# Design: reference first, one image per screen

## Decisions

- **A screen is a component folder named exactly `Screen`.** The alternative was a hand-kept list of screens, which the genshin-parity skill already rejects, since a list silently misses the next screen added. A folder name is what a reader can see, and the coverage test reads the same folders.
- **A screen with no reference is named pending, never given a fixture.** A fixture without a reference reaches the visual suite and locks in whatever it draws, which is the drift this change exists to stop. The alternative, a placeholder reference, makes the coverage test pass while the gap stays hidden. The pending list sits beside `screens.ts`, the module that collects the fixtures, so the backlog and the check that reads it are one place.
- **The coverage test is a `.test.ts` beside `screens.ts`.** The testing skill's rule is that a test lives beside what it tests, never beside the folders a check scans. What it tests is the screen list, so it sits beside that list, the way the login screen's fixture sits beside its component. It is not a `.visual.ts`: CI runs no browser suite, so a check there never fails a build. It is not a `.bench.ts` or `.typebench.ts`, since nothing here is timed or typed.
- **No screenshot framework.** The two visual suites share one piece of logic, the expansion of a fixture into its variant cases. The cases differ in what they carry: the interface suite passes a `slot`, the screen suite passes `stillProps` and `readyEvent`. One shared helper would need a callback for that difference, which costs more than the second copy. Revisit when a third suite repeats the loop.
- **One image name per screen and variant, with no platform segment.** The alternative was keeping one file per platform. That is how the 36 images split: each machine approved its own, so a screen's truth depended on which machine last ran `approve`. A single name needs one render to be the truth, and the compare bar (a mean difference under 1%) absorbs the small anti-aliasing differences between machines.
- **A pinned Linux render container was considered and deferred.** It removes cross-machine differences entirely, but needs Docker running and a second render path to maintain. It is adopted only if the compare bar fails on identical screens across two machines.
- **When a screen has both a win32 and a darwin image, the win32 image is kept.** It is the set most approved screens already have. The darwin file stays in git history.

## Enforcement by rung

| Requirement                                                      | Rung          | What holds it                                                                                         |
| :--------------------------------------------------------------- | :------------ | :---------------------------------------------------------------------------------------------------- |
| Every `Screen` folder is referenced or pending                   | 4. Test       | `packages/genshin-world/parity/screens.test.ts`, new                                                  |
| A fixture has a reference entry                                  | 4. Test       | `scripts/src/services/genshinParity/shared/ParityReferenceMap.test.ts`, already present               |
| Approved images have no platform segment                         | 4. Test       | `packages/configuration/src/services/getVitestBrowserConfiguration.test.ts`, new, beside the resolver |
| The order reference, fixture, component, compare, approve, suite | 5. Remembered | the genshin-parity skill's rules, read by review                                                      |

The order itself is not testable from the repository, since git does not record the sequence of edits. The coverage and reference tests make the order's outcome checkable, and the rule is kept in the skill.

## Sources

- The UI drift and the platform split are the owner's observation from the parity loop, with the 36 approved images and the per-platform resolver in `packages/configuration/src/services/getVitestBrowserConfiguration.ts`.
- The 25 `Screen` folders and the 10 without a fixture were counted from the tree on 2026-10-29.
- The same-shape check for interface components already exists in `packages/genshin-interface/src/components/components.visual.ts`, but it runs only in the browser suite, which CI does not run. It is not a gate, and moving it to a `.test.ts` is a follow-up, not part of this change.

## Key files

| File                                                                   | Role                                                               |
| :--------------------------------------------------------------------- | :----------------------------------------------------------------- |
| `packages/genshin-world/parity/screens.ts`                             | Collects the fixtures, and holds the pending list this change adds |
| `packages/genshin-world/parity/screens.test.ts`                        | The coverage test, beside `screens.ts`                             |
| `packages/genshin-world/parity/screens.visual.ts`                      | The screen suite, whose variant loop is the one shared shape       |
| `scripts/src/services/genshinParity/shared/ParityReferenceMap.test.ts` | Fixture to reference, both ways                                    |
| `scripts/src/services/genshinParity/reference/approveReference.ts`     | Writes the approved image, which loses its platform segment        |
| `packages/configuration/src/services/getVitestBrowserConfiguration.ts` | The screenshot path resolver                                       |
| `packages/genshin-interface/src/components/components.visual.ts`       | The interface's visual suite, with its own variant loop            |
