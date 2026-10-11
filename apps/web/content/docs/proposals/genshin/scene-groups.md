---
title: Scene groups
description: Proposal — the scene group record many units wait on, published now from the current sources each of its fields can be filled from and refilled from the client's group scripts once they are read. Leaked server data is never a source.
model: claude-opus-5-5
needs: [game-install, game-exports]
touches: ["scripts/src/services/genshinAssets/**", "apps/web/content/docs/genshin/game-data-formats.md"]
---

# Scene groups

Teyvat's camps, chests, residents, benches, puzzles, viewpoints and quest triggers are all placed by the game's scene groups. A group is one script under `Lua/Scene/3` naming its monsters, NPCs, gadgets, regions and triggers, each with its config id, its object id, its place and the suites that switch them on by time of day or quest state. Spawned places, gathering, crafting, forging, resident schedules, Genius Invokation's challengers, original resin and the archive each wait on that data, and no page has said where it comes from. This page settles it.

## Decisions

- **Leaked server data is not a source.** The community's decoded scene scripts (the Grasscutter resource sets) come from a 3.6-era leak of the game's server data, carry no licence, and say themselves that publishing them is a rights risk. They are also three years of patches old. They are never read, not even as a cross-check.
- **The record comes first, each field filled from the best current source, and nothing waits on one export.** The group record, keyed by group, holds each member's kind, object id, config id and place, and its suites where they are known. Each field names the source that filled it. Places come from what is already read: the official map's fitted points, and the dump's NPC births and transport points. Group ids come from the tables that already name a group, `ViewCodexExcelConfigData` for the viewpoints and `TriggerExcelConfigData` for the quest triggers. What only the scripts hold is left empty, never guessed, and a unit needing it keeps its stand-in: a camp's members and levels, a puzzle's mechanisms, a trigger's region, the suites that move a thing by time of day. When the client's group scripts are read, they refill the same record, and no unit changes.
- **The current dump's NPC births fill the NPCs' places.** Dimbreath's `animegamedata2` dump publishes `BinOutput/Scene/SceneNpcBorn` for the current version: every NPC's birth place by scene and group. The hosted `sceneNpcBorn/scene3` dataset carries it, and the record takes each NPC's place from it.

## Scope and order

1. **The record**, published as hosted game data keyed by group and filled per field from the sources above. It needs no install.
2. **Hand over.** The waiting units read the record, each on its own page. Those whose fields it fills move now: the viewpoints, the residents' places, the bench's keeper and the stove. The camps, puzzles, quest go-tos and schedules move once the scripts fill theirs, and each unit's page names the record rather than an export another machine is making.
3. **The client's group scripts**, on the machine with the install. The group scripts (`scene3_group*.lua`) remain unresolved in the install's map: find them in the current index, and read their form against the non-group scripts' `GENSHIN_LUA_53` dialect ([game data formats](/docs/genshin/game-data-formats)). Once read, they refill the record.

## Sources

- [Dimbreath/animegamedata2](https://gitlab.com/Dimbreath/animegamedata2), GitLab: the current version's `BinOutput/Scene/SceneNpcBorn`, every NPC's birth place by scene.
- [radioegor146/gi-asset-indexes](https://github.com/radioegor146/gi-asset-indexes), GitHub: the asset index naming the client's `Lua/Scene/3` scripts.
