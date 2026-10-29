## 0. Screenshots only

- [x] 0.1 Hold the reference map to screenshots: the `ParityReference` type has no recording field, so typecheck rejects an entry that names one, and no test is added for it. The 53 entries built from a recording name the `source` they were sampled from instead. Verify: typecheck passes.
- [x] 0.2 Hold a labelled screenshot of each recording-built reference in the parity folder, one per visually different state. Each entry names the recording and second it was sampled from in `source`, or is named pending with its reason. Verify: no entry reads a recording.
- [x] 0.3 Remove the recording fields (`capture`, `seconds`, `plateCapture`) from the reference model, once no entry uses them. Verify: typecheck passes.
- [x] 0.4 Remove the in-repository recording path from the parity tooling, so that no repository code reads a recording: the `frame`, `frames`, `film`, `glide` and `track` commands go with the readers behind them. Sampling stays outside the repository, as a step a person runs. Verify: the parity tests pass without it, and no file under `scripts/src/services/genshinParity` reads a recording.
- [ ] 0.5 Decide whether a reference's `source` may name the recording and second it was sampled from. The design keeps `source` as provenance, so a person can sample it again, and 53 entries carry one, while the references delta says the repository SHALL NOT name a recording or a second of one. Either the delta's wording exempts `source` as provenance and says so in one place, or the design drops the recording and second from `source` and the 53 entries name only the screenshot. Verify: the references delta and `design.md` state the same rule, and `ParityReference.ts` and the reference map follow it.
- [ ] 0.6 Decide whether a reference may be a wiki file. The references delta allows one, while the visual-suite delta says a reference SHALL be a screenshot the parity folder holds. Either the 17 wiki-titled entries get held screenshots, which is new work this list does not cover, or the rule changes and the references delta keeps it. Then keep one owner for the rule: the references delta or the visual-suite delta, not both. Verify: the two deltas state the same rule in one place, and each wiki-titled entry either has a held screenshot or is named pending.

## 1. Screen coverage

- [x] 1.1 Write `packages/genshin-world/parity/screens.test.ts` first, beside `screens.ts`, asserting that every `Screen/Index.vue` under `packages/genshin-world/src/components` has a fixture or a pending entry, and watch it fail on the ten screens without a fixture. Verify: the test named after the scenario "Every screen folder is referenced or named pending", seen failing.
- [x] 1.2 Add the pending list to `packages/genshin-world/parity/pendingScreens.ts`, a module with no Vue import so the test can read it, naming each fixture-less screen with the reason it has no reference yet. Verify: the coverage test passes, and the list is exactly the folders that have neither a fixture nor an entry.

## 2. Subscreen coverage

- [x] 2.1 Write the subscreen test first in `scripts/src/services/genshinParity/shared/ParityReferenceMap.test.ts`, asserting that every fixture variant has an entry naming it, and watch it fail on the login's dusk variant, which has none. Verify: the test "names a reference for every subscreen" in the same file, seen failing.
- [x] 2.2 Use the `variant` field that `scripts/src/models/genshinParity/shared/ParityReferenceBase.ts` already declares (the entry model in `ParityReference.ts` composes it, and `title-splash-mainland` is its one live use), set it on every entry for a variant, and make the test match on it. Verify: typecheck passes, and the test "names a reference for every subscreen" fails on a variant whose only entry is its base's.
- [x] 2.3 Record a reference, or a pending entry with its reason, for each variant that lacks one, starting with the login's dusk. Verify: the subscreen test passes, and every fixture variant names an entry of its own.
- [x] 2.4 Convert each subscreen that now has a reference from pending to recorded in the same change. Verify: `ParityReferenceMap.test.ts` passes for the screen, and the pending entries left are exactly those whose reason names a source the owner has to supply.

## 3. One image per subscreen

- [x] 3.1 Write `packages/configuration/src/services/getVitestBrowserConfiguration.test.ts` first, beside the resolver, asserting that a subscreen's approved image resolves to `Index.png` with no platform segment, and watch it fail on the current resolver. Verify: the test titled "names a screenshot the same on Windows as on macOS", for the scenarios "Image name on a Windows machine" and "Image name on a macOS machine", seen failing.
- [x] 3.2 Drop the platform from `getVitestBrowserConfiguration.ts`, and make `approveReference.ts` write `Index.png` and `Index-<variant>.png`. Verify: the resolver test passes, and `approveReference` writes a file with no platform segment in its test.
- [x] 3.3 Rename the 36 platform-suffixed images, keeping the win32 file where a screen has both. Verify: `git ls-files | grep -E "\.(win32|darwin)\.png$"` prints nothing.
- [x] 3.4 Update the comments in `components.visual.ts` and `screens.visual.ts` that name `Index.<platform>.png`. Verify: `git grep -F "<platform>"` prints nothing outside this change.

## 4. The procedure

- [x] 4.1 Put the order into the genshin-parity skill's rules and `references/approval.md`: reference, fixture, component, compare, approve, suite. Verify: the skill's rules name the order, and the parity README's flowchart draws the reference before the screen.

## Gate

The change is archived only when the pending list is empty and every pending entry is gone. Until then it stays open, because the wiki's pages for several screens return HTTP 402 to this session, so those references need the owner's screenshots or a browser capture.

Archiving this change rewrites `openspec/specs/genshin/parity/visual-suite/design.md`, which names the platform image, as built, and `openspec/specs/genshin/parity/references/design.md` and `spec.md`, which name a recording frame as a reference, as built.
