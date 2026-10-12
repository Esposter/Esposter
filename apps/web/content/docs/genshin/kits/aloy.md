---
title: Aloy
description: Aloy's kit as built: her strikes, fully charged shot and plunges, with Freeze Bomb, its Chillwater Bomblets and their coil stacks giving Rushing Ice, and her passives, constellations and normal attack bonuses left unbuilt.
---

# Aloy

Aloy's kit is its record and one behaviour module, `createAloyKitBehaviour`, avatar 10000062: four strikes, a fully charged shot, a collision and two plunges, and Freeze Bomb with its two Chillwater Bomblets, each of which adds a coil stack, four of them giving Cryo infusion for Rushing Ice's ten seconds. Her multipliers are read from proud skill groups 6231, 6232 and 6239; the skill's cooldown, and the burst's cooldown and energy cost, are read from the same groups. Freeze Bomb's circle and the bomblets' are priced as the targeting reach plus their radius, and Prophecies of Dawn's circle as its offset plus its radius. Her Coil and Rushing Ice normal attack bonuses are not built, and her coil stacks are not cleared 30 seconds after she leaves the field, since a kit's status holds no field state. Her passives and constellations are not built, as the game cannot activate her constellations. Her poise is provisional.

## Decisions

- **Aloy's strikes, fully charged shot, Freeze Bomb, Chillwater Bomblets and burst deal 0 poise.** Provisional, as gcsim gives none, so `aloyKit.ts` stands each hit at 0; her plunge reaches and 0.4-second landing are the stand-ins other kits use.
- **Each Chillwater Bomblet adds one coil stack per enemy it strikes, and Freeze Bomb and each bomblet give 1U of Cryo.** gcsim counts a bomblet once for all its enemies and gives Freeze Bomb no gauge, so `aloyKit.ts` counts each enemy and reads 1U as Ganyu's Cryo hits do.
- **The Chillwater Bomblets' hitmarks and Freeze Bomb's hit count are `Unsourced`.** gcsim fires each bomblet at "skillRelease+travel+delay+((i+1)*6)" at skill.go line 101, which no reader evaluates because "travel" and "delay" are parameters with defaults, not single-assignment names, so their hitmarks stay hand-set at 31 and 37 frames. The three hits are one bomb and "bomblets" at 2 by default (skill.go line 52), so the count of 3 stays hand-set too.

## Key files

| File                                                            | Role                                                                                                                                                                                    |
| :-------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/aloyKit.ts` | `createAloyKitBehaviour`, Aloy's kit with Freeze Bomb and its Chillwater Bomblets' coil stacks and Rushing Ice, and her strikes, fully charged shot and plunges, and Prophecies of Dawn |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/aloy), MIT: Aloy's strikes' hitmarks, travel and cancel frames, the fully charged shot's frames, Freeze Bomb's frames, its bomblets' hitmarks and circles, the coil stacks and Rushing Ice's threshold, and Prophecies of Dawn's frames and circle.
