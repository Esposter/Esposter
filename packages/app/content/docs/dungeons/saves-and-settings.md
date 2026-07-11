---
title: Saves and settings
description: The Dungeons save blob, saving from the world menu, the settings scene, and achievements.
---

# Saves and Settings

The whole game persists as one `Dungeons` entity per user — a `saves` array plus `settings` — through the same auth/unauth single-blob pattern as [clicker](/docs/clicker/game-loop-and-saves).

## How it works

A `Save` is the full run state: `player` (position, direction, party monsters, inventory, respawn location), the active `tilemapKey`, and per-map `world` state (chest opened-flags). `useReadDungeons` loads the blob at page setup (authed: `dungeons.readDungeons`; anonymous: localStorage `DungeonsStore`); the Title scene's Continue starts from the first save, New Game from a fresh `Save`. Saving is **manual** — the world menu's Save option calls `saveData`, which writes the active save into the array and persists via `useSave` — there is no autosave.

**Settings** — the Settings scene edits `dungeons.settings`, shared across saves: text speed (Slow/Mid/Fast, driving dialog animation delay), battle style, animations on/off, sound on/off + volume percentage, and theme mode (recoloring the UI glass panels via `ThemeModeColorsMap`). Settings persist in the same blob write.

**Achievements** — two, both save-count-based on the `dungeons.saveDungeons` trigger path (DungeonCrawler: 1, DungeonMaster: 50). Since saving is manual, these do reflect play, unlike the clicker's autosave-driven counts.

## Procedures

| Procedure               | Auth | Input            | Purpose                        |
| ----------------------- | ---- | ---------------- | ------------------------------ |
| `dungeons.readDungeons` | user | —                | read the user's save blob      |
| `dungeons.saveDungeons` | user | `dungeonsSchema` | overwrite the user's save blob |

## Key files

Paths relative to `packages/app`.

| File                                                                          | Role                           |
| ----------------------------------------------------------------------------- | ------------------------------ |
| `shared/models/dungeons/data/Dungeons.ts`                                     | root entity (saves + settings) |
| `shared/models/dungeons/data/Save.ts`                                         | one run's full state           |
| `app/store/dungeons/index.ts`                                                 | `useSave` wiring, `saveData`   |
| `app/composables/dungeons/useReadDungeons.ts`                                 | load on page setup             |
| `app/store/dungeons/settings/`                                                | settings scene stores          |
| `shared/services/achievement/definitions/DungeonsAchievementDefinitionMap.ts` | achievements                   |

## Notes

- The `saves` array is multi-slot scaffolding that is effectively single-slot: `saveIndex` is hardcoded to 0, Continue always takes the first save, and the schema's uniqueness key is `tilemapKey` (a map id, not a slot id). The [single save](/docs/proposals/dungeons/single-save) proposal collapses it honestly.
- A party wipe respawns the player at `player.respawnLocation` with the party healed (`useWorldPlayerStore.respawn` / `healParty`) — in-session state is kept, not rolled back to the last save.
