---
title: Saves and settings
description: The Dungeons save blob, saving from the world menu, the settings scene, and achievements.
---

# Saves and Settings

The whole game persists as one `Dungeons` entity per user — a single optional `save` plus `settings` — through the same auth/unauth single-blob pattern as [clicker](/docs/clicker/game-loop-and-saves).

## How it works

A `Save` is the full run state: `player` (position, direction, party monsters, inventory, respawn location), the active `tilemapKey`, and per-map `world` state (chest opened-flags). `useReadDungeons` loads the blob at page setup (authed: `dungeons.readDungeons`; anonymous: localStorage `DungeonsStore`); the Title scene's Continue resumes `dungeons.save` (enabled only when one exists), New Game starts from a fresh `Save`. Saving is **manual** — the world menu's Save option calls `saveData`, which assigns the active save onto `dungeons.save` and persists via `useSave` — there is no autosave.

**Legacy migration** — older blobs stored a `saves` array that only ever grew one slot. Every read path funnels through the `Dungeons` constructor (the server's blob read, superjson revival on the client, and the localStorage path), which takes the array's first entry as `save` and defaults any monster `defense` missing from pre-defense saves via the species data. `dungeonsSchema` keeps a legacy union arm doing the same migration so stale clients can still write during a deploy cycle — delete that arm once one has passed. If real save slots are ever wanted, design them as slots (their own ids, names, timestamps) rather than resurrecting the array.

**Settings** — the Settings scene edits `dungeons.settings`, shared across runs: text speed (Slow/Mid/Fast, driving dialog animation delay), battle style, animations on/off, sound on/off + volume percentage, and theme mode (recoloring the UI glass panels via `ThemeModeColorsMap`). Settings persist in the same blob write.

**Achievements** — two, both save-count-based on the `dungeons.saveDungeons` trigger path (DungeonCrawler: 1, DungeonMaster: 50). Since saving is manual, these do reflect play, unlike the clicker's autosave-driven counts.

## Procedures

| Procedure               | Auth | Input            | Purpose                        |
| ----------------------- | ---- | ---------------- | ------------------------------ |
| `dungeons.readDungeons` | user | —                | read the user's save blob      |
| `dungeons.saveDungeons` | user | `dungeonsSchema` | overwrite the user's save blob |

## Key files

Paths relative to `packages/app`.

| File                                                                          | Role                                     |
| ----------------------------------------------------------------------------- | ---------------------------------------- |
| `shared/models/dungeons/data/Dungeons.ts`                                     | root entity (save + settings), migration |
| `shared/models/dungeons/data/Save.ts`                                         | one run's full state                     |
| `app/store/dungeons/index.ts`                                                 | `useSave` wiring, `saveData`             |
| `app/composables/dungeons/useReadDungeons.ts`                                 | load on page setup                       |
| `app/store/dungeons/settings/`                                                | settings scene stores                    |
| `shared/services/achievement/definitions/DungeonsAchievementDefinitionMap.ts` | achievements                             |

## Notes

- A party wipe respawns the player at `player.respawnLocation` with the party healed (`useWorldPlayerStore.respawn` / `healParty`) — in-session state is kept, not rolled back to the last save.
