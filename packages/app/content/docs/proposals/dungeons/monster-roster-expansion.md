---
title: Monster roster expansion
description: Proposal — differentiated stats and kits for the five species, and more attacks per species.
---

# Monster Roster Expansion

Make the existing bestiary real: today all five species share identical base stats (attack 5, maxHp 25, level 5) and one attack each, so encounters differ only in sprite. Differentiating the roster is pure content in `MonstersDataMap`/`AttackMap` — the pipeline (weighted encounter tables, capture, party, level-ups) already handles everything.

## Scope

**Today:** 5 species, 2 attacks, 1 encounter area (Grass), all species mechanically interchangeable. Sprite assets exist for all five.

**This adds:** distinct stat lines and 2–3 attacks per species, plus differentiated encounter weights and levels. No new systems; new _species_ beyond five need sprite art and are out of scope here.

## How it works

- Give each species a role via stats: fast-fragile (high attack / low HP), tank (inverse), balanced — using the existing `Stats` fields (plus `defense` once [attack power and defense](/docs/proposals/dungeons/attack-power-and-defense) lands; land that first, this proposal tunes against it).
- Add attacks in `AttackMap` (each needs an `AttackComponentMap` animation — the Slash/IceShard components show the spritesheet pattern; reusing an animation with different power/sound is acceptable).
- Vary `EncounterAreaMap` entries: encounter levels beyond base level 5 by scaling stats on spawn (small helper applying `levelUp` N times to a fresh `Monster`).
- Species' `baseExp` values already differ slightly; align them with the new stat strength.

## Key files

Paths relative to `packages/app`.

| File                                                              | Change                           |
| ----------------------------------------------------------------- | -------------------------------- |
| `shared/assets/dungeons/data/monstersData.ts`                     | differentiated stat lines + kits |
| `app/assets/dungeons/data/attacks.ts`                             | new attacks                      |
| `app/services/dungeons/scene/battle/attack/AttackComponentMap.ts` | animation mapping                |
| `app/assets/dungeons/data/encounterAreas.ts`                      | weights + spawn levels           |

## Notes

- Monsters already caught keep their stored stats ([saves embed monster instances](/docs/dungeons/saves-and-settings)) — that is correct here, since an instance's stats are earned progression, not content to hot-patch.
- Keep the roster at five until art for new species exists; mechanical depth beats headcount.
