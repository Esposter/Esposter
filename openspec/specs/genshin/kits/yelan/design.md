# Yelan

Yelan's kit is its record and one behaviour module, `createYelanKitBehaviour`, on avatar 10000060: four strikes, a fully charged shot with its arrow, a collision and two plunges, Lingering Lifeline's hit, and Depth-Clarion Dice's field, which waves an Exquisite Throw each second and throws one on each Lingering Lifeline hit while it stands. Her multipliers are read from proud skill groups 6031, 6032 and 6039, and the Lifeline's cooldown, and the burst's cooldown and energy cost, from the same groups; each hit's share of her Max HP is priced as flat damage on the caster's Max HP. Breakthrough Barb, the 34% roll each Lifeline hit takes for it, is not built, and her passives and constellations are not built either. The poise, the plunges' seconds and the wave's phase are provisional.

## Decisions

- **Depth-Clarion Dice's first wave comes a second after the initial hit, and its throws land 20, 26 and 32 frames after their wave.** `yelanKit.ts` starts the wave a second after the hit, as gcsim's ticker does.
- **Constellation 1's extra charge is a skill charge.** Lingering Lifeline's second charge before its cooldown is a charge count, so Constellation 1 adds one through `getSkillChargeBonus`, as Ganyu's Constellation 2 does.

## Key files

| File                                                             | Role                                                                                                                                                           |
| :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/yelanKit.ts` | `createYelanKitBehaviour`, Yelan's kit with Lingering Lifeline, Depth-Clarion Dice's field and its Exquisite Throws, and her strikes, charged shot and plunges |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/yelan), MIT: the kit's hitmarks, cancel frames and areas, the shot's frames, Lingering Lifeline's frames and hit, Depth-Clarion Dice's initial hit, its Exquisite Throws' travel and interval, and the wave's ticker.
