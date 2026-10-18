# Aino

Aino's kit is its record and one behaviour module, `createAinoKitBehaviour`, on avatar 10000121: her three strikes and charged attack, a plunge collision and two plunges, Musecatcher's two stages, and Cool Your Jets Ducky's Water Balls with the Ascension 4 Elemental Mastery bonus. Her multipliers are read from proud skill groups 12131, 12132 and 12139. Her skill's cooldown of 10 seconds, the burst's cooldown of 13.5 and energy cost of 50 are read from the same groups, and they match gcsim's values.

## Decisions

- **Her strikes land at their hitmarks, with no travel.** gcsim queues each strike's damage at its hitmark, so the strikes land at 23, 20 and 35 and 43 frames, in animations ending at 48, 75 and 93 frames. Their poise is gcsim's, 88.923, 88.512 and 48.3 per hit. The third strike's first hit is a box of 2.5 by 3.5 metres one metre behind the body, and its second a circle of radius 2, as gcsim's boxes are drawn. Her strikes are physical, so they carry no element.
- **Her charged attack is provisional.** gcsim implements no charge for Aino, so her charged attack borrows Ayato's measured claymore charge, as Gaming's does, 55 frames, a hit at 24, and the reach of a target within the strike area. Its multiplier is the table's at index 4, and its stamina is the table's at index 5, 40, which the layout of the group places by Gaming's. The question is on the [roadmap](../../../../changes/genshin-roadmap/tasks.md).
- **Her plunges are provisional.** Aino has no gcsim plunge file; her plunges use Bennett's timings and poise like Lauma's, under her own multipliers at table indices 7, 8 and 9, and the [roadmap](../../../../changes/genshin-roadmap/tasks.md) holds the question.
- **Musecatcher's second stage is struck from the body.** gcsim centres its second stage on the body, a circle of radius 3.5 1.2 metres ahead, and does not carry its poise, as its stage's attack is copied before its own values are set. The kit gives it no poise either, and both stages are Hydro, gauge 1.
- **Cool Your Jets Ducky drops ten Water Balls.** gcsim drops one every 90 frames from 123 frames for 14.2 seconds, the last at 933 frames, each landing 10 frames after it falls. Each ball strikes a random enemy within 10 metres of the body, which the kit cannot draw, so each ball's reach is the area it could land in, 11 metres round the body, as Ayato's ticks are. The 11 metres is the field's radius of 10, at `burst.go:44`, plus the ball's hitbox of 1, at `config.yml:87`, and no line gives the sum, so the overlay marks it `Unsourced`. The burst's 14.2 seconds are cited at `burst.go:46`, its 852 frames as `14.2*60`, and Ascension 4's half at `asc.go:19`. A ball against several enemies therefore overstates its damage.
- **Her skill's two multipliers are `Unsourced`.** gcsim reads them by level from its skill table, `skill.go:46`, and no line gives the proud skill group's index the join names, so their causes say so and the published values stand.
- **Ascension 4 adds half her Elemental Mastery to each Water Ball.** gcsim's `a4Dmg` is read as the balls are cast, and the kit reads the striker's Elemental Mastery the same way.

## Not built

- **Ascension 1 at Ascendant Gleam drops the balls every 0.7 seconds, each landing with a 4 metre radius.** gcsim's `aino/asc.go` gives the balls that interval and radius, read as the burst is cast. The landing circle's reach is the kit's proxy for the random enemy a ball falls on: the 10 metre search plus the ball's radius, which is 11 metres at the base and 14 at Ascension 1. gcsim also gives those Moonsign hits an internal cooldown of their own, which the kit has no tag for, so these balls strike with none, as the base balls do.
- **Constellation 6's Lunar DMG bonus waits on the Lunar hook.** Its bonus reads the Lunar reactions and the Moonsign's level.
- **Constellation 2's extra ball waits on a hook that reads another member's hits.** It strikes each enemy another member hits while the burst lasts, and the kit has no hook for another member's hits yet.
- **Constellation 1's Elemental Mastery and Constellation 4's energy are not built.** Constellation 1 gives the active member Elemental Mastery for fifteen seconds after a skill or burst, which the kit does not yet re-add on each swap; Constellation 4 gives her energy on the skill's hits every ten seconds, which the kit has no status for yet.
- **Musecatcher's hold is not built, as gcsim does not implement it either.** Her skill's particles are not granted by the kit.
- **Her Ascension 1 passive, Modular Efficiency Protocol, is built as the burst's enhancement at Ascendant Gleam.** The field's interval and radius are fixed at its cast, so the level is read as the burst is cast, as gcsim reads it. Her Ascension 4 passive, Structured Power Booster, is built as the water ball's Elemental Mastery bonus. The talent levels above the level the kit is built at are the [talents](../../../../changes/genshin-talents/design.md) and [constellations](../../../../changes/genshin-constellations/design.md) pages'.

## Key files

| File                                                            | Role                                                                                                                                                   |
| :-------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/ainoKit.ts` | `createAinoKitBehaviour`, Aino's strikes, provisional charged attack and plunges, Musecatcher, and Cool Your Jets Ducky's Water Balls with Ascension 4 |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/aino), MIT: each strike's hitmark, animation, poise and shape, Musecatcher's stages, and Cool Your Jets Ducky's interval, duration, radius and landing delay, read from `attack.go`, `skill.go`, `burst.go` and `asc.go`.
- The proud skill groups' indices, read from gcsim's data file for the character, and the group values of the hosted game data.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/ayato), MIT: the claymore charge's frames and reach, borrowed as Aino's charged attack's are provisional.
- [gcsim](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go), MIT: the plunges' timings and poise, borrowed as Aino's own folder has no plunge file.
