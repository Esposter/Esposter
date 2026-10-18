# Arlecchino

Arlecchino's kit is its record and one behaviour module, `createArlecchinoKitBehaviour`, on avatar 10000096: six strikes, a charged attack, a collision and two plunges, All Is Ash's Spike and Cleave, and Balemoon Rising. Her multipliers read proud groups 9631, 9632 and 9639 at her talent level, and match gcsim's values to four decimal places. Her strikes, shot and plunges are physical, as gcsim has them with the Bond of Life off.

## Decisions

- **Each strike's reach is its box or circle's offset plus its radius.** gcsim places each hitbox at an offset from her body, so its reach from her is the offset's length plus the radius, the same pricing the box helper uses. The fan of her second strike is priced at its 2.6 radius and 0.5 offset, with its 300 degree sweep kept.
- **The fourth strike's two hits are both 3 in the attack group.** They land at 24 and 35 frames within its 55-frame animation, as gcsim has them.
- **The charged attack is a circle of radius 4 0.9 metres ahead of her,** priced at 4.9 metres, hitting at 37 frames of its 60-frame animation. It costs the table's 25 stamina.
- **The plunges are gcsim's.** The low and high plunges land at 47 and 48 frames, with circles of radius 3 and 5 one metre ahead, and poise 100 and 150. The collision is a circle of radius 1, queued 41 frames into a plunge, as gcsim queues it.
- **Cleave is priced conservatively.** Its circle sits 4.5 metres past the target, so its reach from the target is 10.5 metres, the offset plus its radius of 6. The question is on the roadmap.
- **Balemoon Rising hits once at 110 frames of its 146,** a circle of radius 6.5 six metres ahead, priced at 12.5 metres, with 3.704 of the table's multiplier, a gauge of 1, and the table's cooldown of 15 seconds on 60 energy.
- **Her skill's cooldown is the table's 30 seconds.**

## Not built

- **Bond of Life, the strikes' Pyro variant, waits on the HP-debt hook.** While it is up, her strikes and charged attack are Pyro and add a bonus that scales with her HP debt, and each strike consumes some of that debt.
- **The Masque of the Red Death's debt damage waits on the HP-debt hook.** It adds to her strikes and charged attack as a share of her debt and her total ATK, and its ascension and constellation bonuses go with it.
- **The Blood-Debt Directive, the sigils her Cleave sets off, waits on the HP-debt hook.** Its debt limit, its Pyro sigils and its ticks all wait on it.
- **Balemoon Rising's heal waits on the HP-debt hook,** as it is paid from her debt, and its cooldown reset of Spike and Cleave, 107 frames in, waits on a cooldown reset hook.
- **Her ascension and constellation passives are not built,** each waiting on what its constellation reads: Constellations 1, 2 and 4 on the Masque of the Red Death or a Blood-Debt Directive's absorption, which the kit does not record, and Constellation 6 on Bond of Life's percentage, which the kit does not hold.

## Key files

| File                                                                  | Role                                                                                                                           |
| :-------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/arlecchinoKit.ts` | `createArlecchinoKitBehaviour`, Arlecchino's kit with her six strikes, charged attack, plunges, All Is Ash and Balemoon Rising |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/arlecchino), MIT: the kit's hitmarks and animations, the hitboxes and their offsets, the plunge and burst circles, the poise of the plunges, and the proud group indices behind each multiplier, cost and cooldown.
