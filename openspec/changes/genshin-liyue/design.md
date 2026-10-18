# Liyue

This region is built on [terrain](../../specs/genshin/terrain/design.md) and its [shapes](../../specs/genshin/terrain-shape-height/design.md), [vegetation](../../specs/genshin/vegetation/design.md) and its [trees and scatter](../genshin-trees-and-scatter/design.md), [water](../../specs/genshin/water/design.md) and its [flow](../genshin-flowing-water/design.md), [sky and time](../../specs/genshin/sky-and-time/design.md) and [weather](../genshin-weather/design.md), re-derived by the [scene derivation](../../specs/genshin/scene-derivation/design.md)'s method, each scene in its [recreation passes](../genshin-recreation-passes/design.md). Liyue is the nation of the Geo Archon, its culture drawn from traditional China and its fantasy. Its land is vertical. Karst pillars rise from plains and from clouds, stone spears stand in the sea where an archon is said to have pinned a god, and the harbour city is built in tiers up its cliff. Much of what makes Liyue is exactly what a heightfield cannot hold, so this region is where the terrain's rule of meshes on top of the heights is used most.

## Decisions

- **Karst and stone forests are meshes.** Jueyun Karst's pillars, Huaguang Stone Forest, Guyun Stone Forest's spears in the sea, and the sea stacks are generated rock meshes: layered strata, eroded vertical faces, flat tops carrying trees and grass. They are placed as landmarks or scattered by rule within their area's outline, and they rise from a heightfield that keeps only the ground between them.
- **A sea of clouds.** Around Jueyun Karst and the high peaks, a layer of stepped cloud sits below the summits, drawn with the [sky](../../specs/genshin/sky-and-time/design.md)'s cloud material on a flat layer at a set height.
- **A warm, golden palette.** Its hues are the ones the [Liyue building kit](../../specs/genshin/liyue-building-kit/design.md) names. Glaze lilies, silk flowers and qingxin on the peaks are scattered by biome. Dihua Marsh is reed beds and shallow water.
- **The Liyue building kit's dressing** (lanterns, banners, railings) is not built yet, on the [building kit](../../specs/genshin/liyue-building-kit/design.md).

  Liyue Harbor is a set of landmarks on authored stepped streets up the cliff, with its wharves below. Wangshu Inn is a tower on a rock pillar. Qingce Village is terraced paddies of still water around a great tree.

- **The Chasm is a layer.** The surface Chasm is a vast open-pit mine with scaffolding, lifts and ruins in the heightfield and its meshes. The underground mines are their own layer in the [world map](../../specs/genshin/world-map/design.md), dark except for the lamps and the glowing ore.
- **Chenyu Vale is tea and mist.** It has terraced tea slopes, waterfalls, low mist in the valley, and villages in white walls with dark tiles and stepped gables.

## How it works

```mermaid
flowchart TD
  KS[Karst area outline] --> SC[Scatter pillars: height, strata, flat top]
  SC --> TOP[Trees and grass on each top]
```

## Areas

The catalogue holds Liyue's areas as the game names them: Bishui Plain, Minlin, Lisha, Qiongji Estuary, Mt. Laixin, the Sea of Clouds, The Chasm, The Chasm: Underground Mines, and Chenyu Vale's Upper Vale and Southern Mountain. Subareas include Liyue Harbor, Wangshu Inn, Qingce Village, Jueyun Karst, Huaguang Stone Forest, Guyun Stone Forest, Mt. Tianheng, Mt. Hulao, Mt. Aocang, Qingyun Peak, Stone Gate, Dihua Marsh, Luhua Pool, Lingju Pass, Tianqiu Valley, Guili Plains, Yaoguang Shoal, Cuijue Slope, Mingyun Village, Yilong Wharf, Nantianmen, The Chasm's Maw and The Glowing Narrows.

## Still to build

1. **The karst and stone-forest generators**, under `packages/genshin-world/src/services/liyue/`, each fitted to its exports once the passes come to shape, as the [scene derivation](../../specs/genshin/scene-derivation/design.md)'s object passes fit every re-derivation against its own export. Neither can be built yet:
   - **No export holds them.** Liyue's extraction is the harbour's streams. Jueyun Karst's waypoints stand a few hundred metres past the farthest of its placements. Guyun Stone Forest's waypoint stands inside them, but no rock or stone is placed within 400 metres of it: the nearest are the harbour's own "Area_Ly_Stone_LYG_" pieces. An extraction reaching the karst's and the stone forests' streams needs the game's install.
   - **The passes before shape.** The capital's passes run in order: the Inventory (`liyue-every-renderer`) and the base ground (`liyue-region-base`) are done, the Layout waits on the camera `liyue-harbor-location` solves on its landmarks, which waits on a mesh the extraction holds for each, then the Camera ([compute queue](../../specs/genshin/compute/liyue/design.md)).

## Build order

1. **Bishui Plain** from Stone Gate to Wangshu Inn, the way the game enters Liyue.
2. **Liyue Harbor**, matched landmark by landmark.
3. **Minlin with Jueyun Karst**, where the karst meshes and the sea of clouds first appear, then **Qingce Village**.
4. **Lisha and Qiongji Estuary**, including Guyun Stone Forest.
5. **The Chasm**, surface and underground.
6. **Chenyu Vale**, then the rest in the catalogue's order.

## Reference checklist

Stone Gate, Wangshu Inn from the bridge, Liyue Harbor from the sea and from the top of the steps, a harbour street, Jueyun Karst from within the sea of clouds, Qingce Village's terraces, Guyun Stone Forest from the water, the Chasm's rim, and a Chenyu Vale village.

## Key files

| File                                                      | Role after the change                               |
| :-------------------------------------------------------- | :-------------------------------------------------- |
| `packages/genshin-engine/src/noise/createSimplexNoise.ts` | The detail noise and the strata of the karst meshes |

New files:

```text
packages/genshin-world/src/services/liyue/   ← karst and stone-forest generators
```

## Sources

- [Liyue](https://genshin-impact.fandom.com/wiki/Liyue), [The Chasm](https://genshin-impact.fandom.com/wiki/The_Chasm) and [Chenyu Vale](https://genshin-impact.fandom.com/wiki/Chenyu_Vale), Genshin Impact Wiki: Liyue's areas and subareas, the Chasm above ground and below, and Chenyu Vale.
- [The setting of Genshin Impact](https://en.wikipedia.org/wiki/Teyvat), Wikipedia: Liyue drawn from traditional Chinese culture, and Chenyu Vale's Huizhou architecture.
- [Map](https://genshin-impact.fandom.com/wiki/Map), Genshin Impact Wiki: the Chasm's underground mines unlocked as a map of their own, hence a layer.
