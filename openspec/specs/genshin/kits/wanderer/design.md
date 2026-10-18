# Wanderer

Wanderer's kit is its record and one behaviour module, `createWandererKitBehaviour`, on avatar 10000075: three strikes, a charged attack, a collision and two plunges, Hanega: Song of the Wind with its Anemo circle, which sets Windfavored on the team for ten seconds, and Kyougen: Five Ceremonial Plays, five strikes on the target from 92 frames. His multipliers are read from proud skill groups 7531, 7532 and 7539; the charged attack's stamina, the skill's cooldown, and the burst's cooldown and energy cost are read from the same groups. While Windfavored holds, his strikes and charged attack take the skill's bonus, and his burst plays its falling animation. Windfavored's ten seconds are the skydweller points' hundred at six frames each, which the kit takes as the state's full length, with no drain for his Dash and Jump. Those, the swap lock on his skill, and his Ascension and Constellation passives are not built. His high plunge takes Bennett's timings and poise, as gcsim gives Wanderer no high plunge; this is provisional.

## Decisions

- **Wanderer's high plunge takes Bennett's timing and poise.** gcsim gives him a low plunge and its collision but no high plunge, so his high plunge lands at Bennett's 38 frames with 150 poise and his own multiplier, as `wandererKit.ts` writes it; his animation showing otherwise would move it.

## Framework pieces not built

Wanderer's Dash, Jump and swap lock wait on three framework pieces that the kit layer does not have. Each is listed so it can be scheduled; none is built here.

- **A stance's own dash and jump.** Windfavored plays its own dash and jump in place of the kit's, but `KitStanceRecord` has no slot for either (its fields are `burst`, `chargedAttack`, `chargedAttackStamina`, `normalAttacks` and `skill`), and `KitStanceBehaviour` gives no hook for them. Needed: a `dash` and a `jump` slot on the stance record, read by the stance behaviour the way a kit's own dash hits are read for Xiao (`readHits("dash")`), and played while the stance holds. Unlocks the Dash and Jump while Windfavored.
- **A stance resource drained by actions.** Windfavored lasts as long as its skydweller points, and the Dash and Jump drain them. The record holds the stance's seconds (`readSeconds("windfavored")`) but no points count and no drain per action, and the kit neither drains nor tracks the points. Needed: the starting count and the drain per action on the record, and a stance status that ends when the points run out. Unlocks the drain, and Constellation 2, which reads the points.
- **A swap lock.** The skill's swap lock is a restriction on switching out, which the kit cannot express: `KitSwapEndable` ends a status when its character leaves the field, but no kit model holds a swap back. Needed: a status that blocks a swap for its duration, started by the skill's `onStart` and ended with the stance. Unlocks the swap lock on his skill.

## Key files

| File                                                                | Role                                                                                                                                                                         |
| :------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/wandererKit.ts` | `createWandererKitBehaviour`, Wanderer's kit with his strikes, charged attack and plunges, Hanega: Song of the Wind's Windfavored stance, and Kyougen: Five Ceremonial Plays |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/wanderer), MIT: Wanderer's strikes' hitmarks, cancel frames and reaches, the charged attack, the low plunge with its collision, Hanega: Song of the Wind and Windfavored's strikes, charged attack and burst, Kyougen: Five Ceremonial Plays' hitmarks, and the skydweller points.
- [gcsim](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go), MIT: the high plunge's timings and poise, borrowed as gcsim gives Wanderer none.
