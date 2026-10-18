# Mavuika

Mavuika's kit is its record and one behaviour module, `createMavuikaKitBehaviour`, avatar 10000106: her four strikes, a charged attack, and the low, high and collision plunges, played when she is not in her Blessing. Her multipliers are read from proud skill groups 10631, 10632 and 10639, with the skill's cooldown from the second and the burst's from the third. The charged attack costs the 50 stamina gcsim's charge takes.

## Not yet built

Without Nightsoul state in the framework, her Flamestrider Blessing, a stance that runs on its points, waits on the Nightsoul hook, and so does the Fighting Spirit that the party's Nightsoul points feed.

- **The skill's Flamestrider waits on the Nightsoul hook.** The press enters the Blessing and its Ring of Searing Radiance, and while it lasts her strikes, charged attack, sprint and plunges are the Flamestrider's, not the ones built here. The press has no hit yet and spends its 15-second cooldown, so it is a placeholder until the hook lands, as the Natlan kits' skills before it are.
- **Sunfell Slice waits on Fighting Spirit.** The burst is paid in 100 Fighting Spirit, not energy, and its ATK share grows with the Fighting Spirit it spends. Fighting Spirit is fed by the party's Nightsoul points as they are consumed. Until the hook lands, the burst's energy cost is unreachable, so it cannot be cast and has no hit.
- **The Flamestrider's strikes, charged attack and plunges wait on the Nightsoul hook.** gcsim's bike strikes, biked charged attack and bike plunges replace hers inside the blessing, the stance the Nightsoul hook waits on, and a stance holds no plunges to play in place of the kit's.
- **Ascension 1 and 4 and Constellations 1, 2 and 4 wait on the Nightsoul hook.** Ascension 1 gives 30% ATK for ten seconds on each Nightsoul burst, Constellation 1 changes the Fighting Spirit each point gives, and the others read the blessing's Flamestrider or its burst, so none is built.

## Decisions

- **The strikes are the ring-state ones.** gcsim's ring-state attack is her four strikes outside the Flamestrider, and this kit takes those until the Flamestrider hook is built. The second and third strikes are boxes, priced as the circle to their far corner, as the framework prices a box.
- **Her plunge collision is the framework's.** gcsim queues the collision only when a plunge's collision option is set. The framework's collision strikes on every plunge, which the Emilie page's manual question covers.
- **Her charged attack costs the stamina gcsim's `ActionStam` gives a charge.** The table's stamina index is the same 50, so the table and gcsim agree.

## Key files

| File                                                               | Role                                                                                                                                                                         |
| :----------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/mavuikaKit.ts` | `createMavuikaKitBehaviour`, Mavuika's four strikes, charged attack and plunges outside her Nightsoul Blessing, with her skill and burst waiting on the hook Nightsoul needs |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/mavuika), MIT, at v2.47.2: Mavuika's four strikes' hitmarks, cancels, poise and reaches, the charged attack and plunges' frames and reaches, and the skill and burst the Nightsoul hook waits on.
