---
title: Yumemizuki Mizuki
description: Yumemizuki Mizuki's kit as built, with her three strikes, charged attack, plunges, the skill's activation hit and the burst's hit, and what is left waiting on the Dreamdrifter state and the snack pick-ups.
---

# Yumemizuki Mizuki

Mizuki's kit is its record and one behaviour module, `createMizukiKitBehaviour`, on avatar 10000109: three strikes, a charged attack, two plunges and the collision between them, her skill's activation hit and her burst's. Her multipliers are read from proud skill groups 10931, 10932 and 10939, matching gcsim's to four decimal places. The skill's cooldown is 15 seconds, the burst's 15 seconds and 60 energy, and the charged attack takes 50 stamina.

## Decisions

- **Her strikes are circles of 0.7 metres centred on the primary target, landing ten frames past their hitmarks.** gcsim queues each strike's damage with a travel of 10 frames, its default, so the strikes land at 17, 29 and 47 frames in animations of 34, 38 and 98 frames. Each is Anemo at one unit of gauge, with no poise, as gcsim gives it.
- **Her charged attack is a circle of 3.5 metres centred on the primary target at 39 frames, in an animation of 81.** gcsim delays it 14 frames when it is cast out of the air, a windup the kit does not hold: a kit's action has no hook that times it by the state it starts from, so the kit times it from idle, as gcsim does.
- **Her skill's activation hit is a circle of 5.5 metres round the body at 2 frames, with 30 poise, in an animation of 50 frames.** It is Anemo at one unit of gauge.
- **Her burst's hit is a circle of 8 metres centred on the primary target at 93 frames, with 100 poise, in an animation of 94 frames.** It is Anemo at two units of gauge, as gcsim's 50 durability gives it.
- **Her plunges are provisional.** Mizuki has no plunge in gcsim, so her collision, low and high plunge are the borrowed ones of the index, and the [roadmap](/docs/genshin/roadmap) asks whether a recording of her plunges agrees.

## Not built

- **The Dreamdrifter state waits on its hook.** Her skill's activation enters the state, in which she drifts forward while clouds of Anemo strike the enemies near her every 45 frames, she may steer her drift, and only her swap, dash and burst are open to her. The state restricts the actions the kit plays, which is a hook of its own, so the clouds wait on it, and the press deals its activation hit only until then. The Swirl bonus the state gives the party waits on it too.
- **The snack pick-ups wait on the snack hook.** Her burst leaves a snack every 90 frames for 12 seconds, each a gadget that explodes on its own or when a member collects it, healing that member by a share of Elemental Mastery and flat HP. The pick-up's heal and its Munen Shockwave wait on it, and so does Constellation 4, which reads the snacks.
- **Ascension 1 (Swirl extends the Dreamdrifter), Ascension 4 (the party's hits while she drifts) and Constellations 1, 2 and 6 wait on the Dreamdrifter state hook.** Each reads the state or the Swirl it gives, and Constellation 4 waits on the snack hook as well.
- **The charged attack's windup waits on a hook that times an action by the state it starts from**, the 14 frames gcsim gives it when it is cast out of the air, as above.

Talent levels and constellations are read at the level the kit is built at: raising them is the [talents](/docs/proposals/genshin/talents) and [constellations](/docs/proposals/genshin/constellations) pages'.

## Key files

| File                                                              | Role                                                                                                                                                                                         |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/mizukiKit.ts` | `createMizukiKitBehaviour`, Mizuki's three strikes and charged attack, provisional plunges, the activation hit of her skill and her burst's hit, the state and snacks waiting on their hooks |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/mizuki), MIT: each strike's hitmark, animation and travel, the charged attack's hit, animation and windup, the skill's activation, animation and cooldown delay, and the burst's hit, animation and cooldown, read from its attack, charge, skill and burst files, with its snack, ascension and constellation files for the mechanics waiting on their hooks.
- The proud skill groups' indices, read from gcsim's data file for the character, which lists each multiplier beside its group.
