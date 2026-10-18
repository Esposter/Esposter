# Gaming

Gaming's kit is its record and one behaviour module, `createGamingKitBehaviour`, avatar 10000092: four strikes, a charged attack, a collision and two plunges, Bestial Ascent, whose cast strikes nothing of its own, and Suanni's Gilded Dance's one strike. His multipliers are read from proud skill groups 9231, 9232 and 9239, its cooldowns and the burst's energy cost among them. Ascension 4's Incoming Healing Bonus under half HP is built, and the other Ascension passives and the Constellations are not. Bestial Ascent's Charmed Cloudstrider plunge, which is the skill's whole damage, is not built either.

## Not yet built

- **Bestial Ascent's Charmed Cloudstrider plunge.** The skill's damage is the special plunge that follows it, with its radius, its particle and its poise, and Constellation 6's radius and crit. It waits on a plunge variant the skill arms, as `elementalBurstVariant` arms a burst: a kit has no plunge variant yet.
- **Suanni's Man Chai and the burst's status.** The status lasts twelve seconds, and the Man Chai it sends out resets Bestial Ascent's cooldown when the special plunge meets it, which Constellation 1 heals on. It waits on a kit status that a plunge's landing reads, and a cooldown reset on that status.
- **The heals and the Max HP drain.** Suanni's Gilded Dance heals 30% of Max HP at 36 frames, Ascension 1 regains 1.5% of Max HP every 0.2 seconds for 0.8 seconds, and the special plunge drains 15% of Max HP. The burst's heal needs nothing more than a one-tick field healing him through `changeKitMemberHealth`, while Ascension 1's regeneration and the drain follow the special plunge's hit and wait on it.
- **The passives.** Ascension 4's DMG bonus on the plunge, Constellation 2's ATK after an overheal, Constellation 4's energy from the plunge and Constellation 6's crit wait on the passive hook, which reads the combatant and the HP share the party holds.

## Decisions

- **The charged attack is provisional.** gcsim has none for Gaming, since its charge is not implemented, so it takes the frames and reach of Ayato's measured claymore charge (the strike at 24 frames of 55) and the table's index 5 (113.09% of ATK) and 6 (40 stamina), until a recording of the attack settles it.
- **Bestial Ascent strikes nothing of its own.** gcsim's skill has no hit: its damage is the special plunge that follows it, which is not built, so the skill's animation and cooldown are the kit's and its hits are none.
- **The burst's strike is one circle of radius 5 round the body**, at 60 frames, as gcsim queues it. The burst's status, its Man Chai and its heal are not built, so the burst's cooldown and energy cost are the whole of its state.

- **Air of Prosperity's Incoming Healing Bonus is a passive bonus from Ascension 4, while he has under half his HP.** It reads the HP share the party holds through the passive hook. Its other clause, 20% more Plunging Attack DMG at half HP or more, waits on the plunge variant.

## Key files

| File                                                              | Role                                                                                                                                                                     |
| :---------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/gamingKit.ts` | `createGamingKitBehaviour`, Gaming's kit with his four strikes, provisional charged attack, collision and two plunges, Bestial Ascent and Suanni's Gilded Dance's strike |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/gaming), MIT: the kit's four strikes' hitmarks, cancels, poise and reaches, the collision and the low and high plunges' frames, reaches and poise, Bestial Ascent's animation and cooldown, Suanni's Gilded Dance's animation, strike and cooldown, and the multiplier indices of each group.
