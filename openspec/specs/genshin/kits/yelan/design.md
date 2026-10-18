# Yelan

Yelan's kit is its record and one behaviour module, `createYelanKitBehaviour`, on avatar 10000060: four strikes, a fully charged shot with its arrow, a collision and two plunges, Lingering Lifeline's hit, and Depth-Clarion Dice's field, which waves an Exquisite Throw each second and throws one on each Lingering Lifeline hit while it stands. Her multipliers are read from proud skill groups 6031, 6032 and 6039, and the Lifeline's cooldown, and the burst's cooldown and energy cost, from the same groups; each hit's share of her Max HP is priced as flat damage on the caster's Max HP. Breakthrough Barb, the 34% roll each Lifeline hit takes for it, is not built, and her constellations are not built either. Her Ascension 1 passive is not built: it raises Max HP by the party's element count, but `getBuffedCombatant` recomputes only attack and defense, so the Max HP that Lingering Lifeline's share reads stays at its base, and no kit hook sets it. Her Ascension 4 passive is built. The poise, the plunges' seconds and the wave's phase are provisional.

## Decisions

- **Depth-Clarion Dice's first wave comes a second after the initial hit, and its throws land 20, 26 and 32 frames after their wave.** `yelanKit.ts` starts the wave a second after the hit, as gcsim's ticker does.
- **Ascension 4's damage bonus follows the active character from the burst's hit.** A 15-second status starts at the burst's hitmark, as gcsim's `yelan/burst.go` starts its status, and while it runs the active character deals 1% more DMG, rising 3.5% each whole second up to 50%, as gcsim's `yelan/asc.go` gives it. Each step sets the bonus on whoever is active, so a swap moves it, and a recast of the burst restarts the status. The description's "in play" is read as that window.
- **Constellation 1's extra charge is a skill charge.** Lingering Lifeline's second charge before its cooldown is a charge count, so Constellation 1 adds one through `getSkillChargeBonus`, as Ganyu's Constellation 2 does.

## Key files

| File                                                             | Role                                                                                                                                                           |
| :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/yelanKit.ts` | `createYelanKitBehaviour`, Yelan's kit with Lingering Lifeline, Depth-Clarion Dice's field and its Exquisite Throws, and her strikes, charged shot and plunges |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/yelan), MIT: the kit's hitmarks, cancel frames and areas, the shot's frames, Lingering Lifeline's frames and hit, Depth-Clarion Dice's initial hit, its Exquisite Throws' travel and interval, and the wave's ticker.
