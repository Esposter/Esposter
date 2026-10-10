---
title: Combat
description: Genshin's combat rules as built — pure, tested functions in the world package over plain state. An element's attack is left on a target as an aura that decays, a second element triggers the reactions the game tries in its own priority, each consuming its auras by its coefficient, and Electro-Charged, Quicken, Burning and Freeze keep their coexisting auras and ticks. The damage formula, the level multiplier, the internal cooldown on applying an element, shields and energy follow the community's documented mechanics, each held to a worked example from them. The Traveler's kit prices its hits through them, and an enemy's strike on the party does too.
---

# Combat

The game's combat is one small set of rules every character and enemy shares, and its community has documented them to the decimal. They live in `genshin-world` under `services/combat`, as functions over plain state with no rendering, no input and no three.js, since the engine knows no rule of the game as it knows no place. The world calls into them from its fixed steps: the character on the field's kit prices each of its hits, and the [enemies](/docs/genshin/enemies) age their elements and strike the party through them.

## How it works

```mermaid
flowchart TD
  HIT["A hit: its element, gauge and internal cooldown tag"] --> ICD{"applyInternalCooldown: does this hit apply its element?"}
  BLUNT["A blunt hit"] --> SHATTER["applyBluntHit: poise drains the Freeze, and what is left shatters"]
  SHATTER --> APPLY
  ICD -->|"its share of the gauge"| APPLY["applyElement: the element's reactions, in the game's priority"]
  APPLY --> STEP{"An aura this step reacts with?"}
  STEP -->|"yes"| CONSUME["Consume the auras by coefficient × what is left of the trigger; record the reaction once"]
  CONSUME --> LEFT{"Any trigger left?"}
  LEFT -->|"yes"| STEP
  STEP -->|"none left to try"| AURA{"Left over, and nothing it consumes remains?"}
  LEFT -->|"no"| AURA
  AURA -->|"yes"| TAX["Left as an aura: taxed to 0.8, decaying"]
  AURA -->|"no"| EC
  TAX --> EC{"Electro now beside Hydro?"}
  EC -->|"yes"| TICK["Electro-Charged ticks at once"]
  EC -->|"no"| OUT["The reactions"]
  TICK --> OUT
  FIXED["Each fixed step"] --> ADVANCE["advanceElementalState: auras decay; Electro-Charged and Burning tick"]
  ADVANCE --> OUT
  OUT --> DAMAGE["getDamage, getAmplifyingMultiplier, getCatalyzeBonus or getTransformativeDamage"]
```

Each target holds an `ElementalState`: its auras, its own clock, and when its Electro-Charged and Burning last ticked and it last crystallized. `createElementalState` makes an empty one.

### Auras

An attack applies a gauge of its element, in gauge units. Pyro, Hydro, Electro, Cryo and Dendro left as an aura are taxed to 0.8 of that gauge and decay evenly over 2.5 seconds a unit of the attack plus 7, so Bennett's 2U tap leaves 1.6U of Pyro for 12 seconds. Anemo and Geo leave no aura. A second attack of the same element keeps the larger gauge at the first aura's rate, except Pyro: a larger Pyro replaces the aura with its own rate.

### Reactions, in the game's priority

`ElementReactionStepsMap` holds, for each applied element, the reactions it tries in the order the game tries them. Each step names the auras it reacts with and the gauge of aura each unit of the trigger consumes. A step meeting several auras consumes them together, by the larger one's gauge. What is left of the trigger after a step goes on to the next, so 2U of Hydro on a Burning target vaporizes the Burning and its Pyro, then blooms the Dendro under them with the unit left over. A reaction is recorded once per application, however many auras it meets.

