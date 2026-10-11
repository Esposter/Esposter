---
title: Character kits
description: The framework every playable character's combat kit is written on, and the table linking to one page per character.
---

# Character kits

A character's combat kit is its skills, cooldowns, costs and talent multipliers, and the game keeps those in its tables by the character's skill sets. Every playable character's kit is written on the framework below: the skill sets and talent multipliers read from the tables, the targeting that turns an action to its enemy, and the shared effects and kit events every kit uses. The table at the end links one page per character, and it is the record of which kits are built. The kits' hits are [combat](/docs/genshin/combat)'s, and the kit's action state machine is documented there too. The attributes a kit is priced from are on [character attributes](/docs/genshin/character-attributes), and the character's movement on the field is on [character controller](/docs/genshin/character-controller).

## Skill sets

A character has one skill set in its own form, and a set for each element form its element may take, the one a statue's element picks. A set holds a skill, the character's elemental skill, and a burst, its energy skill, each read from the skill table by its id. The skill has a cooldown and its charges, the burst a cooldown, an energy cost and the element it deals, the element its energy is named as.

```mermaid
flowchart LR
  AV["AvatarExcelConfigData: each avatar's own skill sets and the element sets it may take"] --> RD["getCharacterSkillKits: each set's skill and burst, read from their rows"]
  SK["AvatarSkillDepotExcelConfigData and AvatarSkillExcelConfigData, in the dump"] --> RD
  RD --> JSON["stats/characterSkillKits, published with the other stat tables"]
  JSON --> APP["the hosted game data; no kit reads it yet"]
```

- **A set with neither a skill nor a burst is left out.** A character none of whose sets has either is left out too. One of the Traveler's element sets, 705, holds neither in this dump, so the dump gives the Traveler no form for it.
- **A burst's element is the one its energy names, when it names one of the seven.** A burst that costs no element has none. Which set a Traveler's kit reads is for the element a statue gives, which is not built yet.
- **The table is published by** `pnpm -C scripts genshin:assets stats`, the same run as the characters, weapons and artifacts. Each character is checked against the world's schema as it is built.

## Talent multipliers

The stats run publishes each playable character's combat talent multipliers as its own entry of the `talentMultipliers` index, by its avatar id, keyed by the talent's proud skill group. A level keeps its parameters (`paramList`) up to the last one that is not zero, so a read past that point is zero. The labels, the text id naming each parameter (`paramDescList`), go apart into the character's entry of the `talentLabels` index, which the combat table never carries.

Each character's multipliers are an entry of the hosted `talentMultipliers` index, under its avatar id ([hosted game data](/docs/genshin/hosted-game-data)). `TalentMultiplierLoaderMap` is keyed by avatar id, and each entry reads that character's record from the world's game data base and checks it against its schema. `readTalentMultipliers` merges the records by group, and `getTalentMultiplier` reads a parameter from the merged table by its index. The world's gate reads the starting team's multipliers before the world opens, so its first frame has each member's combatant, and the world reads a character's as the team changes to take it in, reading a failed read again `DATA_FETCH_RETRY_MS` later, since a team that stays as it is starts no other. A kit is built from the loaded table, so the world's entry carries none of them. A member whose multipliers are still in flight has no combatant yet, which is a loading state rather than an error: it gains no energy, and on the field its kit's step waits, starting no attack, skill or burst and holding the team's effects, while the body moves on. The one static import this replaced was 1.4 MB of it.

```mermaid
flowchart LR
  P["ProudSkillExcelConfigData: each group's levels and their parameters"] -->|"stats run, one record per character"| M["talentMultipliers index: avatar id to its record, keyed by group"]
  M -->|"fetched at the gate or as a character joins, checked by its schema"| R["readTalentMultipliers: merged by group"]
  R -->|"getTalentMultiplier reads a parameter by its index"| T["createTravelerKit: the Anemo form's hits' multipliers"]
```

## Targeting

An action turns the body to the enemy it targets as it starts. That is the living enemy inside the action's targeting area scoring highest, where an enemy's score is 0.7 times its nearness to the body within the area's radius, plus 0.3 times its nearness to straight ahead, the angle from the body's facing over a half-turn. An enemy more than 2 metres above or below the body scores a fifth of that. Enemies outside the area, and the dead, are not targeted. The view, current-target and priority coefficients are not built.

## Shared effects

Each effect is on the party, in the list a `KitEffectState` holds, so a switch leaves it running, and a drown or a jump clears it. Each one is ticked each step.

