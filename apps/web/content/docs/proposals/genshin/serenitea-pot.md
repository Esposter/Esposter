---
title: Serenitea Pot
description: Proposal — the Serenitea Pot's realm: a gadget that opens a realm of its own scene from the game's layouts, a placement editor that furnishes it within each area's load, the Realm Depot, gardens and ponds, the Adeptal Mirror, and characters who live there as companions. Tubby's furnishings, Trust Rank, Adeptal Energy and the realm's stores are built.
model: claude-opus-5-5
touches: ["packages/genshin-world/src/models/home/**", "packages/genshin-world/src/services/home/**"]
---

# Serenitea Pot

The Serenitea Pot is a realm the player owns and furnishes: an island, a mansion and its grounds, decorated with furnishings and lived in by the player's characters. Its spirit, Tubby, makes furnishings, keeps the Trust Rank and sells from the Realm Depot. It is a world of its own beside the open world, entered through a gadget ([gadgets](/docs/proposals/genshin/gadgets)), and its companions earn [companionship](/docs/proposals/genshin/companionship).

## Today

Tubby's making, the Trust Rank, Adeptal Energy and the realm's Realm Currency and Realm Bounty stores are built, as the [Serenitea Pot](/docs/genshin/serenitea-pot) page describes. The world still holds no realm: nothing is placed, entered or seen. What follows is what remains.

## Decisions

- **A realm is a scene of its own.** Each realm layout, the Floating Abode, Emerald Peak, Cool Isle, Silken Courtyard and the rest, is the game's own scene, laid out from its data and derived as a region is ([scene derivation](/docs/genshin/scene-derivation)), its mansion one of the game's own. Placing the Serenitea Pot gadget on a valid surface and interacting with it fades into the realm; the gadget or any teleport in the open world fades back out to where the player went in.
- **The editor places furnishings.** In the realm, the furnishing placement mode places, moves, turns and stacks furnishings on the ground, on each other and in the mansion's rooms, by the pointer and the keys. Each area has a load, every furnishing, animal and companion counting its own, and the editor refuses a placement past it, showing green, orange and red as the game does. A layout's placements are kept with the player's progress.
- **Furnishings are drawn by their kits.** Each furnishing is drawn by its own generated kit at the measures of its export, as every building is ([derived assets](/docs/genshin/derived-assets)). Its comfort comes from `HomeWorldFurnitureExcelConfigData`, which the editor reads once it places anything.
- **Companions live there.** From its quest on, characters other than the Traveler are invited to live in the realm, up to eight at the highest Trust Rank. They earn Companionship EXP as Realm Bounty, and a character invited to a gift set they favour speaks its dialogue and gives its one-time rewards.
- **The Realm Depot and the Adeptal Mirror.** Tubby's depot sells blueprints, furnishings and materials for Realm Currency from the game's shop rows, and the Adeptal Mirror's missions reward blueprints as the handbook rewards its chapters.
- **Gardens and ponds.** A garden's fields grow seeds over real time and a pond holds fish, by `HomeWorldFarmFieldExcelConfigData`, `HomeWorldPlantExcelConfigData` and `HomeWorldRaiseFishExcelConfigData`.
- **Opened at Adventure Rank 28** with its quests.
- **A companion is invited within the Trust Rank's count.** Any character the player owns but the Traveler may live in the realm, one character once, as many as the Trust Rank's `npcCount` in the built `levels.json` allows, one companion at Trust Rank 1 rising to eight at Trust Rank 10. Inviting takes no furnishing; the gift sets are the furnishing sets' and wait on the placement editor.
- **The Realm Depot is the shop table's.** Its goods are shops 213 and 214 of `ShopGoodsExcelConfigData` (goods ids 213xxx and 214xxx, filed under `shopType` 1048 in the goods rows), split by `subTabId` as the wiki's Realm Depot page lists them: 1 the weekly Realm Treasures (eight goods), 2 the daily Furnishings, 3 the Furnishing Blueprints, 4 Riches of the Realm, 5 the weekly Creatures of the Realm and 6 the weekly Wood. Every good is priced in Realm Currency, item 204, so the depot waits on Realm Currency joining the wallet, whose save holds every currency as a key of its record.
- **A furnishing's load is its `cost`.** `HomeWorldFurnitureExcelConfigData` gives each furnishing its `comfort` and its `cost`, the load it counts against its area. The area's own limit is still in no table read, so the editor's refusal waits on it.

