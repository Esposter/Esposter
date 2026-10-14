---
title: Durin
description: Durin's kit as built, with his four strikes, charged attack, provisional plunges, Tap E's window, the Confirmation of Purity and Denial of Darkness recasts, and both Dragon bursts, and what is left waiting on the passive and particle hooks.
---

# Durin

Durin's kit is its record and one behaviour module, `createDurinKitBehaviour`, on avatar 10000123: his four strikes, a charged attack, a plunge collision and two plunges, Tap E, which opens a six-second window, its two recasts, and As the Light Shifts and As the Stars Smolder, the burst the Denial of Darkness recast switches to. His multipliers are read from proud skill groups 12331, 12332 and 12339, matching gcsim's to six decimal places. The same groups give the charged attack's stamina, the burst's energy cost and cooldown, and the skill's cooldown.

## Decisions

- **Durin's strikes are physical and land on their hitmarks, with no travel.** gcsim queues each at its hitmark, so the four strikes land at 11, 9, 14 and 37, and 38 frames, in animations of 29, 30, 55 and 66 frames. The first three are circles of 2.15, 2.15 and 2.4 metres, and the last a box of 3.3 by 4.8 metres, every one offset as gcsim has it.
- **His charged attack is a circle of 2.5 metres centred 0.8 metres ahead, at 17 frames in an animation of 58.** It is physical, and costs 20 stamina, read from the table's index after its multiplier.
- **Tap E plays no hit of its own, and opens the window.** gcsim's Tap E deals no damage, so the press builds no hit. It starts a window of six seconds, a stance of Denial of Darkness for his normal attacks, and a skill chain whose one follow-up is Confirmation of Purity. Its cooldown is the table's 12 seconds.
- **Confirmation of Purity is the skill's recast, a Pyro circle of 4.5 metres centred 1.2 metres ahead, at 35 frames in an animation of 83.** It ends the window and the Denial of Darkness status, and gives the skill's energy of 6 once every six seconds, as gcsim's energy ICD does.
- **Denial of Darkness is the window's normal attack, three Pyro hits at 32, 37 and 42 frames in an animation of 67.** Each hit is a box 3 metres wide and 7 long, anchored 3 metres behind the body. It ends the window, gives the same energy, and starts the Denial of Darkness status for 30 seconds, which sets the burst to As the Stars Smolder.
- **As the Light Shifts and As the Stars Smolder hit at 97, 121 and 154 frames, in an animation of 104.** Each is a circle of 6.5 metres round the body, Pyro at one unit of gauge. The Dragon's DoT is a summon of sixteen or twenty ticks on the primary target: the white's ticks are circles of 3.5 metres, from 155.2 frames at 58.8 frames apart, and the black's circles of 1.5 metres, from 175.4 frames at 73.6 apart, each travelling 9 frames after its tick, gcsim's default travel. A new burst ends the Dragon of the other.
- **The burst's cooldown is 18 seconds and its energy cost 70, both from the table.** gcsim's energy cost is the character's maximum energy, which agrees with the table's 70.
- **His plunges are provisional.** Durin has no plunge file in gcsim; the kit shares the plunge reach and borrows Bennett's timings and poise as Flins's and Lauma's do, under his own multipliers. The [roadmap](/docs/genshin/roadmap) holds the question.
- **The black burst's travel is fixed at gcsim's default of 9 frames.** gcsim reads a `travel` parameter on the burst, and the kit cannot read a parameter of the action yet, so it plays the default.

## Not built

- **His passives and constellations are not built.** They read the burst's state, the Burning and Pyro reactions and the team's buffs, none of which a passive prices yet, so the kit prices his strikes, recasts and bursts without them.
- **The Pyro particles of his recasts are not built.** gcsim drops four Pyro particles on each enemy his recasts strike, once every 0.3 seconds, delayed by the particle delay. A kit's hit has no particle drop with its own delay and internal cooldown, so the energy the recasts give is built, and the particles wait on that hook.
- **A skill press after Denial of Darkness, within the window's remaining seconds, plays Confirmation of Purity.** gcsim's Denial of Darkness ends the window, so the next press is Tap E, which the skill's cooldown holds. A kit's skill chain is not ended by its stance's normal attack, so the press still reads the chain's follow-up until the window's seconds run out. This differs from gcsim only in that press, and it waits on a hook that lets a stance end a skill chain.

Talent levels and constellations are read at the level the kit is built at: raising them is the [talents](/docs/proposals/genshin/talents) and [constellations](/docs/proposals/genshin/constellations) pages'.

## Key files

| File                                                             | Role                                                                                                                                                                |
| :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/durinKit.ts` | `createDurinKitBehaviour`, Durin's strikes, charged attack, provisional plunges, Tap E's window and its recasts, and the two Dragon bursts with their status switch |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/durin), MIT: each strike's hitmarks, animation and reach, the charged attack's circle, hitmark and animation, Tap E's window, both recasts and Denial of Darkness's status, and the bursts' hitmarks, animations and DoT schedules, read from `attack.go`, `charge.go`, `skill.go` and `burst.go`, with `cons.go` and `asc.go` for the mechanics waiting on their hooks.
- The proud skill groups' indices, read from gcsim's data file for the character, which lists each multiplier beside its group.
- [gcsim](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go), MIT: the plunges' timings and poise, borrowed as Durin's own folder has no plunge file.
