# Arlecchino

Arlecchino's kit is its record and one behaviour module, `createArlecchinoKitBehaviour`, on avatar 10000096: six strikes, a charged attack, a collision and two plunges, All Is Ash's Spike and Cleave, and Balemoon Rising. Her multipliers read proud groups 9631, 9632 and 9639 at her talent level, and match gcsim's values to four decimal places. Her strikes, shot and plunges are physical, as gcsim has them with the Bond of Life off.

## Decisions

- **Each strike's reach is its box or circle's offset plus its radius.** gcsim places each hitbox at an offset from her body, so its reach from her is the offset's length plus the radius, the same pricing the box helper uses. The fan of her second strike is priced at its 2.6 radius and 0.5 offset, with its 300 degree sweep kept.
- **The fourth strike's two hits are both 3 in the attack group.** They land at 24 and 35 frames within its 55-frame animation, as gcsim has them.
- **The charged attack is a circle of radius 4 centred 0.9 metres ahead of its target,** priced at the targeting area's radius plus 4.9, 9.9 metres, hitting at 37 frames of its 60-frame animation. It costs the table's 25 stamina.
- **The plunges are gcsim's.** The low and high plunges land at 47 and 48 frames, with circles of radius 3 and 5 one metre ahead, and poise 100 and 150. The collision is a circle of radius 1, queued 41 frames into a plunge, as gcsim queues it. The kit strikes it on every plunge that ends among enemies, not only when gcsim's `collision` option is set: that option only tells gcsim's simulator to assume the contact, so the kit keeps its own rule.
- **Cleave's reach is measured from different points.** gcsim places its circle of radius 6 4.5 metres past the target, so it reaches 10.5 metres from the target. The kit centres the circle on Arlecchino's body and reaches 10.5 metres from there, so the kit's reach is understated for targets far from her body. The question stays open on the roadmap.
- **Balemoon Rising hits once at 110 frames of its 146,** a circle of radius 6.5 six metres ahead, priced at 12.5 metres, with 3.704 of the table's multiplier, a gauge of 1, and the table's cooldown of 15 seconds on 60 energy.
- **Her skill's cooldown is the table's 30 seconds.**
- **Constellation 6's CRIT starts at All Is Ash, for 20 seconds, once every 15.** gcsim's `c6skill` (`arlecchino/cons.go:91`) gives 10% CRIT Rate and 70% CRIT DMG to her Normal Attacks and Balemoon Rising for 20 seconds, behind a 15-second internal cooldown started on each skill cast. The kit starts the cooldown as a status of her own, `arlecchino-constellation-6-cooldown`, and on a pass gives the 20-second status `arlecchino-constellation-6`, which its strike hooks read on her own Normal Attacks and burst. The values are the dump's `paramList` for Constellation 6 (0.1, 0.7, 20 and 15), and the game's own text names the same Normal Attacks and Elemental Burst.
- **Balemoon Rising resets her skill's cooldown 107 frames in.** gcsim's `burst.go` queues `ResetActionCooldown(action.ActionSkill)` at that frame, and the kit schedules the same reset as a task that zeroes her party member's skill cooldown.

## Not built

- **Bond of Life, the strikes' Pyro variant, is not built.** While it is up, her strikes and charged attack are Pyro and add a bonus that scales with her HP debt, and each strike consumes some of that debt. The Bond of Life hook it sits on is built; the HP debt it scales with is not, so it waits on the HP-debt hook alone.
- **The Masque of the Red Death's debt damage waits on the HP-debt hook.** It adds to her strikes and charged attack as a share of her debt and her total ATK, and its ascension and constellation bonuses go with it.
- **The Blood-Debt Directive, the sigils her Cleave sets off, waits on the HP-debt hook.** Its debt limit, its Pyro sigils and its ticks all wait on it.
- **Balemoon Rising's heal waits on the HP-debt hook,** as it is paid from her debt.
- **Her utility passive is built, from no ascension,** the Balemoon Alone May Know's 40% Pyro DMG Bonus. Her Ascension 1 passive waits on the HP-debt hook, which its Blood-Debt Directives read, and her Ascension 4 passive's RES is not built, as gcsim v2.47.2 models no Resistances. Constellations 1, 2 and 4 each need the Masque of the Red Death or a Blood-Debt Directive's absorption, which the kit does not record, and Constellation 6's added damage to Balemoon Rising is not built, as it reads Bond of Life's percentage.

## Key files

| File                                                                  | Role                                                                                                                           |
| :-------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/arlecchinoKit.ts` | `createArlecchinoKitBehaviour`, Arlecchino's kit with her six strikes, charged attack, plunges, All Is Ash and Balemoon Rising |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/arlecchino), MIT: the kit's hitmarks and animations, the hitboxes and their offsets, the plunge and burst circles, the poise of the plunges, and the proud group indices behind each multiplier, cost and cooldown.
