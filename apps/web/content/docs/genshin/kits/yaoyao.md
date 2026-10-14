---
title: Yaoyao
description: Yaoyao's kit as built, with her four strikes, charged attack and plunges, and Moonjade Descent's initial hit, and what is left to build: her Yuegui and its radishes, and her passives and constellations.
---

# Yaoyao

Yaoyao's kit is its record and one behaviour module, `createYaoyaoKitBehaviour`, on avatar 10000077: four strikes, the third of two hits, a charged attack, then a collision and two plunges after it, her skill's cast and Moonjade Descent's initial hit. Her multipliers are read from proud skill groups 7731, 7732 and 7739; the charged attack's stamina, the skill's cooldown, and its cooldown and energy cost come from the same groups. The first strike is a box of 1.2 by 3 metres, the second and third fans of 270 degrees, and the fourth a circle of radius 2.2. Her skill's cast takes 52 frames and cools down for 15 seconds, and Moonjade Descent costs 80 energy with a 20-second cooldown.

Her skill throws a Yuegui that flings White Jade Radishes at enemies, each healing the active character when it lands near them, and her burst throws three more Yuegui. Those radishes and their healing are not built: a summon's hits pick their enemy once, at its cast, where gcsim picks one within 8 metres of the Yuegui at each throw, and the healing needs the radish's landing point to reach the active character. The hook is a summon whose target is chosen again at each hit, with the healing a summon's hit can give the team. Her passives and constellations are not built either. Her plunge timings are provisional.

## Decisions

- **Yaoyao's fourth strike reaches 2.7 metres ahead of the body.** gcsim's code gives the strike a circle of radius 2.2 at an offset of 0.5, which the kit prices as 2.7; its config's 1.5 offset would reach 3.7.
- **Yaoyao's plunges land 0.4 seconds after they start.** her plunges take Ganyu's reaches and landing, as gcsim gives her plunges none.

## Key files

| File                                                              | Role                                                                                                                                       |
| :---------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/yaoyaoKit.ts` | `createYaoyaoKitBehaviour`, Yaoyao's kit with her strikes, charged attack and plunges, her skill's cast and Moonjade Descent's initial hit |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/yaoyao), MIT: Yaoyao's strikes' hitmarks, reaches and cancel frames, the charged attack's circle and frames, the skill's cast animation, and Moonjade Descent's circle, animation and frames.
