---
title: Heizou
description: Heizou's kit as built: his strikes, charged attack and plunges, Heartstopper Strike's press and full hold, and Fudou Style Vacuum Slugger, with Windmuster Iris and his passives and constellations left unbuilt.
---

# Heizou

Heizou's kit is one module, `createHeizouKit`, avatar 10000059: five strikes with the fourth's three hits, a charged attack, a collision and two plunges, Heartstopper Strike's press and its full hold with the Declension stacks and Conviction bonus, and Fudou Style Vacuum Slugger. His multipliers are read from proud skill groups 5931, 5932 and 5939; the charged attack's table index and stamina, the skill's and burst's cooldowns and the burst's energy cost are read from the same groups. The hold is gcsim's full charge, which releases at three seconds with four stacks. Windmuster Iris, which reads the enemy's aura, and his passives and constellations are not built.

## Decisions

- **Heizou's hold is gcsim's full charge, and his Windmuster Iris waits on the aura.** gcsim's Heartstopper hold charges its four Declension stacks over 180 frames, so the kit's hold is one level at three seconds, and a shorter hold reads as the press. Windmuster Iris explodes on the aura an enemy holds, which the kit's hits do not read, so it is not built. His strikes, charged attack, plunges and skill give no poise, as gcsim gives none.

## Key files

| File                                                              | Role                                                                                                                                    |
| :---------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/heizouKit.ts` | `createHeizouKit`, Heizou's kit with Heartstopper Strike's press and full hold, Fudou Style Vacuum Slugger, and his strikes and plunges |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/heizou), MIT: Heizou's strikes' hitmarks, reaches and cancel frames, the charged attack's frames and box, the plunges' frames and circles, Heartstopper Strike's hit, box and frames, its full hold's 180 frames and Declension and Conviction bonuses, and Fudou Style Vacuum Slugger's circle and hitmark.
