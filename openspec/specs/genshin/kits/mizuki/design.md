# Yumemizuki Mizuki

Mizuki's kit is its record and one behaviour module, `createMizukiKitBehaviour`, on avatar 10000109: three strikes, a charged attack, two plunges and the collision between them, her skill's activation hit and her burst's. Her multipliers are read from proud skill groups 10931, 10932 and 10939, matching gcsim's to four decimal places. The skill's cooldown is 15 seconds, the burst's 15 seconds and 60 energy, and the charged attack takes 50 stamina.

## Decisions

- **Her strikes are circles of 0.7 metres centred on the primary target, landing ten frames past their hitmarks.** gcsim queues each strike's damage with a travel of 10 frames, its default, so the strikes land at 17, 29 and 47 frames in animations of 34, 38 and 98 frames. Each is Anemo at one unit of gauge, with the wiki's poise, 9.802, 8.796 and 13.382, as gcsim gives none.
- **Her charged attack is a circle of 8.5 metres centred on the primary target at 39 frames, in an animation of 81.** gcsim gives its circle 3.5 metres round the primary target, and a reach on a target is the strike zone's 5 metres plus that, as the [kits README](../README.md) prices it. gcsim delays it 14 frames when it is cast out of the air, a windup the kit does not hold: a kit's action has no hook that times it by the state it starts from, so the kit times it from idle, as gcsim does.
- **Her skill's activation hit is a circle of 5.5 metres round the body at 2 frames, with 30 poise, in an animation of 50 frames.** It is Anemo at one unit of gauge.
- **Her burst's hit is a circle of 8 metres centred on the primary target at 93 frames, with 100 poise, in an animation of 94 frames.** It is Anemo at two units of gauge, as gcsim's 50 durability gives it.
- **Her skill's press enters the Dreamdrifter state for five seconds, and a press in it cancels the state.** gcsim gives the state its five-second duration (`skill.go`'s `dreamDrifterBaseDuration`) and cancels it on a second press (`Skill`). The state is the kit's status, so it ends on its timer or the press.
- **Her plunges are provisional.** Mizuki has no plunge in gcsim, so her collision, low and high plunge are the borrowed ones of the index, except that their poise is the wiki's: 5 for the collision, 100 high and 50 low. The [roadmap](../../../../changes/genshin-roadmap/tasks.md) asks whether a recording of her plunges agrees.

## Not built

- **The snack pick-ups wait on the kit leaving them.** Her burst leaves a snack every 90 frames for 12 seconds, each a gadget that explodes on its own or when a member collects it, healing that member by a share of Elemental Mastery and flat HP. A snack is a `KitPickUp`, its explosion on running out an answer to its `EffectExpired` and its pickup's heal or Munen Shockwave its `onPickedUp`, so the heal, the shockwave and Constellation 4, which reads the snacks, wait only on her kit. The larger reach gcsim gives her pickups in the Dreamdrifter state (`mizuki/snack.go:76`) is not a radius a pick-up holds, so it waits on the state as well.
- **Ascension 1 (Swirl extends the Dreamdrifter), Ascension 4 (the party's hits while she drifts) and Constellations 1, 2 and 6 wait on the Dreamdrifter state hook.** Each reads the state or the Swirl it gives, and Constellation 4 waits on her kit leaving the snacks as well.
- **The charged attack's windup waits on a hook that times an action by the state it starts from**, the 14 frames gcsim gives it when it is cast out of the air, as above.

## Key files

| File                                                              | Role                                                                                                                                                                                                                                           |
| :---------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/mizukiKit.ts` | `createMizukiKitBehaviour`, Mizuki's three strikes and charged attack, provisional plunges, the activation hit of her skill and her burst's hit, and the Dreamdrifter state its press enters with its clouds, the snacks waiting on their hook |

## Sources

- [gcsim skill.go](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/mizuki), MIT: the Dreamdrifter state's five-second duration and its cancel on a second press.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/mizuki), MIT: each strike's hitmark, animation and travel, the charged attack's hit, animation and windup, the skill's activation, animation and cooldown delay, and the burst's hit, animation and cooldown, read from its attack, charge, skill and burst files, with its snack, ascension and constellation files for the mechanics waiting on their hooks.
- The proud skill groups' indices, read from gcsim's data file for the character, which lists each multiplier beside its group.
