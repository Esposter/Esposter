# Yanfei

Yanfei's kit is its record and one behaviour module, `createYanfeiKitBehaviour`, on avatar 10000048: three strikes, a charged attack that spends her Scarlet Seals, a collision and two plunges, Signed Edict and Done Deal. Her multipliers are read from proud skill groups 4831, 4832 and 4839; the charged attack's stamina and its per-seal values, the skill's cooldown, and the burst's seconds, cooldown and energy cost are read from the same groups. The seals are a status for each of four slots, which a gain restarts together for 10 seconds, so they run out together, as gcsim's do. A strike, Signed Edict and Done Deal set her seals, and Done Deal adds one each second for its 15 seconds. Each seal the charged attack spends widens its circle, raises its multiplier and cuts its stamina, and Ascension 1 gives 5% Pyro DMG Bonus per seal for 6 seconds. Constellation 1 cuts the stamina more, and Constellation 6 holds a fourth seal. Done Deal's DMG Bonus goes to the charged attack while it stands. Her Ascension 4 shot, her Constellation 2 CRIT Rate and her Constellation 4 shield are not built, as no kit event reaches the enemy's health or a shield. The poise of the plunges and the collision is provisional, and the charged attack lands at 63 frames from every start.

## Decisions

- **Yanfei's seals are four statuses, one a slot, and her charged attack reads them as it starts.** A kit status of one id restarts rather than stacks, so each seal has its own slot id and a gain restarts the held slots together. The charged attack's hit is cast as a summon at her body as the seals are spent, as Ganyu's Bloom is, so its circle is priced round the body at the charge's radius plus the targeting area.
- **Yanfei's charged attack lands at 63 frames from a standing start.** gcsim adds a 16-frame windup to a start from a run, which the kit does not read, so every start lands at 63 frames.

## Key files

| File                                                              | Role                                                                                                                                                                             |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/yanfeiKit.ts` | `createYanfeiKitBehaviour`, Yanfei's kit with the Scarlet Seals her charged attack spends, Signed Edict, Done Deal and its seals, and her Ascension 1 and Constellations 1 and 6 |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/yanfei), MIT: the kit's hitmarks, cancel frames and areas, the charged attack's animation, hit and radii by seal count, the plunges' and collision's circles, Signed Edict's hit and cooldown, Done Deal's hit, seals and bonus, Ascension 1's Pyro DMG Bonus, and Constellations 1 and 6.
