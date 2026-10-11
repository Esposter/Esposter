---
title: Raiden Shogun
description: Raiden Shogun's kit as built: five strikes, a charged attack, the Eye of Stormy Judgment with its coordinated attacks and Musou Shinsetsu with the Musou Isshin stance, with Resolve's gain and her Constellation 2 left unbuilt.
---

# Raiden Shogun

Raiden Shogun's kit is one module, `createRaidenKit`, on avatar 10000052: five strikes, a charged attack, a collision and two plunges, Eye of Stormy Judgment with its Eye and coordinated attacks, and Musou Shinsetsu with the Musou Isshin stance. Her multipliers are read from proud skill groups 5231, 5232 and 5239; the charged attacks' stamina, the skill's and the burst's cooldowns, the Eye's seconds, the burst's energy cost and the energy and seconds of Musou Isshin are read from the same groups. The skill's hit lands 51 frames on from a summon at the body, and 66 frames on the Eye reaches every member of the deployed team, so a member holding it who deals damage sets off a coordinated attack on the enemy struck, once every 0.9 seconds. The burst spends her Resolve stacks into Musou no Hitotachi and every Musou Isshin attack as it is cast, and takes Musou Isshin as a stance, whose Electro strikes and two-hit charged attack restore the whole team's energy once a second, five times a cast; leaving the field ends it. The Eye's Elemental Burst DMG Bonus raises her own burst hits, read as the burst is cast. Ascension 4's energy and Electro DMG Bonus from Energy Recharge, Constellation 4's ATK to the rest of the team as Musou Isshin ends, and Constellation 6's second off the others' burst cooldowns on the hits that restore energy are built. Resolve's gain from another member's burst, Ascension 1's gain from particles and Constellation 1's faster gain are not, as no kit event tells a burst's cast or a particle's pickup, so the burst spends a Resolve status nothing yet fills. Constellation 2's DEF ignored is not either, as no hit carries one to pricing, nor the Eye's bonus to another member's burst, as no kit reaches another's pricing, nor the Musou Isshin plunges, as a stance holds none, nor the skill's particles. Musou Isshin's hits are dealt as normal and charged attacks, where gcsim deals them as Elemental Burst. Her strikes', charged attacks', skill's, coordinated attack's, burst's and collision's poise is provisional, as gcsim gives none.

## Key files

| File                                                              | Role                                                                                                                               |
| :---------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/raidenKit.ts` | `createRaidenKit`, the Raiden Shogun's kit with the Eye and its coordinated attacks, Resolve, and Musou Isshin's stance and energy |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/raiden), MIT: the Raiden Shogun's polearm and Musou Isshin strikes' hitmarks, animations and hitboxes, both charged attacks' frames and hits, the plunges' and collision's frames, circles and poise, Eye of Stormy Judgment's frames, hit, Eye delay and coordinated attack with its ICD, Musou Shinsetsu's frames and hitbox, Musou Isshin's energy with its interval and count, the proud skill groups' indices (`zz_raidenshogun.dm.go`), Ascension 4, and Constellations 4 and 6.
