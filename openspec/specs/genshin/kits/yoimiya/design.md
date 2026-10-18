# Yoimiya

Yoimiya's kit is its record and one behaviour module, `createYoimiyaKitBehaviour`, on avatar 10000049: five strikes, a fully charged shot, a collision and two plunges, Niwabi Fire-Dance's Blazing Arrows, and Ryuukin Saxifrage's initial hit with Aurous Blaze. Her multipliers are read from proud skill groups 4931, 4932 and 4939; Niwabi Fire-Dance's seconds, cooldown and Normal Attack multiplier, Aurous Blaze's seconds and its explosion's multiplier and internal cooldown, and the burst's cooldown and energy cost are read from the same groups. The plunges' timing is provisional.

Niwabi Fire-Dance is a stance for the table's 10 seconds whose strikes deal Pyro, 1U under the Normal Attack internal cooldown, each hit's multiplier raised by the skill's 137.9%; it ends as she leaves the field. The burst's hit marks the first enemy it strikes with Aurous Blaze for 10 seconds. While the mark stands, a hit another member deals the enemy as a kind of attack sets off an explosion round it a frame later, 1U of Pyro priced by Yoimiya and dealt as Elemental Burst DMG, then not again on that enemy for 2 seconds. Ascension 1 is built as a passive: each Blazing Arrow that strikes an enemy while Niwabi Fire-Dance stands raises a count to 10, giving 2% Pyro DMG Bonus per count for 3 seconds. Her Ascension 4 ATK share is not built, as gcsim v2.47.2 defines it and never calls it, and Constellations 4 and 6 are not built.

## Decisions

- **Yoimiya's plunges land 0.4 seconds after they start.** gcsim gives her plunges no timing, so her reaches and landing are Ganyu's.
- **Niwabi Fire-Dance is a stance, not an infusion.** gcsim scales each Normal Attack's multiplier by the skill's 137.9% and makes it Pyro, and leaves her aimed shots and plunges alone. An infusion only sets the element, and on her charged attack and plunges too, so the skill is a stance whose normal attacks are the Blazing Arrows, each hit its strike's at the raised multiplier.
- **Aurous Blaze answers the damage the team deals, not every hit gcsim sees.** The mark is an enemy status, and the explosion answers the damage taken that the kit events report. A hit that carries a kind of attack, a normal or charged attack, a plunge, a skill or a burst, sets it off, as gcsim's six attack tags do, whether an action or a summon deals it. A summon whose kit names no kind and a reaction's own damage carry none, so they do not. The explosion is Elemental Burst DMG, gcsim's tag for it, and as it is Yoimiya's own it sets off no other.
- **Constellation 1's ATK is a buff from a defeat's damage event.** A damage event that defeats an enemy still carrying Aurous Blaze gives Yoimiya 20% ATK for 20 seconds, under the constellation's own source, so a second defeat restarts that buff rather than adding one. The extra 4 seconds lengthen the mark itself, and the explosion is read as the base's.
- **Constellation 2 reads a CRIT on her own Pyro hit.** A damage event carries whether the hit was a CRIT, so her Constellation 2 gives her 25% Pyro DMG Bonus for 6 seconds when a hit she strikes with Pyro is one. A hit with no element of its own is her Pyro, as the hit's element field only names an element other than the character's own. The buff is read from any kit's event, so it holds whether she is active or not.

## Key files

| File                                                               | Role                                                                                                                                                                                |
| :----------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/yoimiyaKit.ts` | `createYoimiyaKitBehaviour`, Yoimiya's kit with Niwabi Fire-Dance's Blazing Arrows, her fully charged shot, and Ryuukin Saxifrage's initial hit with Aurous Blaze and its explosion |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/yoimiya), MIT: the kit's hitmarks, cancel frames and areas, the fully charged shot's frames, Niwabi Fire-Dance's animation, the Normal Attacks alone it makes Pyro and multiplies, and its end as she leaves the field, Ryuukin Saxifrage's initial hit and animation, and Aurous Blaze's mark on the first enemy struck, the attacks that set it off, and its explosion's delay, circle, gauge and poise.
