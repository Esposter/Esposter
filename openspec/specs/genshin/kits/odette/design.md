# Odette

Odette's kit is its record and one behaviour module, `createOdetteKitBehaviour`, avatar 10000150. Her record follows gcsim v2.47.2's talent indices and hitmarks, with her multipliers and cooldowns read from the dump's proud skill groups, as [the kits index](../README.md) describes.

## Decisions

- **Odette's five strikes, charged attack and plunges take gcsim's hitmarks.** Her strikes are Physical, as gcsim's `attack.go` and `charge.go` give them, so they carry no element. Their multipliers are the strike group 15031 of the dump.
- **Her skill is one press hit.** Adagio: Phantom Night Dancers' press hits at gcsim's hitmark of 23 frames, on the player's own radius of 4 and as Ice, from gcsim's `skill.go`. Its multiplier is group 15032.
- **Her burst is four hits, the first blunt.** Presto: Bluebird Finale's hitmarks are 112, 128 and 140 frames for its three slashes, and 144 frames for its final, all of radius 7 on the player and the final as Ice, from gcsim's `burst.go`. The first slash's poise of 30 is taken from gcsim's assignment of its blunt poise to that slash, provisional. Multipliers are group 15039.
- **Odette places the gadgets the combat's Stellar reactions stand on.** A Superconduct triggered while she is deployed leaves a Polestar Field of radius 15 and 6 seconds at the body, and a standing field is refreshed rather than doubled. A Cryo Swirl leaves a Stellar Vortex of 181 frames, one at a time. gcsim's `stellarconduct_gadget.go` and `stellarswirl_gadget.go` give the field's radius, lifetime and think interval of 4 seconds (240 frames), and the vortex's lifetime. These placements are provisional: gcsim creates the gadgets inside the reaction, and the kit places them on the step after it.
- **The vortex deals no hit of its own here.** Its explosion's Cryo damage belongs to the combat's Stellar Swirl, which the kit does not build, so the vortex's summon carries no hits.
- **Every value of her overlay is Unclassified.** As Nefer's overlay is, her values are read from gcsim's files and the dump and are not checked against a recording, so each stays provisional until one settles it.

## Not built

- **Her skill's recast is not built.** gcsim's Coda has three damage-over-time hits and a final hit, at 11, 20, 28 and 62 frames, which the record does not hold as a skill chain yet, so her skill presses once.
- **Her Dance Double is not built.** Adagio: Phantom Night Dancers summons a double that attacks nearby opponents periodically, with Plume and Wing hits that need named hit lists the record does not hold.
- **Her burst's extra Stellar Glimmer damage is not built.** Presto: Bluebird Finale adds Stellar Glimmer damage for some time, and the combat's reactions carry it.
- **The Stellar reactions are the combat's.** Stellar-Conduct, Stellar Swirl, the Radiance state and the Stellar Glimmer bonus are the combat change's to build, as `openspec/changes/genshin-combat/` describes. Odette's kit only places the gadgets they stand on.
- **Her passives and constellations are not built.**

## Key files

| File                                                              | Role                                                                               |
| :---------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/odetteKit.ts` | `createOdetteKitBehaviour`, which places the Polestar Field and the Stellar Vortex |
| `packages/genshin-world/src/data/kits/odette.json`                | Odette's overlay                                                                   |

## Sources

- [Odette](https://genshin-impact.fandom.com/wiki/Odette), Genshin Impact Wiki: her talent names (Adagio: Phantom Night Dancers and Presto: Bluebird Finale), the Stellar Glimmer text, and the rule that a Superconduct or Cryo Swirl triggered by a party member becomes a Stellar-Conduct or Stellar Swirl while she is in the party.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/odette), MIT at v2.47.2: `config.yml` for the talent indices, `attack.go`, `charge.go`, `skill.go`, `burst.go` and `stellar.go` for the hitmarks, areas and the Stellar Glimmer state.
- [gcsim `pkg/reactable`](https://github.com/genshinsim/gcsim/tree/v2.47.2/pkg/reactable), MIT at v2.47.2: `stellarconduct_gadget.go` for the Polestar Field's radius, lifetime and think interval, and `stellarswirl_gadget.go` for the vortex's lifetime.
- The dump's `AvatarSkillExcelConfigData` and `ProudSkillExcelConfigData`: the proud skill groups 15031, 15032 and 15039, the skill's cooldown of 15 seconds, and the burst's energy cost of 60 and cooldown of 15 seconds.
