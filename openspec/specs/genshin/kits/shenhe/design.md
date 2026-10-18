# Shenhe

Shenhe's kit is its record and one behaviour module, `createShenheKitBehaviour`, on avatar 10000063: five strikes, a charged attack, a collision and two plunges, Spring Spirit Summoning's press and its hold, and Divine Maiden's Deliverance with its initial hit, the field's DoT ticks, the Ascension 1 Cryo DMG Bonus for an active character inside it, and the RES Decrease its DoT gives. Her multipliers are read from proud skill groups 6331, 6332 and 6339; the charged attack's stamina, the press's and hold's cooldowns, and the burst's energy cost and cooldown are read from the same groups. The field stands 2 metres ahead of the body, and each DoT tick's two hits are summoned there. Spring Spirit Summoning's press and hold give the other party members her Icy Quill, whose ATK-based Cryo DMG her kit's party strike hook prices and whose triggers each Cryo hit spends. Her other passives and Constellations 4 and 6 sit outside the kit. The hold's threshold is provisional.

## Decisions

- **Shenhe's strikes, charged attack, plunges and Spring Spirit Summoning's press and hold deal 0 poise.** Provisional, as gcsim gives none; her plunges' reaches and 0.4 seconds are the other kits' stand-ins.
- **Spring Spirit Summoning's hold begins at 0.5 seconds.** Provisional: gcsim reads the hold from the input alone, as it does for Eula and Diona.
- **Divine Maiden's Deliverance's RES Decrease holds between its DoT ticks.** `shenheKit.ts` holds the decrease for one 117-frame tick interval from each tick, where gcsim refreshes it every 18 frames.
- **Constellation 1's extra use is a skill charge.** Spring Spirit Summoning's second use before its cooldown is a charge count, so Constellation 1 adds one through `getSkillChargeBonus`, as Ganyu's Constellation 2 does.
- **The Icy Quill is held by the other party members, not by Shenhe.** Her kit's party strike hook never prices her own strikes, and the quill's "nearby party members" is read as the rest of the deployed team. The hook's ATK is Shenhe's buffed ATK, read through the team's combatant map the strike loop now hands the hook.
- **Each Cryo hit a quill holder strikes spends a trigger, one per enemy it reaches.** Strikes are priced and their events sent per enemy, so a strike reaching several enemies spends one trigger for each. The enemy hit events carry no attack kind, so Constellation 6, which exempts Normal and Charged Attack triggers from the quota, is not built. Constellation 4's Skyfrost Mantra, fed by the quill's triggers, is not built either.
- **The quill's seconds and triggers do not change with the skill's level.** Its ratio is read at the start level, 45.656% of ATK.
- **Constellation 2 extends the field by six seconds, and gives the active character Cryo CRIT DMG in it.** gcsim's burst lasts six seconds longer at two constellations, so the kit adds six to the field's seconds where it is cast, and its ticks stay as they are. gcsim's `c2` gives the active character 15% CRIT DMG on her Cryo attacks while she stands in the field, so each tick adds an element CRIT DMG effect for the tick's interval, which the strikes of that element by that character price in as CRIT DMG. The effect belongs to the active character, not to Shenhe, and the next tick restarts it rather than stacking it.

## Key files

| File                                                                  | Role                                                                                                                                                                                                    |
| :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/shenheKit.ts`     | `createShenheKitBehaviour`, Shenhe's kit with Spring Spirit Summoning's press and hold, Divine Maiden's Deliverance's field, its DoT and its Constellation 2 Cryo CRIT DMG, and her strikes and plunges |
| `packages/genshin-world/src/services/kit/getDeployedStrikeBonuses.ts` | Hands each deployed member's party strike hook the team's combatant map, so the Icy Quill reads Shenhe's buffed ATK                                                                                     |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/shenhe), MIT: the kit's hitmarks, cancel frames and areas, Spring Spirit Summoning's press and hold frames and circles, Divine Maiden's Deliverance's initial hit, its 250 poise, field, DoT ticks and offsets, the Ascension 1 Cryo DMG Bonus and the RES Decrease.
- The Genshin Impact Wiki's Shenhe talents, checked against the dump's proud skill group 6332 for the Icy Quill's ratio (45.7 to 97% of ATK across levels), its 10 and 15 seconds, its 5 and 7 triggers, and the texts of Constellations 4 and 6 from the dump's talent table.
