# Collei

Collei's kit is its record and one behaviour module, `createColleiKitBehaviour`, avatar 10000067: four strikes, a fully charged shot, a collision and two plunges, Floral Brush's two hits, and Trump-Card Kitty's explosion with its leap field. Her multipliers are read from proud skill groups 6731, 6732 and 6739; Floral Brush's cooldown and Trump-Card Kitty's cooldown and energy cost come from the same groups. Constellation 4's Elemental Mastery for the other members is built on Trump-Card Kitty's burst start.

Not yet built: Sprout (Ascension 1) and the Cuilein-Anbar Zone's extension (Ascension 4) both react to a reaction another party member triggers, which no passive can read yet. Constellation 2's Sprout extension and Constellation 6's Forest of Falling Arrows wait on a passive's hook.

## Decisions

- **Trump-Card Kitty's leap runs 378 frames from its explosion, as gcsim gives it.** The table's duration reads 6 seconds, and gcsim's 6.3 is shipped until a recording settles it. The field has no edge, as a schedule that runs wherever the body stands, and each of its ticks lands the leap's circle of radius 4 round the spot the kitty was cast at, at 68 frames and every 30 after it.
- **The leap's first tick reads 68 frames as the explosion's 25 and the leap's 43 added together.** gcsim starts the leap in a task at the explosion's hitmark of 25 (`burst.go:56`), and that task starts the ticks in a task at `leapHitmark-explosionHitmark`, 43 (`burst.go:54`), so the tick's `QueueAttackWithSnap` at `burst.go:88` reads 68 and `hits.leap.hitmarkFrames` is 68. It read 0 before the reader summed the delays of the tasks that run a method's call, the outer task's 25 with the inner task's 43.
- **The leap's ticks are priced by the kitty's combatant with the team's buffs as each tick lands.** A summon is priced as its hits land, as Xiangling's Pyronado is. gcsim snapshots the explosion's attack for each tick, so a tick there reads the stats of the cast; that snapshot is not built.
- **Collei's arrows, her charged shot, Floral Brush and Trump-Card Kitty take the wiki's poise: 14.88 to 23.73 an arrow, 20 for the charged shot, 40 a Floral Brush hit, 30 for the explosion and 10 for the leap.** gcsim gives them no poise, so the record takes each from the wiki.
- **Constellation 1 reads whether Collei is on the field from the deployed team.** gcsim (MIT) gives her 20% Energy Recharge while she is not the active character, so the passive reads her own entry's `isOnField` in the deployed team it is given, and gives none when she is not in that team.

## Key files

| File                                                              | Role                                                                                                        |
| :---------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/colleiKit.ts` | `createColleiKitBehaviour`, Collei's kit with Floral Brush, Trump-Card Kitty's explosion and its leap field |

## Sources

- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/collei), MIT: Collei's strikes' hitmarks and cancels, the fully charged shot's frames, Floral Brush's hitmarks, and Trump-Card Kitty's explosion, leap ticks and status.
