# Mondstadt

This region is built on [terrain](../../specs/genshin/terrain/design.md) and its [shapes](../../specs/genshin/terrain-shape-height/design.md), [vegetation](../../specs/genshin/vegetation/design.md) and its [trees and scatter](../genshin-trees-and-scatter/design.md), [water](../../specs/genshin/water/design.md) and its [flow](../genshin-flowing-water/design.md), [sky and time](../../specs/genshin/sky-and-time/design.md) and [weather](../genshin-weather/design.md), re-derived by the [scene derivation](../../specs/genshin/scene-derivation/design.md)'s method, each scene in its [recreation passes](../genshin-recreation-passes/design.md). Mondstadt is where the game begins: the nation of the Anemo Archon, its culture drawn from Germany and Switzerland. It is a land of open grass that the wind keeps moving, low wooded hills, a great lake with the city on an island in it, and sea cliffs to the west. To the south rises Dragonspine, a snowbound mountain around a colossal spike driven into it from the sky. It is the first region because the [rendering style](../../specs/genshin/rendering-style/design.md)'s Windrise scene already stands in it.

## Decisions

- **The strongest wind in the world.** Mondstadt's base wind is the highest of any region, and gusts visibly roll across the meadows. This is the [vegetation](../../specs/genshin/vegetation/design.md)'s wind field at its most visible, and Stormterror's Lair raises it to a gale.
- **The meadows wear Mondstadt's breeze until their reference is fitted.** Their base wind and gusts are the breeze Windrise is set with, so the rolling waves are built while the claim that it is the highest of any region is not yet fitted against the meadows' or the other regions' references. `services/mondstadt/computeWindGust.ts` mirrors the engine's gust term on the CPU and must stay in step with `createWindNode`.
- **A bright, cool palette.** Saturated spring greens, white limestone, slate and terracotta roofs under a clear high blue. Dandelions and windwheel asters in the meadows, and cecilia flowers on Starsnatch Cliff. Its display transform and its light are solved against references at noon and at dusk, each in its pass.
- **The Mondstadt building kit's dressing** (window boxes, shutters, lanterns, banners) is not built yet, on [Mondstadt buildings](../../specs/genshin/mondstadt-buildings/design.md).

  Windmills are their own kit, a stone tower with sails that turn in the wind field. The city wall, the gate bridge and the cathedral are landmark-tier pieces built from the kit's parts and matched pose by pose.

- **Species.** Broad oaks, with Windrise's great oak as a landmark, apple trees, pines on the slopes, grape rows at Dawn Winery, and dense old forest in Wolvendom and Whispering Woods.
- **Windrise stays in Galesong Hill.** The game's own area table files Windrise under Galesong Hill, and the catalogue does too, so its oak and statue stay that area's landmarks; Mondstadt City's buildings are Starfell Valley's.
- **Dragonspine is a snow biome with ruins.** It has snow ground, ice, frozen falls, snow and snowstorm weather, and the Entombed City's ruins. Skyfrost Nail is a landmark-tier spike mesh, and Starglow Cavern and Wyrmrest Valley are surface caves and hollows.

## Areas

The catalogue holds Mondstadt's areas as the game names them: Starfell Valley, Galesong Hill, Windwail Highland, Brightcrown Mountains, Windrest Peak and Dragonspine. Subareas include Mondstadt City, Cider Lake, Starfell Lake, Windrise, Springvale, Dawn Winery, Whispering Woods, Wolvendom, Stormterror's Lair, Thousand Winds Temple, Starsnatch Cliff, Cape Oath, Falcon Coast, Dadaupa Gorge, Brightcrown Canyon, Stormbearer Mountains, Stormbearer Point, Musk Reef, Millhaven, Dornman Port, and Dragonspine's Skyfrost Nail, Entombed City, Starglow Cavern, Wyrmrest Valley and Snow-Covered Path.

## Still to build

1. **The windmill and wall generators**, in `packages/genshin-world/src/services/mondstadt/`, each fitted against its exports when the passes reach its shape.

## Build order

1. **Starfell Valley** beside Galesong Hill's Windrise, growing out of the rendering-style scene: Starfell Lake, Whispering Woods and the road to the city.
2. **Mondstadt City** on its island: the gate bridge, the walls, the cathedral, the plaza of the Anemo Archon's statue and the windmills. It is matched landmark by landmark.
3. **Windwail Highland and Springvale**, then **Dawn Winery** and **Galesong Hill**.
4. **Stormterror's Lair** and **Brightcrown Mountains**.
5. **Dragonspine**, once snow weather exists.
6. The remaining areas in the catalogue's order.

## Reference checklist

References are found for each of these first, published recordings searched before the game is recorded: Windrise's oak and statue, the city gate bridge, the cathedral front, the Anemo Archon statue plaza, a windmill, a Springvale house, Dawn Winery's manor, Stormterror's Lair from the approach, Thousand Winds Temple, Starsnatch Cliff, and Skyfrost Nail from the Entombed City.

## Key files

| File                                                                           | Role after the change                                                            |
| :----------------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/mondstadt/createMondstadtWindUniforms.ts` | The meadows' wind uniforms, Mondstadt's breeze with its gusts                    |
| `packages/genshin-world/src/services/mondstadt/computeWindGust.ts`             | The gust at a point on the CPU, as the engine's wind node computes it on the GPU |
| `packages/genshin-engine/src/noise/createSimplexNoise.ts`                      | The detail noise Mondstadt's meadow and hill biomes tune                         |

New files:

```text
packages/genshin-world/src/services/mondstadt/   ← windmill and wall generators
```

## Sources

- [Mondstadt](https://genshin-impact.fandom.com/wiki/Mondstadt), [Windrise](https://genshin-impact.fandom.com/wiki/Windrise) and [Dragonspine](https://genshin-impact.fandom.com/wiki/Dragonspine), Genshin Impact Wiki: the nation and its areas, Windrise's oak sheltering a Statue of The Seven, and Dragonspine's snow.
- [The setting of Genshin Impact](https://en.wikipedia.org/wiki/Teyvat), Wikipedia: the German and Swiss cultural designs behind Mondstadt, and Dragonspine's inspiration in the Matterhorn.
- [Weather](https://genshin-impact.fandom.com/wiki/Weather), Genshin Impact Wiki: snow and snowstorms on Dragonspine, and no rain in the city.
