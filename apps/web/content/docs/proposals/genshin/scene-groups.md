---
title: Scene groups
description: Proposal — the scene group export many units wait on. The client's two non-group scene scripts are read; the group scripts themselves remain unresolved, and the current community dump's NPC births are published meanwhile. Leaked server data is never a source.
model: claude-opus-5-5
needs: [game-install, game-exports]
touches: ["scripts/src/services/genshinAssets/**", "apps/web/content/docs/genshin/game-data-formats.md"]
---

# Scene groups

Teyvat's camps, chests, residents, benches, puzzles, viewpoints and quest triggers are all placed by the game's scene groups. A group is one script under `Lua/Scene/3` naming its monsters, NPCs, gadgets, regions and triggers, each with its config id, its object id, its place and the suites that switch them on by time of day or quest state. Spawned places, gathering, crafting, forging, resident schedules, Genius Invokation's challengers, original resin and the archive each wait on that data, and no page has said where it comes from. This page records what the probes found and the source decision still open.

## Decisions

- **Leaked server data is not a source.** The community's decoded scene scripts (the Grasscutter resource sets) come from a 3.6-era leak of the game's server data, carry no licence, and say themselves that publishing them is a rights risk. They are also three years of patches old. They are never read, not even as a cross-check.
- **The current dump's NPC births stand in for the NPCs.** Dimbreath's `animegamedata2` dump publishes `BinOutput/Scene/SceneNpcBorn` for the current version: every NPC's birth place by scene and group. The hosted `sceneNpcBorn/scene3` dataset carries it, and resident schedules, the blacksmith's place and the crafting bench's keeper will read their NPCs' places from it, then switch to the group record when it lands, since only the scripts hold the suites that move an NPC by time of day. No reader calls it yet.

## Scope and order

1. **The groups' source.** The group scripts (`scene3_group*.lua`) remain unresolved in the install's map, so no group is read yet; the units need that source, and it is the next decision.
2. **Publish and hand over.** Once a source is decided, publish the group records as hosted game data, keyed by group. Then the waiting units read their camps, chests, residents, gadgets and triggers from them, each unit on its own page.

## Sources

- [Dimbreath/animegamedata2](https://gitlab.com/Dimbreath/animegamedata2), GitLab: the current version's `BinOutput/Scene/SceneNpcBorn`, every NPC's birth place by scene.
- [radioegor146/gi-asset-indexes](https://github.com/radioegor146/gi-asset-indexes), GitHub: the asset index naming the client's `Lua/Scene/3` scripts.
