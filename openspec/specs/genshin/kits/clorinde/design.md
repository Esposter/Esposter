# Clorinde

Clorinde's kit is its record and one behaviour module, `createClorindeKitBehaviour`, on avatar 10000098: five normal attacks, the fourth of three boxes and the fifth of one circle, a charged attack, a collision and two plunges, and Last Lightfall's five strikes. Her multipliers are read from proud skill groups 9831 and 9839, matching gcsim's to three decimal places, and the burst's cooldown and cost and the charged attack's 20 stamina come from them. Hunter's Vigil's press plays its 33-frame animation and starts its 16-second cooldown, with no hit of its own.

## Decisions

- **Each strike is priced at its gcsim reach.** The first three strikes are circles of radius 1.7, 1.9 and 2.1 centred 1.1 to 1.3 metres ahead, priced as the offset plus the radius, as Zhongli's are. The fourth strike is three boxes 2 metres wide, 1.3 metres ahead, and the fifth a circle of radius 2.5 at 1.4 metres. gcsim gives no poise for a normal attack, so none is dealt.
- **The charged attack is a circle of radius 4.1 round her.** gcsim strikes it at 38 frames of a 68-frame animation as a Physical hit, with 20 stamina.
- **Last Lightfall keeps gcsim's five frames.** Its boxes land at 97, 103, 109, 115 and 121 frames, each a gauge of 1U under the Elemental Burst internal cooldown, inside its 128-frame animation.
- **The press has no hit.** gcsim's press only starts Night Vigil, so the kit's press plays its animation and starts its cooldown, and the stance is not built.
- **Her plunges are provisional.** Clorinde has no plunge in gcsim, so hers share the plunge reach, deal 0 poise and land as their action starts; the roadmap's Manual verification list has the question.

## Not built

- **Night Vigil is waiting on the Bond of Life hook.** While Night Vigil stands, her normal attacks become Impale the Night and Swift Hunt, whose damage and healing depend on the Bond of Life a fraction of her HP sets, and that fraction reads wearer HP, which the kit cannot read yet. Night Vigil is therefore not built, and no stance stands in for it.
- **Bond of Life is waiting on a wearer-HP hook.** Her Bond of Life rises as she attacks and falls as she heals, and Last Lightfall's damage and her Bond of Life gain scale with it. Each waits on that hook, and until it lands her burst deals its base damage only.
- **Her Surging Blade waits on a conditional follow-up hit.** Her skill's arkhe is a follow-up hit gcsim fires under a 10-second cooldown on a condition of its own, and a conditional follow-up under a cooldown has no hook yet.
- **Her passives and constellations are not built.** The Nightvigil Shade and the Glimbright Shade that Night Vigil summons, and the constellations that work through Bond of Life wait on the same hooks. Constellation 6's crit buff after Hunter's Vigil is built on the skill's start. The constellations that raise talent levels are the [talents](../../../../changes/genshin-talents/design.md) page's.

## Key files

| File                                                                | Role                                                                                |
| :------------------------------------------------------------------ | :---------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/clorindeKit.ts` | `createClorindeKitBehaviour`, Clorinde's strikes, charged attack and Last Lightfall |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/clorinde), MIT: every strike's hitmarks, frames and areas, the circle and hitmark of the charged attack, Last Lightfall's five boxes and their hitmarks, the press's cooldown and state, and the passives and constellations listed as not built.
