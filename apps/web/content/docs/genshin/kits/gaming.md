---
title: Gaming
description: Gaming's kit as built: his four strikes, a provisional charged attack, a collision and two plunges, and Bestial Ascent and Suanni's Gilded Dance's strike, with his Man Chai, his heals and his passives left unbuilt.
---

# Gaming

Gaming's kit is one module, `createGamingKit`, avatar 10000092: four strikes, a charged attack, a collision and two plunges, Bestial Ascent, whose cast strikes nothing of its own, and Suanni's Gilded Dance's one strike. His multipliers are read from proud skill groups 9231, 9232 and 9239; the skill's cooldown, the burst's cooldown and energy cost, and the charged attack's stamina are read from the same groups. Ascension and Constellations are not built, and Bestial Ascent's Charmed Cloudstrider plunge, which is the skill's whole damage, is not either.

## Not yet built

- **Bestial Ascent's Charmed Cloudstrider plunge.** The skill's damage is the special plunge that follows it, with its radius, its particle and its poise, and Constellation 6's radius and crit. It waits on a plunge variant the skill arms, as `elementalBurstVariant` arms a burst: a kit has no plunge variant yet.
- **Suanni's Man Chai and the burst's status.** The status lasts twelve seconds, and the Man Chai it sends out resets Bestial Ascent's cooldown when the special plunge meets it, which Constellation 1 heals on. It waits on a kit status that a plunge's landing reads, and a cooldown reset on that status.
- **The heals and the Max HP drain.** Suanni's Gilded Dance heals 30% of Max HP at 36 frames, Ascension 1 regains 1.5% of Max HP every 0.2 seconds for 0.8 seconds, and the special plunge drains 15% of Max HP. The heal waits on a Max HP share heal on a field tick, since `healPartyMember` takes an absolute amount, and the drain on a wearer HP hook.
- **The passives.** Ascension 4's Incoming Healing Bonus and DMG bonus, Constellation 2's ATK after an overheal, Constellation 4's energy from the plunge and Constellation 6's crit wait on the passive hook, which reads the combatant alone.

## Decisions

- **The charged attack is provisional.** gcsim gives Gaming no charged attack, as its charge is not implemented, so the charged attack takes Ayato's measured claymore charge's frames and reach, and the table's index 5 and 6 for its multiplier and stamina, as a best estimate until a recording of the attack settles them.
- **Bestial Ascent strikes nothing of its own.** gcsim's skill has no hit: its damage is the special plunge that follows it, which is not built, so the skill's animation and cooldown are the kit's and its hits are none.
- **The burst's strike is one circle of radius 5 round the body**, at 60 frames, as gcsim queues it. The burst's status, its Man Chai and its heal are not built, so the burst's cooldown and energy cost are the whole of its state.

## Key files

| File                                                              | Role                                                                                                                                                            |
| :---------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/gamingKit.ts` | `createGamingKit`, Gaming's kit with his four strikes, provisional charged attack, collision and two plunges, Bestial Ascent and Suanni's Gilded Dance's strike |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/gaming), MIT: the kit's four strikes' hitmarks, cancels, poise and reaches, the collision and the low and high plunges' frames, reaches and poise, Bestial Ascent's animation and cooldown, Suanni's Gilded Dance's animation, strike and cooldown, and the multiplier indices of each group.
