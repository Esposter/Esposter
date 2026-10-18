# Kuki

Kuki's kit is its record and one behaviour module, `createKukiKitBehaviour`, on avatar 10000065: four strikes, a charged attack of two slashes, a collision and two plunges, Grass Ring of Sanctification with its ring and drain, and Gyoei Narukami Kariyama Rite's seven hits. Her multipliers are read from proud skill groups 6531, 6532 and 6539; the charged attack's stamina, the burst's cooldown and energy cost, and the skill's duration and cooldown are read from the same groups. The ring ticks every 90 frames from its 23rd, healing the active character by the table's share of her Max HP and flat amount and striking 2 frames after each tick, and the cast drains 30% of her health share, to no lower than 20%. Each burst hit is a share of her Max HP as flat damage. Ascension 4 and Constellations 1 and 2 are built. Ascension 1's healing bonus and Constellations 4 and 6 are not, as they read her current HP or an enemy's marks. The plunges' reaches and poise and the burst's seven hits are provisional.

## Decisions

- **Kuki's HP-based damage and drain are read from her Max HP and the party's health share.** A kit has no current HP for her, so each burst hit is her Max HP's share as flat damage on the caster's Max HP, and the cast's drain is a one-tick field that lowers the health share by 30%, floored at 20%, as Xiao's drain is a field. gcsim casts twelve burst hits at 50% HP or less, which the kit cannot tell, so seven stand until the Mac measures it.
- **Kuki's burst strikes twelve times at half her HP or less, and seven at more.** gcsim casts seven hits at full HP and twelve at half or less, every 17 frames from 50; the kit builds the seven.
- **Kuki's plunges reach 1, 3 and 5 metres with poise 10, 50 and 100.** gcsim gives Kuki no plunge file, so the kit takes the generic plunges' reaches and poise.

## Key files

| File                                                            | Role                                                                                                                                                                             |
| :-------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/kukiKit.ts` | `createKukiKitBehaviour`, Kuki's kit with her strikes, charged attack and plunges, Grass Ring of Sanctification with its ring and drain, and Gyoei Narukami Kariyama Rite's hits |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/kuki), MIT: the kit's hitmarks, cancel frames and areas, reaches, the charged attack's slashes, Grass Ring of Sanctification's frames, ring, ticks and drain, Gyoei Narukami Kariyama Rite's frames and hits, and Ascension 4 and Constellations 1 and 2.
