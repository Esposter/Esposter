# Sigewinne

Sigewinne's kit is its record and one behaviour module, `createSigewinneKitBehaviour`, on avatar 10000095: three strikes, the Fully-Charged Aimed Shot, a collision and two plunges, Bolstering Bubblebalm's five bubbles, and Super Saturated Syringing's six waves. Her strikes, shot and plunges read proud attack group 9531, and her bubbles and waves are shares of her Max HP, priced as each hit's additive base damage on its striker, as Zhongli's Max HP share is.

## Decisions

- **Her hits land on gcsim's hitmarks as they are.** Her strikes land at 12, 14 and 38 frames and the shot at 86, as gcsim lists them. gcsim's attack queue lands each projectile 10 frames after its hitmark, which is not added here, so these hits land 10 frames early against gcsim's own timing. Question on the roadmap.
- **The press casts Bolstering Bubblebalm where she stands.** Its five bubbles are circles of radius 1 on the primary target, at 35 frames and then every 107 frames, each a share of her Max HP. Its animation is 41 frames and its cooldown 18 seconds.
- **Super Saturated Syringing is six waves from her.** Each wave is a box 4 metres wide and 10 long, at 99 frames and then every 25 frames, through its 241-frame animation, each a share of her Max HP. Its cooldown is 18 seconds on 70 energy.
- **The charged shot is the Fully-Charged Aimed Shot, the charge's first level.** It is gcsim's default, hitting at 86 frames of its 94, in a box as her first strike is, and costs no stamina, as Ganyu's does not.
- **Plunges use the shared plunge reaches, with provisional talent indices.** gcsim names no plunge group for her, so the collision, low and high plunges read attack group indices 3, 4 and 5, inferred from their values' ratios (0.568, 1.136 and 1.419), and land at the start of their 0.4-second action.
- **Her strikes, shot and plunges carry no poise, provisionally.** gcsim gives them none.

## Not built

- **The Mini-Stration Bubble, the shot's second charge level,** is gcsim's hitmark 103 of 112 frames and a second hit, waiting on a charge level that carries a follow-up hit.
- **The bubbles' hold tiers,** which are gcsim's held press at 66 and 90 frames with their damage buffs, wait on a summon whose tier its cast chooses.
- **The bubbles' healing and the final bounce's heal,** which heal her party by a Max HP share and a flat amount, wait on a party healing hook.
- **Surging Blade,** the second damage gcsim gives the press, waits on a summon's second timed hit.
- **Her ascension and constellation passives, and the droplets her press and burst spawn,** are not built.

## Key files

| File                                                                 | Role                                                                                                                                                    |
| :------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/sigewinneKit.ts` | `createSigewinneKitBehaviour`, Sigewinne's kit with her strikes, Fully-Charged Aimed Shot, plunges, Bolstering Bubblebalm and Super Saturated Syringing |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/sigewinne), MIT: the kit's hitmarks and animations, the strikes' and shot's boxes and circles, the bubbles' radius and interval, the waves' box and ticks, and the proud group indices behind each multiplier and share.
