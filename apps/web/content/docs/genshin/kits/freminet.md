---
title: Freminet
description: Freminet's kit as built, with his four strikes, charged attack, plunges, Pressurized Floe's upward thrust and Shadowhunter's Ambush, and what is left of his Pers Time stance, Spiritbreath Thorn, stalking state and passives.
---

# Freminet

Freminet's kit is its record and one behaviour module, `createFreminetKitBehaviour`, on avatar 10000085: four strikes, a charged attack, a collision and two plunges, Pressurized Floe's Upward Thrust, a cryo circle two metres ahead of the body, and Shadowhunter's Ambush, a cryo burst on the target. His multipliers are read from proud skill groups 8531, 8532 and 8539; the charged attack's stamina, the skill's cooldown, and the burst's cooldown and energy cost are read from the same groups. Each strike, the plunges and the thrust deal physical or cryo damage as gcsim gives them, with their poise.

The charged attack is provisional. gcsim gives Freminet no charged attack, so it takes the fourth strike's hitmark, animation and reach with the table's charged multiplier and stamina, and a yes-or-no question is on the roadmap.

Not built: Pressurized Floe's Pers Time stance, which holds the frost of each strike and the stacks it gains, and the detonation that replaces the skill on its next press; Spiritbreath Thorn, which hits at 62 frames, past the skill's animation; Shadowhunter's Ambush's stalking state, which lowers the skill's cooldown to three seconds and resets it; and his ascension and constellation passives. The fandom wiki was out of reach for the elemental gauge of each hit, so no gauge is set.

## Decisions

- **Freminet's charged attack is provisional at 42 frames, in a circle of radius 2.4 round the target, for 40 stamina.** gcsim gives him none ("action charge not implemented"), so `freminetKit.ts` takes the fourth strike's hitmark, animation and reach, the table's attack multiplier at index 4 and its stamina at index 6; a recording of the attack showing another timing, reach or stamina would replace them.

## Key files

| File                                                                | Role                                                                                                                                               |
| :------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/freminetKit.ts` | `createFreminetKitBehaviour`, Freminet's kit with his strikes, charged attack, plunges, Pressurized Floe's upward thrust and Shadowhunter's Ambush |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/freminet), MIT: Freminet's strikes' hitmarks, cancel frames, reaches and poise, the low and high plunges and their collision, Pressurized Floe's Upward Thrust, and Shadowhunter's Ambush.
