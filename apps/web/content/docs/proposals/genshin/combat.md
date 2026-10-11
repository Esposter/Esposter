---
title: Combat
description: Proposal — the combat rules the built ones leave out. The Lunar and Stellar Glimmer reactions of the game's newest characters, the auras no attack applies, the enemies' and the environment's own level multiplier, the limits on how often a reaction lands, Superconduct's resistance shred, the reach of a reaction round its target, and the energy normal attacks generate, each from the community's documented mechanics.
model: claude-opus-5-5
touches: ["packages/genshin-world/src/services/combat/**"]
---

# Combat

This page builds on [combat](/docs/genshin/combat) as built: auras, reactions by the game's priority, damage, internal cooldown, shields and energy. What it leaves out falls in two kinds. Some are rules the game added later or keeps for special targets. The rest are what reaches past one target, which only the world that places targets can resolve. Each is built the way the built rules were, as pure functions in `genshin-world`'s `services/combat`, each held to a worked example from its source.

## Decisions

- **The Lunar and Stellar Glimmer reactions as their own formula.** Lunar-Charged, Lunar-Bloom and Lunar-Crystallize, with Stellar-Conduct and Stellar Swirl, are dealt directly by a talent or as a separate instance. Each contributor's damage is worked out alone with standard crit, then the four highest are weighted 0.6, 0.3, 0.05 and 0.05. Lunar-Charged replaces Electro-Charged while a Moonsign character is in the party, so the step that starts Electro-Charged reads the party.
- **Self and immutable auras as a kind of aura.** Water, rain, an enemy's innate element and its elemental shields put an element on a target with no aura tax and a decay of their own, or none. An immutable aura is never consumed, but what is left of the trigger after it goes on to the auras beside it. Both enter `ElementalState` with their source's fixed gauge, and the enemies give each kind its own.
- **The enemies' level multiplier.** Enemies and the environment trigger reactions on the wiki's second table, which parts from the characters' from level 58 up. It sits beside `CharacterLevelMultiplierMap`, and a reaction's damage takes the table of the side that triggered it.
- **The game's limits on how often a reaction lands.** Swirl, Superconduct, Shattered, Bloom, Hyperbloom and Burgeon deal two instances to a target every half second from each source, Overloaded and Electro-Charged one, and Burning's damage has none. A Swirl of one element, a Superconduct or an Overloaded within a tenth of a second of the last lands once, whatever its source. The enemy keeps these as internal cooldowns beside its hits', one mechanism counting a share of a gauge or of a reaction's damage.
- **Debuffs a reaction leaves.** Superconduct takes 40% off the target's Physical resistance for 12 seconds, which the damage formula then reads.
- **Reach, resolved by the world.** An Overloaded's and a Superconduct's explosion reach every enemy within 3 metres, a Swirl's element spreads to every target within 5 metres but the one it triggered on, Burning's Pyro lands within a metre, and Electro-Charged arcs to one Wet target within 5 metres. A Dendro Core bursts over 5 metres, and Hyperbloom homes on the nearest enemy. A Crystallize shard lasts 15 seconds and grants the one Crystallize shield, which a new one overwrites. The rules already return what each spreads and at what gauge; the world asks which targets stand within reach and applies it to each.
- **Energy from attacks.** A normal or charged attack's hit has a chance to give 1 energy, starting at its weapon's base and rising with each miss until it lands: a sword 10% and 5% more a miss, a bow 0% and 5%, a claymore and a catalyst 0% and 10%, a polearm 0% and 4%. Energy Recharge does not touch it. It draws on the world's seeded random source.

## Scope and order

**Today:** auras, reactions and their damage on one target, the internal cooldown, shields and energy from particles and orbs, and the Traveler's kit's hits through them, as the [combat](/docs/genshin/combat) page describes.

**This adds, in order:**

```text
packages/genshin-world/src/services/combat/damage/EnemyLevelMultiplierMap.ts
```

1. **The enemies' level multiplier**, so an enemy's reaction on a character is priced. Shipped: the table and the parameter are built and as-built on the [combat](/docs/genshin/combat) page.
   - `EnemyLevelMultiplierMap.ts`: levels 1 to 100, the "Enemies and Environment" column of the wiki's [Elemental Reaction/Level Scaling](https://genshin-impact.fandom.com/wiki/Elemental_Reaction/Level_Scaling) table, read through the persona's wiki reader and written as `CharacterLevelMultiplierMap` is.
   - `getTransformativeDamage` gains a last parameter, the triggering side's level multiplier map, defaulting to `CharacterLevelMultiplierMap`, so its caller in `services/kit/strikeEnemy.ts` is unchanged.
   - Test: `getTransformativeDamage.test.ts` gains an Overloaded at level 90 priced on 1202.813736 from the enemies' table and 1446.853458 from the characters', and the two tables agreeing at level 57, where they last match.