| Applied | Its reactions, in order                                                                                                |
| :------ | :--------------------------------------------------------------------------------------------------------------------- |
| Pyro    | Overloaded on Electro (1); Vaporize on Hydro (0.5); Melt on Cryo and Freeze (2); Burning on Dendro or Quicken          |
| Hydro   | Vaporize on Pyro and Burning (2); Frozen on Cryo (1); Bloom on Dendro and Quicken (0.5)                                |
| Electro | Aggravate on Quicken; Overloaded on Pyro and Burning (1); Superconduct on Cryo, then Freeze (1); Quicken on Dendro (1) |
| Cryo    | Superconduct on Electro (1); Melt on Pyro and Burning (0.5); Frozen on Hydro (1)                                       |
| Dendro  | Spread on Quicken; Quicken on Electro (1); Burning on Pyro or Burning; Bloom on Hydro (2)                              |
| Anemo   | Swirl on Electro, Pyro and Burning, Hydro, Cryo, then Freeze (0.5 each)                                                |
| Geo     | Shattered on Freeze; Crystallize on Electro, Pyro and Burning, Hydro, then Cryo (0.5 each)                             |

What is left once every step has run stays as an aura, if the element leaves one and no aura it consumes remains. A reaction with no coefficient consumes neither side, which is how auras come to coexist.

- **Electro-Charged** is no step: it is Electro and Hydro left on a target together. It ticks the moment they meet and each second after, every tick taking 0.4U from each aura that has more than that to give. Once one decays away it ends, ticking once more if half a second has passed since the last.
- **Quicken** consumes Dendro and Electro at 1 and leaves the gauge it consumed as its own aura, lasting 5 seconds a unit plus 6. Aggravate and Spread consume neither the Quicken nor their trigger, so the trigger goes on to its later steps and may lie beside the Quicken.
- **Burning** consumes nothing when it lights. It leaves a 2U Burning aura that never decays over the Pyro and Dendro beneath it, ticks every quarter second, and applies 1U of Pyro under Burning's internal cooldown. The Dendro and Quicken under it drain at twice their own decay, 0.4U a second at least, and it goes out once neither is left. Pyro or Dendro on a burning target refreshes it without triggering it again, and Dendro then replaces the Dendro whatever its gauge.
- **Frozen** leaves twice the gauge it consumed as a Freeze, which decays at 0.4U a second and faster by 0.1 every second it holds, so its gauge G lasts 2√(5G + 4) − 4 seconds. Hydro and Cryo lie under it. Pyro and Electro meet only the Freeze over a Hydro, and what is left of them stays as no aura. A Geo hit shatters it, at no gauge too, and `applyBluntHit` drains 0.006U of it per point of poise damage before shattering what is left. A Shatter takes 8U.
- **Swirl** records the gauge it spreads its element at, (G − 0.04) × 1.25 + 1, where G is the Anemo's gauge if the aura takes all of it and the aura's gauge if not. 1U of Anemo on 0.8U of Hydro spreads 2.2U.
- **Crystallize** triggers once a second on a target at most.
- **Bloom** leaves a Dendro Core. A core bursts six seconds after it is left, and at most five stand on the field, the oldest bursting as a sixth is left (`burstDendroCores`). Electro on a core is Hyperbloom and Pyro is Burgeon (`DendroCoreReactionTypeMap`).

Each recorded reaction carries the element its damage is dealt in, none for Shattered's physical damage or for a reaction that deals none.

### Damage

`getDamage` is the game's general formula. The talent's multiplier of its stat, plus any flat bonus, a hit's own additive base damage and a catalyze's, is multiplied by one plus the damage bonus and by a crit's one plus critical damage. It is then cut by the enemy's defence against the attacker's level, (5 × attacker level + 500) / (enemy defence + 5 × attacker level + 500) before any reduction or ignoring, and by the enemy's resistance, less any RES a status on the enemy takes off it, its element's or its Physical RES, as Enduring Rock's Geo RES and the Jade Shield's every RES do. An enemy of level L has 5 × L + 500 defence, so a hit from its own level is halved. Last it is multiplied by an amplifying reaction's multiplier. `getResistanceMultiplier` adds half a negative resistance, takes off a resistance up to 75%, and leaves 1 / (4 × resistance + 1) past that.

- **Amplifying**: Vaporize and Melt multiply their hit by 2 where Hydro vaporizes or Pyro melts, and by 1.5 the other way round. Elemental mastery raises that by 2.78 × EM / (EM + 1400), plus any reaction bonus (`getAmplifyingMultiplier`).
- **Catalyze**: Aggravate adds 1.15 and Spread 1.25 times the character's level multiplier to the hit's flat bonus, raised by 5 × EM / (EM + 1200) (`getCatalyzeBonus`).
- **Transformative**: Overloaded, Superconduct, Electro-Charged, Swirl, Shattered, Bloom, Hyperbloom, Burgeon and Burning deal their own damage, from 0.25 to 3 times the level multiplier. That is raised by 16 × EM / (EM + 2000) and cut by resistance alone, since it ignores defence and cannot crit (`getTransformativeDamage`).

