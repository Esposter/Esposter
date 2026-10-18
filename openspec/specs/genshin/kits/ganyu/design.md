# Ganyu

Ganyu's kit is its record and one behaviour module, `createGanyuKitBehaviour`, avatar 10000037: six strikes, a fully charged shot with its Frostflake Arrow and Bloom, a collision and two plunges, Trail of the Qilin's Ice Lotus with its taunt and explosion, and Celestial Shower's field. Her multipliers are read from proud skill groups 3731, 3732 and 3739; the Ice Lotus taunt's seconds and cooldown, and the burst's seconds, cooldown and energy cost are read from the same groups. Undivided Heart's 20% CRIT Rate goes to each Frostflake Arrow after the first from Ascension 1, Harmony between Heaven and Earth's 20% Cryo DMG Bonus to the active character inside the shower's field from Ascension 4, and Constellation 1's Cryo RES cut on the arrows and their Bloom come from one. Constellation 2's extra charge is built as the skill's charge bonus. Constellations 4 and 6 are not built, as the enemy stacks of 4 and the charge skip of 6 are not on the kit's effects. The particles are not built.

## Decisions

- **Ganyu's Ice Lotus explodes with its second multiplier, and her Bloom is the shot's own hit.** gcsim queues one lotus multiplier for both hits; here the flower reads the table's first and the explosion its second, as the wiki's flower and explosion. The explosion lands as the taunt runs out, 373 frames after the cast, gcsim's. The Bloom outlasts the shot's 113-frame animation and lands 131 frames on, queued past the shot's end as gcsim queues it, so it is dealt as a charged attack. No source gives the lotus health, so it stands until its seconds run out.

## Key files

| File                                                             | Role                                                                                                                                                   |
| :--------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/ganyuKit.ts` | `createGanyuKitBehaviour`, Ganyu's kit with the Frostflake Arrow and its Bloom, Ice Lotus, Celestial Shower's field and her passives and constellation |

## Sources

- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/ganyu), MIT: Ganyu's strikes' hitmarks and cancels, the shot's and Bloom's frames, Ice Lotus's flower and explosion, Celestial Shower's ticks and hits, and Undivided Heart's, Harmony's and Constellation 1's values.
