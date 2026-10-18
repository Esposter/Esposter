# Iansan

Iansan's kit is its record and one behaviour module, `createIansanKitBehaviour`, on avatar 10000110: her three strikes and charged attack, a plunge collision with two plunges, and the hits of the skill's activation and the burst. Her multipliers are read from proud skill groups 11031, 11032 and 11039, matching gcsim's to four decimal places. Her skill cools for 16 seconds, her burst for 18 at 70 energy, and her charged attack costs 25 stamina.

## Decisions

- **Her strikes land at their hitmarks, with no travel.** gcsim queues each strike's damage at its hitmark, so the strikes land at 14, 7 and 22 frames in animations of 27, 31 and 55 frames. The first is a fan of 260 degrees and 1.75 metres centred 0.4 metres ahead of the body, the second a circle of 2 metres centred 0.5 metres ahead, and the third a box of 2.2 metres by 3 on its near edge 0.5 metres behind the body, with 59.896 blunt poise. They are Physical, so they carry no gauge.
- **Her second and third strikes' areas are `Unsourced`.** The second's 2.5 is its circle's 2 plus the 0.5 offset, and no line gives that sum. The third is a box, which has no constructor to cite. The published values stand. The first's fan matches gcsim's, so it carries no entry.
- **Her charged attack is a circle of 0.8 metres centred on the primary target at 21 frames, in an animation of 55.** It is Physical, with no poise, as gcsim gives it. The kit takes the normal charged attack only: the Swift Stormflight that replaces it while the Nightsoul state runs waits on that hook, below.
- **Her skill's activation hit is a circle of 0.8 metres centred on the primary target at 9 frames, in an animation of 137 frames.** It is Electro at one unit of gauge and has no poise, as gcsim gives it.
- **Her burst's hit is a circle of 5 metres round the body at 38 frames, with 180 blunt poise, in an animation of 45 frames.** It is Electro at one unit of gauge, as gcsim's 25 durability gives it.
- **Her plunges are provisional.** gcsim has no plunge file for Iansan, so they take the standard borrowed plunge ([how a kit is read](../README.md#how-a-kit-is-read)). A recording of them would settle it; the [roadmap](../../../../changes/genshin-roadmap/tasks.md) holds the question.

## Not built

- **The Nightsoul state waits on its hook.** Her skill's press enters a timed state three frames after it, in which her Nightsoul points drain and her charged attack becomes the Electro Swift Stormflight. Her burst adds points and gives the party a flat ATK bonus converted from her ATK, up to her table's maximum, on whichever character is active. The points and the conversion wait on the Nightsoul state hook, and until then the press deals only its activation hit. The conversion of her ATK into a bonus on the active character waits on the party ATK buff hook, since a kit's buff holds a fixed amount.
- **Ascension 1, Ascension 4 and Constellations 1, 2, 4 and 6 wait on the Nightsoul state hook.** Each reads the points the state holds, the state itself or the party ATK bonus.

Talent levels and constellations are read at the level the kit is built at: raising them is the [talents](../../../../changes/genshin-talents/design.md) and [constellations](../../../../changes/genshin-constellations/design.md) pages'.

## Key files

| File                                                              | Role                                                                                                                                                                                              |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/iansanKit.ts` | `createIansanKitBehaviour`, Iansan's strikes, charged attack, provisional plunges, the skill's activation hit and the burst's hit, the Nightsoul state and party ATK bonus waiting on their hooks |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/iansan), MIT: the hitmark and animation of each strike, the charged attack's hit and animation, the skill's activation and animation, and the burst's hit and animation, read from its attack, charge, skill and burst files, with its constellation and ascension files for the mechanics waiting on their hooks.
- The proud skill groups' indices, read from gcsim's data file for the character, which lists each multiplier beside its group.
