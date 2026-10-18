# Diona

Diona's kit is its record and one behaviour module, `createDionaKitBehaviour`, avatar 10000039: five strikes, a charged aimed shot, a collision and two plunges, Icy Paws' tap and hold with their paws and shields, and Signature Mix's initial hit with its field. Her multipliers are read from proud skill groups 3931, 3932 and 3939; the shield's share of Max HP and flat HP, its seconds and the hold's bonus, the tap's cooldown, and the burst's cooldown, energy cost and seconds are read from the same groups. A press sets its shield from her Max HP, the hold's at the table's bonus, and Constellation 2 raises either by 15%. The field is a circle of radius 7 round her body that heals the active character each two seconds, and its six ticks of damage are a summon from the cast. Constellation 1's 15 energy comes as the field ends. Her passives and Constellations 4 and 6 are not built, as the kit events do not reach them. The paws' poise and the charged attack's and plunges' frames are provisional.

## Decisions

- **Diona's shields are set as the press starts, and her paws reach 5 metres.** gcsim sets a shield as each paw lands and prices a paw as a circle of radius 0.5 on the primary target; an area does not hold a target, so the paws reach as the targeting does. The paws' poise is zero until the wiki's advanced properties are measured, and the hold threshold is a provisional half second.

## Key files

| File                                                             | Role                                                                                                                                           |
| :--------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/dionaKit.ts` | `createDionaKitBehaviour`, Diona's kit with Icy Paws' tap and hold, its shields, Signature Mix's field and its first and second constellations |

## Sources

- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/diona), MIT: the kit's hitmarks, cancel frames and areas, Icy Paws' hitmarks, travel and paw count, its shield's duration and cooldown, Signature Mix's frames, ticks and field, and her constellations' shield and energy.
