# Chevreuse

Chevreuse's kit is its record and one behaviour module, `createChevreuseKitBehaviour`, on avatar 10000090: four normal attacks, a charged attack, a collision and two plunges, Short-Range Rapid Interdiction Fire's press and its hold, and Ring of Bursting Grenades with its eight shells. Her multipliers are read from proud skill groups 9031, 9032 and 9039, matching gcsim's to three decimal places; the cooldowns, the burst's energy cost and the charged attack's stamina come from those groups or from gcsim. The hold releases a Pyro box of 3 by 7 metres, and once an Overloaded reaction has happened, the next hold casts the Overcharged Ball instead, a Pyro circle of radius 5 on the primary target with 125 poise, which spends the ball as it starts. Explosive Grenade's circle of radius 6 lands at 59 frames, and its eight shells explode from 83 to 119 frames after the cast, past its animation's end, which they still land in.

## Decisions

- **The Overloaded reaction sets the ball going from any source.** gcsim's subscription sets Chevreuse's overcharged flag on any Overloaded reaction on an enemy, whoever triggers it, so `onKitEvent` reads every reaction event of the team and sets a status on her that has no end. A hold that casts the ball takes it as a variant, and its start spends the status, so the next hold is a plain one.
- **Shells are priced round the primary target.** gcsim's shells are 60-degree arcs of radius 6 centred on the primary target's position as she casts, and the kit prices each as the circle of radius 6 round that target, as its centre is placed on the target. The arcs are not modelled, so the shells reach farther than the game's.
- **A hit that lands after its action ends keeps gcsim's frame.** The burst's shells fall from 83 to 119 frames against an animation of 61, so they are not stretched into it, and a hit past its action's end is left to the framework's own handling of late hitmarks.
- **The press and hold are priced at gcsim's frames.** The press's box is 2 by 6 metres from half a metre behind her, at 25 frames of a 31-frame animation. The hold's box is 3 by 7 from the same point at 19 frames of a 26-frame animation, measured from its release, since the framework starts a hold's action on release.
- **Provisional: the hold's threshold.** The seconds a press must be held to become the hold are not in any table, so it takes Zhongli's half second, as the question in the roadmap's Manual verification list asks.
- **Vertical Force Coordination is built as the Overcharged Ball's hold start.** From Ascension 4 the ball's firing gives each Pyro and Electro member of the deployed team 1% ATK for every 1,000 of Chevreuse's Max HP, up to 40%, for 30 seconds, as gcsim does, with no range check on the members, as gcsim has none.

## Not built

- **Her skill's heal is waiting on a timed party heal.** Short-Range Rapid Interdiction Fire heals the active character every 2 seconds for 12 seconds from her Max HP and a flat amount, which a kit has no hook for over time. It waits on that hook.
- **Surging Blade is waiting on a conditional follow-up hit.** Each press or hold that hits anything sets off a circle of radius 2 round the target after a delay, once per 10 seconds, and a hit that fires only when an earlier one landed, under the character's own cooldown, has no hook yet.
- **Her first ascension passive is waiting on the party-composition hook.** Coordinated Tactics applies only when the deployed team is all Pyro and Electro, which the kit cannot read as party composition yet, and it adds the Overloaded reaction's Pyro and Electro RES cut of 40% for 6 seconds to the enemies it hits. Her first constellation's energy on an Overloaded reaction by a member with that status waits on the same hook. Her dash's stamina cut is not built.
- **Her constellations are not built.** The second's chain explosions after a hold, the fourth's cooldown waiver, the sixth's team heal and its stacked elemental damage bonus wait on the hooks above, and the constellations that raise talent levels are the [talents](../../talents/design.md) page's.

## Key files

| File                                                                 | Role                                                                        |
| :------------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/chevreuseKit.ts` | `createChevreuseKitBehaviour`, her press, hold, shells and Overcharged Ball |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/chevreuse), MIT: each strike's hitmarks, frames and areas, the charged attack's hitmark and circle, the press's and hold's boxes and hitmarks, the Overcharged Ball's circle and the overload subscription, Explosive Grenade and its shells' delays, and the passives and constellations listed as not built.
- [Short-Range Rapid Interdiction Fire](https://genshin-impact.fandom.com/wiki/Short-Range_Rapid_Interdiction_Fire) and [Ring of Bursting Grenades](https://genshin-impact.fandom.com/wiki/Ring_of_Bursting_Grenades), Genshin Impact Wiki, where the game's values agree with the table.
