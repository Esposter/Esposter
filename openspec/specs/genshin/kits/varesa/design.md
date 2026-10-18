# Varesa

Varesa's kit is its record and one behaviour module, `createVaresaKitBehaviour`, avatar 10000111: her three strikes, a charged attack, Rush as her skill with two charges, Flying Kick as her burst, and a low, high and collision plunge, all as she plays them outside her Nightsoul Blessing. Her multipliers are read from proud skill groups 11131, 11132 and 11139. Her charged attack costs 50 stamina, Rush cools for 9 seconds, and Flying Kick costs 70 energy with an 18-second cooldown.

## Not yet built

Her Fiery Passion forms, the apex state that opens Volcanic Kablam and the Follow-Up Strike wait on a skill variant and a Rush follow-up hook the kit lacks. Her Nightsoul points and the timed Blessing a full set enters are built (see Decisions).

- **The Fiery Passion forms need a skill variant.** Inside the blessing Rush is Fiery Passion Rush, a different multiplier and a 2-frame hitmark, and Flying Kick is Fiery Passion Flying Kick. The burst's form fits the kit's burst variant, which the kit can hold; Rush's needs a skill variant, which the record has no slot for.
- **Her plunge chain's apex state waits on the apex hook.** gcsim's plunges set an apex state, which opens Volcanic Kablam, the short burst that follows a plunge. The plunges built here give the Nightsoul points but not the apex state, so Volcanic Kablam is not built.
- **The Follow-Up Strike waits on a Rush follow-up hook.** After Rush, her charged attack lands at 11 frames and costs no stamina, from a status Rush sets. A kit holds no charged attack variant to swap in, so the charged attack built here is the one without the follow-up.
- **Her Ascension 1 and 4 and Constellations 1, 2, 4 and 6 wait on the apex and follow-up hooks.** Ascension 1 adds a share of her ATK to each plunge while a status holds, Ascension 4 stacks ATK on each Nightsoul burst, and the constellations read the apex state, Kablam or her plunges' energy, so none is built.

## Decisions

- **Her Nightsoul points gain on each action's start, and a full set enters the Blessing for 15 seconds.** Her skill's press gives 20 points, her high and low plunges 25 each, and her burst fills them to 40; a full set outside the Blessing enters it with those points, which gcsim's `generatePlungeNightsoul` does (`varesa.go`). Her skill's gain only adds points, as gcsim's does (`skill.go`). gcsim lands each plunge's points at its hitmark, and the kit applies them when the plunge starts, which the kit's plunge hooks give.
- **The strikes are gcsim's outside the blessing.** The first and second strikes are boxes and the third a circle, each centred as gcsim centres it, with a box priced as its far corner as the framework prices a box.
- **Her charged attack keeps its own internal cooldown.** gcsim gives it the tag `VaresaCombatCycle` (`charge.go`, line 61), so it counts apart from her normal attacks, as the framework's tags keep a character's normal attacks, skill and burst apart.
- **Strikes and the charged attack give no poise.** gcsim gives Varesa's normal attacks and plunges none, so each reads 0, following the framework's rule for an absent poise.
- **The plunges are the airborne ones.** gcsim plays a high plunge from a charged attack at 37 frames and from the air at 38, and the low plunge at 37 from the air, so the kit takes the airborne frames for both: the high at 38 frames of a 77-frame animation, and the low at 37 of 75. The collision is 6 frames before the high's first hit, at 31.
- **Rush's box is gcsim's, marked provisional.** gcsim queues Rush as a box 0.1 metres wide and 2 metres long centred on the primary target and marks it "TODO: approximated". The kit ships it as gcsim gives it, priced as the target's reach plus the box's far corner. The roadmap's manual verification has the question.
- **Rush's particles are not built.** Its hit gives particles in gcsim, which the framework does not yet produce, so Rush's energy is not generated, as the kit page's shared gap records.

## Key files

| File                                                              | Role                                                                                                                                                          |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/varesaKit.ts` | `createVaresaKitBehaviour`, Varesa's three strikes, charged attack, Rush, Flying Kick and plunges, with her Nightsoul points and the timed Blessing they fill |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/varesa), MIT, at v2.47.2: the three strikes' hitmarks, cancels and reaches, the charged attack and its frames, the plunges' frames and reaches, Rush, Flying Kick, and the Nightsoul points and blessing (`varesa.go`, `skill.go`, `burst.go`, `plunge.go`).
