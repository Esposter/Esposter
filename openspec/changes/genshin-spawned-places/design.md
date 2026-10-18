# Spawned places

The servers' spawned places are not in the client's data, so the world holds none of them yet. The official map's public points stand in for them. Its points are read and fitted onto the scene's transport points as the [as-built page](../../specs/genshin/spawned-places/design.md) describes, one similarity over the whole map with its residual reported, Mondstadt checked first. What is left is writing each kind's places into region data, and standing each on the ground that holds it. Nearly every system after this one stands on such a place, so this proposal comes before them.

## Decisions

- **The fit needs no waypoint landmark.** The map's statues and waypoints are fitted against the scene's transport points, which the dump holds for every nation but Snezhnaya, so the fit does not wait on [exploring](../../specs/genshin/exploring/design.md) placing the waypoints into region data. The fit's own calls are on the [as-built page](../../specs/genshin/spawned-places/design.md).
- **Only fitted places ship.** The map's data stays a reference; what enters the repository is each place's kind and its fitted position in the region's slice, as the chests' and the Oculi's are.
- **Stood on what is beneath.** A map point has no height, so a fitted place stands on the ground under it, or on the top of a landmark whose collision holds it. An underground layer's points stand on that layer's own floor. A place whose height the ground cannot give is reported, never guessed.
- **Camps come from the map's enemy marks, clustered.** The map marks each enemy by a family label (its Hilichurl label alone covers every kind of hilichurl), with no level and no camp. Each family label's points are clustered by distance into camps, the clustering radius an estimate marked provisional. A camp's kinds are its points' labels, and its levels are estimated from the region's world-level band, marked provisional. The map gives neither level nor camp membership, so both are estimates, and the wiki's counts check the camps as they check every kind.
- **Each kind is checked against the wiki's count.** The map's points are contributed by its users, so each kind's count in a region is held to the wiki's, and a shortfall or a surplus is reported per kind. The other kinds take their wiki counts as their pages land.

## How it works

```mermaid
flowchart TD
  FIT["The fitted map: the similarity and each region's matched points"] --> PLACE["Each kind's point carried into the world"]
  PLACE --> HEIGHT["Stood on the ground, a landmark or its layer's floor"]
  HEIGHT --> COUNT{"Each kind's count against the wiki's"}
  COUNT --> DATA["The region's data, by kind"]
```

## Scope and order

**Today:** the map's points are read and fitted, the chests are published into their slices by [chests](../../specs/genshin/chests/design.md), the Oculi into theirs by the [spawned places](../../specs/genshin/spawned-places/design.md) page, and region data holds what the client's data places, beside one stand-in enemy camp in Mondstadt, written by hand with the enemies.

**Still to add:**

1. **The camps**, for [enemies](../../specs/genshin/enemies/design.md): each family label's points clustered into camps and written into its region's `enemyCamps`, replacing Mondstadt's stand-in camp, each enemy with its family's kind as `EnemyKindId`, its estimated level and its place, through the same region-axes step `placeMapPoints` takes. The kinds the camps place are then published to the enemies dataset by `genshin:assets enemies`, which reads them from the region data. The gathering points are placed by the [gathering](../../specs/genshin/gathering/design.md) page.

## Data and measures

- **Measured:** each kind's count in each region against the wiki's, and each kind's height against the ground the place stands on.

## Key files

| File                                                               | Role after the change                               |
| :----------------------------------------------------------------- | :-------------------------------------------------- |
| `scripts/src/services/genshinAssets/points/placeMapPoints.ts`      | Carries each kind's points into its region          |
| `scripts/src/services/genshinAssets/oculi/buildOculusPlaces.ts`    | Builds the Oculi slices from the points and the fit |
| `scripts/src/services/genshinAssets/points/buildMapPointSlices.ts` | Builds each kind's places as one record a region    |
| `packages/genshin-world/src/services/world/createWorldHeight.ts`   | The ground a fitted place stands on                 |

## Sources

- [Teyvat Interactive Map](https://act.hoyolab.com/ys/app/interactive-map/index.html), HoYoLAB: the official map, whose points the fit reads, and the label tree the points are labelled by.
- [Oculus](https://genshin-impact.fandom.com/wiki/Oculus), Genshin Impact Wiki: each region's count of Oculi, one of the counts a fit is held to.
- [Chest](https://genshin-impact.fandom.com/wiki/Chest), Genshin Impact Wiki: the chests and their kinds the map marks.
