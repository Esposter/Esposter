## 1. Screen coverage

- [ ] 1.1 Write `packages/genshin-world/parity/screens.test.ts` first, beside `screens.ts`, asserting that every `Screen/Index.vue` under `packages/genshin-world/src/components` has a fixture or a pending entry, and watch it fail on the ten screens without a fixture. Verify: the test named after the scenario "Every screen folder is referenced or named pending", seen failing.
- [ ] 1.2 Add the pending list to `packages/genshin-world/parity/screens.ts`, naming each uncovered screen with the reason it has no reference yet. Verify: the coverage test passes, and the list is exactly the folders that have neither a fixture nor an entry.
- [ ] 1.3 Record a reference for each pending screen, then move it from the pending list to a fixture in the same change. Verify: `ParityReferenceMap.test.ts` passes for the screen, and the coverage test drops it from the pending list.

## 2. One image per screen

- [ ] 2.1 Write `packages/configuration/src/services/getVitestBrowserConfiguration.test.ts` first, beside the resolver, asserting that a screen's approved image resolves to `Index.png` with no platform segment, and watch it fail on the current resolver. Verify: the test named after the scenario "Approved image carries no platform", seen failing.
- [ ] 2.2 Drop the platform from `getVitestBrowserConfiguration.ts`, and make `approveReference.ts` write `Index.png` and `Index-<variant>.png`. Verify: the resolver test passes, and `approveReference` writes a file with no platform segment in its test.
- [ ] 2.3 Rename the 36 platform-suffixed images, keeping the win32 file where a screen has both. Verify: `git ls-files | grep -E "\.(win32|darwin)\.png$"` prints nothing.
- [ ] 2.4 Update the comments in `components.visual.ts` and `screens.visual.ts` that name `Index.<platform>.png`. Verify: `git grep -F "<platform>"` prints nothing outside this change.

## 3. The procedure

- [ ] 3.1 Put the order into the genshin-parity skill's rules and `references/approval.md`: reference, fixture, component, compare, approve, suite. Verify: the skill's rules name the order, and the parity README's flowchart draws the reference before the screen.

Archiving this change rewrites `openspec/specs/genshin/parity/visual-suite/design.md`, which names the platform image, as built.
