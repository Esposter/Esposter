# Weapon Enhancement

## Why

Levelling, ascension and refinement are built, and a weapon's refinement rank is kept and paid for. Nothing yet reads a weapon's refinement as a passive: each rank changes what the weapon does, and the passive's names and numbers sit in the game's affix table, which is not read. A passive acts through the character kits, so this change waits on them.

## What Changes

Each weapon shows its passive at every refinement rank, and the passive takes effect at the rank the weapon holds.

- A weapon with a passive shows the passive's name and its description at each refinement rank, in refinement order, with the game's own numbers.
- A weapon with no passive shows none.
- A weapon's passive acts at its wielder's refinement rank, changing the wielder's stats and combat as the game's passive does.

## Capabilities

- **genshin/weapon-enhancement** (modified)

## Waiting on

- `openspec/changes/genshin-character-kits/`: a passive acts through the kits' shared effects.
- Game data: `game-exports` (per the change's needs).

## Impact

The weapons record gains each weapon's passive: its name, each rank's description and each rank's numbers, all as text ids and numbers rather than words. The passives' words come through the game text once keyed. The weapon data the game reads is republished from the stats table.

Size kept as the source page's own: splitting it is a later decision.
