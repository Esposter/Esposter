# Design: reference first, one image per screen

## Decisions

- **A screen is a component folder named exactly `Screen`.** The alternative was a hand-kept list of screens, which the genshin-parity skill already rejects, since a list silently misses the next screen added. A folder name is what a reader can see, and the coverage test reads the same folders.
- **A subscreen is a screen folder's base state or one of its fixture's variants, and each names a reference of its own.** The map test matched references by screen name, so a variant borrowed its base's entry and passed. The login's dusk variant has no entry and still passes. A variant is now named by a `variant` field on its entry, not matched by its props, since a props match breaks the moment a variant's props change.
- **A pending entry covers a subscreen whose fixture exists; the pending list covers a screen with no fixture.** The reference model already has a pending state with a reason, so a variant that cannot be sourced yet uses it. A fixture-less screen has no entry for the test to read, so it stays in the list beside `screens.ts`, which the coverage test reads.
- **The coverage test is a `.test.ts` beside `screens.ts`.** The testing skill's rule is that a test lives beside what it tests, never beside the folders a check scans. What it tests is the screen list, so it sits beside that list, the way the login screen's fixture sits beside its component. It is not a `.visual.ts`: CI runs no browser suite, so a check there never fails a build. It is not a `.bench.ts` or `.typebench.ts`, since nothing here is timed or typed.
- **No screenshot framework.** The two visual suites share one piece of logic, the expansion of a fixture into its variant cases. The cases differ in what they carry: the interface suite passes a `slot`, the screen suite passes `stillProps` and `readyEvent`. One shared helper would need a callback for that difference, which costs more than the second copy. Revisit when a third suite repeats the loop.
- **One image name per screen and variant, with no platform segment.** The alternative was keeping one file per platform. That is how the 36 images split: each machine approved its own, so a screen's truth depended on which machine last ran `approve`. A single name needs one render to be the truth, and the compare bar (a mean difference under 1%) absorbs the small anti-aliasing differences between machines.
- **A pinned Linux render container was considered and deferred.** It removes cross-machine differences entirely, but needs Docker running and a second render path to maintain. It is adopted only if the compare bar fails on identical screens across two machines.
- **When a screen has both a win32 and a darwin image, the win32 image is kept.** It is the set most approved screens already have. The darwin file stays in git history.
- **The parity run compares only screenshots, which are never committed.** HoYoverse's images stay out of git (the references design): a screenshot lives in the parity folder as `<id>.png` until `references pack` stores it as an object and its manifest row names it. A recording is downloaded and sampled there into labelled screenshots, one per visually different state, kept lean. An entry names the recording and second its screenshot was sampled from in `source`, so a person can sample it again. The repository never reads a recording, so the recording fields (`capture`, `seconds`, `plateCapture` and the crop) and the in-repository frame path go. Sampling is what makes a recording usable here: a whole recording costs far more to store and compare than the stills it yields, and the sampler picks a clean frame and labels its variant, which a whole clip does not.
- **Motion is matched at sampled moments, never by recording.** A moment of a screen's motion is compared against a labelled screenshot a person sampled from the recording outside the repository, so no screen carries a recording of its own motion. The frame, frames, film, glide and track commands and the readers behind them measure motion off a recording frame by frame, which is the comparison this drops, so they are deleted with the fields.
- **A backdrop's world is a screenshot of its own, `<id>.plate.png`, named by `plateSource`.** The three quest entries are laid over the world as the game draws it, which their wiki still does not show. The plate was a frame cut from a recording at each run; it is now the screenshot beside the reference, and the reference itself when none is there.
- **A recording's softness is measured off its screenshot.** The compare softens our shot by the blur its reference carries, which it read off the recording's first frame; it now reads the screenshot, cached beside it under the screenshot's hash.
- **The change is archived only when nothing is pending.** A pending entry waits on a sampled screenshot, not on code: a screen whose recording the repository has not yet sampled, or one no recording shows. The change stays open until each has its screenshot or its reason is settled.