`CharacterLevelMultiplierMap` is the wiki's level multiplier for characters at every level to 90, then 95 and 100.

The deployed team's [elemental resonance](/docs/genshin/party) adds to a kit hit's CRIT Rate, read in `strikeEnemy` before the hit's own reactions: Shattering Ice's 15% against an enemy Frozen or affected by Cryo, so a hit's critical roll is `random() < CRIT Rate + 0.15` on that enemy. The roll is drawn from the world's one seeded random source, the stream the kit's other rolls read, so a session's rolls repeat. The other resonances' stat effects are summed into each member's attributes, and reach the damage formula through them. Enduring Rock's DMG and Geo RES, and Sprawling Greenery's timed Elemental Mastery, are read as a strike lands, as the [party](/docs/genshin/party) page describes.

### Internal cooldown

A hit applies its element under an internal cooldown, kept per attacker, target and tag. `applyInternalCooldown` counts a hit into one and returns the share of its gauge it applies. A hit once the reset interval has passed restarts the timer and the count and applies; any other is the next hit of the group's gauge sequence. `DEFAULT_INTERNAL_COOLDOWN_GROUP` is the standard 2.5 seconds with every third hit applying, so Yoimiya's seven arrows melt on the first, fourth and seventh. `BURNING_INTERNAL_COOLDOWN_GROUP` applies once each two seconds.

### Shields and energy

`absorbShieldDamage` takes damage on a shield. Each point of its health absorbs its absorption times one plus the character's shield strength: a Geo shield's 150% of any damage, an elemental shield's 250% of its own element, and 100% otherwise. What it cannot absorb passes to the character. `getCrystallizeShieldHealth` is the shard's shield: its base for the crystallizing character's level, raised by 4.44 × EM / (EM + 1400).

`getEnergyGain` is the energy a party member gains from a particle or an orb. A particle gives 3 of their own element, 1 of another and 2 of none, and an orb three times that. A member off the field takes 80%, 70% or 60% in a party of two, three or four, and their energy recharge multiplies it.

## Calling in

The rules hold no clock of their own past a target's state, so a caller drives them:

1. Each fixed step, `advanceElementalState` moves every target's state on and pushes the ticks it brings onto the caller's array, so a quiet step allocates nothing.
2. A hit runs its element's gauge through `applyInternalCooldown` with its tag's group, a blunt hit through `applyBluntHit` first, then `applyElement` with the share it applies.
3. Each reaction returned prices its damage through the damage functions. A Swirl's spread gauge and a Burning tick's Pyro are applied by the caller to the targets round it, and a Bloom's core is the caller's to place.

The enemies' `damageEnemy` takes a hit's damage and poise damage, which is where these meet the enemies.

### The kit's hits

The character on the field runs its kit at the world's fixed step ([character controller](/docs/genshin/character-controller)). Each step reads the frame's presses and the body's state, starts the action the kit allows, and turns the body to the enemy the action's area scores highest. Every hit that lands runs through the steps above on each enemy in its area, and every particle an enemy drops is handed to the party's energy.

```mermaid
flowchart TD
  PRESS["A frame's presses, held for the step, and the attack held"] --> GATE{"Allowed? Movement state, cooldown, charges, energy, stamina"}
  GATE -->|"no"| IDLE["Nothing starts"]
  GATE -->|"yes"| ACTION["The kit's action: string, charged attack, plunge, skill or burst"]
  ACTION -->|"it starts"| AIM["The body turns to the enemy its area scores highest"]
  ACTION -->|"each hitmark"| HIT["A hit lands on each enemy in its area"]
  HIT --> STRIKE["strikeEnemy: blunt, internal cooldown, element, getDamage, damageEnemy"]
  STRIKE -->|"particles"| ENERGY["gainPartyEnergy: each standing member, up to its burst's cost"]
  ENEMY["An enemy's strike reaches the body"] --> HURT["strikePartyMember: the team's shields, then getDamage over the member's Max HP"]
  HURT -->|"the team all down"| RESPAWN["reviveParty at 35%, jumped to the nearest statue"]
```

