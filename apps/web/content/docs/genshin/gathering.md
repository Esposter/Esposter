---
title: Gathering
description: The plants and specialties the official map marks, placed by the fit into each region as gathering points, picked with F and kept gone until their respawn. A local specialty comes back 46 hours after it is picked, and a cooking ingredient at the game's midnight that follows, as the wiki gives each. The gather table's refresh ids name no policy in the dump, so the category settles it.
---

# Gathering

The plants and specialties of the open world are the gathering points the [proposal](/docs/proposals/genshin/gathering) describes: a point stands where the official map marks its item, and F picks it into the bag. This page is the first build of that proposal, covering the points of the two categories that are picked, Local Specialties and Inventory / Materials. The ores are published beside them: the same builder places each ore the map marks under Ores, and the world keeps those points out of the pick ups, since an ore is struck until it breaks. The ores are struck by the character's hits until they break, as the ores' rules below give. Mining outcrops and investigation spots wait in the proposal.

## How it works

```mermaid
flowchart TD
  G["The game's gather table: ground rows that save a pick"] --> I["Items, each with its English name"]
  M["The official map's label tree"] --> L["Labels named as the item, under Local Specialties or Inventory / Materials"]
  I --> L
  L --> C{"Which category?"}
  C -->|"Local Specialties"| S["Specialty: back 46 hours after the pick"]
  C -->|"Inventory / Materials"| D["Daily: back at the game's midnight after the pick"]
  P["The official map's points, fitted to the scene"] --> PL["Each point of a labelled item, placed by its region"]
  L --> PL
  PL --> SLICE["One record per region, and the items record beside them"]
  SLICE -->|"on demand, as the world opens"| W["Standing points: nearest rows in reach"]
  W -->|"F picks it, bag takes it"| PK["Picked at the instant of the pick"]
  PK -->|"respawn has come"| W
```

## Reading the tables

The slices and the items are published by `pnpm -C scripts genshin:assets gathering` to the gathering dataset of the [hosted game data](/docs/genshin/hosted-game-data). It reads three tables from the game text dump, the gather table and the material table in `ExcelBinOutput/` and the English text map, and the official map's label tree and fitted points from the references folder. The gather table, which the dump lacked, is fetched from the community's AnimeGameData repository into the dump and never committed.

- **A row is picked off the ground.** A gather row counts when it sits on the ground and saves its pick. The rows that save nothing belong to other pages, such as fishing, animals and events, and are not points here.
- **An item is named as its label.** The item's English name is matched to the label of the same name the official map files under Local Specialties, Inventory / Materials or Ores. A Magical Crystal Chunk is left out, since a mining outcrop draws it, and so are a Scarlet Quartz, a Rainbowdrop Crystal and an Electro Crystal (shattered from a Tourmaline by Pyro), which have no poise requirement on the wiki's Mineral page. Special Items, which holds the Oculi, is left to the statues' page.
- **Each point is the fit's.** Every point of a labelled item is carried into the game's coordinates by the [spawned places](/docs/genshin/spawned-places) fit and then into its region's axes, its kind the item's id, and its region from its map area. Points on layers under the ground are left out, as the places' builder already does.

## The respawn

The gather table's refresh ids do not name a policy in the dump. The ground rows that carry a refresh name ids the policy table lacks, and the rest carry none, so the policy cannot be read off the row. The category settles it instead, as the wiki gives each:

- **A local specialty comes back 46 hours after it is picked**, the wiki's own figure for specialties.
- **A cooking ingredient comes back at the game's midnight that follows the pick.** The wiki says the common overworld ingredients spawn at 0:00 server time each day, and a picked point is read as back at the next such midnight. The game's time zone is UTC+8, as the [Original Resin](/docs/genshin/original-resin) page reads it.

An ore's respawn is its own, from the wiki's Reset page: an Iron Chunk at the game's midnight, a White Iron Chunk or Starsilver two days after the break, and a Crystal Chunk, Amethyst Lump or Condessence Crystal three days after. Those labels are keyed by the map's label id, since a plant's category does not settle them.

A point is kept as picked with the instant of the pick, and stands again once its respawn has come. Nothing runs while the page is closed: each look at the clock compares the instant with its respawn, and the page's clock looks once a minute while it is open.

## The ores' rules

