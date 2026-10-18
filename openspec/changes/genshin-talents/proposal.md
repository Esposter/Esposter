# Talents

## Why

Levelling is built: each combat talent rises from one to ten by its phase, paid in Mora and materials, and the constellations' additions to a talent's level are built too. Nothing yet presses an upgrade on the character screen, and nothing reads the additions, so the levelling cannot be used. The Talents tab and the kit's read of the additions are what remain.

## What Changes

The player raises a combat talent from the Talents tab, and a talent that cannot rise yet says why.

- The Talents tab lists each combat talent with its level, the phase its next level needs and its cost, with an Upgrade button for each.
- A talent that cannot rise shows why, whether it is at its last level, its phase is too early, the Mora is short or the materials are missing, and its Upgrade is disabled.
- Pressing Upgrade raises the talent by one and takes its Mora and materials, and the raised level is saved with the world.
- A talent plays at its own level plus the levels its constellations add, so a level past ten comes from a constellation alone.

## Capabilities

- **genshin/talents** (modified)

## Waiting on

- `openspec/changes/genshin-character-kits/`: the kit plays a talent at the level it reads, so the constellation additions wait on it.
- Game data: `game-exports` (per the change's needs).

## Impact

The character screen's Talents tab gains its upgrade press, and the screen takes the bag and the wallet as the wish screen does. The refusal of an upgrade is one answer that both the tab and the upgrade read. The character's talent levels are saved with the world.
