# Charlotte

Charlotte's kit is its record and one behaviour module, `createCharlotteKitBehaviour`, on avatar 10000088: three Cryo strikes, a charged attack that sets off Spiritbreath Thorn, a collision and two plunges, Framing's press and Still Photo. Her multipliers are read from proud skill groups 8831, 8832 and 8839. The charged attack's stamina, the press's cooldown, and the burst's cooldown and energy cost are read from the same groups.

Framing's press is a Cryo box 4 metres wide and 8 long from the body. Each enemy it strikes gets a Snappy Silhouette mark for 6.8 seconds, which ticks a single-target Cryo hit every 1.5 seconds, and a press marks no more than five enemies. Spiritbreath Thorn strikes 30 frames after the charged attack's hit, a circle of radius 2.5 round the target's position at that moment, and its six-second cooldown starts when it strikes. Still Photo strikes a circle of radius 6 4.5 metres ahead of the body at 53 frames, and its cast heals every member of the party by a flat amount and a share of Charlotte's ATK. Kamera strikes the same circle eight times, and each tick heals whoever is on the field by a flat amount plus a share of her ATK while it stands within 7 metres of the cast point.

Not built yet:

- **Framing's hold and Focused Impression.** Its hit falls a held duration after the press, and a skill's hold levels are fixed, so it waits on a hold whose hitmark follows the seconds held.
- **Ascension 1**, which cuts the press's cooldown when a marked enemy dies, waits on an enemy-death kit event.
- **Ascension 4**, the team's Healing Bonus and Cryo DMG Bonus by region, waits on a passive that reads each member's region, as a passive reads the combatant alone.
- **Constellation 1**, the ATK regeneration on each heal, is not built, though its event is: `HealthChanged` carries each heal with its healer once her heals name her through `changeKitMemberHealth`.
- **Constellation 2**, the ATK stacks from the press's hits, waits on a passive that reads the team's effects, as a passive reads the combatant alone.
- **Constellation 4**, the extra DMG and energy on the burst's hits against marked enemies, waits on a count kept over a kit's own hits within a window and on the energy one of them gives.
- **Constellation 6**, the summation strike and heal on hold-marked enemies, waits on Focused Impression's mark.

Gcsim gives her strikes, charged attack, plunges and marks no poise, so each deals none, and the charged attack's stamina is the table's flat value at index 4, which gcsim does not give. Each is provisional until a recording settles it.

## Key files

| File                                                                 | Role                                                                                                                                                                                          |
| :------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/charlotteKit.ts` | `createCharlotteKitBehaviour`, Charlotte's kit with her strikes, charged attack and Spiritbreath Thorn, plunges, Framing's press and its marks, and Still Photo with its cast heal and Kamera |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/charlotte), MIT: her strikes' hitmarks, cancel frames and radii, the charged attack and Spiritbreath Thorn, the plunges' frames and radii, Framing's press and its marks, and Still Photo's hit, heals and Kamera's ticks.
