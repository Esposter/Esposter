---
title: Yoimiya
description: Yoimiya's kit as built, with Niwabi Fire-Dance's Pyro infusion and Naganohara Meteor Swarm's initial hit, and what is left of her passives, her constellations and Aurous Blaze.
---

# Yoimiya

Yoimiya's kit is one module, `createYoimiyaKit`, on avatar 10000049: five strikes, a fully charged shot, a collision and two plunges, Niwabi Fire-Dance's Pyro infusion, and Naganohara Meteor Swarm's initial hit. Her multipliers are read from proud skill groups 4931, 4932 and 4939; Niwabi Fire-Dance's seconds and cooldown, and the burst's cooldown and energy cost are read from the same groups. Her passives and constellations are unbuilt, nor Aurous Blaze's explosion or the multiplier Niwabi Fire-Dance gives her Normal Attacks. The plunges' timing is provisional.

## Decisions

- **Yoimiya's Niwabi Fire-Dance multiplies her Normal Attacks, which an infusion cannot carry.** gcsim scales each Normal Attack's multiplier by the skill's 137.9% while the infusion stands. An infusion here only sets the element, so her Normal Attacks keep their own multipliers, and the infusion is built without that scale. Aurous Blaze's explosion lands on another character's hits, an event no kit reads yet, so the burst's initial hit is all of the burst that is built.

## Key files

| File                                                               | Role                                                                                                                                       |
| :----------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/yoimiyaKit.ts` | `createYoimiyaKit`, Yoimiya's kit with Niwabi Fire-Dance's Pyro infusion, her fully charged shot and Naganohara Meteor Swarm's initial hit |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/yoimiya), MIT: the kit's hitmarks, cancel frames and areas, the fully charged shot's frames, Niwabi Fire-Dance's animation, and Naganohara Meteor Swarm's initial hit and animation.
