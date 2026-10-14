---
title: Lyney
description: Lyney's kit as built, with his four strikes, Prop Arrow with its Grin-Malkin Hat, collision and two plunges, Bewildering Lights' press, and Wondrous Trick: Miracle Parade's Explosive Firework with its hat, and what is left of his tap-released and partial-hold shots, his Prop Surplus, his hat's explosions and his passives.
---

# Lyney

Lyney's kit is its record and one behaviour module, `createLyneyKitBehaviour`, on avatar 10000084: four strikes, a Prop Arrow as his charged attack with the Grin-Malkin Hat it sets, a collision and two plunges, Bewildering Lights' press, and Wondrous Trick: Miracle Parade's Explosive Firework with the hat it sets. His strikes, plunges and Prop Arrow are physical or Pyro as gcsim deals them, and his skill and burst are Pyro. His multipliers are read from proud skill groups 8431, 8432 and 8439; the skill's and burst's cooldowns and the burst's energy cost come from the same groups. Each hat's Pyrotechnic Strike travels 36 frames to the primary target after the hat expires, gcsim's default: the Prop Arrow's strike lands 387 frames after the cast, and the burst's 563 frames after it.

Not built yet: the tap-released Physical Aimed Shot and the Pyro shot at a partial hold, which a kit's single charged attack cannot hold beside the Prop Arrow, so the hold for each waits on a kit with several charged attacks; the Prop Surplus that the Prop Arrow adds, its bonus per stack and its heal on Bewildering Lights, and the HP drain the Prop Arrow takes from him, which read his own HP; the hats' kill and skill explosions, which need a hit when a hat is removed early; the hat limit that kills the oldest hat for a newer one; the burst's ticks, which strike each enemy within four metres once while the burst's mark is not on it; the skill-aligned Spiritbreath Thorn, which needs a cooldown a hit cannot read; and his Ascension and Constellation passives.

Provisional: his plunges. gcsim's folder has no plunge file, so the collision, low and high plunge take Bennett's shared timings and poise, with his table's entries 5, 6 and 7 as their multipliers, as `lyneyKit.ts` writes them. The roadmap asks whether they match the game.

## Key files

| File                                                             | Role                                                                                                                                                             |
| :--------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/lyneyKit.ts` | `createLyneyKitBehaviour`, Lyney's kit with his strikes, Prop Arrow and hat, plunges, Bewildering Lights' press, and Miracle Parade's Explosive Firework and hat |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/lyney), MIT: Lyney's strikes' hitmarks, cancel frames and reach, the Prop Arrow and its Grin-Malkin Hat, Bewildering Lights' hit and reach, and Wondrous Trick: Miracle Parade's Explosive Firework and its hat with their timings and the Pyrotechnic Strike's travel.
