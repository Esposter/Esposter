# Chests

The servers' chests are not in the client's data, so the official map's public points stand in for them, as the [spawned places](../spawned-places/design.md) page describes. This page is the first half of the [chests](../../../changes/genshin-chests/design.md) proposal: each chest the map marks on the ground is carried into the scene by the fit's transform and published into its region's slice, with its kind. Opening one is the second half, below.

## How it works

```mermaid
flowchart TD
  P["The official map's points, read into the references folder"] --> K{"A chest label: a tier, Buried or Sealed?"}
  K -->|"no"| SKIP["Not a chest: left alone"]
  K -->|"yes"| L{"On the ground layer?"}
  L -->|"no"| UG["Left out: the layers under the ground are not placed yet"]
  L -->|"yes"| A{"In a mapped region's area?"}
  A -->|"no"| UM["Left out: no region holds it"]
  A -->|"yes"| T["Fit's transform into the game's axes,<br/>then placeMapPoints into its region's axes"]
  T --> S["One slice per region, published to the chests dataset of the hosted game data"]
```

## The kinds

`ChestKind` names the map's own tier labels, Common to Remarkable, one per chest. Buried and Sealed are places the map marks with no tier: a Buried chest is dug up where it stands and a Sealed one is freed of its seal first. A dug or freed place's contents are not yet settled, since the map gives no tier for it and the buried and sealed points stand well apart from every tiered chest, so none can be read off a neighbour.

## Opening

In the world, each unopened Common, Exquisite or Precious chest of Mondstadt is a row on the ground beneath its point, named by its kind and opened on F. `useWorldChests` offers the rows and opens the chest through `openChest`, which rolls the kind's Primogems and Mora within their ranges into the wallet and keeps the chest as opened, so a second opening pays nothing. The chest's drops are poured out where it stands for the player to pick up. The opened chests are the save's `openedChests` slice, and the account's copy keeps them on a merge. The ranges are the wiki's chest reward table, one range per tier, not banded by Adventure Rank, since the table lists no bands. `ChestKindRewardMap` holds them.

A kind with no entry stays unopened: Luxurious, whose Mora the table leaves unstated, and Remarkable, whose blueprints are not built, and the buried and sealed places, which the map gives no tier. Each roll is uniform within its range, a provisional draw until a recording of openings reads its spread. Opening also pours out what the wiki lists for the tier, as provisional pools: one weapon picked from the one-star weapons Common and Exquisite chests name, and the Character EXP materials by star with their counts (Wanderer's Advice, Adventurer's Experience, Hero's Wit). The artifacts are not rolled yet, since an artifact needs its slot and rarity. The high zone-level areas (Dragonspine, the Stormbearer Mountains, Guyun Stone Forest, Lisha and the Chasm) give more Primogems than the default, which the places cannot yet tell, since they name no area.

## The builder

`pnpm -C scripts genshin:assets chests` reads the points and the fit, and publishes one slice per region to the chests dataset of the [hosted game data](../hosted-game-data/design.md): a list of places laid out as the [spawned places](../spawned-places/design.md) page's Oculi slices are, each in its region's axes. A publish replaces the whole chests dataset, and the notes count each region's chests and what it left out. With `--dry-run` it prints `unchanged, no request made` when the published slices already match, and it needs no credential. It does not read the game's tables, the wiki or the installed game.

- **The ground only.** Underground chests are counted and left out for the reason the [Oculi](../spawned-places/design.md#the-oculi) section gives.
- **Mapped areas only.** A point in an area no region is mapped to has no region to join, so it is counted and left out. The current run leaves none out.
- **Mora chests are not chests of these kinds.** The map's Mora chests are not among the seven, so the builder does not place them.
- **Not landmarks.** A landmark is built by a region kit, and a chest is acted on, so the [spawned places](../spawned-places/design.md#the-oculi) rule keeps it out of `LandmarkKind`.
- **Regions, not catalogue areas.** Each slice is a region, and a place does not yet name its catalogue area, since that needs the region outlines the exploration progress reads. The area each chest counts toward is not set.
- **Region axes.** The fit carries a point into the game's axes, so `placeMapPoints` carries each place round the Windrise origin into its region's axes, x less the origin's x and z the origin's less the place's, as the landmarks and residents are. Every builder of a map point takes the same step through it, so no slice is left in the game's axes.
- **No height is published.** A place stands on the ground at its point, and that height is read where the place is stood on, which the runtime step does when it lands.

## Key files

| File                                                                     | Role                                                                                                             |
| :----------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| `scripts/src/services/genshinAssets/points/placeMapPoints.ts`            | Carries each kind's points into its region's axes, the ground and mapped areas, shared with the other map points |
| `scripts/src/services/genshinAssets/chests/buildChestPlaces.ts`          | Builds each region's slice from the points and the fit                                                           |
| `scripts/src/services/genshinAssets/chests/ChestKindLabelIdMap.ts`       | Each chest kind's label on the official map                                                                      |
| `scripts/src/services/genshinAssets/commands/chestsCommand.ts`           | `genshin:assets chests`                                                                                          |
| `packages/genshin-world/src/models/chest/ChestKind.ts`                   | The five tiers, and the buried and sealed places                                                                 |
| `packages/genshin-world/src/models/chest/ChestPlace.ts`                  | A placed chest: its id, kind and ground position                                                                 |
| `packages/genshin-world/src/services/chest/openChest.ts`                 | Opens a chest once and rolls its Primogems and Mora into the wallet                                              |
| `packages/genshin-world/src/services/chest/computeChestInteractables.ts` | Each unopened rewarded chest, offered as an Open row beneath its point                                           |
| `packages/genshin-world/src/composables/useWorldChests.ts`               | Loads Mondstadt's chests and opens one on F                                                                      |
| `packages/genshin-world/src/services/chest/ChestKindRewardMap.ts`        | Each tier's Primogem and Mora ranges, from the wiki's chest reward table                                         |

## Sources

- [Chest](https://genshin-impact.fandom.com/wiki/Chest), Genshin Impact Wiki: the chest reward table's ranges per tier.
- [Teyvat Interactive Map](https://act.hoyolab.com/ys/app/interactive-map/index.html), HoYoLAB: the official map, whose public label tree and point list the builder reads as references.
- [Common Chest Windrise, Mondstadt](https://www.youtube.com/watch?v=JQEikGg8Nvk), OAT_OA, 30 to 42 seconds: a Common chest in Windrise's area opened from standing in reach, its rewards (Adventure EXP, Anemo Sigil, Enhancement Ore, Traveling Doctor's Medicine Pot and Mora) in the wallet's list. Read at 1080 high and 30 frames a second, with the interaction key shown as Enter rather than F, so its opening's timing is measured to a frame at 30 a second.
