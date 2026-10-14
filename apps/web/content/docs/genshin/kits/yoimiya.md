---
title: Yoimiya
description: Yoimiya's kit as built, with Niwabi Fire-Dance's Blazing Arrows and Ryuukin Saxifrage's initial hit with Aurous Blaze and its explosion, and her passives and constellations left unbuilt.
---

# Yoimiya

Yoimiya's kit is its record and one behaviour module, `createYoimiyaKitBehaviour`, on avatar 10000049: five strikes, a fully charged shot, a collision and two plunges, Niwabi Fire-Dance's Blazing Arrows, and Ryuukin Saxifrage's initial hit with Aurous Blaze. Her multipliers are read from proud skill groups 4931, 4932 and 4939; Niwabi Fire-Dance's seconds, cooldown and Normal Attack multiplier, Aurous Blaze's seconds and its explosion's multiplier and internal cooldown, and the burst's cooldown and energy cost are read from the same groups. The plunges' timing is provisional.

Niwabi Fire-Dance is a stance for the table's 10 seconds whose strikes deal Pyro, 1U under the Normal Attack internal cooldown, each hit's multiplier raised by the skill's 137.9%; it ends as she leaves the field. The burst's hit marks the first enemy it strikes with Aurous Blaze for 10 seconds. While the mark stands, a hit another member deals the enemy as a kind of attack sets off an explosion round it a frame later, 1U of Pyro priced by Yoimiya and dealt as Elemental Burst DMG, then not again on that enemy for 2 seconds. Her passives and constellations are not built.

## Decisions

- **Yoimiya's plunges land 0.4 seconds after they start.** gcsim gives her plunges no timing, so her reaches and landing are Ganyu's.
- **Niwabi Fire-Dance is a stance, not an infusion.** gcsim scales each Normal Attack's multiplier by the skill's 137.9% and makes it Pyro, and leaves her aimed shots and plunges alone. An infusion only sets the element, and on her charged attack and plunges too, so the skill is a stance whose normal attacks are the Blazing Arrows, each hit its strike's at the raised multiplier.
- **Aurous Blaze answers the damage the team deals, not every hit gcsim sees.** The mark is an enemy status, and the explosion answers the damage taken that the kit events report. A hit that carries a kind of attack, a normal or charged attack, a plunge, a skill or a burst, sets it off, as gcsim's six attack tags do, whether an action or a summon deals it. A summon whose kit names no kind and a reaction's own damage carry none, so they do not. The explosion is Elemental Burst DMG, gcsim's tag for it, and as it is Yoimiya's own it sets off no other.

## Key files

| File                                                               | Role                                                                                                                                                                                |
| :----------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/yoimiyaKit.ts` | `createYoimiyaKitBehaviour`, Yoimiya's kit with Niwabi Fire-Dance's Blazing Arrows, her fully charged shot, and Ryuukin Saxifrage's initial hit with Aurous Blaze and its explosion |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/yoimiya), MIT: the kit's hitmarks, cancel frames and areas, the fully charged shot's frames, Niwabi Fire-Dance's animation, the Normal Attacks alone it makes Pyro and multiplies, and its end as she leaves the field, Ryuukin Saxifrage's initial hit and animation, and Aurous Blaze's mark on the first enemy struck, the attacks that set it off, and its explosion's delay, circle, gauge and poise.
