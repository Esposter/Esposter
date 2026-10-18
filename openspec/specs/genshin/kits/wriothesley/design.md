# Wriothesley

Wriothesley's kit is its record and one behaviour module, `createWriothesleyKitBehaviour`, on avatar 10000086: five cryo strikes, a charged attack, a collision and two plunges, and Darkgold Wolfbite, five cryo strikes on the target from 99 frames. His multipliers are read from proud skill groups 8631, 8632 and 8639; the charged attack's stamina, the skill's cooldown, and the burst's cooldown and energy cost are read from the same groups. Each of his strikes is a box on the target, which the kit prices as a circle of the box's length, and this is provisional.

Icefang Rush deals no damage of its own, so its action has no hits and the kit holds its animation and cooldown. The skill also starts its ten-second status, which ends on a swap through `KitStatus`'s `isEndedOnSwap`. While the status holds and his HP is above half of his Max HP (the party's health share, read through `getPartyMember`), each strike of his five normal attacks drains him 4.5% of his Max HP as Chilling Penalty, once every 6 frames, and gives one Cryo particle every 2 seconds. The particle is held as a delayed energy for 100 frames and collected on its expiry, through `delayKitEnergy` and `collectDelayedKitEnergy`.

From Ascension 4, Prosecution Edict stacks on each self-drain of his HP and each heal that restores some of it, while the status holds and he is on the field, up to five. Each stack is a buff on his AttackPercent from the edict's own source, restarted with each change so it lasts as long as the skill; recasting resets the stacks. The ATK buff is not ended by a swap, as gcsim's stat mod is not removed on exit.

Not built, and why each is out of reach of the kit now:

- The enhanced strikes' damage multiplier. gcsim's `Snapshot` multiplies each normal attack by the skill's own table, `skill[talent]` (1.431695 at level 1, in `zz_wriothesley.dm.go`), and the record holds no hit whose multiplier that scales. No hit field can carry it.
- The enhanced strikes' hitboxes. gcsim's enhanced normal attacks use larger boxes (2.4 by 3.4 and 2.8 by 3.4, against the base 2 by 3 and 2.5 by 3), and the record holds only the base areas. A kit's hit takes its area from the record, not from a behaviour.
- Darkgold Wolfbite's Surging Blade, which hits at 160 frames inside a 10 by 16 box with a 10-second internal cooldown. Its multiplier is not in the record, and the kit has no timed hit to land it on.
- Ascension 1's Gracious Rebuke. It turns the charged attack into Rebuke: Vaulting Fist, which needs a charged attack variant (only burst and skill holds have one) and a +50% damage bonus that reads the Rebuke status, where the strike damage bonus reads no effect.
- Constellations 1, 2, 4 and 6. C1 extends Icefang Rush and needs Gracious Rebuke; C2 adds 40% per Prosecution Edict stack to Darkgold Wolfbite, a damage bonus the strike hook cannot read; C4 and C6 need Rebuke's heal and CRIT and icicle.
- The charged attack's ascension and constellation boxes.

The kit-records row stays open. Its six `Unclassified` overlay entries (the five burst areas, a radius-23 circle that gcsim's `burst.go` queues as an 8 by 16 box, and `skill.hits.length`, zero) are the ones the builder names no source for, and the compare keeps them so.

## Key files

| File                                                                   | Role                                                                                                                                                              |
| :--------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/wriothesleyKit.ts` | `createWriothesleyKitBehaviour`, Wriothesley's kit with his strikes, charged attack, plunges, Icefang Rush's enhancement, Prosecution Edict and Darkgold Wolfbite |
| `packages/genshin-world/src/models/kit/KitStatus.ts`                   | `KitStatus`, which extends `KitSwapEndable` so a status such as Icefang Rush ends when its character leaves the field                                             |

## Sources

- [gcsim `skill.go`](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/wriothesley/skill.go), MIT: Icefang Rush's status (ten seconds and a frame), `skillBuffActive` (HP above half), `particleCB` and `particleICD` (one Cryo particle every 2 seconds), `chillingPenalty` with `skillLoseHPICD` (6 frames) and its drain of 0.045 of Max HP, and `onExit` ending the status on a swap.
- [gcsim `attack.go`](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/wriothesley/attack.go), MIT: the enhanced normal attacks' boxes and callbacks, which the kit reads for the Chilling Penalty and particle timing and does not read for the box.
- [gcsim `wriothesley.go`](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/wriothesley/wriothesley.go), MIT: `Snapshot`, which multiplies only `AttackTagNormal` strikes by the skill's table while the status holds.
- [gcsim `zz_wriothesley.dm.go`](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/wriothesley/zz_wriothesley.dm.go), MIT: the `skill` multiplier table, not built.
- [gcsim `asc.go`](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/wriothesley/asc.go), MIT: `a4` (stacks on a self-drain above zero and on a non-overheal heal, while on the field and the skill holds, up to five), `applyA4` (6% ATK per stack for the skill's duration) and `resetA4` on cast. `a1` (Gracious Rebuke) is not built.
- [gcsim `burst.go`](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/wriothesley/burst.go), MIT: Darkgold Wolfbite's hitmarks, which the record holds, and its 8 by 16 box, which the record does not hold as a box.
- [gcsim `cons.go`](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/wriothesley/cons.go), MIT: Constellations 1, 2, 4 and 6, not built.
- [gcsim `wriothesley.go`](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/wriothesley/wriothesley.go), MIT: the strikes' multipliers, the charged attack, plunges and their collision, Icefang Rush's animation and Darkgold Wolfbite's hitmarks and animation, as the record already reads them.
