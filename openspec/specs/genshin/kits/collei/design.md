# Collei

Collei's kit is its record and one behaviour module, `createColleiKitBehaviour`, avatar 10000067: four strikes, a fully charged shot, a collision and two plunges, Floral Brush's two hits, and Trump-Card Kitty's explosion with its leap field. Her multipliers are read from proud skill groups 6731, 6732 and 6739; Floral Brush's cooldown and Trump-Card Kitty's cooldown and energy cost come from the same groups.

Not yet built: Sprout (Ascension 1) and the Cuilein-Anbar Zone's extension (Ascension 4) both react to a reaction another party member triggers, which no passive can read yet. Constellation 1's Energy Recharge, Constellation 2's Sprout extension, Constellation 4's Elemental Mastery for the other members and Constellation 6's Forest of Falling Arrows wait on a passive's hook, which the kit does not yet offer.

## Decisions

- **Trump-Card Kitty's leap runs 378 frames from its explosion, as gcsim gives it.** The table's duration reads 6 seconds, and gcsim's 6.3 is shipped until a recording settles it. The field has no edge, as a schedule that runs wherever the body stands, and each of its ticks lands the leap's circle of radius 4 round the spot the kitty was cast at, at 68 frames and every 30 after it.
- **The leap's ticks are priced by the kitty's combatant with the team's buffs as each tick lands.** A summon is priced as its hits land, as Xiangling's Pyronado is. gcsim snapshots the explosion's attack for each tick, so a tick there reads the stats of the cast; that snapshot is not built.
- **Collei's arrows, Floral Brush and Trump-Card Kitty deal 0 poise.** gcsim gives them no poise, so `colleiKit.ts` gives each 0 poise damage.

## Key files

| File                                                              | Role                                                                                                        |
| :---------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/colleiKit.ts` | `createColleiKitBehaviour`, Collei's kit with Floral Brush, Trump-Card Kitty's explosion and its leap field |

## Sources

- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/collei), MIT: Collei's strikes' hitmarks and cancels, the fully charged shot's frames, Floral Brush's hitmarks, and Trump-Card Kitty's explosion, leap ticks and status.