- **Damage** is a hit: its talent multiplier, its gauge of an element, the element it names when it is not its character's own, the DMG Bonus it carries of its own, if any, added to its striker's as it is priced, and the additive base damage it reads from its striker, if any, added to its base damage. A hit with no internal cooldown applies its whole gauge, and one under a cooldown shares it through it.
- **Infusion** makes the character's normal attacks, charged attack and plunges deal its element at the gauge the hit gives it, 1U for a strike and 0U for a collision. One that converts the attacks gives each hit its converted poise and reach where it has them, and one with a DMG Bonus adds it to each hit it infuses, as Bane of All Evil's does to Xiao's Normal, Charged and Plunging Attacks alone. It is refreshed by a second one of its kind on the same character, not stacked.
- **Buff** adds a stat bonus to the character's pricing for its seconds: a flat ATK adds to its attack and any other bonus to its attribute total. It is refreshed by one of its attribute from the same source on the same character, not stacked: a source names the effect that gives it, so two effects on one attribute run side by side, as Sprawling Greenery's two Elemental Mastery buffs do.
- **Heal** is `healPartyMember`: a share of a standing member's max HP, never above all of it. A downed member stays down, as only a revive brings one back.
- **Energy** is the party's `gainPartyEnergy`, which an enemy's drop calls through `collectKitEnergyDrops`.
- **Field** is a circle placed where its character casts, for its seconds, with a tick on a schedule. Each tick runs while the body stands inside it, reading the character on the field and the team, and a tick's own buffs and infusions start at their full seconds.
- **Summon** is an entity cast where its character stands, which lands its own hits on the seconds their hitmarks fall at, for its seconds. It is priced by the combatant that cast it, as it stood then, and its hits land from its own body, not the character's. A summon may travel: its body moves forward at its speed from its start on its clock, and its hits are reached from where it is then. A summon may follow the body on the field instead: its body stands where that body stands on each step, whoever is on the field, and its hits are reached from there. A summon whose seconds end on its last hitmark lives `SUMMON_LINGER_SECONDS` past it, so the step that lands its last hit still has it on the field however its clock and its seconds left round.
- **A coordinated summon** is set going by the character on the field, whoever that is: as that character starts a normal attack, `coordinateKitSummons` runs each summon's `onNormalAttackStart` from that character's body and combatant, called by the character component beside the action's own start. Any other action sets none going, and the summon's hook decides what it casts.
- **A shield** is set on the team by the character that casts it, for the seconds left of it, and is recast over the one that character already holds. It takes the damage the character on the field takes, whichever character cast it: an enemy's strike is taken by every live shield at once, each absorbing the full damage through the combat's `absorbShieldDamage` at the struck character's shield strength, and the character loses the least any of them passes on. The wiki gives the rule in its own words: "when the active character takes damage, damage is dealt to shield health first", and "When a character has more than one shield, the damage dealt by an enemy will affect every active shield simultaneously" ([Shield](https://genshin-impact.fandom.com/wiki/Shield)). A shield is dropped once its health is spent. A shield with an explosion goes off as it ends, whether its seconds run out, its health is spent or it is recast over.
- **A taunt** is an entity placed where its character cast it, with health, which draws the enemies' strikes while it stands. It explodes once, from its body and priced by the combatant that cast it, when its seconds run out or its health is gone. An enemy within its aggro range strikes it instead of the character, and each strike is taken from its health by `damageKitTaunt`.
- **A bubble** is held on one enemy by a hit that casts it, for its seconds. A hit with poise damage bursts it, as its seconds running out do: the Omen goes on the enemy from the burst, and the explosion lands on that enemy alone, from where it stands, priced by the combatant that cast it. A hit that casts a bubble holds the enemy in one, and never restarts the one it holds, since each cast's bubble bursts on its own.
- **A status on a character** is a mark it carries for its seconds, by an id (`KitStatus`), as gcsim's character statuses are: a passive's or a constellation's own cooldown, such as Thundering Retribution's half second on the character on the field, or a mark a kit reads later, such as Havoc: Annihilation's on Tartaglia's stance. A second one of its id on the same character restarts it, and `checkHasKitStatus` reads it.
- **A stance** plays its own normal attacks, charged attack and its stamina, skill and burst in place of its character's kit while it lasts (`KitStance`), and counts the seconds it has held, which its end reads. The step of the character on the field plays `getStancedKit`'s kit, so a stance's attacks are that character's normal and charged attacks wherever a kit's actions are read: their hits' kinds, an infusion, a coordinated summon.
- **A field may lower cooldowns.** A skill or a burst cast while the body stands inside a field with a `cooldownMultiplier` has its cooldown multiplied by it, each such field multiplying in turn, as Atmospheric Revolution's frost field does (`getKitFieldCooldownMultiplier`).
- **An infusion may quicken the normal attacks.** An infusion with a `normalAttackSpeedBonus` plays each normal attack of its character that much faster, its seconds and its hitmarks alike, as Steady Breathing's does.
- **A strike may carry a DMG Bonus against some enemies.** A kit's `getStrikeDamageBonus` reads each of its own strikes and the enemy it lands on, and adds what it returns to the hit's DMG Bonus as it is priced, as Frozen to the Bone's 15% against an enemy with Cryo on it and Rally of Four Blades' 15% against an enemy with less of its HP left do.
- **A status on an enemy may strike on its own schedule.** A status with a `tickIntervalSeconds` counts down to its next tick, and each tick that falls due while it lasts is sent to the kits as an event (`tickEnemyStatuses`), as Hydrospout's on Riptide is. A refresh restarts its seconds and keeps the schedule it holds. A status may also cut the ATK the enemy strikes with by its `attackReduction`, as Divine Suppression's Talisman does, and a status's own interval is a status of its own, as Riptide Flash's 0.7 seconds on each enemy are.

## Kit events

