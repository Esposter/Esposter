# Reference first, one image per screen

## Why

A screen built without its reference drifts until it is unusable: the parity loop only has a target when the reference comes first, and the screens built before it drifted that way. The approved images also carry a platform segment, so one screen is several files, one per machine that approved it. And 10 of the 25 `Screen` folders have no fixture, so nothing renders them and nothing compares them, Mail among them.

The check that exists matches references by screen name, so a screen's subscreens can pass on the base screen's entry alone. The login screen's dusk variant has no entry of its own and passes that check.

## What Changes

- **BREAKING:** approved images are `Index.png` and `Index-<variant>.png`, with no platform segment. The 36 platform-suffixed images are renamed to that name, keeping the win32 file where a screen has both.
- Every `Screen` folder is either referenced (a fixture and a reference entry) or named pending in the list beside `screens.ts`. None is silently absent.
- Every subscreen, the base state and each fixture variant, names a reference of its own, or a pending entry stating why it has none. No subscreen borrows another's reference.
- A subscreen's approved image is written only once its own compare clears the bar.
- A reference is a screenshot, never a frame of a recording. The 57 entries built from recordings are re-referenced from screenshots or named pending, and the recording fields leave the reference model. Transitions are built once in a shared mechanism and checked by the state tests, not compared frame by frame.
- The order a screen is built in is fixed: reference, then fixture, then component, then compare, then approve, then the visual suite.

## Capabilities

- **genshin/parity/screens** (modified): every `Screen` folder is covered or named pending, and every subscreen names a reference of its own.
- **genshin/parity/visual-suite** (modified): approved images carry no platform segment, and a subscreen's image is approved only once its own compare clears.

## Impact

`packages/genshin-world/parity` (the screen list, its pending entries and the coverage test beside it), `scripts/src/services/genshinParity` (the subscreen test beside the reference map, and `approve`), `scripts/src/models/genshinParity` (the base reference model, which already declares the `variant` field a subscreen's entry sets, and the entry model that composes it), `packages/configuration` (the screenshot path and its test beside it), the genshin-world and genshin-interface fixtures, and the approved images. Git keeps the platform-suffixed files for anyone who wants them.
