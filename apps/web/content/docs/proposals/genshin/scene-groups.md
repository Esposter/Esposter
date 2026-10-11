---
title: Scene groups
description: Proposal — the client's own group scripts read on the machine with the install, refilling what the built scene group record leaves out (a camp's monsters, a puzzle's mechanisms, a trigger's region, the suites by the hour), and the units waiting on those fields moved onto it. Leaked server data is never a source.
model: claude-opus-5-5
needs: [game-install, game-exports]
touches: ["scripts/src/services/genshinAssets/**", "apps/web/content/docs/genshin/game-data-formats.md"]
---

# Scene groups

The [scene groups](/docs/genshin/scene-groups) page holds the record as built, every field the current sources can fill already filled. A group is one script under `Lua/Scene/3`, and the rest of each group lives only there: its monsters with their levels, its gadgets beyond the viewpoints, its regions, and the suites that switch its members on by time of day or quest state. This proposal reads those scripts and moves the units still waiting onto what they add.

## Decisions

- **Leaked server data is not a source.** The community's decoded scene scripts (the Grasscutter resource sets) come from a 3.6-era leak of the game's server data, carry no licence, and say themselves that publishing them is a rights risk. They are also three years of patches old. They are never read, not even as a cross-check.
- **The scripts refill the built record; no reader changes.** Each script's members land under its own group id in `sceneGroups/scene3`, with a new `SceneGroupSource` member naming the scripts, and replace a member another source filled only where the script holds the same one. A unit reads a field the same way whichever source filled it.

## Scope and order

1. **The client's group scripts**, on the machine with the install. The group scripts (`scene3_group*.lua`) remain unresolved in the install's map: find them in the current index, and read their form against the non-group scripts' `GENSHIN_LUA_53` dialect ([game data formats](/docs/genshin/game-data-formats)). Once read, they refill the record: monsters as a new member kind, each gadget, each trigger's region as its place, and every member's suites.
2. **The units waiting on those fields**, each on its own page once its field is filled: the camps of [spawned places](/docs/proposals/genshin/spawned-places), the [puzzles](/docs/proposals/genshin/puzzles)' mechanisms, the [quests](/docs/proposals/genshin/quests)' go-tos, the night spots of [resident schedules](/docs/proposals/genshin/resident-schedules), the [ley line outcrops](/docs/proposals/genshin/ley-line-outcrops)' places, the [chests](/docs/proposals/genshin/chests)' join and the keepers no birth places, among them [reputation](/docs/proposals/genshin/reputation)'s Hertha and [Genius Invokation](/docs/proposals/genshin/genius-invokation)'s challengers.

## Sources

- [radioegor146/gi-asset-indexes](https://github.com/radioegor146/gi-asset-indexes), GitHub: the asset index naming the client's `Lua/Scene/3` scripts.