A passive or a constellation that answers something happening in combat is a kit's `onKitEvent`, one handler on each kit over one channel. The step of the character on the field sends each event to the kit of every member of the deployed team whose combatant is built, on the field or off it (`emitKitEvent`), and each kit reads it as its own character, whose ascension and constellation count gate what it does. A handler writes through the team's effects, the party and the enemy's statuses, and a strike it sets off is a summon cast at the enemy or the body, landing a frame or more on, as gcsim queues them.

```mermaid
flowchart TD
  STEP["stepActiveKit, at the fixed step"] -->|"another character on the field than the last step's"| SWAP["CharacterSwapped"]
  STEP -->|"stepKitEffects drops an effect that ran out"| EXPIRED["EffectExpired"]
  STEP -->|"tickEnemyStatuses: a status's tick falls due"| TICK["StatusTicked"]
  STEP -->|"a normal attack's first hitmark falls"| LANDED["NormalAttackLanded"]
  STEP -->|"a burst starts, ahead of its own start"| BURST["BurstUsed"]
  STEP --> STRIKES["strikeKitEnemies: each strike on each enemy it reaches"]
  STRIKES -->|"the hit triggered reactions"| REACTION["ReactionTriggered"]
  STRIKES -->|"the enemy took its damage, CRIT or not, defeated or not"| DAMAGE["DamageTaken"]
  STRIKES -->|"collectKitEnergyDrops: the enemy dropped energy, which the team took"| PARTICLE["EnergyParticleCollected"]
  SWAP --> EMIT["emitKitEvent: every deployed member's kit, as its own combatant"]
  EXPIRED --> EMIT
  TICK --> EMIT
  LANDED --> EMIT
  BURST --> EMIT
  REACTION --> EMIT
  DAMAGE --> EMIT
  PARTICLE --> EMIT
  EMIT --> EFFECTS["the kit's handler: summons, statuses, heals, energy, cooldowns"]
  EFFECTS -->|"its summons' hits, on a later step"| STEP
```

- **CharacterSwapped** carries the character that left the field and the one now on it, read off the character the team's effects last stepped with (`KitEffectState.fieldCharacterId`). Chongyun's field infuses the one coming on, Tartaglia's Melee Stance ends as he leaves, and Fischl's burst spawns its Oz at once.
- **EffectExpired** carries an effect the step dropped, its seconds run out or ended by its kit. Rimechaser Blade strikes as Chongyun's field ends, and Tartaglia's stance sets his skill's cooldown as it ends.
- **NormalAttackLanded** carries a normal attack of the character on the field as its first hitmark falls, whether or not it struck anything. Evernight Raven's Oz attacks along with it, Gaze of the Deep fires with Fischl's own, and Ice Unleashed's blades follow Chongyun's fourth strike.
- **ReactionTriggered** carries an enemy, the reactions a hit triggered on it and the combatant that dealt the hit. Thundering Retribution answers an Electro-related one the character on the field triggers while Oz stands.
- **DamageTaken** carries an enemy, the hit as it struck, its kind of attack when it is one of its kit's own actions (`getKitAttackTag`), the combatant that dealt it, whether it was a CRIT hit and whether it defeated the enemy. The Talisman's heal, A Glimpse into Arcanum, Ascetics of Frost, Frozen Skies, and Riptide's application and every strike it sets off answer it.
- **StatusTicked** carries an enemy and the status on it whose tick fell due. Hydrospout answers Riptide's.
- **BurstUsed** carries the member that used its Elemental Burst and the burst's energy cost, sent as the burst starts and ahead of the burst's own start, as gcsim announces a burst before it plays. Resolve's stacks from another member's burst answer it.
- **EnergyParticleCollected** carries the particles or orbs an enemy dropped: how many, which of the two, their element, none for a clear one, and the member on the field, who collects them. It is sent once the team has taken their energy, every standing member by the game's rule, the one on the field in full and the others a share by the party's size, as gcsim distributes a particle before announcing it. Every drop is collected where it falls, a strike's, a reaction's reach or an elemental tick's alike (`collectKitEnergyDrops`). Wishes Unnumbered's Resolve answers it.

## Framework decisions

