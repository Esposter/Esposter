# The features other features read, as stores

## Why

[The session store change](../../genshin-session-store/proposal.md) took the context every feature shares out of the world session's root and made the mailbox its first feature store: the shared keys in the root's composable calls went from 128 to 0 and the package came out 121 lines smaller. The root still passes 388 option keys across 48 calls, because three quarters of the keys were never shared context: they are one feature's results handed to another, and only a feature that owns its state in a store lets the next one read it without a list.

## What changes

The features whose results the most other calls read each become a store the others read, in the order the investigation's table gives: the adventure rank (12 calls read its results), the combat (12), the quests (10), the map (8), the pickups (7) and the puzzles (5). Each slice removes the options keys that handed that feature's results across, and the page that only the feature's state feeds mounts with it.

One intent: a feature whose results another reads is born in a store, as the app's features are.

## Gate

Every slice is judged by the first change's definition of done: its count over the package is negative, the option keys fall, the checks pass for what it touched, a second mount starts clean, the frame step and the mount do not slow, and the guides follow. A slice whose count is not negative is recorded as a refusal with its numbers and the change continues with the next one, since one feature's cost says nothing of another's.

## Out of scope

- The save and the clock (`useWorldSave`, `useWorldClock`): the session's own, not features. The screen was one of the stores here (it is read by twelve calls and owns two lines), and the save follows once the stores here show what its sync reads.
- The per-frame composables (`useWorldFrame`, `useWorldHudFrame`, `useWorldCamera`). They stay out of stores by the first change's guideline.
- The genshin-interface screens, which stay presentational.

## Open questions

- Whether the combat's results that the frame reads (the party, the enemies in reach) are low-frequency enough for a store, or whether only its settled state (the defeated, the respawns) is. Decided in the combat's task from the frame step's baseline.