2. **Self and immutable auras**, which the enemies' slimes and elemental shields need. Shipped: both are built and as-built on the [combat](/docs/genshin/combat) page.
   - `Aura` gains `isImmutable`: an immutable aura takes its share of a trigger but is never consumed, never decays and gives Electro-Charged's ticks nothing, and an attack of its own element leaves it as it is.
   - `applyElement` gains a last parameter, a self aura's seconds: what is left is untaxed and decays at the source's gauge over them, or not at all at `Infinity`.
   - Tests: the wiki's Cryo Slime and Cryo Hypostasis under Beidou's 4U of Electro, an immutable Hydro holding up Electro-Charged undrained, the Large Dendro Slime's Toxic Seeds, and a self Hydro's excess kept whole after it vaporizes.
   - The world's enemies give each kind its innate element and its shield as the kind is added, since the Hilichurl Fighter has neither.
3. **The limits on reaction damage, and Superconduct's shred.** Shipped: both are built and as-built on the [combat](/docs/genshin/combat) page.
   - `InternalCooldownGroup`'s `gaugeSequence` becomes `sequence`, the share of a gauge or of a reaction's damage, and the wiki's damage sequences join the groups: `TransformativeReactionInternalCooldownGroupMap` and the tenth of a second's group for Swirl, Superconduct and Overloaded.
   - `applyReactionInternalCooldown` counts a reaction into the enemy's `internalCooldownMap`, per source, reaction and element, after the tenth of a second's window kept whatever the source, and `strikeEnemy` deals each transformative reaction's damage at its share.
   - A Superconduct gives its enemy a 12 second status taking 40% off its Physical RES, and the transformative reactions read the statuses' RES reductions as the hit does.
   - Tests: a source's Swirls, Shatters, Electro-Charged and Burning through half a second, Swirls of one element from two sources within a tenth of a second and another element's apart, a second Overloaded within half a second dealing nothing, and a physical hit after a Superconduct reading 40% less Physical RES.
4. **Reach.** The world session places the enemies and the character in one world, so their distances are measured. Shipped for the explosions, the Swirl, Electro-Charged's arc, the Crystallize shard and Burning's ticks: as-built on the [combat](/docs/genshin/combat) page.
   - `priceEnemyReactions` takes the pricing of a hit's reactions out of `strikeEnemy`, and returns the reactions that landed with a reach. `applySimultaneousReactionInternalCooldown` is the tenth of a second's limit apart from the source's count, since it stops a Swirl's spread too.
   - `landReactionReach` lands an Overloaded's or a Superconduct's explosion within 3 metres, and a Swirl's spread within 5 metres, on every other standing enemy, the radii gcsim's (`TransformativeReactionReachRadiusMap`). A Swirl's element triggers its chain reactions there, priced from the character that swirled, and `strikeKitEnemies` reaches on with any of them that reach.
   - Tests: an explosion reaching inside its radius and not past it, a Superconduct's shred on the enemy it reaches, a Pyro Swirl's damage and a Hydro Swirl's none, a Pyro Swirl vaporized on a Wet enemy and triggering an Overloaded that reaches on, and a second Swirl within a tenth of a second reaching nothing.
   - Electro-Charged's ticks are priced on the enemies. Each enemy keeps the reactions its fixed step brings (`elementalReactions`) and the combatant whose Electro or Hydro last charged it (`applyEnemyElement`), as gcsim moves Electro-Charged's ownership, and the step of the kit on the field strikes the ticks (`strikeElementalTicks`), each arcing to the nearest Wet enemy within 5 metres, the wiki's radius. The nearest is a provisional choice, asked in the roadmap's manual verification.
   - Tests: an Electro or Hydro that charges an enemy taking its Electro-Charged over and a Pyro not, a tick dealt from its owner and arcing to a Wet enemy, an unowned tick and a Burning tick dealing nothing, and the arc reaching the nearest Wet enemy alone.
   - A Crystallize drops a shard by its enemy, a `KitCrystallizeShard` among the team's effects, at gcsim's place and times (`addCrystallizeShards`), and the body on the field picks it up within 2 metres, a provisional reach asked in the roadmap's manual verification (`pickUpCrystallizeShards`). Its shield is a `KitShield` marked `isCrystallize`, which overwrites only the last Crystallize shield and is no character's own for a heal that wants one.
   - Tests: a shard of the Crystallize's element at its place holding its shield, the shards past the newest three going in two seconds, a shard left before it may be picked up or out of reach, a pickup overwriting the last Crystallize shield beside a character's own, and a Crystallize shield rolling no Breastplate heal.
   - Burning's ticks are struck as Electro-Charged's are, from the combatant whose Pyro or Dendro last lit or fed the Burning (`applyEnemyElement`), as gcsim prices it again from each. Each tick deals Burning's damage to its enemy and reaches every other standing enemy within a metre, gcsim's circle, applying its Pyro under that enemy's own Burning internal cooldown (`applyBurningInternalCooldown`) and dealing each its damage.
   - Tests: a Pyro or Dendro that lands on a Dendro or Pyro enemy taking its Burning over, a tick dealt from its owner reaching an enemy within a metre and none past it, an unowned tick dealing nothing, and a reached enemy taking a tick's Pyro once in its internal cooldown.
   - Left: the Dendro Core's burst, Burgeon and Hyperbloom's homing, now that Kirara's kit applies Dendro.
