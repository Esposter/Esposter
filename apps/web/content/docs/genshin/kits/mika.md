---
title: Mika
description: Mika's kit as built, with his five strikes, charged attack, plunges, Starfrost Swirl's press and held Rimestar Flare, and Skyfeather Song's initial heal, and what is left of his Rimestar Shard, Eagleplume heals, the team's ATK SPD bonus, and his passives.
---

# Mika

Mika's kit is its record and one behaviour module, `createMikaKitBehaviour`, on avatar 10000080: five strikes, a charged attack, a collision and two plunges, Starfrost Swirl's press, which is a Cryo box of 2.5 by 10 metres 0.4 metres behind the body, and its held form, Rimestar Flare, a Cryo hit on the primary target that the held skill releases after half a second. His burst, Skyfeather Song, heals the active character once at its 51st frame. His multipliers are read from proud skill groups 8031, 8032 and 8039; the charged attack's stamina, the skill's cooldown, and the burst's cooldown and energy cost are read from the same groups.

Not built yet: Rimestar Shard, which strikes three random enemies within 10 metres of the body after the flare, as it needs a strike on three chosen enemies rather than all in reach; Eagleplume, the party's heal on each member's normal attack, which waits on a reaction to another member's attacks; the ATK SPD bonus Starfrost Swirl gives the team, as the attributes do not yet hold attack speed; and his Ascension and Constellation passives.

Gcsim gives Mika's plunges no file, so they take the timings and poise of Bennett's plunge file, with the reaches as the fallback's areas. The flare's hold threshold is the half second gcsim does not give, and the poise of his strikes and charged attack is 0, as gcsim gives none. Each is provisional until a recording settles it.

## Key files

| File                                                            | Role                                                                                                                                                                |
| :-------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/mikaKit.ts` | `createMikaKitBehaviour`, Mika's kit with his strikes, charged attack, plunges, Starfrost Swirl's press and held Rimestar Flare, and Skyfeather Song's initial heal |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/mika), MIT: Mika's strikes' hitmarks, cancel frames and reaches, the charged attack, Starfrost Swirl's press and held Rimestar Flare, and Skyfeather Song's animation and initial heal.
- [gcsim](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go), MIT: the plunges' timings and poise, borrowed as Mika's own folder has no plunge file.