- **A kit's action carries its start.** A kit action may name an `onStart` that adds its effects, given the body, the character's combatant, the party and the enemy it turned to, so a module writes what its burst or skill sets going without the framework knowing which. A burst may name a variant the same way a skill hold does, played instead while its check holds on the step it starts.
- **A character's ascension phase is on its combatant.** A passive reads `combatant.ascension` against the phase its table names, so the Diluc A4 gate is `ascension >= 4`.
- **A character's constellations are on its combatant as a count.** A character's `constellationCount` is on her `Character` record, and the world copies it onto the combatant beside its ascension phase. No save holds the roster yet, so a reload starts without the characters a player held, as the [save data proposal](/docs/proposals/genshin/save-data) records. A constellation reads `combatant.constellationCount` against the level it needs, so Breastplate's C1 gate is `constellationCount >= 1` and its C4 gate `constellationCount >= 4`, each read as the effect is cast. Bennett's C1 and C6 read it alike, on `constellationCount >= 1` and `constellationCount >= 6`.
- **A gcsim call says what it puts on the character.** "ApplySelfInfusion" puts an elemental aura on the character, not a weapon infusion; only "AddWeaponInfuse" is one, and the kit's `infusion` effect is that. A branch on `c.Base.Cons >= N` is constellation N, so the kit gates it on `constellationCount >= N`. The Bennett fix is the evidence: its field infused the character at every constellation, having read the self-infusion as a weapon infusion, with the Cons 6 branch left ungated.
- **Boxes are circles.** An area holds a fan or a circle, so a box is priced as the circle to its farthest corner, provisional until areas hold boxes.
- **A kit's provisional values share four causes.** A plunge or charged attack gcsim has no file for, or gives no frames, lands as its action starts and ends at 0. A poise gcsim gives none reads 0. A hold's threshold with no table or wiki figure is half a second, Bennett's first Charge Level's 0.5. A reach on a target is the circle round the body until areas hold targets. A kit's own page names only the value that differs from these four.
- **A collision infused at 0U still deals the element.** A hit's element no longer needs a gauge, so the collision's Pyro damage lands with no aura, as the wiki's table gives it.
- **A charged attack after a strike skips its windup.** gcsim skips 14 frames of the charge's windup after a normal attack, so the hit lands at 56 frames here, and at 70 from rest, which the kit does not start.
- **A skill with holds starts on its release.** A kit's `elementalSkillHolds` are ordered by their minimum seconds, and a release plays the highest level its held seconds reach, else the press, on that level's cooldown. The press therefore starts when the key is let go, as the game's Charge Levels do, rather than on the press.
- **A cooldown multiplier is read as a skill's cooldown starts.** `getSkillCooldownMultiplier` takes the step's context, the body, the combatant and the team's effects, and each skill's cooldown is multiplied by it when the skill starts. Bennett's A1 cuts every Passion Overload by 20%, and A4 halves it while Bennett stands in a field he cast, which a field's `characterId` names. The deployed team's Impetuous Winds multiplies a skill's cooldown by a further 0.95 after the kit's own, in `startNextKitAction`, so the two compose.
- **A charged attack's stamina multiplier is read as it starts.** `getChargedAttackStaminaMultiplier` takes the step's context, and a charged attack's stamina is multiplied by it both where the pool is checked and where it is spent, in `startNextKitAction`, so a multiplier of none starts the attack on an empty pool. A charged attack that costs none spends nothing, so it does not hold the pool's refill back. Ningguang's Backup Plan gives none while she holds a Star Jade, from Ascension 1, and Impetuous Winds' cut applies after the kit's, as it does to every spend.
- **An enemy's strike takes the team's shields through the combat shield, all at once.** `absorbKitShield` gives the strike's damage to every live shield, each priced by `absorbShieldDamage` with the struck character's shield strength, the rule the combat page gives, so the Geo shield's 150% and the shield strength are the combat's. The character takes the least overflow among them as damage to HP, so a shield that holds the whole strike leaves none. The kit keeps no second absorption arithmetic.
- **An enemy strikes the nearest live taunt within its aggro range.** `selectEnemyTaunt` picks, for each enemy on each step, the nearest taunt within `ENEMY_AGGRO_RANGE` of the enemy, and a taunt with no seconds or no health left is not picked. The taunt takes the damage the strike would deal the active character, as the kit gives a taunt no defence of its own.
- **An enemy's statuses add to the damage of each hit on it.** An enemy carries statuses for their seconds, stepped with the enemy. A hit's `enemyStatus` gives it to each enemy it strikes before the hit's damage is taken, restarting a status of its id, each status's `damageTakenBonus` adds to the damage bonus the hit reads, its `resistanceReduction` lowers the enemy's resistance to each element it names, as Enduring Rock's Geo RES does, and its `physicalResistanceReduction` lowers the Physical RES a physical hit reads, as the Jade Shield's does.
- **The team's effects are the world screen's.** The screen holds one `KitEffectState`, the character on the field steps it, and the enemies and their strikes read its list. A write reassigns the list rather than changing it, as the stepping and the adding do, and the character emits `clearKitEffects` on a drown, a jump and its unmount, which the screen answers by emptying the list, so a shield or taunt does not outlive a drown, a jump or the character's unmount. A switch clears nothing, so a shield another character cast stands while someone else is on the field.
- **A skill's charges are the seconds until every one is back.** A kit's `elementalSkillCharges` gives its skill more than one, and the party member's one skill cooldown counts the seconds until all of them are back: each use adds its cooldown, and the skill starts while no more than the other charges' cooldowns are left, which `getSkillReadySeconds` reads for the step and the HUD alike. That is the game's recharge, a charge at a time, each on the skill's cooldown, as gcsim's charges run, and a skill of one charge waits out the whole cooldown as before. A use adds its cooldown at the kit's multiplier and Impetuous Winds', and the charges' threshold takes Impetuous Winds' alone, which is exact while no kit with charges has a multiplier of its own, as none does. The HUD counts down only while no charge stands, and the count of charges the game draws on the button is not built. Klee's and Xiao's skills hold 2, their skill sets' count, written beside each kit as a kit reads no skill set.
- **One event channel, not a hook per event.** A kit has one `onKitEvent`, sent every event of combat while its character is deployed, as gcsim subscribes each character to the core's events, and a handler that answers only some ignores the rest. A new passive or constellation is a branch of its kit's handler, never a new hook on the framework.
- **An action's start is given the enemy it turned to.** `onStart` reads the target the step's targeting picked, so a hit gcsim centres on the primary target lands there from a summon, as Flash of Havoc does.
- **A strike an event sets off is a summon.** Thundering Retribution, the Talisman's and Riptide's strikes and the coordinated attacks are summons cast where the enemy or the body stands, landing a frame or more on as gcsim queues them, priced by the combatant that casts them; Fischl's are priced by Oz, which holds her as she cast it.
- **A hit's kind of attack is read off its kit's actions.** `getKitAttackTag` reads it before an infusion copies the hit, from the kit as its stance plays it, and a summon's hit carries none, though gcsim tags some of them, Gaze of the Deep's and Riptide Flash's among them, Normal Attack DMG; no handler reads a summon's kind yet.
- **A normal attack lands as its first hitmark falls.** `NormalAttackLanded` is sent once for each normal attack, whether or not it strikes, as the wiki gives Evernight Raven "every execution of a Normal Attack regardless if it hits", where gcsim fires it as the attack starts and every second it holds.
- **An interval on an enemy is a status of its own.** Riptide Flash's 0.7 seconds, Riptide Slash's 1.5 and the Talisman heal's second each go on the enemy as a status of their own id, as gcsim keeps them, and a passive's own interval goes on its character as a `KitStatus`.
- **A skill's sweep reads full while more is left than the kit's own cooldown**, as a stance's end sets on Tartaglia's 1-second press cooldown.
- **A Swirl's member is matched by its element from the deployed combatants.** The kit event context now carries every built combatant of the deployed team by id (`KitEventContext.characterIdCombatantMap`), so a passive reads each member's element as the Swirl's element is read.
- **A field's Geo count reads the deployed team's combatants.** A field tick carries every built combatant of the deployed team by id, which Crunch counts its Geo members from, as gcsim counts the party when it loads. The effects step takes that map optionally, and an empty one counts no Geo characters.

