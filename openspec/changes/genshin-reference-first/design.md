# Design: reference first, one image per screen

## Decisions

- **A screen is a component folder named exactly `Screen`.** The alternative was a hand-kept list of screens, which the genshin-parity skill already rejects, since a list silently misses the next screen added. A folder name is what a reader can see, and the coverage test reads the same folders.
- **A screen with no reference is named pending, never given a fixture.** A fixture without a reference reaches the visual suite and locks in whatever it draws, which is the drift this change exists to stop. The alternative, a placeholder reference, makes the coverage test pass while the gap stays hidden. Pending screens sit in a list in the reference map module, so the backlog is one place to read.
- **One image name per screen and variant, with no platform segment.** The alternative was keeping one file per platform. That is how the 36 images split: each machine approved its own, so a screen's truth depended on which machine last ran `approve`. A single name needs one render to be the truth, and the compare bar (a mean difference under 1%) absorbs the small anti-aliasing differences between machines.
- **A pinned Linux render container was considered and deferred.** It removes cross-machine differences entirely, but needs Docker running and a second render path to maintain. It is adopted only if the compare bar fails on identical screens across two machines.
- **When a screen has both a win32 and a darwin image, the win32 image is kept.** It is the set most approved screens already have. The darwin file stays in git history.

## Enforcement by rung

| Requirement                                                      | Rung          | What holds it                                                           |
| :--------------------------------------------------------------- | :------------ | :---------------------------------------------------------------------- |
| Every `Screen` folder is referenced or pending                   | 4. Test       | `ScreenCoverage.test.ts` in `scripts/src/services/genshinParity/shared` |
| A fixture has a reference entry                                  | 4. Test       | `ParityReferenceMap.test.ts`, already present                           |
| Approved images have no platform segment                         | 4. Test       | the resolver test in `packages/configuration`                           |
| The order reference, fixture, component, compare, approve, suite | 5. Remembered | the genshin-parity skill's rules, read by review                        |

The order itself is not testable from the repository, since git does not record the sequence of edits. The coverage and reference tests make the order's outcome checkable, and the rule is kept in the skill.

## Sources

- The UI drift and the platform split are the owner's observation from the parity loop, with the 36 approved images and the per-platform resolver in `packages/configuration/src/services/getVitestBrowserConfiguration.ts`.
- The 25 `Screen` folders and the 10 without a fixture were counted from the tree on 2026-10-29.

## Key files

| File                                                                   | Role                                                            |
| :--------------------------------------------------------------------- | :-------------------------------------------------------------- |
| `scripts/src/services/genshinParity/shared/ParityReferenceMap.ts`      | The reference per screen, and the pending list this change adds |
| `scripts/src/services/genshinParity/shared/ParityReferenceMap.test.ts` | Fixture to reference, both ways                                 |
| `scripts/src/services/genshinParity/reference/approveReference.ts`     | Writes the approved image, which loses its platform segment     |
| `packages/configuration/src/services/getVitestBrowserConfiguration.ts` | The screenshot path resolver                                    |
| `packages/genshin-interface/src/components/components.visual.ts`       | The interface's visual suite                                    |
| `packages/genshin-world/parity/screens.visual.ts`                      | The screen suite                                                |
