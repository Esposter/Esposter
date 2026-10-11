---
title: Shenhe
description: Shenhe's kit as built: Spring Spirit Summoning's press and hold and Divine Maiden's Deliverance field with its DoT, with her Quill, other passives and constellations left unbuilt.
---

# Shenhe

Shenhe's kit is one module, `createShenheKit`, on avatar 10000063: five strikes, a charged attack, a collision and two plunges, Spring Spirit Summoning's press and its hold, and Divine Maiden's Deliverance with its initial hit, the field's DoT ticks, the Ascension 1 Cryo DMG Bonus for an active character inside it, and the RES Decrease its DoT gives. Her multipliers are read from proud skill groups 6331, 6332 and 6339; the charged attack's stamina, the press's and hold's cooldowns, and the burst's cooldown and energy cost are read from the same groups. The field stands 2 metres ahead of the body, and each DoT tick's two hits are summoned there. The RES Decrease holds for one tick interval, where gcsim refreshes it every 18 frames. Her Quill is not built, as a kit prices a hit from its striker alone and a Quill adds Shenhe's ATK to another member's hits. Her other passives and her constellations are not built. Her poise and the hold's threshold are provisional.

## Key files

| File                                                              | Role                                                                                                                                                                        |
| :---------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/shenheKit.ts` | `createShenheKit`, Shenhe's kit with Spring Spirit Summoning's press and hold, Divine Maiden's Deliverance's field and its DoT, and her strikes, charged attack and plunges |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/shenhe), MIT: Shenhe's strikes' hitmarks, reaches and cancel frames, the charged attack's circle and frames, Spring Spirit Summoning's press and hold frames and circles, Divine Maiden's Deliverance's initial hit, its 250 poise, field, DoT ticks and offsets, the Ascension 1 Cryo DMG Bonus and the RES Decrease.