The enemies' strikes go the other way: `strikePartyMember` prices an enemy's ATK through `getDamage` against the member on the field, takes it from the team's shields first, all at once, through `absorbKitShield`, and the world screen respawns the deployed team when all of it has fallen. A live taunt in aggro range takes the strike through `damageKitTaunt`.

## Decisions

- **The Traveler's kit is the first, at talent level 1.** Its five strikes, charged attack and plunges are the wiki's figures for Lumine's Foreign Ironwind, read into `createTravelerKit`: strikes of 44.5%, 43.4%, 53.0%, 58.3% and 70.8% of ATK with poise 40.5, 39.6, 48.6, 54 and 64.8; a charged attack of 55.9% and 72.2% for 20 stamina, poise 50.6 each; a plunge's collision of 63.9% with poise 25; and a low and a high plunge of 128% and 160%, poise 100 and 150, both blunt. The normal and charged attacks share the Normal Attack tag, and the plunges apply under none. Until the Traveler resonates with a statue, its skill and burst are placeholders shaped as the Anemo Traveler's: Palm Vortex's one hit of 176% on a 5 second cooldown, and Gust Surge's one hit of 80.8% for 60 energy on a 15 second cooldown.
- **The elementless Traveler deals physical damage with them.** Their gauges are set, but combat applies an element only for a character that has one, so the skill and burst are physical until a statue gives the Traveler its element.
- **Actions are a state machine on the fixed step.** Pressing the attack advances the string while the last strike's window is open, which closes at the frame the next attack may start (gcsim v2.47.2's frames, at 60 fps), and the string starts again 0.5 seconds after a strike ends unpressed, provisional. Holding past 0.3 seconds, also provisional, makes the string's next strike the charged attack once that strike ends, if 20 stamina is left to spend it (`startNextKitAction`). A press in the air high enough above the ground is a plunge, a low one when it lands from 2.4 metres or less and a high one from higher. `E` is the skill, on its cooldown, and `Q` the burst, at full energy, which it empties. The step reads the body's movement state, so no attack starts while climbing, swimming or gliding, and the skill and burst also start in the air, falling or jumping.
- **An attack aims as the game's does.** At each action's start the body turns to the enemy its targeting area scores highest: 0.7 × (1 − distance ÷ radius) + 0.3 × (1 − angle ÷ 180°), a fifth of it while the body stands more than 2 metres above the ground the enemies stand on, and a dead enemy never scored. The swords' normal and charged attacks target within 5 metres and 6 high, Palm Vortex within 15 and 10. With none in the area the body keeps its facing (`selectAttackTarget`).
- **A hit reaches what its cylinder holds.** Each hit's area is a cylinder centred on the body's feet. It reaches an enemy within its radius plus the capsule's, within half its fan plus the capsule's angular half width as seen from the body, and overlapping in height (`checkIsInAttackArea`). Palm Vortex's area is the wiki's, 6 metres at 100 degrees and 2 high; the plunge's collision is 1 metre all round, as the wiki gives it; the rest are provisional until the attack clips and a recording measure them.
- **An action holds the body still.** While an action plays, the controller is given the frame's presses with no move, so the body stands where it is and only turns to its target. A jump or a dash ends the action at once, ahead of the attack-cancel frame its `seconds` gives, since the kit does not model the earlier cancels yet.
- **The plunge strikes on its way down and as it lands.** Every 0.3 seconds while it falls, provisional, its collision hits what stands in its area, and the landing is the low or high plunge by the drop from its start.
- **A hit goes through combat as built.** A kit's hit is priced by `getDamage` from the attacker's attributes at the talent's multiplier. Its order is blunt first, then the internal cooldown and the element, then the damage with any amplifying, catalyze or transformative bonus, and last `damageEnemy` (`strikeEnemy`). No kit computes damage of its own.
- **Each member's cooldowns run at the fixed step.** Every member of the deployed team's skill and burst cooldowns lower each step, off the field too, and stand still while a screen holds the world (`stepPartyCooldowns`).
- **Particles reach every member standing.** Each particle a struck enemy drops takes the striker's element, and gives each standing member of the deployed team `getEnergyGain`'s energy, more to a member of that element, up to its burst's cost. A member's element is its row of the roster's, none for the Traveler (`createCombatant`). A fallen member takes none (`gainPartyEnergy`).
- **An enemy's strike uses the same formula.** Its ATK times a provisional multiplier of 1, as physical damage through `getDamage` with the member on the field's DEF and physical resistance, its base 0%. The least overflow the team's shields leave, over the member's Max HP, is the share the member takes (`strikePartyMember`).

