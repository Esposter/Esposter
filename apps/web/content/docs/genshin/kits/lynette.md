---
title: Lynette
description: Lynette's kit as built, with her strikes, charged attack, plunges, Enigmatic Feint's press, and Magic Trick: Astonishing Shift's initial hit and Bogglecat Box ticks, and what is left of her Hold E, her vivid shots, her heal and passives.
---

# Lynette

Lynette's kit is its record and one behaviour module, `createLynetteKitBehaviour`, on avatar 10000083: four strikes, a charged attack of two slashes, a collision and two plunges, Enigmatic Feint's press, and Magic Trick: Astonishing Shift's initial hit with the Bogglecat Box beside it. Her strikes and plunges are physical, as her gcsim folder deals them, and her skill and burst are Anemo. Her multipliers are read from proud skill groups 8331, 8332 and 8339; the charged attack's stamina, the skill's cooldown, and the burst's cooldown and energy cost are read from the same groups. The Bogglecat Box ticks eleven times, from 122 frames every 59 frames, each tick reaching every enemy within six metres of the box, which stands 1.8 metres ahead of the body where the burst starts.

Not built yet: Enigmatic Feint's hold, its Shadowsign and release strike, which need a hold whose hit lands at the held time; its aligned attack, the Surging Blade, which lands only off a ten-second cooldown; the Bogglecat Box's vivid shots, which absorb an enemy's Cryo, Pyro, Hydro or Electro and need an absorb check that a kit's field cannot make; the heal and HP drain on Enigmatic Feint, which read her own HP; and her Ascension and Constellation passives.

## Decisions

- **The Bogglecat Box's tick timings, area, hitmark and poise are `Unsourced`.** gcsim gives the box's 754 frames at `burst.go` line 13, but no literal gives its first tick at 122 frames or its interval of 59, so both stand as published and their causes say so. The tick's area of six metres round the box, its zero hitmark and its zero poise have no literal either. Its multiplier is gcsim's, joined to proud skill group 8339 at index 1.

## Key files

| File                                                               | Role                                                                                                                                                                    |
| :----------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/lynetteKit.ts` | `createLynetteKitBehaviour`, Lynette's kit with her strikes, charged attack and plunges, Enigmatic Feint's press, and Magic Trick's initial hit and Bogglecat Box ticks |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/lynette), MIT: Lynette's strikes' hitmarks, cancel frames and boxes, the charged attack, the plunges and their collision, Enigmatic Feint's press, and Magic Trick: Astonishing Shift's initial hit and the Bogglecat Box's 754-frame duration.
