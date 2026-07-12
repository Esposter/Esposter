---
title: Milestone achievements
description: Proposal — achievements for in-game milestones (points earned, buildings owned) evaluated from the save payload on saveClicker.
---

# Milestone Achievements

Award achievements for actual play milestones — total points, buildings owned, upgrades bought — instead of only counting save calls. Today all five clicker achievements trigger on `clicker.saveClicker` call counts, and since autosave fires every 60 seconds, the whole ladder up to ClickerChampion (1000 saves) unlocks by idling ~17 hours with zero engagement.

## Scope

**Today:** the achievement plugin already supports everything needed — it matches definitions by `triggerPath`, and a definition's optional `condition` is evaluated by `checkAchievementCondition` against the mutation's raw input (`Property` conditions walk a dot path and compare with binary operators or a custom `Operation` callback; `And`/`Or` compose). The clicker definitions just don't use conditions.

**This adds:** milestone definitions only — pure content, no plugin or model changes.

## How it works

New entries in `ClickerAchievementDefinitionMap` on the existing `clicker.saveClicker` trigger path with `amount: 1` (unlock on first satisfied save) and a `condition` reading the save payload, e.g.:

- Points thresholds — `{ type: Property, path: "noPoints", operator: ge, value: 1e6 }` (a tier per magnitude).
- Building collector — `Operation` callback: every `BuildingId` present in `boughtBuildings`.
- Completionist — `Operation` callback: `boughtUpgrades` covers every `UpgradeMap` key.

The autosave cadence then works _for_ the design: progress is evaluated at least once a minute while playing. Unlocks are idempotent — the plugin skips definitions whose user achievement is already `unlockedAt`. Keep the existing save-count achievements; they reward longevity and cost nothing.

## Key files

Paths relative to `packages/app`.

| File                                                                         | Change                |
| ---------------------------------------------------------------------------- | --------------------- |
| `shared/services/achievement/definitions/ClickerAchievementDefinitionMap.ts` | milestone definitions |
| `packages/db-schema/src/services/achievement/ClickerAchievementName.ts`      | new achievement names |

## Notes

- Server-side evaluation of the saved payload is the only honest signal available — it is validated by `clickerSaveSchema` at the same boundary. The blob is still client-authoritative (a player can craft a save); acceptable for a casual game, same trust level as today.
- Anonymous (localStorage) players earn nothing, as with all achievements — unchanged.
