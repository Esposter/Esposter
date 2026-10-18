# Kokomi

Kokomi's kit is its record and one behaviour module, `createKokomiKitBehaviour`, on avatar 10000054: three strikes, a charged attack, a collision and two plunges, Bake-Kurage, and Nereid's Ascension with Ceremonial Garment. Her multipliers are read from proud skill groups 5431, 5432 and 5439. Bake-Kurage is a summon of its seven ripples and a field that heals the active character from her Max HP while it stands within their circle, for 12.5 seconds on a cooldown of 20. Nereid's Ascension's hit deals its share of her Max HP, and the garment it starts is a stance for ten seconds: her normal attacks, charged attack and Bake-Kurage gain their Max HP share to damage, and her normal and charged attacks heal the party by a share of her Max HP and a flat amount. The garment's heal rolls on each enemy an attack strikes, where gcsim heals once per attack, and her strikes are priced on the primary target's reach. Her passives and constellations are not built. The charged attack's stamina, the plunges and their timings are provisional, and the burst's energy cost is the table's 70, where gcsim consumes 57.

## Decisions

- **Kokomi's Ceremonial Garment is a stance that the burst starts as it lands.** gcsim's garment changes her normal attacks, charged attack and Bake-Kurage for ten seconds, which is the job a stance does: its actions replace the kit's while it lasts. So the Max HP bonuses and the heals sit on the garment's own actions, and the kit's base actions carry neither. A swap ends the garment, whose status gcsim deletes on any swap.
- **Kokomi's plunges land at half a second, on the reaches the other kits use.** gcsim gives her plunges no timing.

## Key files

| File                                                              | Role                                                                                                                                          |
| :---------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/kokomiKit.ts` | `createKokomiKitBehaviour`, Kokomi's kit with Bake-Kurage's ripples and heal field, and Nereid's Ascension with its Ceremonial Garment stance |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/kokomi), MIT: the kit's hitmarks, cancel frames and areas, projectile travel, the charged attack's frames, Bake-Kurage's ticks and radius, and Nereid's Ascension's hit, animation and ten-second garment.
