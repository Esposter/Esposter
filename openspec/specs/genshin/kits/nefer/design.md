# Nefer

Nefer's kit is its record and one behaviour module, `createNeferKitBehaviour`, avatar 10000122. gcsim has no folder for Nefer at v2.47.2, so Nefer's record follows [the kits index](../README.md).

## Decisions

- **Nefer is a catalyst.** The installed game's avatar table gives her `weaponType` as `WEAPON_CATALYST`, so her donors are catalyst kits, each taken where its shape matches.
- **Nefer borrows Nahida's hitmarks and areas for her normal attacks, charged attack and skill, provisional.** Her plunges and collision borrow Bennett's hitmarks and areas, as `NoActionFile`.
- **Her burst borrows Nahida's charged attack area, and its hitmarks are that attack's hitmark fraction spread over the burst, Unsourced.** Keqing's burst was the donor before, but her Starward Sword strikes "nearby opponents" around herself, while Nefer's Sacred Vow deals damage to "opponents ahead", so the shapes differ. Nahida's burst records no hit, since Illusory Heart is a field, so the closest forward strike is her charged attack, Akara: an AoE in front, 69 frames, one hit at a 65-frame hitmark. Each of the burst's four hits takes that area. Its hitmarks 23, 45, 68 and 90 are 65 of 69 frames applied to the burst's 96 frames and split into quarters.
- **Her Phantasm Performance is a stance whose charged attack borrows Kokomi's.** Kokomi's ceremonial garment is the closest catalyst stance charged attack: 76 frames, one hit at a 48-frame hitmark, a radius of 18.5. Phantasm Performance has seven hits against Kokomi's one, so its action takes Kokomi's 76 frames, and each hit's hitmark is Kokomi's 48 spread evenly over the action (7, 14, 21, 27, 34, 41 and 48), Unsourced. Every hit takes Kokomi's area. Poise, gauge and cooldown tag come from each hit's wiki row, and targeting from the stance rule.
- **The shade hits are Lunar-Bloom, and keep Grass.** Hits 4 to 6 are the shades' by the wiki join: their rows are gauge 0 and untagged, where Nefer's are gauge 1 and tagged Charged Attack, and the built record has the same split. Their `lunarReactionType` is `LunarBloom`, Unsourced, from the wiki's text that the shades' damage counts as Lunar-Bloom. Their element stays Grass, as a hit record requires one. Hits 0 to 3 are Nefer's, and Grass.
- **Nefer's skill reads its "Skill DMG" label for two hits, and her burst its "1-Hit DMG" and "2-Hit DMG" labels for four.**

## Not built

- **Her Shadow Dance starts with two Verdant Dew, and each Phantasm Performance spends one, the third ending the state.** The wiki's prose gives two initial charges, and its table gives the charges as 3 (`phantasmPerformanceCharges`), which is the most Verdant Dew the state holds, so the module starts it at two and caps it at the record's 3. The wiki also gives that a performance needs at least one Verdant Dew, and that the first shade summon after each performance consumes one. The stance spends it as the performance starts, which approximates that summon's timing. A Phantasm Performance starts only with a Verdant Dew held, its action's start gate refusing it otherwise. The gain amounts are Unsourced and not built: the wiki gives no base amount for the Verdant Dew a Shadow Dance gains from the Slither, nor the Lunar-Bloom gain of the fourth passive. The owed recording is that base amount as the game plays it. The burst does not use charges, since the wiki's burst spends Veils of Falsehood, not Verdant Dew.
- **The Phantasm Performance measurement is owed.** Its action frames, hitmarks and areas are spread or borrowed until her official showcase is measured; the coordinator adds that measurement to the recordings list.

## Key files

| File                                                             | Role                                                                    |
| :--------------------------------------------------------------- | :---------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/neferKit.ts` | `createNeferKitBehaviour`, her skill's Shadow Dance and its Verdant Dew |
| `packages/genshin-world/src/data/kits/nefer.json`                | Nefer's overlay                                                         |

## Sources

- [Nefer](https://genshin-impact.fandom.com/wiki/Nefer) and [Category:Nefer Talents](https://genshin-impact.fandom.com/wiki/Category:Nefer_Talents), Genshin Impact Wiki: Nefer's multipliers, energy, cooldowns and costs, and the burst and skill text read from the category page.
- Nefer's clips, `Ani_Avatar_Lady_Catalyst_Nefer_*`, read with `genshin:assets timings` from the installed game.
- The installed game's avatar table, `weaponType` for avatar 10000122.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/nahida), MIT at v2.47.2: Nahida's hitmarks and areas for Nefer's normal attacks, charged attack and skill.
- The built records of Kokomi (10000054) and Nahida (10000073), for the donors above.
