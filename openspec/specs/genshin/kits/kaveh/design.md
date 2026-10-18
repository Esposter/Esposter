# Kaveh

Kaveh's kit is its record and one behaviour module, `createKavehKitBehaviour`, on avatar 10000081: four strikes, a charged attack, a collision and two plunges, Artistic Ingenuity's Dendro circle of radius 5 round the body at 35 frames, and Painted Dome, a Dendro circle of radius 5 at 36 frames that sets a stance for its twelve seconds. The stance widens each of his strikes' fans to gcsim's second set of radii, as gcsim's burst state does, and plays the rest of his kit as it stands. It ends as he leaves the field, as gcsim's exit deletes the burst's state. The stance starts with the burst's animation rather than at its hit, a difference of 0.6 seconds that is not measured. His multipliers are read from proud skill groups 8131, 8132 and 8139; the skill's cooldown, and the burst's cooldown and energy cost are read from the same groups.

Gcsim gives Kaveh no charged attack, as it has no charge file. His charged attack takes the table's shape like Dori's: a spin lands at once and a final hit at the longest duration the table allows, both circles of radius 2 round the body, costing the stamina per second the table gives. The collision deals no poise, since gcsim gives it none. A recording would settle both.

Not built yet: the Dendro Cores his skill and burst rupture, which strike the enemies on each core in reach, as a rupture is a reaction on gadgets the kit does not yet hold; Painted Dome's Bloom DMG Bonus, which adds to each bloom reaction the team makes for its twelve seconds; and his Ascension passives and Constellations 1 and 6. Constellation 2's Normal Attack SPD is built, as Painted Dome's stance is on him, and Constellation 4's Bloom DMG is built through the kit's `getReactionDamageBonus`, which reads it on each core's burst.

## Key files

| File                                                             | Role                                                                                                                                        |
| :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/kavehKit.ts` | `createKavehKitBehaviour`, Kaveh's kit with his strikes, charged attack and plunges, Artistic Ingenuity's circle, and Painted Dome's stance |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/kaveh), MIT: Kaveh's strikes' hitmarks, cancel frames, fans and poise, Artistic Ingenuity and Painted Dome's hitmarks, animations and circles, the plunges' timings and poise, and Painted Dome's burst state's wider strikes.
