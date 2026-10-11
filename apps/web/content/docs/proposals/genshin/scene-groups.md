---
title: Scene groups
description: Proposal — the scene group export many units wait on, read from the installed client's own scene scripts at rest. Each group's monsters, NPCs, gadgets, regions, triggers and suites with their ids and places are decoded offline into one record per group, and published as derived game data; the current community dump's NPC births stand in for the NPCs until it lands.
model: claude-opus-5-5
needs: [game-install, game-exports]
touches: ["scripts/src/services/genshinAssets/**", "apps/web/content/docs/genshin/game-data-formats.md"]
---

# Scene groups

Teyvat's camps, chests, residents, benches, puzzles, viewpoints and quest triggers are all placed by the game's scene groups. A group is one script under `Lua/Scene/3` naming its monsters, NPCs, gadgets, regions and triggers, each with its config id, its object id, its place and the suites that switch them on by time of day or quest state. Spawned places, gathering, crafting, forging, resident schedules, Genius Invokation's challengers, original resin and the archive each wait on that data, and no page has said where it comes from. This page settles it.

## Decisions

- **The source is the installed client's own scene scripts, read at rest.** The client ships every main-world group as a script asset: the asset index names over ten thousand `Lua/Scene/3/scene3_group*.lua` paths. They are read the way the text maps and tables are, from the install's blocks, through the extraction pipeline, with nothing run against the game. What the scripts become is a record per group of ids, places and suites. The scripts themselves stay outside the repository like every other export, and nothing extracted ships.
- **Leaked server data is not a source.** The community's decoded scene scripts (the Grasscutter resource sets) come from a 3.6-era leak of the game's server data, carry no licence, and say themselves that publishing them is a rights risk. They are also three years of patches old. They are never read, not even as a cross-check.
- **The current dump's NPC births stand in for the NPCs.** Dimbreath's `animegamedata2` dump publishes `BinOutput/Scene/SceneNpcBorn` for the current version: every NPC's birth place by scene and group. Resident schedules, the blacksmith's place and the crafting bench's keeper read their NPCs from it now, through the dump fetch `genshin:text fetch` already uses. They switch to the group record when it lands, since only the scripts hold the suites that move an NPC by time of day.
- **The form of the script bytes is found before any decoder is chosen.** Whether a script is plain Lua source, Lua bytecode or encrypted bytecode decides the whole pipeline. The first step records that form on the [game data formats](/docs/genshin/game-data-formats) page with the command that shows it, before any tool is written for it.

## Scope and order

1. **Probe.** Find the scene scripts in the 7.1 install's asset index. Extract a few groups' raw bytes into `~/Esposter/genshin-parity/extracted/scene-groups-probe/`, and record their form: the asset kind, the leading bytes, whether a Lua header appears plainly or after a transform, and their entropy. Write the finding to the game data formats page with its command.
2. **The NPC births from the dump.** Publish `SceneNpcBorn`'s scene 3 births as a hosted dataset, then hand resident schedules, forging and crafting their NPC places through it.
3. **Decode.** Build the decoder step 1 calls for: a reader for source, or a decompiler or decryptor run offline for bytecode, chosen from the probe's evidence with its tool pinned by version. Make it a `genshin:assets scene-groups` command writing one record per group.
4. **Publish and hand over.** Publish the group records as hosted game data, keyed by group. Then the waiting units read their camps, chests, residents, gadgets and triggers from them, each unit on its own page.

## Sources

- [Dimbreath/animegamedata2](https://gitlab.com/Dimbreath/animegamedata2), GitLab: the current version's `BinOutput/Scene/SceneNpcBorn`, every NPC's birth place by scene.
- [radioegor146/gi-asset-indexes](https://github.com/radioegor146/gi-asset-indexes), GitHub: the asset index naming the client's `Lua/Scene/3` scripts.
