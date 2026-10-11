---
title: Itto
description: Itto's kit as built: four strikes, the Saichimonji Slash and the Arataki Kesagiri his Superlative Superstrength turns it into, a collision and two plunges, Masatsu Zetsugi's hit with Ushi, and Royal Descent's ATK bonus and Geo conversion, with his passives and constellations not built.
---

# Itto

Itto's kit is one module, `createIttoKit`, on avatar 10000057: four strikes, the Saichimonji Slash as his charged attack, a collision and two plunges, Masatsu Zetsugi's hit with Ushi, and Royal Descent's ATK bonus per DEF with its Geo conversion and Normal ATK SPD. His multipliers are read from proud skill groups 5731, 5732 and 5739; the table indexes of his strikes, the Saichimonji Slash, the Arataki Kesagiri's slashes and the plunges, Ushi's share of his Max HP and its seconds, the skill's cooldown and the burst's cooldown and energy cost are read from the same groups. The conversion reaches his strikes, slashes and plunges with the reaches gcsim gives them under the burst.

Superlative Superstrength is a status of up to 5 stacks on the team's effects. His second strike gives 1 as it lands and his fourth 2, and as the Raging Oni King his first and third 1 each. Ushi gives 1 the first time Masatsu Zetsugi's hit strikes and 1 as it leaves, its seconds run out, its health spent or a second Ushi sending it away. Ushi is a taunt on the enemy the skill turned to, holding all of Itto's Max HP for 6 seconds from the hit. While he holds stacks a stance turns his charged attack into the Arataki Kesagiri for them, at no stamina: a combo slash from the left and the right in turn for each stack but the last, then the final slash, with gcsim's hitmarks, windups, boxes, circles and poise. His passives and constellations, and the stack Ushi gives as it takes damage, are not built.

## Decisions

- **Itto's charged attack prices the Saichimonji Slash throughout, and his Ushi waits on stacks no kit effect holds.** gcsim's charged attack is the Saichimonji Slash only with no Superlative Superstrength, and the Arataki Kesagiri combo and final slashes with stacks. The kit holds the no-stack slash, as the stacks are not on the kit's effects, and Ushi's taunt and its stack gains are not built. His skill's gauge is provisional at 2U, as no source fetched gives it.
- **Masatsu Zetsugi's hit gives 2U of Geo gauge.** gcsim's Itto file gives none, so the skill reads 2U as the other Geo skills do.
- **The Arataki Kesagiri is one charged attack holding every slash its stacks buy, and spends them as it starts.** gcsim plays each slash as its own charged attack, spending a stack and choosing the next slash from the stacks then held, so a stack gained mid-combo lengthens it. The kit's charged attack starts only once a strike ends, so it cannot chain one into another: the stance holds the whole combo for the stacks at its start, and lasts as long as the combo plays so its slashes keep the burst's conversion and their kind of attack. A stack gained while it plays waits for the next charged attack.
- **Ushi is a taunt whose explosion reaches nothing, and the stack it gives as it takes damage is not built.** Every taunt explodes as it ends, and Ushi flees without dealing damage, so its explosion is a hit whose area reaches no enemy. No event reports a taunt taking damage, and gcsim leaves that stack to a parameter that defaults to none.
- **Masatsu Zetsugi's gauge is 1U**, the Durability of 25 gcsim gives it.

## Key files

| File                                                            | Role                                                                                                                                                                                                     |
| :-------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/ittoKit.ts` | `createIttoKit`, Itto's kit with Masatsu Zetsugi's hit and Ushi, the Saichimonji Slash, Superlative Superstrength and the Arataki Kesagiri, the plunges and Royal Descent's ATK bonus and Geo conversion |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/itto), MIT: the kit's hitmarks, cancel frames and areas, the Saichimonji Slash's frames, circle and poise, the Arataki Kesagiri's hitmarks, windups, boxes, circles and poise, Superlative Superstrength's cap and the stacks each strike and Ushi give, Ushi's placement and seconds, Masatsu Zetsugi's Durability, the plunges' frames, reaches and poise, Masatsu Zetsugi's hit and its frames, Royal Descent's duration, ATK bonus and Normal ATK SPD, and the table indexes its data-mined file annotates.