## Key files

| File                                                                                   | Role                                                                    |
| :------------------------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| `packages/genshin-world/src/services/combat/aura/applyElement.ts`                      | An element applied to a target: its reactions in order, and its aura    |
| `packages/genshin-world/src/services/combat/aura/ElementReactionStepsMap.ts`           | Each element's reactions in the game's priority, with their coefficient |
| `packages/genshin-world/src/services/combat/aura/advanceElementalState.ts`             | Decay, Electro-Charged's and Burning's ticks, at the fixed step         |
| `packages/genshin-world/src/services/combat/aura/applyReactionAura.ts`                 | What Frozen, Quicken, Burning, Shattered and Crystallize leave or take  |
| `packages/genshin-world/src/services/combat/aura/constants.ts`                         | The aura tax and durations, and every reaction's documented number      |
| `packages/genshin-world/src/services/combat/damage/getDamage.ts`                       | The general damage formula                                              |
| `packages/genshin-world/src/services/combat/damage/getTransformativeDamage.ts`         | A transformative reaction's own damage                                  |
| `packages/genshin-world/src/services/combat/damage/CharacterLevelMultiplierMap.ts`     | The level multiplier by a character's level                             |
| `packages/genshin-world/src/services/combat/internalCooldown/applyInternalCooldown.ts` | A hit counted into its internal cooldown                                |
| `packages/genshin-world/src/services/combat/shield/absorbShieldDamage.ts`              | Damage taken on a shield                                                |
| `packages/genshin-world/src/services/combat/energy/getEnergyGain.ts`                   | Energy from a particle or an orb                                        |
| `packages/genshin-world/src/models/combat/ReactionType.ts`                             | Every reaction, merged from the amplifying, catalyze and transformative |
| `packages/genshin-world/src/services/kit/stepKit.ts`                                   | A kit's step: its action, its hits and what the presses start           |
| `packages/genshin-world/src/services/kit/stepActiveKit.ts`                             | The world's step of the kit on the field: aim, strikes, particles       |
| `packages/genshin-world/src/services/kit/strikeEnemy.ts`                               | A kit's hit on an enemy, priced and applied by combat                   |
| `packages/genshin-world/src/services/kit/strikePartyMember.ts`                         | An enemy's strike on the member on the field                            |
| `packages/genshin-world/src/services/kit/selectAttackTarget.ts`                        | The enemy an action turns the body to                                   |
| `packages/genshin-world/src/services/kit/checkIsInAttackArea.ts`                       | Whether a hit's cylinder reaches an enemy                               |
| `packages/genshin-world/src/services/kit/constants.ts`                                 | The Traveler's kit, the kit's timings and its areas                     |
| `packages/genshin-world/src/services/party/gainPartyEnergy.ts`                         | Particle energy, as [party](/docs/genshin/party) gives it               |

## Notes

- **What is left of a trigger stays at its own gauge.** An aura left over after a reaction is taxed and decays as an attack of the gauge left would, since the sources give no rate for a leftover.
- **A Freeze over a Freeze keeps the larger.** Frozen triggered again over a Freeze keeps the larger gauge at the Freeze's growing rate, as any aura reapplied keeps its rate. A new Freeze starts at 0.4U a second.
- **Burning's first tick is a quarter second after it lights.** The library places its first Pyro between a quarter second and 0.42 seconds after the text, and the rules take the earliest.
- **Electro-Charged's last tick is seen at the step.** An aura decaying out between two steps ends it at the step after, so a target advanced at the world's fixed step ends within a sixtieth of a second of the game's.
- **The wiki's mastery scales are taken as written.** Its 2.78 and 4.44 are rounded, and its tables of the bonus they give read them as written.

