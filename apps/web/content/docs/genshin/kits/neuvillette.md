---
title: Neuvillette
description: Neuvillette's kit as built, with his three hydro strikes, the short charged attack, his plunges, O Tears, I Shall Repay with its Spiritbreath Thorn and O Tides, I Have Returned's first hit and two Waterfalls, and what is left of Equitable Judgment, the droplets and passives.
---

# Neuvillette

Neuvillette's kit is one module, `createNeuvilletteKit`, on avatar 10000087: three hydro strikes, a short charged attack, a collision and two plunges, O Tears, I Shall Repay with its Spiritbreath Thorn, and O Tides, I Have Returned with its first hit and its two Waterfalls. His multipliers are read from proud skill groups 8731, 8732 and 8739; the charged attack's stamina, the skill's cooldown, and the burst's cooldown and energy cost are read from the same groups. His skill and burst hits deal their share of Max HP as a flat base damage, as gcsim gives them, so each takes the table's share times the wearer's Max HP; Spiritbreath Thorn alone is a share of ATK, Hydro with no gauge, landing at 60 frames past the skill's 42-frame animation, as the second Waterfall lands at 154 past the burst's 135.

Provisional: gcsim gives Neuvillette no plunge file, so his plunges take Bennett's timings, reaches and poise, with his own multipliers from the table's plunge entries; and his charged attack is the short Charge Attack, the one released before Equitable Judgment's hold, with its box priced as a circle of its length.

Not built: Equitable Judgment, the held charged attack, whose length counts the Sourcewater droplets its legal evaluation picks up and whose judgement ticks drain Max HP; the droplets the skill and burst leave; Spiritbreath Thorn's aligned 10-second cooldown, which the skill's own 12 always outlast; and his ascension and constellation passives.

## Key files

| File                                                                   | Role                                                                                                                                           |
| :--------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/neuvilletteKit.ts` | `createNeuvilletteKit`, Neuvillette's kit with his strikes, short charged attack, plunges, O Tears, I Shall Repay and O Tides, I Have Returned |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/neuvillette), MIT: Neuvillette's strikes' hitmarks, cancel frames and reaches, the short charged attack, O Tears, I Shall Repay with its circle and Max HP share, Spiritbreath Thorn's hitmark and circle, and O Tides, I Have Returned's first hit and two Waterfalls with their hitmarks and animation.
- [gcsim](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go), MIT: the plunges' timings, reaches and poise, borrowed as gcsim gives Neuvillette no plunge file.
