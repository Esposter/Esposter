---
title: Itto
description: Itto's kit as built: four strikes, the Saichimonji Slash as his charged attack, a collision and two plunges, Masatsu Zetsugi's hit, and Royal Descent's ATK bonus and Geo conversion, with Ushi and his passives and constellations not built.
---

# Itto

Itto's kit is one module, `createIttoKit`, on avatar 10000057: four strikes, the Saichimonji Slash as his charged attack, a collision and two plunges, Masatsu Zetsugi's hit, and Royal Descent's ATK bonus per DEF with its Geo conversion and Normal ATK SPD. His multipliers are read from proud skill groups 5731, 5732 and 5739; the table indexes of his strikes, the Saichimonji Slash and the plunges, the skill's cooldown and the burst's cooldown and energy cost are read from the same groups. The conversion reaches his strikes and plunges with the reaches gcsim gives them under the burst. Superlative Superstrength, Ushi, and his passives and constellations are not built.

## Decisions

- **Itto's charged attack prices the Saichimonji Slash throughout, and his Ushi waits on stacks no kit effect holds.** gcsim's charged attack is the Saichimonji Slash only with no Superlative Superstrength, and the Arataki Kesagiri combo and final slashes with stacks. The kit holds the no-stack slash, as the stacks are not on the kit's effects, and Ushi's taunt and its stack gains are not built. His skill's gauge is provisional at 2U, as no source fetched gives it.

## Key files

| File                                                            | Role                                                                                                                                        |
| :-------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/ittoKit.ts` | `createIttoKit`, Itto's kit with Masatsu Zetsugi's hit, the Saichimonji Slash, the plunges and Royal Descent's ATK bonus and Geo conversion |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/itto), MIT: the kit's hitmarks, cancel frames and areas, the Saichimonji Slash's frames, circle and poise, the plunges' frames, reaches and poise, Masatsu Zetsugi's hit and its frames, Royal Descent's duration, ATK bonus and Normal ATK SPD, and the table indexes its data-mined file annotates.