## Sources

- [Elemental Gauge Theory](https://genshin-impact.fandom.com/wiki/Elemental_Gauge_Theory), Genshin Impact Wiki: the aura tax, the aura's duration and decay, reapplication and Pyro's exception, and each reaction's coefficient.
- [Elemental Gauge Theory: Advanced Mechanics](https://genshin-impact.fandom.com/wiki/Elemental_Gauge_Theory/Advanced_Mechanics), Genshin Impact Wiki: Swirl's gauge, Freeze's gauge and duration, the blunt hit's poise cost and Shatter, Quicken's aura, and Burning's aura, drain and refresh.
- [Simultaneous Reaction Priority](https://genshin-impact.fandom.com/wiki/Elemental_Gauge_Theory/Simultaneous_Reaction_Priority), Genshin Impact Wiki: the order an applied element tries its reactions in, and the scenarios with several auras.
- [Electro-Charged](https://genshin-impact.fandom.com/wiki/Electro-Charged), Genshin Impact Wiki: its ticks, and the last tick as an aura decays out.
- [Damage](https://genshin-impact.fandom.com/wiki/Damage), Genshin Impact Wiki: the general formula, defence, resistance, and the amplifying, catalyze and transformative formulas.
- [Elemental Reaction: Level Scaling](https://genshin-impact.fandom.com/wiki/Elemental_Reaction/Level_Scaling), Genshin Impact Wiki: the level multiplier and the Crystallize shield by level, and each reaction's base damage at each level.
- [Elemental Mastery](https://genshin-impact.fandom.com/wiki/Elemental_Mastery), Genshin Impact Wiki: the mastery bonus of each kind of reaction.
- [Internal Cooldown](https://genshin-impact.fandom.com/wiki/Internal_Cooldown) and [its data](https://genshin-impact.fandom.com/wiki/Internal_Cooldown/Data), Genshin Impact Wiki: the standard rule, the tag and group, and each group's reset interval and gauge sequence.
- [Shield](https://genshin-impact.fandom.com/wiki/Shield) and [Crystallize](https://genshin-impact.fandom.com/wiki/Crystallize), Genshin Impact Wiki: absorption by element and shield strength, and the shard's shield and once-a-second limit.
- [Energy](https://genshin-impact.fandom.com/wiki/Energy), Genshin Impact Wiki: particles and orbs by element, the shares off the field, and Energy Recharge.
- [Foreign Ironwind](https://genshin-impact.fandom.com/wiki/Foreign_Ironwind), [Palm Vortex](https://genshin-impact.fandom.com/wiki/Palm_Vortex) and [Gust Surge](https://genshin-impact.fandom.com/wiki/Gust_Surge), Genshin Impact Wiki: the Traveler's multipliers, stamina, poise, tags and blunt plunges, and the Anemo skill's and burst's cooldowns and energy.
- [Normal Attack](https://genshin-impact.fandom.com/wiki/Normal_Attack), [Charged Attack](https://genshin-impact.fandom.com/wiki/Charged_Attack) and [Plunging Attack](https://genshin-impact.fandom.com/wiki/Plunging_Attack), Genshin Impact Wiki: a string of strikes, the stamina each charged attack costs, and the low and high plunge either side of 2.4 metres.
- [Area of Effect](https://genshin-impact.fandom.com/wiki/Area_of_Effect), [Targeting](https://genshin-impact.fandom.com/wiki/Targeting) and [Targeting/Data](https://genshin-impact.fandom.com/wiki/Targeting/Data), Genshin Impact Wiki: the hit cylinders, the targeting score and its altitude limit, and the swords' targeting zone.
- [Exploration](https://genshin-impact.fandom.com/wiki/Exploration), Genshin Impact Wiki: no combat while climbing, gliding or swimming.
- [Elemental Gauge Theory](https://library.keqingmains.com/combat-mechanics/elemental-effects/elemental-gauge-theory) and [Transformative Reactions](https://library.keqingmains.com/combat-mechanics/elemental-effects/transformative-reactions), KeqingMains Theorycrafting Library: the decay rate, Electro-Charged's ticks, Burning's tick, and the Dendro Core's lifetime and limit.