An ore is struck until it breaks. The character's landed hits feed it from the strike loop, beside the enemies: each hit reaches the ores in its area as an enemy's capsule is reached, at the ore's ground point. A hit is melee when it is a normal or charged attack of a character wielding a sword, a claymore or a polearm, read off the character table, so no kit carries a flag. Each hit adds its poise damage over the ore's requirement for its kind, blunt or melee, so the ore breaks once its shares reach one, and a hit that is neither blunt nor melee adds nothing. The hits are read before an infusion copies them, so an infusion's converted poise does not reach an ore. A broken ore drops its certain piece where it lay, and one more for each of two draws that comes under 10%. It comes back two days after it breaks for a White Iron Chunk or Starsilver, and three days after for a Crystal Chunk away from a mining outcrop, as the wiki's Reset page gives them. The respawn reads the same as the plants', from the instant of the break.

## The pick

F on a gathering point's row picks one of its item into the bag, through the same `addInventoryItem` a drop uses. The point is kept as picked only when the bag takes the item, so a full bag leaves it standing. The picked points are kept for the page's life only, as the drops are. An ore's point is never offered here: it is struck, not picked.

## Key files

| File                                                                             | Role                                                             |
| :------------------------------------------------------------------------------- | :--------------------------------------------------------------- |
| `scripts/src/services/genshinAssets/gathering/readGatheringItems.ts`             | The items the gather table picks, matched to their map labels    |
| `scripts/src/services/genshinAssets/gathering/buildGatheringPlaces.ts`           | Each region's points built as a slice, and the items table       |
| `scripts/src/services/genshinAssets/gathering/constants.ts`                      | The categories and their respawns                                |
| `packages/genshin-world/src/services/gathering/computeGatheringRespawn.ts`       | The instant a picked point is back                               |
| `packages/genshin-world/src/services/gathering/OreItemIdBreakPoiseMap.ts`        | Each ore's poise to break from blunt and from melee hits         |
| `packages/genshin-world/src/services/gathering/strikeOre.ts`                     | An ore's broken share after one hit                              |
| `packages/genshin-world/src/services/gathering/readOreHits.ts`                   | The hits an ore takes from a step's landed hits, melee by weapon |
| `packages/genshin-world/src/services/gathering/rollOreDropCount.ts`              | The pieces an ore drops                                          |
| `packages/genshin-world/src/services/gathering/checkIsGatheringPlaceStanding.ts` | Whether a point stands at an instant                             |
| `packages/genshin-world/src/composables/useGatheringPoints.ts`                   | Mondstadt's points and items, read as the world opens            |
| `packages/genshin-world/src/composables/useWorldPickups.ts`                      | Each ore's broken share, and the pieces a broken ore drops       |
| `packages/genshin-world/src/components/World/Character/Index.vue`                | The character's landed hits, fed to the ores beside the enemies  |
| `packages/genshin-world/src/services/inventory/toItemDefinition.ts`              | An item's definition from its materials row, shared with drops   |
| `packages/genshin-world/src/components/World/Session/Index.vue`                  | Rows for the standing points, and a pick into the bag            |
| `packages/genshin-world/src/generated/gathering/`                                | The per-region slices and the items table                        |

## Notes

- **Four cooking ingredients and one specialty are left out.** Apple, Starshroom, Bulle Fruit and Candlecap Mushroom are typed as a notice-restoring material the world's material type does not name yet, and Rukkhashava Mushrooms has its map label in the singular. Each is one line to add when its type or name lands.
- **The stand-ins are the drops' stand-ins, and they cap at 64.** The world draws each PickUp row as a sphere up to the stand-in capacity, in list order, so most of Mondstadt's roughly two thousand points are not drawn yet. Prompts still come from every standing point in reach. A distance cull of the stand-ins is the open part.
- **The respawns are the wiki's, not measured.** The 46 hours is the wiki's figure, and the midnight is the wiki's reading of the daily spawn. Both wait on a recording of a point picked and watched (see the [roadmap](/docs/genshin/roadmap)).

## Sources

- [Local Specialty](https://genshin-impact.fandom.com/wiki/Local_Specialty), Genshin Impact Wiki: a harvested specialty respawns after 46 hours.
- [Reset](https://genshin-impact.fandom.com/wiki/Reset), Genshin Impact Wiki: the daily reset at 04:00 server time, and the overworld Iron Chunk and common cooking ingredients spawning at 0:00 server time, four hours before it.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: `GatherExcelConfigData` and `MaterialExcelConfigData`, the tables the items and their ground rows are read from.
- [Teyvat Interactive Map](https://act.hoyolab.com/ys/app/interactive-map/index.html), HoYoLAB: the official map's labels and points that the places are fitted from.
