---
title: Forging
description: Proposal — the blacksmith's forge screen and place, the forging talents, the Serenitea Pot's refusal of Magical Crystal Chunks, and the drop-table Mystic Enhancement Ore. The recipes, the queues by rank, real-time orders, the daily cap and the four-star weapons from billets are built.
model: claude-haiku-5-5
---

# Forging

The blacksmith's recipes, queues, orders and daily cap are built, as the [forging](/docs/genshin/forging) page describes. What is left is what a player sees, and the rules that wait on other pages or on a source: the forge screen and the blacksmith's place, the forging talents, the Serenitea Pot's refusal, and the Mystic Enhancement Ore a drop table draws.

## Decisions

- **The forge screen is measured like the other screens.** Its layout and its queues' look are read off a recording of the game's blacksmith, through the [recreation passes](/docs/proposals/genshin/recreation-passes), before it is built. Its words come from the refusal keys the [forging](/docs/genshin/forging) page names, and it changes no number the rules set.
- **The blacksmith's place is an NPC of the Mondstadt scene.** The official map has no blacksmith label, so the place is read from the region's own placements, not from the spawned places. Every blacksmith is one forge, so the place is a screen's concern only.
- **A character's forging talent gives its bonus to the forge.** The bonus is read from the character's passive, as the wiki lists each. The wiki's page was not reachable from the build that settled the rest, so the talents wait on a source that lists them.
- **The Serenitea Pot's forge refuses Magical Crystal Chunks.** The rule is the pot's, and it is applied by the [Serenitea Pot](/docs/proposals/genshin/serenitea-pot) page. The only forge recipe that takes the chunks is the drop-table Mystic below, so the refusal has nothing to refuse until that recipe is written.
- **The Mystic Enhancement Ore from Magical Crystal Chunks and Original Resin waits on its drop table.** Its result is drawn from a table the build does not read yet. Its forge points are zero, so it does not count toward the day's cap whenever it is written.

## Scope and order

**Built:** the recipes, queues by rank, real-time orders, the daily cap, and the four-star weapons from billets with their diagrams. See the [forging](/docs/genshin/forging) page.

**Still to build, in order:**

1. **The forge screen and the blacksmith's place.** After the recording owed on the roadmap, and with the region's placements.
2. **The Serenitea Pot's refusal.** With the pot's own page.
3. **The drop-table Mystic.** When its drop table is read from the dump.
4. **Forging talents.** Once a source lists the characters and their bonuses.

## Data and measures

- **Read from the game's tables:** the drop table behind the Mystic Enhancement Ore from Magical Crystal Chunks, not yet found in the dump.
- **Read from a source:** the forging talents, from a page that lists each character's bonus.

## Key files

| File                                                     | Role after the change    |
| :------------------------------------------------------- | :----------------------- |
| `packages/genshin-world/src/models/screen/ScreenKind.ts` | Gains the forge's screen |

## Sources

- [Forging](https://genshin-impact.fandom.com/wiki/Forging), Genshin Impact Wiki: the forging talents and the blacksmith's screen. The page was not reachable from this build, so the talents wait on it.
