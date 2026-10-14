---
title: Candace
description: Candace's kit as built, with Sacred Rite: Heron's Sanctum's tap and charged hold and their shields, Sacred Rite: Wagtail's Tide's Prayer of the Crimson Crown with its waves, Constellations 1 and 6, and what is left to build.
---

# Candace

Candace's kit is its record and one behaviour module, `createCandaceKitBehaviour`, on avatar 10000072: four strikes, a charged attack, a collision and two plunges; Sacred Rite: Heron's Sanctum, a tap and a charged hold that each set a shield on the team and deal a share of her Max HP as flat DMG; and Sacred Rite: Wagtail's Tide, whose initial hit sets the Prayer of the Crimson Crown going for nine seconds. Her multipliers come from proud skill groups 7231, 7232 and 7239 at level 1. The tap's cooldown is 6 seconds and the charged hold's 9, the burst's cooldown 15 seconds and its cost 60 energy, and the charged attack's stamina 25. Constellations 1 and 6 are built. Ascension 1 and 4, Constellations 2 and 4, the Prayer's DMG Bonus on the team's normal attacks, and the talent levels of Constellations 3 and 5 are not, as the sections below give.

## Decisions

- **Heron's Sanctum's damage is a share of Max HP carried as flat DMG.** Each of the tap's and the charged hit's talent multipliers is zero, and the additive base DMG Bonus is her Max HP times the table's share, 0.12 for the tap and 0.1904 for the charged hit at level 1. The tap reads the table's slot 2, which equals the shield's share at every level, where gcsim reads its tap at the shield's slot; the slot is a best estimate, as the number matches gcsim's.
- **Each shield lasts until its hit lands.** gcsim sets the shield's expiry at the hitmark, "treated as frame when attack hits", so the tap's shield stands for 16 frames and the charged hold's for 91 from its release. Its health is a share of Max HP from the table plus a flat amount, 1155.56 at level 1, and it is Hydro.
- **The charged hold starts at half a second of holding.** gcsim takes the hold as a parameter with no threshold, and no table or wiki page gives one, so the framework's half second stands. The roadmap asks whether the game agrees.
- **The Prayer of the Crimson Crown is a field that stands wherever the body is.** It starts with the burst at the 33-frame hitmark and runs nine seconds, twelve from Constellation 1. Every 30 frames it infuses the party member on the field with Hydro for one second, if that member wields a sword, claymore or polearm, and a swap infuses the one coming on at once.
- **Each swap while the Prayer stands sets off a wave round the body, three at most.** A wave is a circle of radius 3.5 metres round the body, struck one frame on, for 6.6% of her Max HP as flat Hydro DMG, the table's wave share. The wave count is a status that each burst restarts, as gcsim resets it on each cast.
- **Constellation 6 sets off a wave on a party member's elemental normal attack.** While the Prayer stands, a `DamageTaken` event for a normal attack of the character on the field, by another member and with an element, sets off a wave for 15% of her Max HP. It waits 2.3 seconds, as gcsim's cooldown does. The event carries the striker and its element, so the check is the one gcsim makes.

## Not built

- **Ascension 1's instant finish of a charge is not built.** gcsim leaves it as a TODO, and the kit has no hook for damage the team takes: `DamageTaken` reports damage an enemy takes.
- **Ascension 4's DMG and the Prayer's 20% DMG Bonus on the team's normal attacks are not built.** The hook is a party buff read by another member's normal attack, as `getStrikeDamageBonus` reads only the kit's own strikes.
- **Constellation 2's Max HP of 20% is not built.** `getBuffedCombatant` adds a buff to the attribute total, and the Max HP the shield and the damage read is derived once in `computeCharacterAttributes`, so the buff does not reach it. The hook is a Max HP buff that the pricing re-derives.
- **Constellation 4's shorter hold cooldown is not built.** gcsim sets the charged hold's cooldown to the tap's 6 seconds, but a hold's cooldown is one number on the kit, and `getSkillCooldownMultiplier` reads no hold. The hook is a hold cooldown read from the holder's constellations.

## Key files

| File                                                               | Role                                                                                                                                                                                |
| :----------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/candaceKit.ts` | `createCandaceKitBehaviour`, Candace's kit with her strikes, charged attack and plunges, Sacred Rite: Heron's Sanctum's shields, and Sacred Rite: Wagtail's Tide's Prayer and waves |

## Sources

- [gcsim (MIT)](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/candace): the strikes' hitmarks, cancel frames, reaches and poise, the charged attack and the plunges' frames, radii and poise, Heron's Sanctum's frames, hitboxes, shields and cooldowns, Wagtail's Tide's hitmark, duration, infusion and waves, and Constellations 1 and 6.
- The proud skill groups 7231, 7232 and 7239 in the hosted game data: each multiplier's index, the shield's share and flat HP, the cooldowns, the burst's seconds, wave count, cooldown and energy cost, read at talent level 1.
