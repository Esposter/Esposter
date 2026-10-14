---
title: Shenhe
description: Shenhe's kit as built: Spring Spirit Summoning's press and hold and Divine Maiden's Deliverance field with its DoT, with her Quill, other passives and constellations left unbuilt.
---

# Shenhe

Shenhe's kit is its record and one behaviour module, `createShenheKitBehaviour`, on avatar 10000063: five strikes, a charged attack, a collision and two plunges, Spring Spirit Summoning's press and its hold, and Divine Maiden's Deliverance with its initial hit, the field's DoT ticks, the Ascension 1 Cryo DMG Bonus for an active character inside it, and the RES Decrease its DoT gives. Her multipliers are read from proud skill groups 6331, 6332 and 6339; the charged attack's stamina, the press's and hold's cooldowns, and the burst's energy cost and cooldown are read from the same groups. The field stands 2 metres ahead of the body, and each DoT tick's two hits are summoned there. Her Quill is not built, as it adds Shenhe's ATK to another member's hits. Her other passives and her constellations sit outside the kit. The hold's threshold is provisional.

## Decisions

- **Shenhe's strikes, charged attack, plunges and Spring Spirit Summoning's press and hold deal 0 poise.** Provisional, as gcsim gives none; her plunges' reaches and 0.4 seconds are the other kits' stand-ins.
- **Spring Spirit Summoning's hold begins at 0.5 seconds.** Provisional: gcsim reads the hold from the input alone, as it does for Eula and Diona.
- **Divine Maiden's Deliverance's RES Decrease holds between its DoT ticks.** `shenheKit.ts` holds the decrease for one 117-frame tick interval from each tick, where gcsim refreshes it every 18 frames.

## Key files

| File                                                              | Role                                                                                                                                                                 |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/shenheKit.ts` | `createShenheKitBehaviour`, Shenhe's kit with Spring Spirit Summoning's press and hold, Divine Maiden's Deliverance's field and its DoT, and her strikes and plunges |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/shenhe), MIT: the kit's hitmarks, cancel frames and areas, Spring Spirit Summoning's press and hold frames and circles, Divine Maiden's Deliverance's initial hit, its 250 poise, field, DoT ticks and offsets, the Ascension 1 Cryo DMG Bonus and the RES Decrease.