## Enforcement by rung

| Requirement                                                      | Rung                     | What holds it                                                                                           |
| :--------------------------------------------------------------- | :----------------------- | :------------------------------------------------------------------------------------------------------ |
| Every `Screen` folder is referenced or pending                   | 4. Test                  | `packages/genshin-world/parity/screens.test.ts`, new                                                    |
| Every subscreen names a reference of its own                     | 1. Construction, 4. Test | the `variant` field on the entry model, and `ParityReferenceMap.test.ts` with a new test                |
| A fixture has a reference entry                                  | 4. Test                  | `ParityReferenceMap.test.ts`, already present                                                           |
| Approved images have no platform segment                         | 4. Test                  | `packages/configuration/src/services/getVitestBrowserConfiguration.test.ts`, new, beside the resolver   |
| A subscreen is approved only once its compare clears             | 4. Test                  | the approval command's test, already the gate in `approveReference.ts`                                  |
| Every reference is a screenshot, never a recording               | 1. Construction          | the entry model loses `capture`, `seconds` and `plateCapture`, and typecheck rejects one that keeps one |
| The order reference, fixture, component, compare, approve, suite | 5. Remembered            | the genshin-parity skill's rules, read by review                                                        |

The order itself is not testable from the repository, since git does not record the sequence of edits. The coverage and reference tests make the order's outcome checkable, and the rule is kept in the skill.

## Sources

- The UI drift and the platform split are the owner's observation from the parity loop, with the 36 approved images and the per-platform resolver in `packages/configuration/src/services/getVitestBrowserConfiguration.ts`.
- The 25 `Screen` folders and the 10 without a fixture were counted from the tree.
- The subscreen gap was checked on the tree: the login screen fixture declares dawn, day and dusk variants, the map has entries for dawn, day and night on the title, and none for dusk. The map test matches on screen names alone.
- The recording dependence was counted on the reference map: 53 entries are built from a recording, 17 from a wiki still, and 33 are pending. The parity folder already held a screenshot of every recording-built entry but two, whose recordings are not on disk and which are now pending; the other 53 name where theirs was sampled from. The wiki's pages return HTTP 402 to this session, so the recordings are the source for the stills as well.
- The same-shape check for interface components already exists in `packages/genshin-interface/src/components/components.visual.ts`, but it runs only in the browser suite, which CI does not run. It is not a gate, and moving it to a `.test.ts` is a follow-up, not part of this change.

## Key files

| File                                                                   | Role                                                              |
| :--------------------------------------------------------------------- | :---------------------------------------------------------------- |
| `packages/genshin-world/parity/screens.ts`                             | Collects the fixtures the parity page shoots                      |
| `packages/genshin-world/parity/pendingScreens.ts`                      | The pending list, in a module with no Vue import for the test     |
| `packages/genshin-world/parity/screens.test.ts`                        | The coverage test, beside `screens.ts`                            |
| `packages/genshin-world/parity/screens.visual.ts`                      | The screen suite, whose variant loop is the one shared shape      |
| `scripts/src/models/genshinParity/shared/ParityReferenceBase.ts`       | Declares the optional `variant` field, which one entry sets today |
| `scripts/src/models/genshinParity/shared/ParityReference.ts`           | The entry model: a `source`, a wiki title or a pending reason     |
| `scripts/src/services/genshinParity/shared/ParityReferenceMap.ts`      | The reference entries, one per subscreen                          |
| `scripts/src/services/genshinParity/shared/ParityReferenceMap.test.ts` | Fixture to reference, and now variant to entry                    |
| `scripts/src/services/genshinParity/reference/approveReference.ts`     | Writes the approved image, which loses its platform segment       |
| `packages/configuration/src/services/getVitestBrowserConfiguration.ts` | The screenshot path resolver                                      |
| `packages/genshin-interface/src/components/components.visual.ts`       | The interface's visual suite, with its own variant loop           |
