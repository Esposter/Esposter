---
title: Furina
description: Furina's kit as built, with her four strikes and the Arkhe hits they open, the charged attack that turns her Arkhe, plunges, Salon Solitaire's Ousia members who drain the team or Pneuma's Singer who heals it, Let the People Rejoice with its Fanfare, Endless Waltz, her fourth ascension and three of her constellations, with the rest not built.
---

# Furina

Furina's kit is its record and one behaviour module, `createFurinaKitBehaviour`, on avatar 10000089: four strikes, a charged attack that turns her Arkhe, a collision and two plunges, Salon Solitaire and Let the People Rejoice. Her multipliers are read from proud skill groups 8931, 8932 and 8939. The charged attack's stamina, the Arkhe hits' cooldowns, the skill's cooldown, and the burst's cooldown and energy cost are read from the same groups.

She starts in Ousia, a status she holds for as long as she is not in Pneuma. Each strike that lands opens her Arkhe's own hit, Spiritbreath Thorn in Ousia or Surging Blade in Pneuma, a normal attack's Hydro hit with no gauge that strikes 30 frames on, once within each one's six-second cooldown. The charged attack's circle strikes at 33 frames, and a frame on her Arkhe turns; while Salon Solitaire lasts, the other Arkhe's summons take over from the ones out, for the seconds it has left.

Salon Solitaire in Ousia strikes a bubble round her at 18 frames and brings out Gentilhomme Usher, Surintendante Chevalmarin and Mademoiselle Crabaletta with it, each on gcsim's mean schedule. As each attacks the enemy nearest it, within the skill's targeting reach, it drains every member of the deployed team above half HP by its share of that member's Max HP through `changeKitMemberHealth`, and its hit, a share of Furina's Max HP, lands on a circle round that enemy once its attack has travelled, a tenth harder for each member it drained. Chevalmarin's and Usher's hits count under internal cooldown tags of their own, gcsim's Salon group of one in two over 30 seconds, and Crabaletta's under none. In Pneuma the skill brings out the Singer of Many Waters 10 frames in, which heals the character on the field by a flat amount and a share of her Max HP every two seconds. The skill lasts 1736 frames (about 28.9 seconds) from its summons, as gcsim has it, and a new one ends the summons of the one before.

Let the People Rejoice strikes a circle round her at 98 frames, a share of her Max HP, and its Fanfare starts at 95 frames for 18.2 seconds, ending the one before. Each change to a member's HP while it lasts, every `HealthChanged` event, gives a point of Fanfare for each 1% of that member's HP changed, up to 300. The first lands 6 frames on and opens a 35-frame window a frame later, and those within the window land as it closes, gcsim's estimate of the game's debounce. Each point gives every member of the deployed team 0.07% DMG Bonus to every element and Physical, and 0.01% Incoming Healing Bonus, for the seconds the Fanfare has left.

Ascension 1's Endless Waltz starts when another character's heal runs past full HP on the character on the field: every member of the deployed team regenerates 2% of their own Max HP every two seconds while the last such heal is under four seconds old. Ascension 4 raises the Salon members' DMG by 0.7% for each 1,000 of her Max HP, up to 28%, and cuts the Singer's interval by 0.4% for each 1,000, up to 16%. Constellation 1 starts the Fanfare at 150 and raises its most by 100, Constellation 2 gives 250% more Fanfare from each change, and Constellation 4 gives her 4 energy as a Salon member's hit lands or the Singer heals, once each five seconds.

Not built yet:

- **Constellation 2's Max HP**, 0.35% for each point of Fanfare past its most, waits on a buff to Max HP, as a buff adds to an attribute and Max HP is never computed again from it. The Fanfare is held at its most instead.
- **Constellation 6's Center of Attention**, the Hydro infusion that cannot be overridden and the share of her Max HP added to her strikes, charged attack and plunges for six hits, waits on a hit's flat DMG that reads the team's effects, as `additiveBaseDamageBonus` reads the combatant alone, and on a count of the infused hits.
- **Salon Solitaire's particles** are not built, as no kit's are.
- **The drain on a character in the burst's iframes.** Gcsim drains no character on the field during its own burst, while still counting it for the DMG, and waits on a field tick that reads the active character's action.
- **Endless Waltz from a whole team's heal.** Gcsim starts it from a heal on the whole team that runs past full HP on any member, as it sums the team's overflow; the kit reads each member's `HealthChanged` alone, so such a heal starts it only when it runs past full HP on the character on the field. It waits on an event that carries a heal's whole overflow.
- **The schedule's jitter.** Gcsim gives each Salon member a random spread round its mean interval; the kit takes the mean.
- **Pneuma's skill animation** is gcsim's Ousia one, 54 frames, though gcsim gives Pneuma's 57 and a 10-frame delay to its cooldown; the charged attack after a strike is not 11 frames shorter as gcsim has it.

Gcsim gives her strikes, charged attack and the Salon's hits no poise, so each deals none. A Salon member with no enemy within the skill's reach neither drains nor strikes, a provisional reading of gcsim's targeting. Each is provisional until a recording settles it.

## Key files

| File                                                              | Role                                                                                                                                                                                                                |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/furinaKit.ts` | `createFurinaKitBehaviour`, Furina's kit with her strikes and Arkhe hits, the charged attack's turn, plunges, Salon Solitaire's members and Singer, Let the People Rejoice's Fanfare, Endless Waltz and Ascension 4 |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/furina), MIT: her strikes' hitmarks, cancel frames and reaches, the Arkhe hits and their cooldowns, the charged attack and its turn of her Arkhe, the plunges' frames, reaches and poise, Salon Solitaire's bubble, members, schedules, drain and Singer, the burst's hit and Fanfare with its debounce, Endless Waltz, Ascension 4 and the constellations; `pkg/core/attacks/icd_groups.dm.go`, the Salon's internal cooldown group.
- The proud skill groups 8931, 8932 and 8939 in the hosted game data: each multiplier's index, the drains' and heal's shares, the Arkhe hits' and skill's cooldowns, the Fanfare's share of HP, most and bonuses, and the burst's cooldown and energy cost, read at talent level 1.
