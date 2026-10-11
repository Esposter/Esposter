---
title: Kazuha
description: Kazuha's kit as built: Chihayaburu's press and hold, and Kazuha Slash with its Autumn Whirlwind, with the absorption-dependent passives and the Autumn Whirlwind's elemental ticks not built.
---

# Kazuha

Kazuha's kit is one module, `createKazuhaKit`, on avatar 10000047: five strikes, a charged attack of two slashes, a collision and two plunges, Chihayaburu's press and hold, and Kazuha Slash with its five-tick Autumn Whirlwind. His multipliers are read from proud skill groups 4731, 4732 and 4739; the charged attack's stamina, the skill's and hold's cooldowns, and the burst's cooldown and energy cost are read from the same groups. Constellation 1 takes a tenth off both skill cooldowns, and Constellation 6 gives him an Anemo infusion for five seconds after each press, hold or slash. His Ascension passives are not built: the absorption of Chihayaburu, the Swirl Elemental Mastery bonus and Constellation 2's field. The Autumn Whirlwind's elemental ticks are not built either, as they depend on the element the absorption takes. The poise of the skills, the burst and the collision is provisional.

## Decisions

- **Kazuha's Autumn Whirlwind ticks are built on the Anemo hit alone.** gcsim adds each tick's elemental damage from the element Chihayaburu absorbed, and the kit has no absorption check to read it from, so the elemental ticks wait on that check rather than being priced at a guessed element.

## Key files

| File                                                              | Role                                                                                                                             |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/kazuhaKit.ts` | `createKazuhaKit`, Kazuha's kit with Chihayaburu's press and hold, Kazuha Slash and its Autumn Whirlwind, and his constellations |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/kazuha), MIT: Kazuha's strikes' hitmarks and cancel frames, the charged attack's and plunges' frames and circles, Chihayaburu's press and hold, Kazuha Slash's hitmarks and circle, the Autumn Whirlwind's five ticks, and Constellations 1 and 6.
