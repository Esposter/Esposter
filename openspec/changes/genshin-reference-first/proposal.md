# Reference first, one image per screen

## Why

A screen built without its reference drifts until it is unusable: the parity loop only has a target when the reference comes first, and the screens built before it drifted that way. The approved images also carry a platform segment, so one screen is several files, one per machine that approved it. And 10 of the 25 `Screen` folders have no fixture, so nothing renders them and nothing compares them, Mail among them.

## What Changes

- **BREAKING:** approved images are `Index.png` and `Index-<variant>.png`, with no platform segment. The 36 platform-suffixed images are renamed to that name, keeping the win32 file where a screen has both.
- Every `Screen` folder is either referenced (a fixture and a `ParityReferenceMap` entry) or named pending in the list beside `screens.ts`. None is silently absent.
- The order a screen is built in is fixed: reference, then fixture, then component, then compare, then approve, then the visual suite.

## Capabilities

- **genshin/parity/screens** (modified): every `Screen` folder is covered or named pending.
- **genshin/parity/visual-suite** (modified): approved images carry no platform segment.

## Impact

`packages/genshin-world/parity` (the screen list, its pending entries and the coverage test beside it), `scripts/src/services/genshinParity` (`approve`, and the existing reference-map test), `packages/configuration` (the screenshot path and its test beside it), the genshin-world and genshin-interface fixtures, and the approved images. Git keeps the platform-suffixed files for anyone who wants them.
