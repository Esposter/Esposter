---
title: Kaveh
description: Kaveh's kit as built, with his four strikes, a provisional charged attack, his plunges, Artistic Ingenuity's circle and Painted Dome's twelve-second stance, and what is left of the Dendro Cores his skill and burst rupture, Painted Dome's Bloom DMG Bonus, and his passives.
---

# Kaveh

Kaveh's kit is one module, `createKavehKit`, on avatar 10000081: four strikes, a charged attack, a collision and two plunges, Artistic Ingenuity's Dendro circle of radius 5 round the body at 35 frames, and Painted Dome, a Dendro circle of radius 5 at 36 frames that sets a stance for its twelve seconds. The stance widens each of his strikes' fans to gcsim's second set of radii, as gcsim's burst state does, and plays the rest of his kit as it stands. The stance starts with the burst's animation rather than at its hit, a difference of 0.6 seconds that is not measured. His multipliers are read from proud skill groups 8131, 8132 and 8139; the skill's cooldown, and the burst's cooldown and energy cost are read from the same groups.

Gcsim gives Kaveh no charged attack, as it has no charge file. The charged attack here takes the table's shape, as Dori's does: a spin at once and a final hit at the table's maximum duration, each a circle of radius 2 round the body, with the stamina per second the table gives. His collision deals no poise, as gcsim gives none. Both are provisional until a recording settles them.

Not built yet: the Dendro Cores his skill and burst rupture, which strike the enemies on each core in reach, as a rupture is a reaction on gadgets the kit does not yet hold; Painted Dome's Bloom DMG Bonus, which adds to each bloom reaction the team makes for its twelve seconds; and his Ascension and Constellation passives.

## Key files

| File                                                           | Role                                                                                                                                     |
| :------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/kavehKit.ts` | `createKavehKit`, Kaveh's kit with his strikes, charged attack and plunges, Artistic Ingenuity's circle, and Painted Dome's stance      |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/kaveh), MIT: Kaveh's strikes' hitmarks, cancel frames, fans and poise, Artistic Ingenuity and Painted Dome's hitmarks, animations and circles, the plunges' timings and poise, and Painted Dome's burst state's wider strikes.
