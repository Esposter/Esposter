# Lauma

Lauma's kit is its record and one behaviour module, `createLaumaKitBehaviour`, on avatar 10000119: her three strikes, a charged attack, a plunge collision and two plunges, Hymn of Hunting's press and Hymn of Eternal Rest's hold with the Frostgrove Sanctuary each plants, and the Moonsign Benediction that turns the party's Bloom into [Lunar-Bloom](../../combat/design.md#lunar-reactions). Her multipliers are read from proud skill groups 11931, 11932 and 11939, and match gcsim's values to six decimal places. The press's cooldown of 12 seconds, the burst's cooldown of 15 and energy cost of 60 are read from the same groups. Her burst lands no hit of its own, so its action has none, and its Pale Hymn is listed below.

## Decisions

- **Her strikes land at their hitmarks, with no travel.** gcsim queues each strike's damage at its hitmark, so the strikes land at 14, 11 and 16 frames in animations of 29, 33 and 38 frames. The first two are boxes of 2 metres by 8 and the third a box of 2.8 metres by 8, each on the body's near edge, as gcsim's boxes are drawn.
- **Her charged attack, Spiritcall Prayer, lands after its animation.** gcsim queues its hit at 73 frames and its animation ends at 68, so the hit lands 5 frames past the action's end. The kit keeps gcsim's hitmark and does not stretch the action to fit it. It is a box of 2.8 metres by 8, and Dendro as her element.
- **The charged attack costs no stamina.** gcsim drains stamina only in the Spirit Envoy state, which is not built, so the charged attack outside it has no cost.
- **The press plants its sanctuary where the body stands.** gcsim places the Frostgrove Sanctuary on the body when the press is cast, and it ticks eight times from 62 frames, every 117 frames, for 15 seconds. Each tick is a circle of 6 metres round that point, dealing Dendro at her ATK share and her Elemental Mastery, and the kit's summon holds those eight hits.
- **The press and each sanctuary tick shed the RES of the Dendro and Hydro enemies they strike.** gcsim gives the shred 2.5% at the first level, for 10 seconds, on each enemy a press or a tick hits. The kit applies it to each enemy a hit strikes as the hit lands, through the enemy status's RES reduction.
- **The hold is Hymn of Eternal Rest while the party holds Verdant Dew.** gcsim refuses the hold with no Dew, so the kit plays the press for a hold then. The hold's Dendro hit lands at 45 frames in an animation of 64, planting the same sanctuary as the press, and it spends up to three Dew on a direct Lunar-Bloom hit at the same hitmark, 152% of her Elemental Mastery at the first level for each Dew spent, on a circle of 6 metres round her. The Dew is spent as the hold starts, where gcsim spends it at 29 frames, since the hit's multiplier is set as it is cast. The skill cools for 12 seconds either way. The half second the press must be held to become the hold is provisional, as gcsim takes the hold as a parameter, and its question is on the [roadmap](../../../../changes/genshin-roadmap/tasks.md).
- **Her Moonsign Benediction turns Bloom into Lunar-Bloom.** As gcsim's ascension file gives it, it adds 0.0175% Base DMG Bonus to the party's Lunar-Bloom for each point of her Elemental Mastery, at most 14%, read as the team's buffs leave her.
- **Her plunges are provisional.** gcsim has no plunge file for Lauma either, so her plunges borrow Bennett's timings and poise as the builder gives them to every kit with no plunge file, on the reach every kit shares and with multipliers from her table; the [roadmap](../../../../changes/genshin-roadmap/tasks.md) asks about it.

## Not built

- **Pale Hymn waits on the reaction hooks.** Her burst adds Pale Hymn stacks, which add Elemental Mastery to each Bloom, Hyperbloom, Burgeon and Lunar-Bloom hit that follows and are spent by them, and Hymn of Eternal Rest's Dew gives Moon Song stacks to it. No hook lets a buff read and spend itself on a reaction's hit, so the burst's hit list is empty until one does.
- **The Spirit Envoy state waits on a stance that drains stamina.** Her charged attack's first press, when the state is ready, enters a deer state that drains 25 stamina a second, blocks dashing and ends on any other action. The kit has no stance that drains stamina or ends on an action, so that first press is not built, and the charged attack is always Spiritcall Prayer.
- **Her passives and constellations are not built.** Each reads the Pale Hymn, the Spirit Envoy or the Moonsign's level, or the Frostgrove Sanctuary's own timing.

## Key files

| File                                                             | Role                                                                                                                                                                                                                                |
| :--------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/laumaKit.ts` | `createLaumaKitBehaviour`, Lauma's strikes, charged attack, provisional plunges, Hymn of Hunting's press and Hymn of Eternal Rest's hold with its Frostgrove Sanctuary, RES shred and Lunar-Bloom hit, and her Moonsign Benediction |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/lauma), MIT: each strike's hitmark, animation and box, the charged attack's hit, animation and box, the press's hitmark, animation and circle, the Frostgrove Sanctuary's ticks, duration and circle, the RES shred and its duration, the hold's hitmark, animation, Dew and Lunar-Bloom hit, and the burst's animation, read from its attack, charge, skill and burst files, with its charge file for the stamina and its ascension file for the Moonsign Benediction.
- The proud skill groups' indices, read from gcsim's data file for the character, which lists each multiplier beside its group.
- [gcsim](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go), MIT: the plunges' timings and poise, borrowed as Lauma's own folder has no plunge file.
