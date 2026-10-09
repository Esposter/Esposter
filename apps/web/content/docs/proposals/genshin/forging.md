---
title: Forging
description: Proposal — the blacksmith's forge screen and place. The recipes, queues by rank, real-time orders, the daily cap, the four-star weapons from billets, the drop-table Mystic Enhancement Ore, the forging talents and the Serenitea Pot's refusal of Magical Crystal Chunks are built.
model: claude-haiku-5-5
---

# Forging

The blacksmith's recipes, queues, orders, daily cap, drop-table Mystic, forging talents and the Serenitea Pot's refusal are built, as the [forging](/docs/genshin/forging) page describes. What is left is what a player sees: the forge screen and the blacksmith's place.

## Decisions

- **The forge screen is measured like the other screens.** Its layout and its queues' look are read off a recording of the game's blacksmith, through the [recreation passes](/docs/proposals/genshin/recreation-passes), before it is built. Its words come from the refusal keys the [forging](/docs/genshin/forging) page names, and it changes no number the rules set.
- **The blacksmith's place is an NPC of the Mondstadt scene.** The official map has no blacksmith label, so the place is read from the region's own placements, not from the spawned places. Every blacksmith is one forge, so the place is a screen's concern only.

## Scope and order

**Built:** the [forging page](/docs/genshin/forging) records what is built.

**Still to build, in order:**

1. **The forge screen and the blacksmith's place.** After the recording owed on the roadmap, and with the region's placements.
2. **The screen's wiring to the built rules.** The Adventure EXP a Mystic unit yields goes to the Adventure Rank, and the Mystic ore's and Magical Crystal Chunk's item definitions join the items slice, both wired by the screen that forges them.

## Data and measures

- **Read from the game's tables:** every number the rules need is read, and none waits on a source.

## Key files

| File                                                     | Role after the change    |
| :------------------------------------------------------- | :----------------------- |
| `packages/genshin-world/src/models/screen/ScreenKind.ts` | Gains the forge's screen |

## Sources

- [Forging](https://genshin-impact.fandom.com/wiki/Forging), Genshin Impact Wiki: the blacksmith's screen. The page was not reachable from this build, so the screen's layout waits on the recording instead.
