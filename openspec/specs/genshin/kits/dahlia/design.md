# Dahlia

Dahlia's kit is its record and one behaviour module, `createDahliaKitBehaviour`, avatar 10000115: her four strikes, a charged attack, Immersive Ordinance as her skill with its tap and hold, Radiant Psalter as her burst with its shield, and a low, high and collision plunge. Her multipliers are read from proud skill groups 11531, 11532 and 11539, the burst's shield, Favonian Favor's seconds and its multiplier among them. The charged attack costs 20 stamina, the skill cools for 9 seconds, and the burst takes 60 energy and a 15-second cooldown.

## Not yet built

The framework has no attack-speed buff for the party, so what depends on it waits on that hook. The Benison stacks need no hook of their own.

- **Benison stacks and the shield's regeneration wait on the kit keeping them.** Her normal attacks gain her stacks during Favonian Favor, four hits to a stack, and a broken shield is made again from a stack. Radiant Psalter's shield is built here, but it is not made again once it breaks. gcsim keeps the stacks on Dahlia alone, gained and spent inside her own package with no event for any other character (`dahlia/dahlia.go:15`, `burst.go:134`, `shield.go:58`), so they are a status of hers with `stacks`, as Navia's Crystal Shrapnel is: an `EnemyHit` of a normal attack by the member on the field gains them, a `ReactionTriggered` with Frozen gains Ascension 1's two, and a `ShieldAbsorbed` that leaves her shield's `health` at 0 spends one to cast it again.
- **The Favonian Favor attack speed waits on the attack-speed hook.** The active party member gets an attack-speed bonus from her burst's Favonian Favor, which the framework has no attribute or party buff for. Her charged attack takes none.
- **Her skill's Hydro particles wait on the particle hook.** Immersive Ordinance gives three Hydro particles on an internal cooldown, so its energy goes ungenerated, as the index says of every particle.
- **Her Ascension passives and Constellations 1, 2 and 6 are not built.** The Benison stacks are read by Ascension 1 and Constellations 1 and 2, so they wait on the kit keeping them: Constellation 1's 2.5 Energy a stack gained is `gainPartyMemberEnergy` (`dahlia/cons.go:21`), and Constellation 2's 25% Shield Strength is a buff of `ShieldStrength` on the member on the field, which a shield's absorption reads with the member's buffs on (`dahlia/cons.go:37`). Ascension 4 and Constellation 6 read the attack-speed bonus, so they wait on that hook. Constellation 4 lengthens Favonian Favor by three seconds on the shield the burst places.

## Decisions

- **The shield is a task's.** gcsim places Radiant Psalter's shield 31 frames in, so the burst sets a task that runs then; the shield reads her Max HP as it runs, as the table's share of Max HP plus a flat HP. It lasts the 12 seconds Favonian Favor holds, from its placement.
- **The hold's threshold is provisional.** gcsim takes Immersive Ordinance's hold as its own variant but gives no threshold for it, so the kit uses the 0.5 seconds the other holds use. The roadmap's manual verification has the question.
- **The plunges are borrowed.** Dahlia has no gcsim plunge file, so her three plunges are priced like the ones in [how a kit is read](../README.md#how-a-kit-is-read), with the 150, 100 and 25 poise Mizuki's plunges are given. The roadmap's manual verification has the question.
- **Normal attacks and the charged attack take the wiki's poise.** gcsim gives her normal attacks and charged attack none, so the kit takes the wiki's rows: 45.6 for the first strike, 42 for the second, 27.6 for each hit of the third and 68.7 for the fourth, and 60 for each of the charged attack's two hits.

## Key files

| File                                                              | Role                                                                                                                         |
| :---------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/dahliaKit.ts` | `createDahliaKitBehaviour`, Dahlia's four strikes, charged attack, Immersive Ordinance, Radiant Psalter's shield and plunges |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/dahlia), MIT, at v2.47.2: hitmarks, cancels and reaches for the strikes and the charged attack, the skill's tap and hold, the burst and its shield, and the Benison and attack-speed states the hooks wait on.
- [Hosted game data](../../hosted-game-data/design.md): the proud skill groups 11531, 11532 and 11539 and the skill-kit record.
