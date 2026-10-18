# Amber

Amber's kit is its record and one behaviour module, `createAmberKitBehaviour`, avatar 10000021: five arrows, a fully charged aimed shot, a collision and two plunges, Explosive Puppet's Baron Bunny and Fiery Rain. Its multipliers are read from proud skill groups 2131, 2132 and 2139, and match the wiki's Sharpshooter, Explosive Puppet and Fiery Rain values to two decimal places. Baron Bunny is a taunt, built as the shared effects below, and Fiery Rain is a summon of eighteen arrows, with Ascension 1's CRIT Rate and AoE.

## Decisions

- **Amber's fully charged aimed shot is the bow's charged attack.** Only the fully charged shot deals Pyro, under a charged attack internal cooldown, so the unlit Aimed Shot and its weak-point hits are not built. A bow's aimed shot (`isAimed`) turns the body to the camera's yaw while the aim binding, `R` on a keyboard, is held, and to its enemy by the wiki's score otherwise. The kit's hits are drawn from the turned body, so the shot lands along the aim.
- **Fiery Rain's arrows are priced at twice the burst radius.** Each arrow lands at random within a radius of 2 round the burst's centre and is itself a circle of that radius, so a summon's arrow is priced at 4 round the body. gcsim states the radius once, at "amber.go" line 26, and scales it at Ascension, so the record leaves the radius and the arrows' areas `Unsourced`: the field is written twice in the package, and a random landing point has no place to cite. Ascension 1, Every Arrow Finds Its Target, adds 10% CRIT Rate, priced on the summon's combatant, and widens the radius by 30%. The [character kits proposal](../../../../changes/genshin-character-kits/design.md) settles the arrow area at 4, which the record holds once it is republished, and Ascension 1's widening is built in `amberKit.ts` as her passive, scaling the base arrows' areas by 30%.
- **Baron Bunny lands where Amber stands.** The wiki's throw, 1.4 metres ahead and the hold's distance, is not built, so it is priced round Amber's body. Its HP is 41.36% of Amber's Max HP, from the table.

## Not built

- **Amber's A4 is left.** Its ATK bonus after a weak-point hit has no weak spot to strike: the enemies here have none, so there is no hit for the bonus to follow.
- **Amber's Constellation 2 is left.** Its manual detonation needs a charged attack that reports the bunny it lands on: `ChargedAttackLanded` names no target, and `damageKitTaunt` has no caller, so no shot reaches the bunny.

## Key files

| File                                                             | Role                                                                                    |
| :--------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/amberKit.ts` | `createAmberKitBehaviour`, Amber's kit with Baron Bunny's taunt and Fiery Rain's summon |

## Sources

- [Sharpshooter](https://genshin-impact.fandom.com/wiki/Sharpshooter), [Explosive Puppet](https://genshin-impact.fandom.com/wiki/Explosive_Puppet) and [Fiery Rain](https://genshin-impact.fandom.com/wiki/Fiery_Rain), Genshin Impact Wiki: Amber's arrows' and shots' poise and gauges, the bunny's explosion, and Fiery Rain's arrows.
- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/amber), MIT: the kit's hitmarks, cancel frames and areas, the bunny's explosion.
- [gcsim v2.47.2 skill file](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/amber/skill.go), MIT: Constellation 1's second arrow.
- [gcsim v2.47.2 burst file](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/amber/burst.go), MIT: Constellation 6's Movement SPD and ATK buff.
- [gcsim v2.47.2 constellation file](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/amber/cons.go), MIT: Constellation 2, which is left.
