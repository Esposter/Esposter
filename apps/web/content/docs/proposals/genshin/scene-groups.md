---
title: Scene groups
description: Proposal — the scene group export many units wait on. Reading the client's own scene scripts waits on the user's decision; the current community dump's NPC births are published meanwhile, and leaked server data is never a source.
model: claude-opus-5-5
needs: [game-install, game-exports]
touches: ["scripts/src/services/genshinAssets/**", "apps/web/content/docs/genshin/game-data-formats.md"]
---

# Scene groups

Teyvat's camps, chests, residents, benches, puzzles, viewpoints and quest triggers are all placed by the game's scene groups. A group is one script under `Lua/Scene/3` naming its monsters, NPCs, gadgets, regions and triggers, each with its config id, its object id, its place and the suites that switch them on by time of day or quest state. Spawned places, gathering, crafting, forging, resident schedules, Genius Invokation's challengers, original resin and the archive each wait on that data, and no page has said where it comes from. This page settles it.

## Decisions

- **Reading the client's scene scripts waits on the user's decision.** No session searches the scene 3 group hashes or works on the client's Lua until the user decides, by their standing rule. Two probes ran before that rule reached this page, and found that the install's map names only 5 of the 10,735 `Lua/Scene/3` scripts the community index lists, three groups among them. So the client does not carry the main world's groups under those names. `scene3.lua` and `scene3_dummy_points.lua` are standard Lua 5.3 bytecode behind a length word ([game data formats](/docs/genshin/game-data-formats), Scripts). Which source the groups come from instead is the user's call.
- **Leaked server data is not a source.** The community's decoded scene scripts (the Grasscutter resource sets) come from a 3.6-era leak of the game's server data, carry no licence, and say themselves that publishing them is a rights risk. They are also three years of patches old. They are never read, not even as a cross-check.
- **The current dump's NPC births stand in for the NPCs.** Dimbreath's `animegamedata2` dump publishes `BinOutput/Scene/SceneNpcBorn` for the current version: every NPC's birth place by scene and group. Resident schedules, the blacksmith's place and the crafting bench's keeper read their NPCs from it now, through the dump fetch `genshin:text fetch` already uses. They switch to the group record when it lands, since only the scripts hold the suites that move an NPC by time of day.

## Scope and order

1. **Probe. Done, then stopped at the rule:** the counts and forms above, recorded on the game data formats page.
2. **The NPC births from the dump.** Publish `SceneNpcBorn`'s scene 3 births as a hosted dataset, then hand resident schedules, forging and crafting their NPC places through it.
3. **The groups' source.** Waits on the user's decision. Until then nothing reads the client's scene scripts.
4. **Publish and hand over.** Once a source is decided, publish the group records as hosted game data, keyed by group. Then the waiting units read their camps, chests, residents, gadgets and triggers from them, each unit on its own page.

## Sources

- [Dimbreath/animegamedata2](https://gitlab.com/Dimbreath/animegamedata2), GitLab: the current version's `BinOutput/Scene/SceneNpcBorn`, every NPC's birth place by scene.
- [radioegor146/gi-asset-indexes](https://github.com/radioegor146/gi-asset-indexes), GitHub: the asset index naming the client's `Lua/Scene/3` scripts.