## How it works

```mermaid
flowchart TD
  GADGET["The pot placed, interacted with"] --> REALM["The realm's scene"]
  REALM --> EDIT["Placement mode"]
  EDIT --> LOAD{"Within the area's load?"}
  LOAD -->|"no"| REFUSE["Refused, the load shown red"]
  LOAD -->|"yes"| PLACED["Placed, kept"]
  PLACED --> COMFORT["Comfort: the Adeptal Energy rank"]
  COMFORT --> ACCRUE["Realm Currency and Realm Bounty accrue"]
```

## Scope and order

**Built:** Tubby's making, the Trust Rank, Adeptal Energy and the realm's stores, as the [Serenitea Pot](/docs/genshin/serenitea-pot) page describes.

**Still to build, in order:**

1. **Companions invited.** `models/home/HomeProgress.ts` gains `companionIds`, the characters living in the realm. A new `services/home/inviteHomeCompanion.ts` adds one, refusing the Traveler (`TRAVELER_CHARACTER_ID`), a character the player does not own, one already living there, and one past the `npcCount` of the Trust Rank `computeHomeTrustRank` reads from the progress's Trust EXP; `services/home/dismissHomeCompanion.ts` takes one out. Test: `inviteHomeCompanion.test.ts` (a rank-one realm takes one companion and refuses a second, the Traveler is refused, and a character already living there is refused).
2. **The Realm Depot.** Realm Currency joins the wallet as a currency, item 204 in `CurrencyItemIdMap` and `ShopItemCurrencyMap`, its name a `GameTextKey` written by `genshin:text`, and the save's currencies record with it; then the depot's tabs are written from the goods rows the Decisions name through the shops' `writeShopGoodSlice`, and bought through `buyShopGood` at each tab's refresh.
3. **The gadget and one realm layout**, entered and left, once the first layout's scene (world scene 2001 of `HomeworldModuleExcelConfigData`) is extracted as a region's is.
4. **The placement editor and its load.** Waits on the load each area holds, which the realm tables read so far do not carry.
5. **Gift sets**, once the editor places the furnishing sets they are.
6. **Gardens, ponds, the other layouts and the Adeptal Mirror.**

## Data and measures

- **Read from the game's data, not yet read:** the layouts' own scene data, the furnishings' comfort and types from `HomeWorldFurnitureExcelConfigData`, and the farm, plant and fish-raising tables.
- **Not located:** the load each area holds. It is the one number the editor's refusal needs, and no table read so far names it. Until a source names it, the editor waits, and its recording is owed on the roadmap.
- **Measured:** each furnishing's shape against its export, as every building's is, and the editor's movement and snapping off a recording of placement mode, provisional until then.

## What this does not propose

- **Visiting another player's realm.** It needs other players, which [co-op](/docs/genshin/deferred/co-op) defers.

## Key files

| File                                                            | Role after the change                                    |
| :-------------------------------------------------------------- | :------------------------------------------------------- |
| `packages/genshin-world/src/components/World/Session/Index.vue` | Enters a realm's scene and returns to the world          |
| `packages/genshin-world/src/models/world/BuildingKit.ts`        | The kits a furnishing is drawn by                        |
| `packages/genshin-world/src/models/inventory/Currency.ts`       | Gains Realm Currency, once its game text name has a key  |
| `packages/genshin-world/src/models/inventory/Inventory.ts`      | Furnishings and blueprints, in the bag's Furnishings tab |

## Sources

- [Serenitea Pot](https://genshin-impact.fandom.com/wiki/Serenitea_Pot), Genshin Impact Wiki: the unlock at rank 28, the gadget and entering and leaving, the realm layouts, furnishings and their sources, the furnishing sets and gift sets, the companions, the load's traffic light, the Adeptal Mirror and the Trust Rank's bonuses.
- [Companionship EXP](https://genshin-impact.fandom.com/wiki/Companionship_EXP), Genshin Impact Wiki: Realm Bounty's rate by Adeptal Energy and its store by Trust Rank.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the realm, furniture, comfort, farm, plant, fish-raising and furniture-making tables.
