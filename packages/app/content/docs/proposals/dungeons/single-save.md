---
title: Single save
description: Proposal — collapse the unused multi-save array into one save field, with a legacy-shape migration.
---

# Single Save

Make the save model honestly single-slot: `Dungeons.save: Save` instead of `saves: Save[]`. The array is scaffolding that never grew slots — `saveIndex` is hardcoded to 0, the Title scene's Continue always `takeOne(saves)`, and the schema's uniqueness key is `tilemapKey`, which is a map id, not a slot id (two saves on the same map would be "duplicates"). Every reader pays the indirection; no feature uses it.

## Scope

**Today:** `Dungeons { saves: Save[]; settings }`, `saveIndex = ref(0)` in the dungeons store, `saveData` writes `saves[saveIndex]`, Continue enables on `saves.length > 0`.

**This adds:** `Dungeons { save?: Save; settings }`; `saveData` assigns `dungeons.save`; Continue enables on `dungeons.save !== undefined`; `saveIndex` deleted. A migration arm in `dungeonsSchema` accepts the legacy `saves` array and takes its first entry.

## How it works

- Change the `Dungeons` class + `dungeonsSchema` to an optional single `save` (optional so New Game–never-saved states don't need a sentinel).
- On read (`useReadDungeons` and the localStorage path), a union schema accepts `{ saves: [...] }` and maps it to `{ save: saves[0] }`; delete the arm after a deploy cycle.
- Real save slots, if ever wanted, should be designed as slots (their own ids, names, timestamps) rather than resurrecting this array — record that decision here when it comes up.

## Key files

Paths relative to `packages/app`.

| File                                      | Change                                |
| ----------------------------------------- | ------------------------------------- |
| `shared/models/dungeons/data/Dungeons.ts` | single `save` + legacy migration arm  |
| `app/store/dungeons/index.ts`             | drop `saveIndex`, simplify `saveData` |
| `app/store/dungeons/title/scene.ts`       | Continue reads `dungeons.save`        |

## Notes

- Purely mechanical; no gameplay change. Do it before any proposal that touches the save schema so they build on the simple shape.
