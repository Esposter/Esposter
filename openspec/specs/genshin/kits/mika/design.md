# Mika

Mika's kit is its record and one behaviour module, `createMikaKitBehaviour`, on avatar 10000080: five strikes, a charged attack, a collision and two plunges, Starfrost Swirl's press, which is a Cryo box of 2.5 by 10 metres 0.4 metres behind the body, and its held form, Rimestar Flare, a Cryo hit on the primary target that the held skill releases after half a second. His burst, Skyfeather Song, heals the active character once at its 51st frame. His multipliers are read from proud skill groups 8031, 8032 and 8039; the charged attack's stamina, the skill's cooldown, and the burst's cooldown and energy cost are read from the same groups.

Starfrost Swirl's press and held Rimestar Flare each grant every party member Soulwind for 12 seconds, with the ATK SPD bonus read from the skill's `ATK SPD Bonus` label. Skyfeather Song's initial heal grants every party member the Eagleplume state for 15 seconds, and a character under it heals by Mika's flat heal and a share of his Max HP on each normal attack, once per 2.5 seconds for that character. Constellation 1 shortens that interval under Soulwind by the ATK SPD bonus.

The bonus and both heal values are talent-level table references read from their labels, the Eagleplume's flat part and share from `Eagleplume Healing`, since gcsim's constants are per-level arrays that a named constant would read only at level 1. The 15, 2.5 and 12 seconds are gcsim's, as the wiki leaves them unstated. The wiki grants the Eagleplume state to each party member, and gcsim's status on Mika is read as that, so the interval is per character. The press and hold apply Soulwind at their start rather than at gcsim's cooldown offset. gcsim's arrays agree with the table at level 1, as the coordinator confirmed against the table's first level, so the level-1 numbers match either source and the table alone gives the other levels.

Not built yet: Rimestar Shard, which strikes three random enemies within 10 metres of the body after the flare, as it needs a strike on three chosen enemies rather than all in reach; and Constellations 2, 4 and 6, and his Ascension passives.

Gcsim gives Mika's plunges no file, so they take the timings and poise of Bennett's plunge file, with the reaches as the fallback's areas. The flare's hold threshold is the half second gcsim does not give, and the poise of his strikes and charged attack is 0, as gcsim gives none. Each is provisional until a recording settles it.

## Key files

| File                                                            | Role                                                                                                                                                                                                        |
| :-------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/mikaKit.ts` | `createMikaKitBehaviour`, Mika's kit with his strikes, charged attack, plunges, Starfrost Swirl's press and held Rimestar Flare with Soulwind, and Skyfeather Song's initial heal with the Eagleplume heals |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/mika), MIT: Mika's strikes' hitmarks, cancel frames and reaches, the charged attack, Starfrost Swirl's press and held Rimestar Flare, and Skyfeather Song's animation and initial heal.
- [gcsim](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go), MIT: the plunges' timings and poise, borrowed as Mika's own folder has no plunge file.
