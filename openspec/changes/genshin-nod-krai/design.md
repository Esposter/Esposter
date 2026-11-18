# Nod-Krai

This region is built on [terrain](../../specs/genshin/terrain/design.md) and its [shapes](../../specs/genshin/terrain-shape-height/design.md), [vegetation](../../specs/genshin/vegetation/design.md) and its [trees and scatter](../genshin-trees-and-scatter/design.md), [water](../../specs/genshin/water/design.md) and its [flow](../genshin-flowing-water/design.md), [sky and time](../../specs/genshin/sky-and-time/design.md) and [weather](../genshin-weather/design.md), re-derived by the [scene derivation](../../specs/genshin/scene-derivation/design.md)'s method, each scene in its [recreation passes](../genshin-recreation-passes/design.md). Nod-Krai is an autonomous region at the southern edge of Snezhnaya, an archipelago formed from the material left over when the Three Moons were made. Its culture is fictional, drawn from the Baltic with dieselpunk machinery. People from every nation gather there, the Fatui run a stronghold there, and its indigenous Frostmoon Scions worship a moon goddess. It is the newest of the nations' neighbours in the game, and the least documented, so its page commits to the mechanism and leaves its look to the game's own exports.

## Decisions

- **An archipelago of distinct isles.** Lempo Isle, Hiisi Island and Paha Isle are separate islands with their own outlines in the [world map](../../specs/genshin/world-map/design.md), joined by the Moontide Sea. The sea between them is part of the region, as it is for Inazuma.
- **Two kits: the dieselpunk and the Scions'.** The first builds the ports, towns and Fatui works: riveted iron, pipework, cranes, smokestacks and timber sheds. The second builds the Frostmoon Scions' enclaves and stone circles. Both are fitted against their own exports, since no earlier region's kit carries over.
- **Statues of the New Moon.** Nod-Krai's statues stand where other regions have Statues of The Seven. They are a landmark kind of their own (`StatueOfTheNewMoon`, its arrival required) and act as waypoints in [exploring](../../specs/genshin/exploring/design.md). Their places are the official map's labels of Nod-Krai's map area (area 13) under the Statue of The Seven label, seven in all. Each pairs with a transport point of scene 3's file within the fit's bar, the same pairing the Teleport Waypoints use (`toPairedLandmarks`), and takes that point's arrival, so the seven sit in `packages/genshin-world/src/data/regions/nod-krai.json` from `pnpm -C scripts genshin:assets waypoints`. Their points are gadgets 70130009 to 70130011 (`TransPointFirst`, named `NKGoddess`), in areas 70 to 76. Their first unlock is keyed by the point their id ends in, as a waypoint's is. They are not drawn yet: the world draws a landmark by its kind's kit, and no kit draws this kind, so each stands in the world with no model until one is built.

## How it works

```mermaid
flowchart TD
  EXP[Nod-Krai's exports] --> PK[Kit parameters fitted against them]
  PK --> KI{Which kit?}
  KI -->|dieselpunk| DP[Riveted iron, pipework, cranes, smokestacks]
  KI -->|Frostmoon Scions| FS[Enclaves and stone circles]
  CLK[Clock at night] --> MO{In Nod-Krai?}
  MO -->|yes| BIG[Regional moon override: larger, brighter]
  MO -->|no| STD[The sky's standard moon]
```

## Areas

The catalogue holds Nod-Krai's areas as the game names them: Lempo Isle, Hiisi Island, Paha Isle, the Moontide Sea, the Lunar Highlands, Wavechaser Plain, Ashveil Peak, Dunanna Pit, Voidsea Outlook and the Dark Side of the Moon. Subareas include Nasha Town, the Frostmoon Enclave, Blue Amber Lake, Silvermoon Hall, Golden Hall, Favonius Keep, Cliffwatch Camp, the Nuur Stone Circle, the Pillar of Embla, Piramida, Traveler's Crater and Starsand Shoal.

## Reference checklist

Nasha Town's port and main street, a Statue of the New Moon, the Frostmoon Enclave, Blue Amber Lake, a Fatui works, the moon at night from each isle, and the sea between the isles.

## Key files

| File                                                                    | Role after the change                                            |
| :---------------------------------------------------------------------- | :--------------------------------------------------------------- |
| `packages/genshin-engine/src/noise/createSimplexNoise.ts`               | The detail noise each isle's ground tunes                        |
| `packages/genshin-world/src/models/world/StatueOfTheNewMoonLandmark.ts` | The Statue of the New Moon landmark, its arrival required        |
| `scripts/src/services/genshinAssets/fit/toPairedLandmarks.ts`           | Pairs a map label's ground points with transport points, by kind |
| `scripts/src/services/genshinAssets/fit/fitRegionWaypoints.ts`          | Writes each region's waypoints and Statues of the New Moon       |
| `scripts/src/services/genshinAssets/shared/constants.ts`                | `NEW_MOON_STATUE_REGIONS`, the regions whose statues are written |

**Still to build, in order:**

1. **The kits' fitted values**, as the passes after the inventory read them. Waits on the queue items in `openspec/specs/genshin/compute/nod-krai/design.md`.

## Sources

- [Nod-Krai](https://genshin-impact.fandom.com/wiki/Nod-Krai), Genshin Impact Wiki: an autonomous region at Snezhnaya's southern tip, an archipelago from the Three Moons' remnant material, the Frostmoon Scions, the Fatui stronghold, the Statues of the New Moon, and its areas and subareas.
- [The setting of Genshin Impact](https://en.wikipedia.org/wiki/Teyvat), Wikipedia: Nod-Krai's fictional culture drawn from the Baltic Sea area with dieselpunk elements.
