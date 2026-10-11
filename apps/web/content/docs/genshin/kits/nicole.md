---
title: Nicole
description: Nicole's kit as built: her three strikes, charged attack, plunges, Pyro skill and Pyro burst's hit, with her burst's projections and passives left waiting on their hooks.
---

# Nicole

Nicole's kit is its record and one behaviour module, `createNicoleKitBehaviour`, avatar 10000131: three normal attacks, a charged attack, a collision and two plunges, her skill's hit, and the burst's hit. Her skill and burst are Pyro.

Her skill and burst are read from proud skill groups as their talent multipliers, and her cooldowns, energy cost and charged stamina are read from the table: 16 seconds, 15 seconds, 60 energy and 50 stamina.

gcsim sources: `nicole/attack.go`, `charge.go`, `skill.go` and `burst.go`, with the table data in gcsim's Nicole data file.

## Decisions

- **The burst's hit is priced round the targeting zone.** Her burst is a circle of 6.5 metres on her primary target, which an area holds as the targeting zone's radius plus its own, 21.5 metres, as `TargetCentred`.
- **The skill's hit is a circle of 5 metres round her body**, recorded by hand as `Unclassified` as its hitbox is not named as gcsim's press names are.

## Not built

- **The burst's projections wait on the projection hook.** Each projection is a copy of a character's skill that Nicole's burst asks of that character, which a kit cannot read yet. The record holds her burst's own hit alone.
- **Her passives wait on their hooks.** Each one reads her projections or the party's Elemental Resonance, so none is built.

## Key files

| File                                                              | Role                                                                                       |
| :---------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/nicoleKit.ts` | `createNicoleKitBehaviour`, Nicole's module, built on her record and with no behaviour yet |
| `packages/genshin-world/src/data/kits/nicole.json`                | Nicole's overlay: the areas gcsim's hitboxes do not give by name                           |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/nicole), MIT: her strikes' hitmarks and cancels, the charged attack, the skill, the burst and their elements, and her table data file.
