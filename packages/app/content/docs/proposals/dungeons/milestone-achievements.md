---
title: Milestone achievements
description: Proposal — achievements for captures, level-ups, and collection, evaluated from the save payload on saveDungeons.
---

# Milestone Achievements

Award achievements for play milestones — first capture, party levels, catching every species — instead of only save counts. Today's two dungeons achievements (save 1× / 50×) reflect menu usage, not play. The achievement plugin already evaluates a definition's optional `condition` against the mutation's raw input (see the clicker's [milestone achievements](/docs/proposals/clicker/milestone-achievements) — same mechanism, same trigger pattern), so this is pure definition content on the `dungeons.saveDungeons` path.

## Scope

**Today:** `DungeonsAchievementDefinitionMap` has two save-count definitions. Saving is manual (world menu), so conditions are evaluated exactly when the player checkpoints.

**This adds:** milestone definitions with `amount: 1` and conditions over the `dungeonsSchema` payload.

## How it works

Conditions read the saved run (`saves[0].player` today; `save.player` after [single save](/docs/proposals/dungeons/single-save) — land that first so paths don't churn):

- **Monster Catcher** — party size ≥ 2 (`Operation` callback; the starter is 1, so 2 means a capture).
- **Collector** — every `MonsterKey` present across the party.
- **Trainer** — any monster at level ≥ 10; **Elite** at ≥ 25.
- **Homeowner** — every chest in `world` opened (`Operation` over `chestMap` values).

Names go in `DungeonsAchievementName` (db-schema), definitions in the map — nothing else changes; the plugin's idempotent unlock handling covers repeated saves.

## Key files

Paths relative to `packages/app`.

| File                                                                          | Change                |
| ----------------------------------------------------------------------------- | --------------------- |
| `shared/services/achievement/definitions/DungeonsAchievementDefinitionMap.ts` | milestone definitions |
| `packages/db-schema/src/services/achievement/DungeonsAchievementName.ts`      | new achievement names |

## Notes

- Party-size-based capture detection undercounts if a player releases monsters — releasing doesn't exist, so it's exact today; revisit the condition if a release feature ever lands.
- Same client-authoritative trust level as all blob-state games; acceptable for casual play.
