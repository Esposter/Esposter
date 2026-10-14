---
title: Faruzan
description: Faruzan's kit as built, with Wind Realm of Nasamjnin, The Wind's Secret Ways' Dazzling Polyhedron and its Whirlwind Pulses, and what is left of the Manifest Gale, Pressurized Collapse and her particles, passive and constellations.
---

# Faruzan

Faruzan's kit is its record and one behaviour module, `createFaruzanKitBehaviour`, on avatar 10000076: four strikes, a fully charged shot, a collision and two plunges, Wind Realm of Nasamjnin's polyhedron hit, and The Wind's Secret Ways' initial hit with its Dazzling Polyhedron. Her multipliers are read from proud skill groups 7631, 7632 and 7639, and the skill's and burst's cooldowns and the burst's energy cost from the same groups. The polyhedron's Whirlwind Pulses, six through its duration, each shred the enemies near their gadget and give every member of the team Prayerful Wind's Anemo DMG Bonus. The Manifest Gale and Pressurized Collapse, her partial aimed shot, her particles, her passive and her constellations are not built, listed below.

## Decisions

- **The polyhedron's Pulses are summons of no damage, cast from the three gadgets' places.** gcsim places the gadgets from the body at the cast, offset 5.19 metres across and 10.5 ahead for the top two and 1.5 ahead for the bottom one, and cycles each Pulse through them. Each Pulse is a summon of a hit with no damage that gives the Perfidious Wind's Ruin RES cut to the enemies within 6 metres of its gadget, which the kit's hits carry as an enemy status. The first Pulse comes 3 seconds after the cast, then one every 2 seconds, and the field lasts gcsim's 745 frames from the cast with its ticker's 43-frame start, so the sixth Pulse lands at 13 seconds.
- **Prayerful Wind's Gift is given at the cast and on each Pulse, to every member of the deployed team.** gcsim refreshes it on a 239-frame schedule from 43 frames, which keeps the buff up while the polyhedron stands. Here the cast and the Pulses refresh it, as the 4-second buff outlasts the 2-second interval between them.
- **The skill's and the burst's hits are priced as circles offset from the body.** The skill's circle is radius 3 three metres ahead, priced at 6 round the body, and the burst's radius 6.3 1.5 metres ahead, priced at 7.8, as `createCircleReach` gives a circle centred ahead of the body.

## Not built

- **The Manifest Gale is not built.** Wind Realm of Nasamjnin's state makes the next fully charged shot a Hurricane Arrow, consumed one per shot, which Pressurized Collapse and Constellation 1 count on. It waits on a kit's charged attack chosen by a status, which the kit's actions do not take yet. Ascension 1's 60% shorter charge under the state waits on the same hook.
- **Pressurized Collapse is not built.** The Hurricane Arrow's vortex lands 33 frames after the hit, a circle of radius 6 on the enemy the arrow struck, not on the body, and it gives Constellation 4's energy. It waits on a hit placed where an enemy stands rather than where the body does, which the kit's hits do not take.
- **The partial-charge Aimed Shot is not built.** Its physical hit at index 4 needs a second charged-attack action beside the fully charged one, which the kit takes only the one of. The Manifest Gale's Hurricane Arrow waits on the same hook.
- **Her particles are not built.** The skill gives an Anemo particle on its hit, on a 5.5-second cooldown, which waits on a hit that gives particles, as an enemy's HP drops are the only energy a strike gives.
- **Ascension 4's Hurricane Guard is not built.** It adds 32% of her base ATK to Anemo hits of her team's characters while Prayerful Wind's Gift is on them, once each 0.8 seconds, which waits on a party effect that adds to other members' hits.
- **Constellations 1, 2, 4 and 6 are not built.** Constellation 1's second Hurricane Arrow and 4's energy wait on Pressurized Collapse and the Manifest Gale; Constellation 2's 6 seconds more on the polyhedron waits on the constellations' pass; Constellation 6's 40% CRIT DMG and its extra arrow wait on the same two hooks.
- **Dazzling Polyhedron stands 12.4 seconds, 745 frames, where the table gives 12.** gcsim's burst is 745 frames, so its sixth Whirlwind Pulse, at 13 seconds, comes after it has gone.
- **Faruzan's strikes, fully charged shot and plunges take Yelan's and Ganyu's poise.** gcsim gives none: 20 for the fully charged shot, 50 for the low plunge and 100 for the high one.

## Key files

| File                                                               | Role                                                                                                                                                                                                  |
| :----------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/faruzanKit.ts` | `createFaruzanKitBehaviour`, Faruzan's kit with her four strikes, charged shot and plunges, Wind Realm of Nasamjnin's hit, and The Wind's Secret Ways with its Dazzling Polyhedron's Whirlwind Pulses |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/faruzan), MIT: Faruzan's strikes' hitmarks and cancel frames, the fully charged shot's frames, Wind Realm of Nasamjnin's frames and hit, The Wind's Secret Ways' frames, initial hit, the polyhedron's 745 frames, its Pulses and gadgets, and Prayerful Wind's Gift and Perfidious Wind's Ruin.
