# Flins

Flins's kit is its record and one behaviour module, `createFlinsKitBehaviour`, on avatar 10000120: his five strikes, a charged attack, a plunge collision and two plunges, Manifest Flame's press, which starts the stance, and Cometh the Night's initial and final hits. His multipliers are read from proud skill groups 12031, 12032 and 12039, matching gcsim's to six decimal places. From the same groups come the charged attack's stamina, the burst's energy cost and the skill's cooldown. The burst's cooldown is gcsim's 15 seconds, not the table's 20, as the decisions below give.

## Decisions

- **Flins's strikes are physical, with no travel, and land on their hitmarks.** Each is queued by gcsim at its hitmark, so the hits land at 11, 11, 16, 20, 29 and 29 frames, with the fourth strike's two at 20 and 29 and the fifth's at 29, in animations of 31, 31, 45, 67 and 68 frames. The first two are boxes of 1.3 by 3.2 and 2 by 3.8 metres, and the rest circles of 2.8 metres, each offset as gcsim gives it.
- **His charged attack is a box of 4 by 6 metres on the body's near edge, at 28 frames in an animation of 60.** It is physical, and costs 25 stamina, read from the table's index after its multiplier as the other kits' charged attacks read theirs.
- **Manifest Flame's press plays no hit of its own, and starts the stance.** gcsim's Arcane Light deals no damage, so the press builds no hit, and the stance it starts lasts the 10 seconds the table gives. During the stance his strikes and charged attack are Electro, at the skill's multipliers, and the strikes keep their hitmarks and reaches. Swapping him out ends the stance, which gcsim's exit from the field deletes.
- **The stance keeps the kit's own press and burst, as Raiden's Musou Isshin does.** Northland Spearstorm, which the stance's skill would be, waits on the hook below, so the press stands in for it until then. Pressing it inside the stance restarts the stance, where gcsim fires Spearstorm, so that one press differs until Spearstorm is built.
- **Cometh the Night's initial hit lands at 93 frames, and its final at 164, in an animation of 130.** Both are circles of 7 metres round the body, Electro at one unit of gauge. gcsim queues the final 71 frames after the initial, so it lands past the animation, as the framework allows.
- **The burst's cooldown is gcsim's 15 seconds.** gcsim sets the cooldown at 15 seconds, where the game's table reads 20. The kit ships gcsim's value until a recording settles it, and the question is on the [roadmap](../../../../changes/genshin-roadmap/tasks.md).
- **His plunges are provisional.** No gcsim plunge file exists for Flins, so his timing and poise are Nahida's, which are Bennett's, on the shared plunge reach and his own table's multipliers. The question sits on the [roadmap](../../../../changes/genshin-roadmap/tasks.md).

- **Whispering Flame, from Ascension 4, is a passive bonus to his Elemental Mastery of 8% of his ATK, to at most 160.** It is read through the kit's passive hook from his ATK as it stands, and the bonus is flat, as the attribute total takes it.

## Not built

- **Northland Spearstorm waits on a stance's own skill cooldown.** Inside the stance, the skill is a box of 4 by 6 metres at 23 frames, Electro, on the table's skill multiplier at index 6. It has a cooldown of 6 seconds of its own, which a stance's action cannot hold yet, so the kit keeps the press in its place until the framework can give a stance's skill its own cooldown.
- **Thunderous Symphony waits on the Lunar-Charged hook.** For six seconds after Spearstorm, the burst is a Lunar-Charged hit and an extra one at moonsign level 2. Both hits are Lunar-Charged, which the kit does not price yet, so the burst stays Cometh the Night.
- **Cometh the Night's middle hits wait on the Lunar-Charged hook.** Its two middle hits, four at moonsign level 2, are Lunar-Charged, so the kit builds its initial and final hits alone.
- **His Ascension 1 passive, and Constellations 1, 2 and 6, are not built.** Most of them read the Lunar-Charged reaction, and Constellation 1 shortens Spearstorm's cooldown, which waits with Spearstorm. Constellation 4's ATK is built as a passive bonus; its Elemental Mastery part is 10% of his total ATK up to 220, and a passive bonus is given only the combatant and its health share, not the ATK total, so it is not built.

## Key files

| File                                                             | Role                                                                                                                                                              |
| :--------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/flinsKit.ts` | `createFlinsKitBehaviour`, Flins's strikes, charged attack, provisional plunges, Manifest Flame's press and stance, and Cometh the Night's initial and final hits |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/flins), MIT: each strike's hitmark, animation and reach, the charged attack's box, hitmark and animation, Manifest Flame's press and stance, and Cometh the Night's hitmarks, animation and circle, read from gcsim's `attack.go`, `charge.go`, `skill.go` and `burst.go`; `cons.go` and `asc.go` hold the mechanics still waiting on hooks.
- The proud skill groups' indices, read from gcsim's data file for the character, which lists each multiplier beside its group.
- [gcsim](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go), MIT: the plunges' timings and poise, borrowed as Flins's own folder has no plunge file.
