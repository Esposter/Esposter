# Escoffier

Escoffier's kit is its record and one behaviour module, `createEscoffierKitBehaviour`, avatar 10000112: her three normal attacks, a charged attack, and a low, high and collision plunge, with Low-Temperature Cooking as her skill, Scoring Cuts as her burst, and Rehab Diet from Ascension 1. Her multipliers are read from proud skill groups 11231, 11232 and 11239, the skill's press, tick, Surging Blade and interval among them and the burst's hit and heal. The charged attack costs 25 stamina, the skill cools for 15 seconds, and the burst costs 60 energy, cooling for 15 seconds.

## Not yet built

The framework holds no way for an enemy's status to read the party's elements, and holds no timed effect on another member's hits, so the parts that depend on them wait on those hooks.

- **Ascension 4's Cryo RES shred waits on the party-element hook.** It takes 0, 5, 10 or 15% off the enemy's Cryo and Hydro RES for 12 seconds, from the Hydro and Cryo members the party holds, and at 55% when all four are Hydro or Cryo. A status's `resistanceReduction` is fixed when the status is written, and a hit's `enemyStatus` reads only its striker, so the count is not built.
- **Constellation 1 waits on the party-reaction hook.** It adds 60% Crit DMG to every member's Cryo attacks, and to the stellar reactions, while the party holds only Cryo and Hydro members. A member's hit reading the party's elements is not built.
- **Constellation 2 waits on the party-hit hook.** Cold Dishes adds 240% of her ATK to each Cryo normal, charged, plunge, Elemental Skill or Burst hit of another member while Frosty Parfait holds, for five hits. A hit reading another member's buff is not built.
- **Constellation 4 waits on the seeded-roll hook.** Its six extra Rehab Diet ticks and their 1.0-share heal roll on the character's Crit Rate, which the framework does not roll.
- **Constellation 6 waits on the party-hit hook.** Special-Grade Frozen Parfait strikes the target once every half second, when the active character's normal, charged or plunge hit lands while Frosty Parfait holds. A hit reading the skill's status on another member is not built.
- **Arkhe waits on the Arkhe hook.** The Surging Blade's Arkhe application is gcsim's TODO, so the blade deals its damage and applies no Arkhe, as gcsim gives it.
- **Her skill's cooldown delay waits on the cooldown-delay hook.** gcsim starts the 15 seconds 22 frames after the press. The framework starts every skill's cooldown with the skill, so the cooldown here runs 22 frames early.

## Decisions

- **The plunges are the airborne ones.** gcsim plays her plunges as airborne moves, so the kit takes their frames: the low plunge at 41 frames of a 76-frame animation, the high at 43 of 77, and the collision at 35.
- **Strikes and the charged attack give no poise, and the collision none.** gcsim gives none to a normal attack, the charged attack or the collision, so each reads 0 as the framework's rule for a poise gcsim does not give.
- **The Surging Blade's interval is checked on the cast.** gcsim queues the blade at 83 frames only if the 10-second interval is not running at that frame. The kit checks at the press and starts the interval there, which differs only when the interval ends between the press and its 83rd frame. The roadmap's manual verification has the question.
- **Scoring Cuts' heal is one tick of a field.** gcsim heals at frame 97 with no hit, which the framework does not place, so the burst sets a field whose one tick heals the active character, as Diona's Signature Mix heals, and a second tick is kept past its end.
- **Rehab Diet is a field from the burst.** gcsim starts it from the burst on Ascension 1 or above, nine ticks from 157 frames every 58.5 frames, each healing the active character for 1.3824 of her ATK, so the kit starts the same field from the burst's start.
- **Frosty Parfait's ticks are a summon.** Its 21 ticks land on the primary target 5 frames after each tick, as hits of a summon placed where she cast it, each priced as the target's reach and a circle of radius 1.5, the way the framework prices a hit on a target.

## Key files

| File                                                                 | Role                                                                                                                     |
| :------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/escoffierKit.ts` | `createEscoffierKitBehaviour`, Escoffier's kit as built, with the Cryo RES shred and her constellations waiting on hooks |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/escoffier), MIT, at v2.47.2: the hitmarks, cancels and reaches of the strikes and the charged attack, the plunges, Low-Temperature Cooking with Frosty Parfait and the Surging Blade, Scoring Cuts, Rehab Diet and the constellations.
