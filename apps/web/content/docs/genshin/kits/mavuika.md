---
title: Mavuika
description: Mavuika's kit as built outside her Nightsoul Blessing: her four strikes, charged attack and low, high and collision plunges. Her skill's Flamestrider, her burst Sunfell Slice and every passive wait on the Nightsoul hook.
---

# Mavuika

Mavuika's kit is one module, `createMavuikaKit`, avatar 10000106: her four strikes, a charged attack, and a low, high and collision plunge, all as she plays them outside her Nightsoul Blessing. Her multipliers are read from proud skill groups 10631, 10632 and 10639: the strikes, charged attack, stamina and plunges from the first, the skill's cooldown from the second, and the burst's cooldown from the third. The charged attack costs the 50 stamina gcsim's charge takes.

## Not yet built

The framework holds no Nightsoul state, so everything that depends on it waits on the Nightsoul hook: the Nightsoul Blessing that gives her the Flamestrider, which needs a stance's required attack tags and the blessing's points, and the Fighting Spirit that the party's Nightsoul points feed.

- **The skill's Flamestrider waits on the Nightsoul hook.** Her press enters the Nightsoul Blessing and its Ring of Searing Radiance, and while it lasts her strikes, charged attack, sprint and plunges are the Flamestrider's, not the ones built here. The press has no hit yet and spends its 15-second cooldown, so it is a placeholder until the hook lands, as the Natlan kits' skills before it are.
- **Sunfell Slice waits on Fighting Spirit.** The burst is paid in 100 Fighting Spirit, not energy, and its ATK share grows with the Fighting Spirit it spends. Fighting Spirit is fed by the party's Nightsoul points as they are consumed. Until the hook lands, the burst's energy cost is unreachable, so it cannot be cast and has no hit.
- **The Flamestrider's strikes, charged attack and plunges wait on the stance hook.** gcsim's bike strikes, biked charged attack and bike plunges replace hers inside the blessing, and their stance needs the attack tags of its action groups, which the framework does not hold yet.
- **Ascension 1 and 4 and Constellations 1, 2 and 4 wait on the Nightsoul hook.** Ascension 1 gives 30% ATK for ten seconds on each Nightsoul burst, Constellation 1 changes the Fighting Spirit each point gives, and the others read the blessing's Flamestrider or its burst, so none is built.

## Decisions

- **The strikes are the ring-state ones.** gcsim's ring-state attack is her four strikes outside the Flamestrider, and this kit takes those until the Flamestrider hook is built. The second and third strikes are boxes, priced as the circle to their far corner, as the framework prices a box.
- **Her plunge collision is the framework's.** gcsim queues the collision only when a plunge's collision option is set. The framework's collision strikes on every plunge, which the Emilie page's manual question covers.
- **Her charged attack costs the stamina gcsim's `ActionStam` gives a charge.** The table's stamina index is the same 50, so the table and gcsim agree.

## Key files

| File                                                               | Role                                                                                                                                                          |
| :----------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/mavuikaKit.ts` | `createMavuikaKit`, Mavuika's four strikes, charged attack and plunges outside her Nightsoul Blessing, with her skill and burst waiting on the Nightsoul hook |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/mavuika), MIT, at main: Mavuika's four strikes' hitmarks, cancels, poise and reaches, the charged attack and plunges' frames and reaches, and the skill and burst the Nightsoul hook waits on.
