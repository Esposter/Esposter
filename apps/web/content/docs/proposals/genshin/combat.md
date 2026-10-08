---
title: Combat
description: Proposal — the combat rules the built ones leave out. The Lunar and Stellar Glimmer reactions of the game's newest characters, the auras no attack applies, the enemies' and the environment's own level multiplier, the limits on how often a reaction lands, Superconduct's resistance shred, the reach of a reaction round its target, and the energy normal attacks generate, each from the community's documented mechanics.
model: claude-opus-5-5
---

# Combat

This page builds on [combat](/docs/genshin/combat) as built: auras, reactions by the game's priority, damage, internal cooldown, shields and energy. What it leaves out falls in two kinds. Some are rules the game added later or keeps for special targets. The rest are what reaches past one target, which only the world that places targets can resolve. Each is built the way the built rules were, as pure functions in `genshin-world`'s `services/combat`, each held to a worked example from its source.

## Decisions

- **The Lunar and Stellar Glimmer reactions as their own formula.** Lunar-Charged, Lunar-Bloom and Lunar-Crystallize, with Stellar-Conduct and Stellar Swirl, are dealt directly by a talent or as a separate instance. Each contributor's damage is worked out alone with standard crit, then the four highest are weighted 0.6, 0.3, 0.05 and 0.05. Lunar-Charged replaces Electro-Charged while a Moonsign character is in the party, so the step that starts Electro-Charged reads the party.
- **Self and immutable auras as a kind of aura.** Water, rain, an enemy's innate element and its elemental shields put an element on a target with no aura tax and a decay of their own, or none. An immutable aura is never consumed, but what is left of the trigger after it goes on to the auras beside it. Both enter `ElementalState` with their source's fixed gauge, and the enemies give each kind its own.
- **The enemies' level multiplier.** Enemies and the environment trigger reactions on the wiki's second table, which parts from the characters' from level 58 up. It sits beside `CharacterLevelMultiplierMap`, and a reaction's damage takes the table of the side that triggered it.
- **The game's limits on how often a reaction lands.** Swirl, Bloom and Shatter deal two instances to a target every half second from each source, Electro-Charged one, and Swirls of one element within a tenth of a second land once. A target keeps these timers in its state, as it keeps Crystallize's.
- **Debuffs a reaction leaves.** Superconduct takes 40% off the target's Physical resistance for 12 seconds, which the damage formula then reads.
- **Reach, resolved by the world.** A Swirl's element spreads to every target round it but the one it triggered on, Burning's Pyro lands within a metre, and Electro-Charged arcs to one Wet target within 5 metres. A Dendro Core bursts over 5 metres, and Hyperbloom homes on the nearest enemy. A Crystallize shard lasts 15 seconds and grants the one Crystallize shield, which a new one overwrites. The rules already return what each spreads and at what gauge; the world asks which targets stand within reach and applies it to each.
- **Energy from attacks.** A normal or charged attack's hit has a chance to give 1 energy, starting at its weapon's base and rising with each miss until it lands: a sword 10% and 5% more a miss, a bow 0% and 5%, a claymore and a catalyst 0% and 10%, a polearm 0% and 4%. Energy Recharge does not touch it. It draws on the world's seeded random source.

## Scope and order

**Today:** auras, reactions and their damage on one target, the internal cooldown, shields and energy from particles and orbs, as the [combat](/docs/genshin/combat) page describes.

**This adds, in order:**

1. Self and immutable auras, which the enemies' slimes and elemental shields need first.
2. The enemies' level multiplier, so an enemy's reaction on a character is priced.
3. The limits on reaction damage, and Superconduct's shred.
4. Reach, once the enemies and the character stand in one world to measure distances between.
5. Energy from attacks.
6. The Lunar and Stellar Glimmer reactions, with the first character whose kit triggers them.

## What this does not propose

- **Characters' kits.** Talent multipliers, each ability's gauge, internal cooldown tag and particles are a character's data, added with the [characters](/docs/genshin/characters) that use them.
- **Anything drawn.** A reaction's text, an aura's icon over its target and a shield's bar belong to the HUD and the enemies.

## Key files

| File                                                                               | Role after the change                                               |
| :--------------------------------------------------------------------------------- | :------------------------------------------------------------------ |
| `packages/genshin-world/src/models/combat/ElementalState.ts`                       | Gains a target's self and immutable auras and its reaction limits   |
| `packages/genshin-world/src/services/combat/aura/applyElement.ts`                  | Reads immutable auras, the party's Moonsign and the reaction limits |
| `packages/genshin-world/src/services/combat/damage/getTransformativeDamage.ts`     | Takes the level multiplier of the side that triggered the reaction  |
| `packages/genshin-world/src/services/combat/damage/CharacterLevelMultiplierMap.ts` | Joined by the enemies' and the environment's table                  |
| `packages/genshin-world/src/services/enemy/damageEnemy.ts`                         | Where a reaction's damage and its reach reach the enemies           |

## Sources

- [Damage](https://genshin-impact.fandom.com/wiki/Damage), Genshin Impact Wiki: the Lunar and Stellar Glimmer formulas, direct and indirect, and the four contributors' weights.
- [Elemental Gauge Theory: Advanced Mechanics](https://genshin-impact.fandom.com/wiki/Elemental_Gauge_Theory/Advanced_Mechanics), Genshin Impact Wiki: self auras, immutable auras and their gauges, Freeze resistance, and the shielded skirmishers' reaction coefficients.
- [Elemental Reaction: Level Scaling](https://genshin-impact.fandom.com/wiki/Elemental_Reaction/Level_Scaling), Genshin Impact Wiki: the enemies' and the environment's level multiplier.
- [Swirl](https://genshin-impact.fandom.com/wiki/Swirl), [Bloom](https://genshin-impact.fandom.com/wiki/Bloom) and [Electro-Charged](https://genshin-impact.fandom.com/wiki/Electro-Charged), Genshin Impact Wiki: each reaction's reach and its damage limits.
- [Crystallize](https://genshin-impact.fandom.com/wiki/Crystallize), Genshin Impact Wiki: the shard's lifetime, the three kept, and the one shield.
- [Energy](https://genshin-impact.fandom.com/wiki/Energy), Genshin Impact Wiki: energy from normal and charged attacks by weapon type.
- [Transformative Reactions](https://library.keqingmains.com/combat-mechanics/elemental-effects/transformative-reactions), KeqingMains Theorycrafting Library: Superconduct's shred, and the damage limits on Electro-Charged, Swirl and Shatter.
