# Diluc

Diluc's kit is its record and one behaviour module, `createDilucKitBehaviour`, avatar 10000016: four strikes, a charged attack, a collision and two plunges, Searing Onslaught's three presses, and Dawn's slashing hit with its phoenix's ticks and explosion. Its multipliers are read from proud skill groups 1631, 1632 and 1639, and match the wiki's Tempered Sword and gcsim's level-1 values to two decimal places. Dawn's infusion, its phoenix and the A4 passive are built, as the shared effects below.

## Decisions

- **Dawn's phoenix** is a travelling summon launched at the slash's hitmark, a metre ahead of the body and moving 14 metres a second. It strikes eight ticks, every 0.2 seconds from its launch, and explodes 1.7 seconds on, 24.8 metres out.
- **Searing Onslaught's cooldown starts on its first press.** The second and third presses are a chain: each is pressed within four seconds of the one before, and a press inside that window plays its follow-up whatever the cooldown, which the first press set at 10 seconds. The third press closes the chain, and a window that lapses ends it. gcsim sets the cooldown on the first use, and the wiki's lapse path ends a chain with the cooldown already running, so the cooldown always starts on the first press.
- **Dawn's phoenix is priced by the same ICD as its slash.** Its ticks and explosion are 2U of Pyro each under the Elemental Burst internal cooldown, and carry the slash's 100 poise, as gcsim's copy of the attack does. Their area is a circle to the far corner of gcsim's box, provisional until areas hold boxes. gcsim places tick _i_ at 1 + 2.8*i* metres; the phoenix's own clock puts it 2.8 metres further, which the kit follows.
- **Its stamina drains a second as it plays.** The table's 40 a second is drained each step of the charge, so its 1.2 seconds cost 48 in all, and the charge starts with any stamina. The game holds the charge up to 5 seconds and stops it when the stamina runs out, which the kit does not model.
- **Poise is the wiki's where gcsim gives none.** gcsim sets no poise on Diluc's skill, burst or collision; the wiki's advanced properties give 120, 100 and 35.
- **Relentless, from Ascension 1, halves the charged attack's stamina.** The talent text's 50% cut is priced by the charged-attack stamina hook at Ascension 1 and above. Its "+3s duration" clause is not built, since the talent text does not name what that duration is; gcsim models neither part.
- **Blessing of Phoenix, from Ascension 4,** lengthens Dawn's infusion by 4 seconds to 12 and gives a 20% Pyro DMG Bonus for as long, as gcsim's Pyro bonus does.

## Provisional constants

- **The charged attack's timing is provisional.** gcsim does not model it, so the slashes are priced at half a second and a second, the attack ending at a second and a fifth. Its damage is the wiki's cyclic 68.8% and final 124.7%, its poise 60 and 120 from the wiki.

## Not built

- **Relentless's "+3s duration" clause and the phase-0 passive, Tradition of the Dawn Knight, are not built.** The first has no named referent in the talent text, and the second refunds ore when crafting, outside combat.

## Key files

| File                                                             | Role                                                                                               |
| :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/dilucKit.ts` | `createDilucKitBehaviour`, Diluc's kit with Searing Onslaught's chain, Dawn's infusion and phoenix |

## Sources

- [Tempered Sword](https://genshin-impact.fandom.com/wiki/Tempered_Sword), Genshin Impact Wiki: Diluc's advanced properties (gauge, internal cooldown, poise, blunt) and the charged attack's and plunges' values.
- [Searing Onslaught](https://genshin-impact.fandom.com/wiki/Searing_Onslaught), [Dawn](https://genshin-impact.fandom.com/wiki/Dawn) and [Elemental Gauge Theory: Character Data](https://genshin-impact.fandom.com/wiki/Elemental_Gauge_Theory/Character_Data), Genshin Impact Wiki: the skill's and burst's gauges and poise, and the infused collision's 0U.
- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/diluc), MIT: the kit's hitmarks, cancel frames and areas, the burst's infusion and A4.
