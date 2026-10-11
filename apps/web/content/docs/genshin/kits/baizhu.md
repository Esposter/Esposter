---
title: Baizhu
description: Baizhu's kit as built, with his strikes, charged attack, plunges, Universal Diagnosis's first hit, and Holistic Revivification's seamless shield with its Spiritvein explosions, and what is left of his bounces, heals and passives.
---

# Baizhu

Baizhu's kit is one module, `createBaizhuKit`, on avatar 10000082: four strikes, a charged attack, a collision and two plunges, Universal Diagnosis's first hit, and Holistic Revivification's seamless shield. His multipliers are read from proud skill groups 8231, 8232 and 8239; the charged attack's stamina, the skill's cooldown, and the burst's cooldown and energy cost are read from the same groups. The shield absorbs his share of Max HP plus its flat amount. It lasts to the frame gcsim gives its first expiry, and five recasts, every 146 frames from 223 frames, each explode the shield they replace as Spiritvein, which strikes the enemies within the skill's reach at its ATK multiple. His plunges take Bennett's timings and poise, as his gcsim folder has no plunge file; these are provisional.

Not built yet: Universal Diagnosis's bounces to the next nearby enemy and its heal at the chain's end, which need a hit that picks each bounce's target; the Seamless Shield's heals on each recast and on its removal, which need a heal a kit's field or shield can give the active character; his first constellation's extra charge of the skill, and Constellations 2 to 6; and his Ascension passives, which read the active character's HP and the reactions the team deals.

## Key files

| File                                                              | Role                                                                                                                                                |
| :---------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/baizhuKit.ts` | `createBaizhuKit`, Baizhu's kit with his strikes, charged attack and plunges, Universal Diagnosis's first hit, and Holistic Revivification's shield |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/baizhu), MIT: Baizhu's strikes' hitmarks, cancel frames and boxes, the charged attack, Universal Diagnosis' first hit and animation, and Holistic Revivification's animation, shield timings and recasts.
- [gcsim](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go), MIT: the plunges' timings and poise, borrowed as Baizhu's own folder has none.