5. **Energy from attacks.** Shipped: as-built on the [combat](/docs/genshin/combat) page.
   - `WeaponTypeAttackEnergyChanceMap` holds each weapon's base and rise, and `rollKitAttackEnergy` rolls a hit's chance from the world's random source, counting the misses on the `KitState`, which a swap starts afresh as gcsim assumes.
   - `strikeKitEnemies` returns the strikes that struck an enemy, and `gainKitAttackEnergy` gives a normal or charged attack's 1 energy on a pass, up to the burst's cost. One roll a hit, however many enemies it strikes, is a provisional choice asked in the roadmap's manual verification.
   - Tests: each weapon's chance taking the wiki's average hits, a sword's chance rising a miss and falling back on a pass, and only a normal or charged attack giving energy, up to the burst's cost.
6. The Lunar and Stellar Glimmer reactions, with the first character whose kit triggers them.

## What this does not propose

- **Characters' kits.** Talent multipliers, each ability's gauge, internal cooldown tag and particles are a character's data, added with the [characters](/docs/genshin/characters) that use them.
- **Anything drawn.** A reaction's text, an aura's icon over its target and a shield's bar belong to the HUD and the enemies.

## Key files

| File                                                                               | Role after the change                                              |
| :--------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| `packages/genshin-world/src/services/combat/aura/applyElement.ts`                  | Reads the party's Moonsign                                         |
| `packages/genshin-world/src/services/combat/damage/getTransformativeDamage.ts`     | Takes the level multiplier of the side that triggered the reaction |
| `packages/genshin-world/src/services/combat/damage/CharacterLevelMultiplierMap.ts` | Joined by the enemies' and the environment's table                 |
| `packages/genshin-world/src/services/enemy/damageEnemy.ts`                         | Where a reaction's damage and its reach reach the enemies          |

## Sources

- [Damage](https://genshin-impact.fandom.com/wiki/Damage), Genshin Impact Wiki: the Lunar and Stellar Glimmer formulas, direct and indirect, and the four contributors' weights.
- [Elemental Gauge Theory: Advanced Mechanics](https://genshin-impact.fandom.com/wiki/Elemental_Gauge_Theory/Advanced_Mechanics), Genshin Impact Wiki: self auras, immutable auras and their gauges, Freeze resistance, and the shielded skirmishers' reaction coefficients.
- [Elemental Reaction: Level Scaling](https://genshin-impact.fandom.com/wiki/Elemental_Reaction/Level_Scaling), Genshin Impact Wiki: the enemies' and the environment's level multiplier.
- [Swirl](https://genshin-impact.fandom.com/wiki/Swirl), [Bloom](https://genshin-impact.fandom.com/wiki/Bloom) and [Electro-Charged](https://genshin-impact.fandom.com/wiki/Electro-Charged), Genshin Impact Wiki: each reaction's reach and its damage limits.
- [Crystallize](https://genshin-impact.fandom.com/wiki/Crystallize), Genshin Impact Wiki: the shard's lifetime, the three kept, and the one shield.
- [Energy](https://genshin-impact.fandom.com/wiki/Energy), Genshin Impact Wiki: energy from normal and charged attacks by weapon type.
- [Transformative Reactions](https://library.keqingmains.com/combat-mechanics/elemental-effects/transformative-reactions), KeqingMains Theorycrafting Library: Superconduct's shred, and the damage limits on Electro-Charged, Swirl and Shatter.
