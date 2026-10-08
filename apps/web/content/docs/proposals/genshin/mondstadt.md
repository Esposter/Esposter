---
title: Mondstadt
description: Proposal — Mondstadt, the Anemo nation of wind and freedom, recreated first among the regions. Rolling meadows under a strong wind, a lake city of timber-framed houses and windmills, the vineyards of Dawn Winery, the ruined tower of Stormterror's Lair, and the snow and ruins of Dragonspine. A building kit of stone ground floors, framed upper storeys and steep roofs builds its towns.
model: claude-opus-5-5
---

# Mondstadt

This region is built on [terrain](/docs/genshin/terrain) and its [shapes](/docs/proposals/genshin/terrain-shapes), [vegetation](/docs/genshin/vegetation) and its [trees and scatter](/docs/proposals/genshin/trees-and-scatter), [water](/docs/genshin/water) and its [flow](/docs/proposals/genshin/flowing-water), [sky and time](/docs/genshin/sky-and-time) and [weather](/docs/proposals/genshin/weather), re-derived by the [scene derivation](/docs/genshin/scene-derivation)'s method, each scene in its [recreation passes](/docs/proposals/genshin/recreation-passes). Mondstadt is where the game begins: the nation of the Anemo Archon, its culture drawn from Germany and Switzerland. It is a land of open grass that the wind keeps moving, low wooded hills, a great lake with the city on an island in it, and sea cliffs to the west. To the south rises Dragonspine, a snowbound mountain around a colossal spike driven into it from the sky. It is the first region because the [rendering style](/docs/genshin/rendering-style)'s Windrise scene already stands in it.

## Decisions

- **The strongest wind in the world.** Mondstadt's base wind is the highest of any region, and gusts visibly roll across the meadows. This is the [vegetation](/docs/genshin/vegetation)'s wind field at its most visible, and Stormterror's Lair raises it to a gale.
- **A bright, cool palette.** Saturated spring greens, white limestone, slate and terracotta roofs under a clear high blue. Dandelions and windwheel asters in the meadows, and cecilia flowers on Starsnatch Cliff. Its display transform and its light are solved against references at noon and at dusk, each in its pass.
- **The Mondstadt building kit** is built as [Mondstadt buildings](/docs/genshin/mondstadt-buildings). Its dressing is not: window boxes, shutters, lanterns, banners.

  Windmills are their own kit, a stone tower with sails that turn in the wind field. The city wall, the gate bridge and the cathedral are landmark-tier pieces built from the kit's parts and matched pose by pose.

- **Species.** Broad oaks, with Windrise's great oak as a landmark, apple trees, pines on the slopes, grape rows at Dawn Winery, and dense old forest in Wolvendom and Whispering Woods.
- **Dragonspine is a snow biome with ruins.** It has snow ground, ice, frozen falls, snow and snowstorm weather, and the Entombed City's ruins. Skyfrost Nail is a landmark-tier spike mesh, and Starglow Cavern and Wyrmrest Valley are surface caves and hollows.

## Areas

The catalogue holds Mondstadt's areas as the game names them: Starfell Valley, Galesong Hill, Windwail Highland, Brightcrown Mountains, Windrest Peak and Dragonspine. Subareas include Mondstadt City, Cider Lake, Starfell Lake, Windrise, Springvale, Dawn Winery, Whispering Woods, Wolvendom, Stormterror's Lair, Thousand Winds Temple, Starsnatch Cliff, Cape Oath, Falcon Coast, Dadaupa Gorge, Brightcrown Canyon, Stormbearer Mountains, Stormbearer Point, Musk Reef, Millhaven, Dornman Port, and Dragonspine's Skyfrost Nail, Entombed City, Starglow Cavern, Wyrmrest Valley and Snow-Covered Path.

## Build order

1. **Starfell Valley** around Windrise, which grows out of the rendering-style scene: Starfell Lake, Whispering Woods and the road to the city.
2. **Mondstadt City** on its island: the gate bridge, the walls, the cathedral, the plaza of the Anemo Archon's statue and the windmills. It is matched landmark by landmark.
3. **Windwail Highland and Springvale**, then **Dawn Winery** and **Galesong Hill**.
4. **Stormterror's Lair** and **Brightcrown Mountains**.
5. **Dragonspine**, once snow weather exists.
6. The remaining areas in the catalogue's order.

## Reference checklist

References are found for each of these first, published recordings searched before the game is recorded: Windrise's oak and statue, the city gate bridge, the cathedral front, the Anemo Archon statue plaza, a windmill, a Springvale house, Dawn Winery's manor, Stormterror's Lair from the approach, Thousand Winds Temple, Starsnatch Cliff, and Skyfrost Nail from the Entombed City.

## Key files

| File                                                      | Role after the change                                    |
| :-------------------------------------------------------- | :------------------------------------------------------- |
| `packages/genshin-engine/src/noise/createSimplexNoise.ts` | The detail noise Mondstadt's meadow and hill biomes tune |

New files:

```text
packages/genshin-world/src/data/regions/mondstadt.json
packages/genshin-engine/src/kits/mondstadt/   ← windmill and wall generators (the building kit is built)
```

## Sources

- [Mondstadt](https://genshin-impact.fandom.com/wiki/Mondstadt), [Windrise](https://genshin-impact.fandom.com/wiki/Windrise) and [Dragonspine](https://genshin-impact.fandom.com/wiki/Dragonspine), Genshin Impact Wiki: the nation and its areas, Windrise's oak sheltering a Statue of The Seven, and Dragonspine's snow.
- [The setting of Genshin Impact](https://en.wikipedia.org/wiki/Teyvat), Wikipedia: the German and Swiss cultural designs behind Mondstadt, and Dragonspine's inspiration in the Matterhorn.
- [Weather](https://genshin-impact.fandom.com/wiki/Weather), Genshin Impact Wiki: snow and snowstorms on Dragonspine, and no rain in the city.
