---
title: Forging
description: Proposal — the blacksmith's forge screen and place. The recipes, queues by rank, real-time orders, the daily cap, the four-star weapons from billets, the drop-table Mystic Enhancement Ore, the forging talents and the Serenitea Pot's refusal of Magical Crystal Chunks are built.
model: claude-haiku-5-5
needs: [game-exports]
touches:
  [
    "packages/genshin-interface/src/components/ForgeScreen/**",
    "packages/genshin-world/src/components/Forge/**",
    "packages/genshin-world/src/services/forging/**",
  ]
---

# Forging

The blacksmith's recipes, queues, orders, daily cap, drop-table Mystic, forging talents and the Serenitea Pot's refusal are built, as the [forging](/docs/genshin/forging) page describes. What is left is what a player sees: the forge screen and the blacksmith's place.

## Decisions

- **The forge screen is measured like the other screens.** Its layout and its queues' look are read off a recording of the game's blacksmith, through the [recreation passes](/docs/proposals/genshin/recreation-passes), before it is built. Its words come from the refusal keys the [forging](/docs/genshin/forging) page names, and it changes no number the rules set.
- **The blacksmith's place is an NPC of the Mondstadt scene.** The official map has no blacksmith label, so the place is read from the region's own placements, not from the spawned places. Every blacksmith is one forge, so the place is a screen's concern only.

## Scope and order

**Built:** the [forging page](/docs/genshin/forging) records what is built, and the forge screen itself (`ScreenKind.Forge`, its Materials and Forge Queues tabs in `genshin-interface`) is built on the public clip, its frames under the reference folder `forge-screen`. Its layout is provisional until the owed `forge-order-queue.mkv` re-measures it, and its visual image is approved by the user, which is owed.

**Still to build, in order:**

1. **The blacksmith's place.** Waits on the scene group export the other machine is making (`Lua/Scene/3` groups carry each NPC's position); until then the screen is reached through its fixture, since the game's menus hold no forge.
2. **The screen's wiring to the built rules.** The Adventure EXP a Mystic unit yields goes to the Adventure Rank, wired by the screen that forges them. The Start and Obtain words wait on their text ids, which the game's own map does not yet key (the forge tab's words are keyed in `GameTextKey`).

## Data and measures

- **Read from the game's tables:** every number the rules need is read, and none waits on a source.

## Key files

| File                                                                     | Role after the change                                          |
| :----------------------------------------------------------------------- | :------------------------------------------------------------- |
| `packages/genshin-world/src/models/screen/ScreenKind.ts`                 | Gains the forge's screen                                       |
| `packages/genshin-interface/src/components/ForgeScreen/Index.vue`        | The forge screen, its two tabs                                 |
| `packages/genshin-interface/src/components/ForgeScreen/Index.fixture.ts` | The screen's fixture, the Materials tab and the queues variant |

## Sources

- [Forging](https://genshin-impact.fandom.com/wiki/Forging), Genshin Impact Wiki: the blacksmith's screen. The screen's layout waits on a measure of the recording: a public clip of the Wagner forge, [Have an item forged at Wagner](https://www.youtube.com/watch?v=AVnbm8fESr0), 81 seconds, is kept under the captures as `yt-AVnbm8fESr0` and is the layout's reference until the owed `forge-order-queue.mkv` lands.
