# Wanderer

Wanderer's kit is its record and one behaviour module, `createWandererKitBehaviour`, on avatar 10000075: three strikes, a charged attack, a collision and two plunges, Hanega: Song of the Wind with its Anemo circle, which sets Windfavored on the team for ten seconds, and Kyougen: Five Ceremonial Plays, five strikes on the target from 92 frames. His multipliers are read from proud skill groups 7531, 7532 and 7539; the charged attack's stamina, the skill's cooldown, and the burst's cooldown and energy cost are read from the same groups. While Windfavored holds, his strikes and charged attack take the skill's bonus, and his burst plays its falling animation. Windfavored's ten seconds are the skydweller points' hundred at six frames each, which the kit takes as the state's full length, with no drain for his Dash and Jump. Those, the swap lock on his skill, and his constellation passives are not built. His Ascension 1 passive waits on Kuugoryoku points, which the kit does not track: its Hydro part raises the Kuugoryoku cap, and the contact that absorbs up to two enemy auras within five metres is not in the kit yet. His Ascension 4 Descent waits on the same points and on the mid-air acceleration of Dash and Jump, which the kit does not build. His high plunge takes Bennett's timings and poise, as gcsim gives Wanderer no high plunge; this is provisional.

## Decisions

- **Wanderer's high plunge takes Bennett's timing and poise.** gcsim gives him a low plunge and its collision but no high plunge, so his high plunge lands at Bennett's 38 frames with 150 poise and his own multiplier, as `wandererKit.ts` writes it; his animation showing otherwise would move it.

## Key files

| File                                                                | Role                                                                                                                                                                         |
| :------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/wandererKit.ts` | `createWandererKitBehaviour`, Wanderer's kit with his strikes, charged attack and plunges, Hanega: Song of the Wind's Windfavored stance, and Kyougen: Five Ceremonial Plays |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/wanderer), MIT: Wanderer's strikes' hitmarks, cancel frames and reaches, the charged attack, the low plunge with its collision, Hanega: Song of the Wind and Windfavored's strikes, charged attack and burst, Kyougen: Five Ceremonial Plays' hitmarks, and the skydweller points.
- [gcsim](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go), MIT: the high plunge's timings and poise, borrowed as gcsim gives Wanderer none.