## Key files

| File                                                                                  | Role                                                                                                                                                                            |
| :------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/models/character/SkillDepot.ts`                           | A skill set: its skill's cooldown and charges, its burst's cooldown, cost and element                                                                                           |
| `packages/genshin-world/src/models/character/CharacterSkillKit.ts`                    | A playable character's skill sets by its id                                                                                                                                     |
| `scripts/src/services/genshinAssets/stats/getCharacterSkillKits.ts`                   | Every playable character's skill sets, from the dump's tables                                                                                                                   |
| `scripts/src/services/genshinAssets/stats/toSkillDepot.ts`                            | One skill set, from its depot row and the skill rows                                                                                                                            |
| `scripts/src/services/genshinAssets/stats/toTalentTables.ts`                          | Each character's talent groups: their levels, parameters and labels, apart                                                                                                      |
| `scripts/src/services/genshinAssets/stats/writeTalentTables.ts`                       | Each character's entries of the two talent indexes, and the loader map whose entries read the hosted index                                                                      |
| `scripts/src/services/genshinAssets/commands/statsCommand.ts`                         | Publishes the skill sets as `stats/characterSkillKits` with the other stat tables                                                                                               |
| `packages/genshin-world/src/generated/talentMultipliers/TalentMultiplierLoaderMap.ts` | The loader map reading each character's multipliers from the hosted index as the character joins                                                                                |
| `packages/genshin-world/src/services/kit/readTalentMultipliers.ts`                    | The loaded characters' multipliers, checked and merged by proud skill group                                                                                                     |
| `packages/genshin-world/src/composables/useWorldCombat.ts`                            | The deployed team's kits, built from the gate's multipliers and a character's read as the team takes it in                                                                      |
| `packages/genshin-world/src/services/kit/createCombatant.ts`                          | A character's combatant once its kit is built: its attributes, and its element and weapon type off the roster                                                                   |
| `packages/genshin-world/src/services/kit/stepActiveKit.ts`                            | The kit on the field at the world's step, playing nothing while its combatant is not built, its stance's actions while one holds, and the step's events sent to the team's kits |
| `packages/genshin-world/src/services/kit/getTalentMultiplier.ts`                      | A talent's parameter at a level, by its index                                                                                                                                   |
| `packages/genshin-world/src/services/kit/selectAttackTarget.ts`                       | The targeting score an action turns the body to                                                                                                                                 |
| `packages/genshin-world/src/models/kit/Combatant.ts`                                  | A character as its hits are priced, its element and the kind of weapon it wields among what it carries                                                                          |
| `packages/genshin-world/src/models/kit/KitSkillHold.ts`                               | A skill's hold level: its action, cooldown and the seconds held to reach it                                                                                                     |
| `packages/genshin-world/src/models/kit/KitStepContext.ts`                             | What a step reads beyond its input: the body, the combatant and the team's effects                                                                                              |
| `packages/genshin-world/src/models/enemy/EnemyStatus.ts`                              | An enemy's status: its id, the seconds left of it, the DMG taken it adds to each hit, the RES and ATK it takes off, and its own tick                                            |
| `packages/genshin-world/src/services/enemy/addEnemyStatus.ts`                         | Gives an enemy a status, restarting the one it already holds of its id and keeping its tick's schedule                                                                          |
| `packages/genshin-world/src/services/kit/effects/stepKitField.ts`                     | A field's schedule, run on each step, ticking while the body stands in it, and a following field's centre moved to the body                                                     |
| `packages/genshin-world/src/services/kit/effects/stepKitTaunt.ts`                     | A taunt's explosion, once its seconds or its health run out                                                                                                                     |
| `packages/genshin-world/src/services/kit/selectEnemyTaunt.ts`                         | The taunt an enemy's aggro picks, as the [enemies](/docs/genshin/enemies) page sets out                                                                                         |
| `packages/genshin-world/src/services/kit/readKitStackedHit.ts`                        | A stacked hit's multiplier and poise by the stacks on an enemy, which the hit consumes                                                                                          |
| `packages/genshin-world/src/models/kit/KitStackedHit.ts`                              | A hit whose multiplier and poise are set by the stacks of a status on the enemy it strikes                                                                                      |
| `packages/genshin-world/src/services/kit/getSkillReadySeconds.ts`                     | The seconds before a skill can be used again, read off the seconds until every charge of it is back                                                                             |
| `packages/genshin-world/src/services/kit/createTargetedHitArea.ts`                    | A hit gcsim centres on the target, priced round the body at the targeting's radius plus its own                                                                                 |
| `packages/genshin-world/src/services/kit/effects/absorbKitShield.ts`                  | Every live shield on the team takes an enemy's strike through the combat's absorption                                                                                           |
| `packages/genshin-world/src/services/kit/effects/stepKitSummon.ts`                    | A summon's clock, moving a following or travelling summon and landing the hits whose hitmarks fall within each step                                                             |
| `packages/genshin-world/src/services/kit/effects/coordinateKitSummons.ts`             | Sets each coordinated summon going as the character on the field starts a normal attack                                                                                         |
| `packages/genshin-world/src/models/kit/KitSkillChain.ts`                              | A skill's follow-up presses and the window each press leaves open                                                                                                               |
| `packages/genshin-world/src/generated/characterKitMap/CharacterIdCreateKitMap.ts`     | The kit map, generated at build from every module in `services/kit/characters/` keyed by its declared id                                                                        |
| `packages/genshin-world/scripts/kit/generateCharacterKitMap.ts`                       | Writes the kit map: the build hook that generates it                                                                                                                            |
| `packages/genshin-world/src/services/kit/effects/healKitStriker.ts`                   | Heals the character that struck an enemy by a hit's share of its ATK, per enemy struck                                                                                          |
| `packages/genshin-world/src/models/kit/KitEffectState.ts`                             | The team's effects, held on one owner so each write reassigns the list                                                                                                          |
| `packages/genshin-world/src/services/kit/effects/addKitEffect.ts`                     | Adds an effect, refreshing one of its kind on the same character from the same source, of the same id, or the same stance                                                       |
| `packages/genshin-world/src/services/kit/effects/createKitSummon.ts`                  | Builds a summon cast where its body stands, landing its hits from there, for its seconds or a tenth past its last hit                                                           |
| `packages/genshin-world/src/services/kit/effects/stepKitEffects.ts`                   | Runs the effects' seconds down, a stance's held seconds up, and drops those that run out into the expired effects                                                               |
| `packages/genshin-world/src/services/kit/effects/getKitInfusion.ts`                   | The infusion on a character's normal attacks, charged attack and plunges, if one is on it                                                                                       |
| `packages/genshin-world/src/models/kit/KitBubble.ts`                                  | A bubble holding an enemy: its seconds, its explosion and its Omen, until it bursts                                                                                             |
| `packages/genshin-world/src/services/kit/effects/strikeKitBubble.ts`                  | A hit's bubble: a poise hit bursts the enemy's, and a casting hit holds the enemy in one                                                                                        |
| `packages/genshin-world/src/services/kit/effects/stepKitBubble.ts`                    | A bubble's clock: its burst, and the explosion on its enemy alone                                                                                                               |
| `packages/genshin-world/src/services/kit/effects/stepKitShield.ts`                    | A shield's explosion, from the body on the field, once its seconds run out or its health is spent                                                                               |
| `packages/genshin-world/src/services/kit/effects/healKitParty.ts`                     | Rolls a hit's party heal under a shield or unshielded, healing each member by a flat HP and ATK, DEF and Max HP shares                                                          |
| `packages/genshin-world/src/models/kit/KitPartyHeal.ts`                               | A hit's party heal: its chance, ATK, DEF and Max HP shares, flat HP and whether it needs a shield                                                                               |
| `packages/genshin-world/src/services/kit/effects/infuseKitHits.ts`                    | Infuses a step's landed hits from the kit's normal attacks, charged attack and plunges                                                                                          |
| `packages/genshin-world/src/services/kit/effects/getBuffedCombatant.ts`               | The combatant with its buffs added to the pricing                                                                                                                               |
| `packages/genshin-world/src/services/kit/constants.ts`                                | The targeting weights, the kit's shared timing constants, the radius of a field with no edge and the weapons a melee infusion converts                                          |
| `packages/genshin-world/src/models/kit/KitEvent.ts`                                   | The events of combat a kit answers, one per `KitEventKind`                                                                                                                      |
| `packages/genshin-world/src/models/kit/KitEventContext.ts`                            | What a kit reads and writes as an event reaches it, as its own character                                                                                                        |
| `packages/genshin-world/src/services/kit/emitKitEvent.ts`                             | Sends an event to the kit of each deployed member whose combatant is built                                                                                                      |
| `packages/genshin-world/src/services/kit/collectKitEnergyDrops.ts`                    | An enemy's energy drops, taken by the team and sent to its kits as collected by the member on the field                                                                         |
| `packages/genshin-world/src/services/kit/strikeKitEnemies.ts`                         | A step's strikes on the enemies they reach, priced, and the reactions and damage they cause sent as events                                                                      |
| `packages/genshin-world/src/services/kit/tickEnemyStatuses.ts`                        | The ticks of the enemies' statuses that strike on their own schedule, as events                                                                                                 |
| `packages/genshin-world/src/services/kit/getKitAttackTag.ts`                          | A hit's kind of attack, read off the kit's action it belongs to                                                                                                                 |
| `packages/genshin-world/src/models/kit/KitStatus.ts`                                  | A status on a character: a cooldown of its own or a mark its kit reads                                                                                                          |
| `packages/genshin-world/src/models/kit/KitStance.ts`                                  | A stance's actions in place of its kit's, and the seconds it has held                                                                                                           |
| `packages/genshin-world/src/services/kit/effects/getStancedKit.ts`                    | The kit a character plays while a stance of its own holds                                                                                                                       |
| `packages/genshin-world/src/services/kit/effects/checkHasKitStatus.ts`                | Whether a character carries a status of an id                                                                                                                                   |
| `packages/genshin-world/src/services/kit/effects/getKitFieldCooldownMultiplier.ts`    | The cooldown factor of the fields a skill or burst is cast inside                                                                                                               |
| `packages/genshin-world/src/services/party/gainPartyMemberEnergy.ts`                  | A flat amount of energy a passive or constellation gives one member, up to its burst's cost                                                                                     |
| `packages/genshin-world/src/services/party/healPartyMember.ts`                        | Heals a standing member up to all its HP                                                                                                                                        |

## Sources

- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the avatar, skill depot and skill tables the table is read from, and the proud skill table the multipliers are read from.
- [Shield](https://genshin-impact.fandom.com/wiki/Shield), Genshin Impact Wiki: the active character's damage is taken by its shields first, every active shield takes an enemy's strike at once, and absorption is scaled by the active character's Shield Strength.

## Characters

| Page                                                | Covers                                                               |
| :-------------------------------------------------- | :------------------------------------------------------------------- |
| [Albedo](/docs/genshin/kits/albedo)                 | Solar Isotoma, Transient Blossoms and the Fatal Blossoms             |
| [Aloy](/docs/genshin/kits/aloy)                     | Freeze Bomb and Rushing Ice                                          |
| [Amber](/docs/genshin/kits/amber)                   | Explosive Puppet's Baron Bunny and Fiery Rain                        |
| [Barbara](/docs/genshin/kits/barbara)               | Let the Show Begin♪ droplets, Melody Loop and Shining Miracle♪       |
| [Beidou](/docs/genshin/kits/beidou)                 | Tidecaller's shield and the Thunderbeast's Targe                     |
| [Bennett](/docs/genshin/kits/bennett)               | Passion Overload's Charge Levels and Fantastic Voyage's field        |
| [Chongyun](/docs/genshin/kits/chongyun)             | Layered Frost's field and Rimechaser Blade                           |
| [Collei](/docs/genshin/kits/collei)                 | Floral Brush and Trump-Card Kitty's explosion and leap               |
| [Diluc](/docs/genshin/kits/diluc)                   | Searing Onslaught and Dawn                                           |
| [Diona](/docs/genshin/kits/diona)                   | Icy Paws and Signature Mix's field                                   |
| [Dori](/docs/genshin/kits/dori)                     | Alcazarzaray's Exactitude's Connector field and Troubleshooter Shot  |
| [Eula](/docs/genshin/kits/eula)                     | Grimheart stacks, Icewhirls and Glacial Illumination                 |
| [Faruzan](/docs/genshin/kits/faruzan)               | Wind Realm of Nasamjnin and the Dazzling Polyhedron                  |
| [Fischl](/docs/genshin/kits/fischl)                 | Oz, Midnight Phantasmagoria and Thundering Retribution               |
| [Ganyu](/docs/genshin/kits/ganyu)                   | Frostflake Arrow, Ice Lotus and Celestial Shower                     |
| [Gorou](/docs/genshin/kits/gorou)                   | General's War Banner and Crystal Collapse                            |
| [Heizou](/docs/genshin/kits/heizou)                 | Heartstopper Strike and Fudou Style Vacuum Slugger                   |
| [Hu Tao](/docs/genshin/kits/hu-tao)                 | Her string, charged attack and Guide to Afterlife's Paramita stance  |
| [Itto](/docs/genshin/kits/itto)                     | Masatsu Zetsugi and the Saichimonji Slash                            |
| [Jean](/docs/genshin/kits/jean)                     | Gale Blade and Dandelion Breeze's field                              |
| [Kaeya](/docs/genshin/kits/kaeya)                   | Frostgnaw and Glacial Waltz's icicles                                |
| [Kamisato Ayaka](/docs/genshin/kits/kamisato-ayaka) | Soumetsu's storms and Senho's infusion                               |
| [Kamisato Ayato](/docs/genshin/kits/kamisato-ayato) | Kyouka's Soukai Kanka stance and Suiyuu's field                      |
| [Kazuha](/docs/genshin/kits/kazuha)                 | Chihayaburu and Kazuha Slash's Autumn Whirlwind                      |
| [Keqing](/docs/genshin/kits/keqing)                 | Stellar Restoration and Starward Sword                               |
| [Kirara](/docs/genshin/kits/kirara)                 | Tail-Flicking Flying Kick's shield and Secret Art: Surprise Dispatch |
| [Klee](/docs/genshin/kits/klee)                     | Jumpy Dumpty, Sparks 'n' Splash and Sparkly Explosion                |
| [Kokomi](/docs/genshin/kits/kokomi)                 | Bake-Kurage and Nereid's Ascension                                   |
| [Kujou Sara](/docs/genshin/kits/kujou-sara)         | The Cover and its Ambush                                             |
| [Kuki](/docs/genshin/kits/kuki)                     | Grass Ring of Sanctification                                         |
| [Layla](/docs/genshin/kits/layla)                   | Nights of Formal Focus and Starlight Slug                            |
| [Lisa](/docs/genshin/kits/lisa)                     | Violet Arc and Lightning Rose                                        |
| [Mona](/docs/genshin/kits/mona)                     | Mirror Reflection of Doom and Stellaris Phantasm                     |
| [Nahida](/docs/genshin/kits/nahida)                 | All Schemes to Know's press and full hold                            |
| [Ningguang](/docs/genshin/kits/ningguang)           | Star Jades, Jade Screen and Starshatter                              |
| [Noelle](/docs/genshin/kits/noelle)                 | Breastplate and Sweeping Time                                        |
| [Qiqi](/docs/genshin/kits/qiqi)                     | Herald of Frost and Fortune-Preserving Talisman                      |
| [Raiden Shogun](/docs/genshin/kits/raiden-shogun)   | The Eye and Musou Isshin                                             |
| [Razor](/docs/genshin/kits/razor)                   | Electro Sigils, the Wolf Within and Lightning Fang                   |
| [Rosaria](/docs/genshin/kits/rosaria)               | Ravaging Confession and Rites of Termination                         |
| [Sayu](/docs/genshin/kits/sayu)                     | Fuufuu Windwheel and Muji-Muji Daruma                                |
| [Shenhe](/docs/genshin/kits/shenhe)                 | Spring Spirit Summoning and Divine Maiden's Deliverance              |
| [Sucrose](/docs/genshin/kits/sucrose)               | Astable Anemohypostasis Creation-6308 and Forbidden Creation         |
| [Tartaglia](/docs/genshin/kits/tartaglia)           | The Ranged and Melee Stances and Riptide                             |
| [Thoma](/docs/genshin/kits/thoma)                   | Blazing Blessing and Crimson Ooyoroi                                 |
| [Traveler](/docs/genshin/kits/traveler)             | The Anemo form's attacks, Palm Vortex and Gust Surge                 |
| [Venti](/docs/genshin/kits/venti)                   | Skyward Sonnet, Wind Domain and Stormeye                             |
| [Xiangling](/docs/genshin/kits/xiangling)           | Guoba, Pyronado and Oil Meets Fire                                   |
| [Xiao](/docs/genshin/kits/xiao)                     | Lemniscatic Wind Cycling and Bane of All Evil                        |
| [Xingqiu](/docs/genshin/kits/xingqiu)               | Fatal Rainscreen and Raincutter                                      |
| [Xinyan](/docs/genshin/kits/xinyan)                 | Sweeping Fervor and Riff Revolution                                  |
| [Yae Miko](/docs/genshin/kits/yae-miko)             | Sesshou Sakura totems and Great Secret Art: Tenko Kenshin            |
| [Yanfei](/docs/genshin/kits/yanfei)                 | Scarlet Seals, Signed Edict and Done Deal                            |
| [Yaoyao](/docs/genshin/kits/yaoyao)                 | Yuegui radishes and Moonjade Descent                                 |
| [Yelan](/docs/genshin/kits/yelan)                   | Lingering Lifeline and Depth-Clarion Dice                            |
| [Yoimiya](/docs/genshin/kits/yoimiya)               | Niwabi Fire-Dance and Naganohara Meteor Swarm                        |
| [Yun Jin](/docs/genshin/kits/yun-jin)               | Opening Flourish and Cliffbreaker's Banner                           |
| [Zhongli](/docs/genshin/kits/zhongli)               | Stone Steles, Jade Shield and Planet Befall                          |

- [Fearnaught](https://genshin-impact.fandom.com/wiki/Fearnaught), [I Got Your Back](https://genshin-impact.fandom.com/wiki/I_Got_Your_Back) and [To Be Cleaned](https://genshin-impact.fandom.com/wiki/To_Be_Cleaned), Genshin Impact Wiki: Bennett's A4, and Noelle's C1 and C4, as the kit gates them.
