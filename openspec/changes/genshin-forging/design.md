# Forging

The [forging](../../specs/genshin/forging/design.md) page holds the recipes, queues, orders, daily cap and forging talents. What is left is what a player sees: the blacksmith's place and the forge screen's wiring to the forge state.

## Decisions

- **The forge screen's layout is measured like the other screens.** Its layout and its queues' look are re-measured off a recording of the game's blacksmith, through the [recreation passes](../genshin-recreation-passes/design.md). Its words come from the refusal keys the [forging](../../specs/genshin/forging/design.md) page names, and it changes no number the rules set.
- **The blacksmith's place is the scene's own mark.** The official map has no blacksmith label, and the dump's births hold no Wagner, so the forge stands at the `Blacksmith` building point of the [scene group record](../../specs/genshin/scene-groups/design.md), the scene's mark of the city's forge (`Blacksmith_liyue` and the like for the others). Every blacksmith is one forge, so the place is a screen's concern only.
- **The refusal is the ore's own line.** An order past the day's forge points shows, in place of Start, the refusal line of the enhancement ore its recipe yields: `104011` the Normal, `104012` the Fine and `104013` the Mystic, mapped in `ForgeRefusalGameTextKeyMap` to the three refusal keys `genshin-text` holds. The Mystic's recipe rows name their own refusal text, which repeats the same English.
- **A queue is the order in its place.** Queue `n` holds the `n`th order of the forge state, since `startForge` appends each order. An obtained order is taken out of the list, so the orders behind it move forward a queue; the state keeps no queue number, so a queue that keeps its place through an obtain is open.
- **A finished queue keeps the cooking screen's Obtain.** `UI_FORGE_PAGE_ITEM_GET` reads "Obtained", the status once the item is taken, not the button that takes it, so the button keeps `UI_COOKING_FETCH_BUTTON`, as the genshin-text key already records.

## Scope and order

**Still to build, in order:**

1. **The blacksmith's place.** Reads Mondstadt's `Blacksmith` building point from the hosted `sceneGroups/scene3` record; the screen is reached through its fixture, since the game's menus hold no forge.
2. **The screen's wiring component.** The forge screen's container in `genshin-world`, as the crafting bench's is: the recipe and queue cells from the forge state, and each queue's Obtain through `obtainForgeOrder`, which already gains the Adventure EXP at the Adventure Rank. Its words are the forge page's own, under the manual ids `find --id "^UI_FORGE_PAGE_"` lists: `UI_FORGE_PAGE_OK_BUTTON` (Start), `UI_FORGE_PAGE_FORMULA_BUTTON` (Materials), `UI_FORGE_PAGE_ITEM_GET` (Obtained), the queue's `UI_FORGE_PAGE_QUEUE_*` and the rest.

## Data and measures

- **Read from the game's tables:** every number the rules need is read, and none waits on a source.

## Key files

| File                                                                      | Role after the change                                                                             |
| :------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/models/screen/ScreenKind.ts`                  | Gains the forge's screen                                                                          |
| `packages/genshin-interface/src/components/ForgeScreen/Index.vue`         | The forge screen, its two tabs                                                                    |
| `packages/genshin-interface/src/components/ForgeScreen/Index.fixture.ts`  | The screen's fixture, the Materials tab and the queues variant                                    |
| `packages/genshin-world/src/components/Forge/Screen/Index.vue`            | The forge container: recipes and queues from the forge state, Start, Obtain and the refusal words |
| `packages/genshin-world/src/services/forging/getBlacksmithPlace.ts`       | Mondstadt's blacksmith's place, from the scene group record's Blacksmith point                    |
| `packages/genshin-world/src/services/forging/computeForgeQueueSlots.ts`   | Each queue's order from the forge state at a moment                                               |
| `packages/genshin-world/src/services/forging/computeForgeRefusalLabel.ts` | The refusal words of an order past the day's forge points                                         |

## Sources

- [Forging](https://genshin-impact.fandom.com/wiki/Forging), Genshin Impact Wiki: the blacksmith's screen. The screen's layout waits on a measure of the recording: a public clip of the Wagner forge, [Have an item forged at Wagner](https://www.youtube.com/watch?v=AVnbm8fESr0), 81 seconds, is kept under the captures as `yt-AVnbm8fESr0` and is the layout's reference until the owed `forge-order-queue.mkv` lands.

## Reference

- `forge-order-queue.mkv` — a Normal Enhancement Ore order of three queued at a blacksmith with the bag counted before and after, each unit followed to collection, 3 minutes at most; it shows whether the units take turns at three seconds each, whether a second order starts in a second queue at Adventure Rank five, and whether a result waits in its queue when the bag is full ([forging](../../specs/genshin/forging/design.md)). On the wiki and YouTube, none found (searched 2026-10-11).
- `forge-refusal.mkv` — a Mystic Enhancement Ore ordered on a day its points are already near the cap, from an account whose day holds them, 15 seconds at most; it shows the words the refusal gives, which key they match, and whether the order is refused at its start or the points are counted as its units are collected ([forging](../../specs/genshin/forging/design.md)). On the wiki and YouTube, none found (searched 2026-10-11).
