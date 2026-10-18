# Kamisato Ayato

Ayato's kit is its record and one behaviour module, `createAyatoKitBehaviour`, on avatar 10000066: five strikes, a charged attack, a collision and two plunges, Kamisato Art: Kyouka with its water illusion's hit and Soukai Kanka's stance of three Shunsuiken strikes, and Kamisato Art: Suiyuu with its field, which follows the body for eighteen seconds and strikes on each of its ticks. His multipliers are read from proud skill groups 6631, 6632 and 6639; the charged attack's stamina, the skill's cooldown, and the burst's seconds, cooldown and energy cost are read from the same groups. Each Shunsuiken strike adds the table's share of his Max HP per Namisen stack to its DMG, and each enemy it strikes adds a stack, up to four or five. Ascension 1, Ascension 4's energy off the field and Constellations 1, 2 and 6 are built, the energy by a field that gives it each second Ayato is off the field, as gcsim does. Constellation 4's team attack speed, Constellation 2's Max HP at three stacks and Suiyuu's normal attack DMG bonus are not, as the kit prices no attack speed, a passive reads the combatant alone, and no kit step reads a normal attack's DMG Bonus from the team's effects. The illusion's delay of 35 frames is provisional, and each burst tick strikes every enemy within 12.5 metres of the body, not one random enemy.

## Decisions

- **Ayato's Namisen stacks are a status that each Shunsuiken strike reads through the team's effects as it prices.** A hit's `additiveBaseDamageBonus` receives the striker alone, so the stance's strikes close over the owner of the team's effects that Kyouka's cast writes into, and read the stacks there. Each enemy a strike hits adds a stack through `onStrike`, and the status has no end, which a swap ends, as gcsim clears the stacks when he leaves the field; the stance ends on the same swap. Soukai Kanka replaces his normal attacks only, as a stance's charged attack and plunges are the kit's own: gcsim refuses both in the skill state, which a stance cannot express.
- **Kamisato Art: Kyouka's water illusion explodes 35 frames after the cast.** gcsim takes the illusion's least delay, which a player's parameter may only raise, so `ayatoKit.ts` takes 35 frames, about 0.58 seconds.

## Key files

| File                                                             | Role                                                                                                                                                                                        |
| :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/ayatoKit.ts` | `createAyatoKitBehaviour`, Ayato's kit with his strikes, charged attack and plunges, Kamisato Art: Kyouka with its Soukai Kanka stance and Namisen stacks, and Kamisato Art: Suiyuu's field |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/ayato), MIT: the kit's hitmarks, cancel frames and areas, reaches, the charged attack's slash, the collision and the low and high plunges' frames, reaches and poise, Kamisato Art: Kyouka's animation, illusion and Soukai Kanka's Shunsuiken strikes, the Namisen stacks, Kamisato Art: Suiyuu's frames, field and ticks, and Ascension 1 and Constellations 1, 2 and 6.
