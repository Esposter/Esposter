# Lan Yan

Lan Yan's kit is its record and one behaviour module, `createLanYanKitBehaviour`, on avatar 10000108: her four strikes, a charged attack of three hits, a plunge collision and two plunges, and the burst's three hits with Constellation 4's party Elemental Mastery. Her multipliers are read from proud skill groups 10831, 10832 and 10839, matching gcsim's to four decimal places. Her skill's cooldown is 16 seconds, her burst's 15 with a cost of 60 energy, and her charged attack takes 50 stamina.

## Decisions

- **Her strikes and charged attack are gcsim's shapes, all Anemo at one unit of gauge.** The first strike is a box of 2.2 by 3 metres offset 0.2 metres back, the second a box of 2.3 by 3, each landing its two hits from the second and third strikes, the third a circle of 2.2 metres ahead by 0.3, and the fourth a fan of 240 degrees of 2.4 metres ahead by 0.5, at 11, 17 and 37, 15 and 21, and 40 frames. Her charged attack is three hits of a circle 2.5 metres centred on the primary target at 42, 49 and 56 frames. Her strikes carry no poise, as gcsim gives none.
- **Her plunges are gcsim's own, not borrowed.** gcsim has a plunge file for Lan Yan, so her low plunge is a circle of 3 metres at 44 frames, her high plunge one of 3.5 metres at 46, and the collision one of 1.5 metres at 38 frames, each in a 67-frame animation. These radii differ from the kit constants that borrow Bennett's, which is why they are written here.
- **Her burst's three hits are circles of radius 6 on the primary target, at 30, 46 and 51 frames.** Each is priced as the targeting area's radius plus its own, and deals two units of Anemo gauge, from gcsim's 50 durability, in a 100-frame animation.
- **Constellation 4 adds 60 Elemental Mastery to each member of the deployed team for 12 seconds as the burst is cast.** It is a buff on each member under one source, so a second burst restarts it, as gcsim's party stat mod does.

## Not built

- **The Swallow-Wisp Pinion Dance press deals nothing.** It plays its 49-frame animation and spends its 16-second cooldown, but its detect hit, its Feathermoon Rings and its shield are not built. The rings are a stance, which replaces her normal attacks and skill for 66 frames from the detect, and are not built yet. The shield is cast with the element the detected enemy carries, which the framework cannot read yet, and that wait is the shield's element hook.
- **Ascension 1 (the shield absorbs the element) and Ascension 4 (the rings' flat damage) wait on the press.** Constellation 1 (the rings' extra hits) and Constellation 6 (the skill's second charge) wait on it too, and Constellation 2 (the shield restored by a normal attack) waits on the shield hook, since it restores a shield the press casts.

Talent levels and constellations are read at the level the kit is built at: raising them is the [talents](../../../../changes/genshin-talents/design.md) and [constellations](../../../../changes/genshin-constellations/design.md) pages'.

## Key files

| File                                                              | Role                                                                                                                              |
| :---------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/lanYanKit.ts` | `createLanYanKitBehaviour`, Lan Yan's strikes, charged attack, plunges, burst and Constellation 4, the press waiting on its hooks |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/lanyan), MIT: the hitmark, animation and reach of each strike, the charged attack, the plunges' hitmarks and radii, the burst's hits and animation, and the skill's animation, read from its attack, charge, plunge, burst, skill and constellation files.
- The proud skill groups' indices, read from gcsim's data file for the character, which lists the multipliers, cooldowns and costs beside each group.
