---
title: Thoma
description: Thoma's kit as built: Blazing Blessing's hit, shield and Pyro infusion and Crimson Ooyoroi's initial hit, with Fiery Collapse, his passives and his constellations left unbuilt.
---

# Thoma

Thoma's kit is one module, `createThomaKit`, on avatar 10000050: four strikes, a charged attack, a collision and two plunges, Blazing Blessing's hit with its shield and Pyro infusion, and Crimson Ooyoroi's initial hit. His multipliers are read from proud skill groups 5031, 5032 and 5039; Blazing Blessing's shield seconds and cooldown, the burst's seconds, cooldown and energy cost, and the charged attack's stamina are read from the same groups. The shield is set from his Max HP and the table's share and flat HP, and his Pyro infusion lasts the 30 frames gcsim gives it. Fiery Collapse, his passives and his constellations are not built. The plunges' timing, the charged attack's stamina and the burst's energy cost are provisional.

## Decisions

- **Thoma's Fiery Collapse fires on a shielded character's damage, which no kit event reaches yet.** gcsim triggers it on each hit a shielded character takes, behind a one-second internal cooldown, and it sets off a shield of its own. The kit builds Crimson Ooyoroi's initial hit and leaves Fiery Collapse and its shield out. Blazing Blessing's shield is set at its table value without a cap for a recast, as the kit's shields replace each other, where gcsim caps it at the table's maximum.

## Key files

| File                                                             | Role                                                                                                                                                       |
| :--------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/thomaKit.ts` | `createThomaKit`, Thoma's kit with Blazing Blessing's hit, shield and Pyro infusion, and Crimson Ooyoroi's initial hit, his charged attack and his plunges |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/thoma), MIT: the kit's hitmarks, cancel frames and areas, the charged attack's frames, Blazing Blessing's hit, animation and shield, and Crimson Ooyoroi's initial hit and animation.
