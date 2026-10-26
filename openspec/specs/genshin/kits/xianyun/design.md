# Xianyun

Xianyun's kit is its record and one behaviour module, `createXianyunKitBehaviour`, on avatar 10000093: four strikes, a charged attack, a collision and two plunges, Stars Gather at Dusk's hit, and Skyladder's three presses in one state. Her multipliers are read from proud skill groups 9331, 9332 and 9339; its cooldowns and the burst's energy cost are the same groups' too. Driftcloud Wave is built as a plunge variant per press count, with Constellations 1, 2, 4 and 6 on top; Constellation 2's ATK buff is built below. Starwicker, her burst's heals, the airborne buff the burst gives the party, and her passives are not built. Her strikes take the wiki's 7.6, 7.3, 9.2 and 12.2, her charged attack the wiki's 90, her collision the wiki's 5, her plunges the wiki's 100 high and 50 low and her Skyladder press the wiki's 30; the poise of her leaps is provisional at 0, as gcsim gives none, and her follow-up presses take the wiki's 30.

## Decisions

- **Constellation 1's extra charge is a skill charge.** Constellation 1 adds one through `getSkillChargeBonus` to White Clouds at Dawn, as the [kits README](../README.md#how-a-kit-is-read) gives.

## Skyladder's presses

Skyladder's first press sets the Cloud Transmogrification state for 220 frames, as gcsim's skillStateDur does, and holds one press in it as the state's stacks. The state's second and third presses are `skillChain` follow-ups, which play their own animations (243 and 178 frames) and set the state for 238 and 179 frames. Each follow-up's frames are cited to gcsim's `skill.go` (lines 46 and 56), and its hitmark to line 20. Its element is `Unsourced`, since gcsim's `attributes.Anemo` at line 95 is a struct field the reader does not evaluate. A chained press starts no cooldown, which matches gcsim: it sets the cooldown only when the chain starts, and a chain's presses are its own.

The engine has one chain window, `windowSeconds`, where gcsim closes each press's window at its own state's end. The window here is 238 frames, the second press's, so a second press up to 18 frames past the first state's end still plays as a follow-up. That is the approximation.

## Driftcloud Wave

While the state stands, a plunge plays a leap for the press count the state holds: one press plays the leap at 4 metres, two at 5 and three at 6.5, each with its own frames cited to gcsim's `plunge.go` and its multiplier read from proud skill group 9332's index one to three. Its hitmark and radius are `Unsourced` values, since the reader cannot cite gcsim's array and struct lines for them; its element is gcsim's `plunge.go` line 115, and its gauge is the wiki's 1, which each `Driftcloud Wave DMG Lv.1` to `Lv.3` row gives. Its poise takes no wiki value, as those rows give 75, 75 and 150 and each leap's label matches all three. Each leap's `checkIsActive` reads the state's stacks, and its `onStart` spends the state and leaves the count on a Driftcloud status for 76 frames, the longest of the three leaps, which covers every hit. The engine's landing picks the variant, the standard plunge is the fallback, as a plunge variant is built.

## Constellation 4 and 6

Constellation 4's heal reads the press count the leap's status holds, so the heal is one of 50%, 80% or 150% of Xianyun's ATK for one, two or three presses. It heals the active character, which is Xianyun, the one who makes the leap, and it has a five-second ICD. gcsim's C4 closure reads the press counter after the leap has reset it, so gcsim's heal indexes the first ratio's 0. That is not the game's text, and this kit reads the leap's own press count instead; the difference is named here.

Constellation 6's burst gives eight presses that cost no cooldown for 16 seconds, as gcsim's `c6()` does. A press spends one through `consumeKitResource`, and its cooldown multiplier is zero while any remain. `checkIsSkillCooldownWaived` lets such a press start while its cooldown runs, which the kit's readiness check reads before the cooldown. Constellation 6's CRIT DMG applies to the Driftcloud Wave's hit by the count the status holds, one to three presses at 15%, 35% and 70%, as gcsim's `c6mod` does with skillCounter.

## Not built

- **Skyladder's once-per-enemy-per-state limit** — gcsim strikes each enemy once per state, and a press here strikes every enemy in its reach again. It waits on a hit that strikes each enemy once per state.
- **The wiki's White Clouds at Dawn cooldown cut** — the wiki says that with no Driftcloud Wave in the state, the next White Clouds at Dawn cooldown drops by 3 seconds. gcsim models it as cooldownReduce, which this kit does not yet.
- **Starwicker** — the burst's plunge hook. While the burst's airborne buff stands on the active character, a plunge of any party member deals Starwicker at 4.8 metres, up to 8 times, and heals the party on its own timer. It waits on a reaction to a party member's plunge landing, which `KitEventKind` does not yet carry.
- **The burst's heals** — the instant heal at the burst's hitmark, and the continuous heals every 2.5 seconds for 16 seconds. `KitPartyHeal` rides a hit only as the hit strikes an enemy, so a heal with no enemy struck waits on a party heal the kit's own timer can give.
- **The airborne buff** — the higher jumps it gives the party. It waits on a party buff the controller's jump reads.
- **Passives** — not built.

## Constellation 2

From Constellation 2, each White Clouds at Dawn press gives Xianyun 20% ATK for 15 seconds, as gcsim's `c2buff` does from its skill function ([gcsim `cons.go`](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xianyun/cons.go), MIT). The buff is a `buffKitMember` on her own `AttackPercent`, keyed by attribute and source, so a press restarts the 15 seconds rather than stacking a second buff, as gcsim's AddStatMod under its one key does.

## Key files

| File                                                                          | Role                                                                                                                                                        |
| :---------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/xianyunKit.ts`            | `createXianyunKitBehaviour`, Xianyun's kit: Skyladder's presses, Driftcloud Wave, Constellations 1, 2, 4 and 6                                              |
| `packages/genshin-world/src/services/kit/characters/xianyunSkyladder.test.ts` | The Skyladder count, the leap variants, the Constellation 4 heal and the Constellation 6 presses and CRIT DMG                                               |
| `packages/genshin-world/src/services/kit/effects/consumeKitResource.ts`       | Spends an amount of a resource a character holds, for Constellation 6's presses                                                                             |
| `packages/genshin-world/src/services/kit/startNextKitAction.ts`               | The skill's readiness, which `checkIsSkillCooldownWaived` can waive                                                                                         |
| `packages/genshin-world/src/data/kits/xianyun.json`                           | The overlay: the follow-up presses, the leaps and the chain window, cited to gcsim where the reader can evaluate the line, and `Unsourced` values elsewhere |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/xianyun), MIT: the strikes' hitmarks, cancel frames and circles, the charged attack's frames and circle, the plunges' frames and circles, Skyladder's press and Stars Gather at Dusk's hit, and the travel each strike takes.
- The game's proud skill groups 9331, 9332 and 9339, read through the hosted talent multipliers: each multiplier and cooldown matches gcsim's table at talent level 1.
- [gcsim `cons.go`](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xianyun/cons.go), MIT: Constellation 4's ratios and ICD, and Constellation 6's CRIT DMG and presses. The `skill.go` lines cited in the overlay are the state durations at line 16, the press hitmark at 20, and the leaps at 46 and 56.
- [Word of Wind and Flower](https://genshin-impact.fandom.com/wiki/Word_of_Wind_and_Flower) and [White Clouds at Dawn](https://genshin-impact.fandom.com/wiki/White_Clouds_at_Dawn), Genshin Impact Wiki: the poise of her strikes, charged attack, collision, plunges and Skyladder presses.
