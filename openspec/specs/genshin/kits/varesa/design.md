# Varesa

Varesa's kit is its record and one behaviour module, `createVaresaKitBehaviour`, avatar 10000111: her three strikes, a charged attack, Rush as her skill with two charges, Flying Kick as her burst, and a low, high and collision plunge, all as she plays them outside her Nightsoul Blessing. Her multipliers are read from proud skill groups 11131, 11132 and 11139. Her charged attack costs 50 stamina, Rush cools for 9 seconds, and Flying Kick costs 70 energy with an 18-second cooldown.

## Not yet built

Her Nightsoul Blessing and its Fiery Passion forms, the points each Rush, Flying Kick and plunge gives, and the apex state that opens Volcanic Kablam all wait on the Nightsoul hook, which the framework lacks.

- **The Fiery Passion forms wait on the Nightsoul hook.** Inside the blessing her strikes, charged attack, Rush, Flying Kick and plunges are gcsim's Fiery Passion moves, which replace the ones built here. The blessing is entered from the Nightsoul points, so until the hook lands none of them is reached.
- **Her plunge chain waits on the Nightsoul hook.** gcsim gives each plunge 25 Nightsoul points and an apex state, which opens Volcanic Kablam, the short burst that follows a plunge. The plunges built here are the airborne ones without either, so the chain from a plunge to Kablam is not built.
- **Volcanic Kablam waits on the Nightsoul hook.** Its short burst is the apex state's, which the plunge chain sets, so the burst is built as Flying Kick alone.
- **The Follow-Up Strike waits on a Rush follow-up hook.** After Rush, her charged attack lands at 11 frames and costs no stamina, from a status Rush sets. A kit holds no charged attack variant to swap in, so the charged attack built here is the one without the follow-up.
- **Her Ascension 1 and 4 and Constellations 1, 2, 4 and 6 wait on the Nightsoul hook.** Ascension 1 adds a share of her ATK to each plunge while a status holds, Ascension 4 stacks ATK on each Nightsoul burst, and the constellations read the blessing, Kablam or her plunges' energy, so none is built.

## Decisions

- **The strikes are gcsim's outside the blessing.** The first and second strikes are boxes and the third a circle, each centred as gcsim centres it, with a box priced as its far corner as the framework prices a box.
- **Her charged attack keeps its own internal cooldown.** gcsim gives it the tag `VaresaCombatCycle` (`charge.go`, line 61), so it counts apart from her normal attacks, as the framework's tags keep a character's normal attacks, skill and burst apart.
- **Strikes and the charged attack give no poise.** gcsim gives Varesa's normal attacks and plunges none, so each reads 0, following the framework's rule for an absent poise.
- **The plunges are the airborne ones.** gcsim plays a high plunge from a charged attack at 37 frames and from the air at 38, and the low plunge at 37 from the air, so the kit takes the airborne frames for both: the high at 38 frames of a 77-frame animation, and the low at 37 of 75. The collision is 6 frames before the high's first hit, at 31.
- **Rush's box is gcsim's, marked provisional.** gcsim queues Rush as a box 0.1 metres wide and 2 metres long centred on the primary target and marks it "TODO: approximated". The kit ships it as gcsim gives it, priced as the target's reach plus the box's far corner. The roadmap's manual verification has the question.
- **Rush's particles are not built.** Its hit gives particles in gcsim, which the framework does not yet produce, so Rush's energy is not generated, as the kit page's shared gap records.

## Key files

| File                                                              | Role                                                                                                                                                                              |
| :---------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/varesaKit.ts` | `createVaresaKitBehaviour`, Varesa's three strikes, charged attack, Rush, Flying Kick and plunges outside her Nightsoul Blessing, with the blessing's forms on the Nightsoul hook |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/varesa), MIT, at v2.47.2: the three strikes' hitmarks, cancels and reaches, the charged attack and its frames, the plunges' frames and reaches, Rush, Flying Kick and the Nightsoul and apex states the hook waits on.
