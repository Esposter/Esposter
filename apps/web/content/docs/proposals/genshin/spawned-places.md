---
title: Spawned places
description: Proposal — where the game's servers' chests, Oculi, puzzle mechanisms, gathering points, camps and ley line places stand, each written into region data at its fitted place from the official map, stood on the ground beneath it, and checked against the wiki's counts.
model: claude-opus-5-5
---

# Spawned places

The servers' spawned places are not in the client's data, so the world holds none of them yet. The official map's public points stand in for them. Its points are read and fitted onto the scene's transport points as the [as-built page](/docs/genshin/spawned-places) describes, one similarity over the whole map with its residual reported, Mondstadt checked first. What is left is writing each kind's places into region data, and standing each on the ground that holds it. Nearly every system after this one stands on such a place, so this proposal comes before them.

## Decisions

- **The fit needs no waypoint landmark.** The map's statues and waypoints are fitted against the scene's transport points, which the dump holds for every waypoint, so the fit does not wait on [exploring](/docs/proposals/genshin/exploring) placing the waypoints into region data. The fit's own calls are on the [as-built page](/docs/genshin/spawned-places).
- **Only fitted places ship.** The map's data stays a reference; what enters the repository is each place's kind and its fitted position and facing in the region's data, as every landmark's is.
- **Stood on what is beneath.** A map point has no height, so a fitted place stands on the ground under it, or on the top of a landmark whose collision holds it. An underground layer's points stand on that layer's own floor. A place whose height the ground cannot give is reported, never guessed.
- **Each kind is checked against the wiki's count.** The map's points are contributed by its users, so each kind's count in a region is held to the wiki's, and a shortfall or a surplus is reported per kind. The Oculi are checked already; the other kinds take their wiki counts as their pages land.

## How it works

```mermaid
flowchart TD
  FIT["The fitted map: the similarity and each region's matched points"] --> PLACE["Each kind's point carried into the world"]
  PLACE --> HEIGHT["Stood on the ground, a landmark or its layer's floor"]
  HEIGHT --> COUNT{"Each kind's count against the wiki's"}
  COUNT --> DATA["The region's data, by kind"]
```

## Scope and order

**Today:** the map's points are read and fitted, and region data holds what the client's data places, with the enemy camps written into it.

**This adds, as each consuming page lands:**

1. **Oculi**, for [statues of The Seven](/docs/proposals/genshin/statues-of-the-seven), at each fitted place.
2. **Chests**, for [chests](/docs/proposals/genshin/chests), at each fitted place, locked, dug or sealed.
3. **Gathering points, and the camps** the map marks, for [gathering](/docs/proposals/genshin/gathering) and [enemies](/docs/genshin/enemies).

## Data and measures

- **Measured:** each kind's count in each region against the wiki's, and each kind's height against the ground the place stands on.

## Key files

| File                                                          | Role after the change                   |
| :------------------------------------------------------------ | :-------------------------------------- |
| `packages/genshin-world/src/models/world/RegionData.ts`       | Gains the spawned places by kind        |
| `packages/genshin-world/src/models/world/LandmarkKind.ts`     | Gains each spawned kind the world draws |
| `packages/genshin-world/src/services/world/getWorldHeight.ts` | The ground a fitted place stands on     |

## Sources

- [Teyvat Interactive Map](https://act.hoyolab.com/ys/app/interactive-map/index.html), HoYoLAB: the official map, whose points the fit reads, and the label tree the points are labelled by.
- [Oculus](https://genshin-impact.fandom.com/wiki/Oculus), Genshin Impact Wiki: each region's count of Oculi, one of the counts a fit is held to.
- [Chest](https://genshin-impact.fandom.com/wiki/Chest), Genshin Impact Wiki: the chests and their kinds the map marks.
