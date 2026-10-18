# Skirk

Skirk's kit is its record and one behaviour module, `createSkirkKitBehaviour`, on avatar 10000114: five strikes, a charged attack of two hits, a collision and two plunges, and Seven-Phase Flash, whose press enters a stance of its own strikes and charged attack. Her multipliers are read from proud skill groups 11431, 11432 and 11439, her normal strikes and charged attack from the first, her Seven-Phase Flash's from the second and Havoc: Ruin's from the third. Her skill's cooldown is 8 seconds, counted from the end of the Seven-Phase Flash as gcsim counts it, her burst's 15 seconds, and the charged attack costs 20 stamina. Her burst costs no energy, so its gate is her Serpent's Subtlety, which is not built.

## Decisions

- **Seven-Phase Flash is a stance that starts 19 frames on from its press.** Its press lands no hit, so its action has no hits and animates for 43 frames, and a task runs after 19 frames to add the stance, as gcsim's skill enters its state after its delay. The stance lasts 754 frames from then. Its strikes are the Seven-Phase Flash's five normal attacks in Cryo, and its charged attack is three Cryo slashes, both from gcsim's stance attack and charge handlers.
- **The stance's attack tags are gcsim's.** Its normal attacks are `AttackTagNormal` in gcsim's `attack.go`, read as `NormalAttack`, its charged attack `AttackTagExtra` in `charge.go`, read as `ChargedAttack`, and its burst and skill read as `ElementalBurst` and `ElementalSkill`, each the kind of the group it plays in.
- **Her skill's cooldown runs from the press, through the state's 19 frames and its 754, then gcsim's 8 seconds.** gcsim sets the cooldown when the state exits, but a kit's cooldown starts at the press, so the kit sets it to the time the state would run out on its cap and the 8 seconds after. This keeps the skill from being pressed during the state, as gcsim does. An early end, by a swap or by Serpent's Subtlety running out, does not move the cooldown, so the skill comes back late after one. The swap ends the state at once, as gcsim's exit does.
- **Havoc: Ruin is priced by its base hits, and its Extinction is the burst in the stance.** Ruin's five slashes at 109, 111, 114, 125 and 135 frames and its final slash at 158, each Cryo and read at the burst group's index 0 and 1, land on the body's box. Havoc: Extinction, the burst the stance plays in place of Ruin, lands no hit, so its action has no hits and animates for 41 frames.
- **Provisional: the plunges are borrowed.** Skirk's gcsim folder has no plunge file; her three plunges are priced and landed as Nilou's are, which the index gives. Whether a recording of her plunges agrees is the roadmap's question.
- **Normal attacks take the windup gcsim queues.** Each strike's hit is queued 2 frames before its hitmark, as gcsim's `attackHitmarks - windup` does, and its animation is its default length from a standing start. gcsim shortens the first strike's animation by the windup after a burst or a normal attack, which is not built.

## Not built

- **Serpent's Subtlety is not built.** It is a point count from 0 to 100 that a press, a hold and each absorbed void rift raise, drained by 7 a second, and it gates Havoc: Ruin at 50 points, adds 0.193 ATK to Ruin's final hit per point above 50 up to 12 points, and ends the Seven-Phase Flash when it runs out. The kit has no point count on its state, so Ruin is castable on its 15-second cooldown alone, where gcsim also requires 50 points, and its SS bonus is missing. This waits on a point count in the kit's state, which the framework does not give a character yet.
- **Void Rifts are not built.** Party reactions that freeze, superconduct, swirl Cryo or crystallise Cryo create a rift each, for 17.6 seconds, up to three, and absorbing one on a Seven-Phase Flash charged attack, a hold or Ruin's animation adds points and a hit. `ReactionTriggered` carries the reactions, but `KitState` holds no list of timed entries to keep the rifts in, so they wait on that.
- **Skill hold is not built.** The Seven-Phase Flash's hold absorbs void rifts for the seconds held and adds 18 points, which waits on the points and rifts above.
- **Havoc: Extinction's bonus is not built.** Its next ten normal attacks gain DMG Bonus from the void rifts absorbed when it was cast, for 12.5 seconds, and it waits on the rifts.
- **The Seven-Phase Flash's plunges are not built.** gcsim gives the stance its own plunge multipliers, at the skill group's indices 9 to 11, and `KitStance` holds no plunge to play in place of the kit's.
- **Constellations 1, 2, 4 and 6 stay unbuilt.** Constellation 1 hits 5 times when a void rift is absorbed, Constellation 2 adds 10 points and 70% ATK to the Seven-Phase Flash, Constellation 4 raises ATK by Ascension 4's stacks, and Constellation 6 strikes on each normal attack in the stance while it holds rifts. They wait on the rifts and points above.
- **Ascension 1 and 4 are not built.** Ascension 1 makes the void rifts above, and Ascension 4 gives ATK by the stacks of a Hydro or Cryo party member's hits on an enemy, which no kit event reports.
- **The talent passive is not built.** A team of only Hydro and Cryo members with both present sets gcsim's passive tag on each of them, a tag no kit reads yet, so the passive waits on a party-wide tag the members' hits read.

## Key files

| File                                                             | Role                                                                                                                |
| :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/skirkKit.ts` | `createSkirkKitBehaviour`, Skirk's kit with her strikes, charged attack and plunges, and Seven-Phase Flash's stance |

## Sources

- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/skirk), MIT: the strikes' hitmarks, animations and reaches, the Seven-Phase Flash's state, its entry at 19 frames and its 754 frames, the charged attack's slashes and reach, Havoc: Ruin's slashes, final slash, reach and animation, Havoc: Extinction's animation, the cooldowns and energy maximum.
- The proud skill groups 11431, 11432 and 11439 in the hosted game data: each multiplier's index and the cooldowns, read at talent level 1.
