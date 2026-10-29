## 0. Screenshots only

- [ ] 0.1 Write the reference test first in `scripts/src/services/genshinParity/shared/ParityReferenceMap.test.ts`, asserting that no entry names a recording, and watch it fail on the 55 entries built from one. Verify: the test named after the scenario "Reference reads a recording", seen failing.
- [ ] 0.2 Sample a labelled screenshot from each recording-built reference, outside the repository, one per visually different state, and add it to the folder task 0.5 names as the reference folder. Each entry is re-referenced from its screenshot, or named pending with its reason. Verify: no entry reads a recording.
- [ ] 0.5 Decide where re-referenced screenshots live. `scripts/src/services/genshinParity/reference/compareScreen.ts` reads `REFERENCES_DIRECTORY`, which `scripts/src/services/genshinParity/shared/constants.ts` places outside the repository and documents as never committed, while the proposal says the repository holds the screenshots it compares. Either move `REFERENCES_DIRECTORY` into the repository, or keep it outside and drop that proposal sentence. Verify: the decision is written into design.md with its reason, and the references 0.2 adds sit in the folder it names.
- [ ] 0.3 Remove the recording fields (`capture`, `seconds`, `plateCapture`) from the reference model, once no entry uses them. Verify: typecheck passes, and the test from 0.1 passes.
- [ ] 0.4 Remove the in-repository recording path from the parity tooling, so that no repository code reads a recording. Sampling stays outside the repository, as a step a person runs. Verify: the parity tests pass without it, and no file under `scripts/src/services/genshinParity` reads a recording.

## 1. Screen coverage

- [ ] 1.1 Write `packages/genshin-world/parity/screens.test.ts` first, beside `screens.ts`, asserting that every `Screen/Index.vue` under `packages/genshin-world/src/components` has a fixture or a pending entry, and watch it fail on the ten screens without a fixture. Verify: the test named after the scenario "Every screen folder is referenced or named pending", seen failing.
- [ ] 1.2 Add the pending list to `packages/genshin-world/parity/screens.ts`, naming each fixture-less screen with the reason it has no reference yet. Verify: the coverage test passes, and the list is exactly the folders that have neither a fixture nor an entry.

## 2. Subscreen coverage

- [ ] 2.1 Write the subscreen test first in `scripts/src/services/genshinParity/shared/ParityReferenceMap.test.ts`, asserting that every fixture variant has an entry naming it, and watch it fail on the login's dusk variant, which has none. Verify: the test named after the scenario "Variant with no entry", seen failing.
- [ ] 2.2 Use the `variant` field that `scripts/src/models/genshinParity/shared/ParityReferenceBase.ts` already declares (the entry model in `ParityReference.ts` composes it, and `title-splash-mainland` is its one live use), set it on every entry for a variant, and make the test match on it. Verify: typecheck passes, and the test named after "Variant borrowing its base's reference" fails on a variant whose only entry is its base's.
- [ ] 2.3 Record a reference, or a pending entry with its reason, for each variant that lacks one, starting with the login's dusk. Verify: the subscreen test passes, and every fixture variant names an entry of its own.
- [ ] 2.4 Convert each subscreen that now has a reference from pending to recorded in the same change. Verify: `ParityReferenceMap.test.ts` passes for the screen, and the pending entries left are exactly those whose reason names a source the owner has to supply.

## 3. One image per subscreen

- [ ] 3.1 Write `packages/configuration/src/services/getVitestBrowserConfiguration.test.ts` first, beside the resolver, asserting that a subscreen's approved image resolves to `Index.png` with no platform segment, and watch it fail on the current resolver. Verify: the test named after the scenario "Approved image carries no platform", seen failing.
- [ ] 3.2 Drop the platform from `getVitestBrowserConfiguration.ts`, and make `approveReference.ts` write `Index.png` and `Index-<variant>.png`. Verify: the resolver test passes, and `approveReference` writes a file with no platform segment in its test.
- [ ] 3.3 Rename the 36 platform-suffixed images, keeping the win32 file where a screen has both. Verify: `git ls-files | grep -E "\.(win32|darwin)\.png$"` prints nothing.
- [ ] 3.4 Update the comments in `components.visual.ts` and `screens.visual.ts` that name `Index.<platform>.png`. Verify: `git grep -F "<platform>"` prints nothing outside this change.

## 4. The procedure

- [ ] 4.1 Put the order into the genshin-parity skill's rules and `references/approval.md`: reference, fixture, component, compare, approve, suite. Verify: the skill's rules name the order, and the parity README's flowchart draws the reference before the screen.

## Gate

The change is archived only when the pending list is empty and every pending entry is gone. Until then it stays open, because the wiki's pages for several screens return HTTP 402 to this session, so those references need the owner's screenshots or a browser capture.

Archiving this change rewrites `openspec/specs/genshin/parity/visual-suite/design.md`, which names the platform image, as built, and `openspec/specs/genshin/parity/references/design.md` and `spec.md`, which name a recording frame as a reference, as built.
