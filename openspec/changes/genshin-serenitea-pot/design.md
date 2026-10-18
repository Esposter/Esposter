# Serenitea Pot

The Serenitea Pot is a realm the player owns and furnishes: an island, a mansion and its grounds, decorated with furnishings and lived in by the player's characters. Its spirit, Tubby, makes furnishings, keeps the Trust Rank and sells from the Realm Depot. It is a world of its own beside the open world, entered through a gadget ([gadgets](../genshin-gadgets/design.md)), and its companions earn [companionship](../genshin-companionship/design.md).

## Today

Tubby's making, the Trust Rank, Adeptal Energy and the realm's Realm Currency and Realm Bounty stores are built, as the [Serenitea Pot](../../specs/genshin/serenitea-pot/design.md) page describes. The world still holds no realm: nothing is placed, entered or seen. What follows is what remains.

## Decisions

- **A realm is a scene of its own.** Each realm layout, the Floating Abode, Emerald Peak, Cool Isle, Silken Courtyard and the rest, is the game's own scene, laid out from its data and derived as a region is ([scene derivation](../../specs/genshin/scene-derivation/design.md)), its mansion one of the game's own. Placing the Serenitea Pot gadget on a valid surface and interacting with it fades into the realm; the gadget or any teleport in the open world fades back out to where the player went in.
- **The editor places furnishings.** In the realm, the furnishing placement mode places, moves, turns and stacks furnishings on the ground, on each other and in the mansion's rooms, by the pointer and the keys. Each area has a load, every furnishing, animal and companion counting its own, and the editor refuses a placement past it, showing green, orange and red as the game does. A layout's placements are kept with the player's progress.
- **Furnishings are drawn by their kits.** Each furnishing is drawn by its own generated kit at the measures of its export, as every building is ([derived assets](../../specs/genshin/derived-assets/design.md)). Its comfort comes from `HomeWorldFurnitureExcelConfigData`, which the editor reads once it places anything.
- **Companions live there.** From its quest on, characters other than the Traveler are invited to live in the realm, up to eight at the highest Trust Rank. They earn Companionship EXP as Realm Bounty, and a character invited to a gift set they favour speaks its dialogue and gives its one-time rewards.
- **The Realm Depot and the Adeptal Mirror.** Tubby's depot sells blueprints, furnishings and materials for Realm Currency from the game's shop rows, and the Adeptal Mirror's missions reward blueprints as the handbook rewards its chapters.
- **Gardens and ponds.** A garden's fields grow seeds over real time and a pond holds fish, by `HomeWorldFarmFieldExcelConfigData`, `HomeWorldPlantExcelConfigData` and `HomeWorldRaiseFishExcelConfigData`.
- **A seed is a crop once its plant's time has passed.** `HomeWorldPlantExcelConfigData` gives each seed a `time` in seconds, 252000 for 47 of its 50 plants and 600 for the other three, and a `sproutTime` the seed shows before it is ripe. The growth rule reads `time` alone, from the moment the seed is planted: a seed is a crop once `time` seconds have passed since then, and not before. The sprout stage is the sprout gadget's and is not read yet, so the rule's measure is provisional until a recording of a garden shows the ripe moment.
- **Companions earn the whole bounty.** Each companion living in the realm gains the whole Realm Bounty its store holds, not a share of it, as the Companionship EXP claims do for the deployed team. The store fills per real hour at the Adeptal Energy rank's `companionshipExpProduceRate`, provisional until a recording settles the hour, up to the Trust Rank's `homeFetterExpStoreLimit`. A claim pays what the store holds at its moment to each companion and empties the store. The grant is capped at the top Friendship Level as any Companionship EXP is, through `gainCompanionshipExp`, which now takes the characters it is given rather than the party's team.
- **Opened at Adventure Rank 28** with its quests.
- **A companion is invited within the Trust Rank's count.** Any character the player owns but the Traveler may live in the realm, one character once, as many as the Trust Rank's `npcCount` in the built `levels.json` allows, one companion at Trust Rank 1 rising to eight at Trust Rank 10. Inviting takes no furnishing; the gift sets are the furnishing sets' and wait on the placement editor.
- **The Realm Depot is the shop table's.** Its goods are the rows of `ShopGoodsExcelConfigData` filed under `shopType` 1048 (goods ids 213xxx and 214xxx; the shop table's rows 213 and 214 are the realm's two shop types, not the goods' filing), split by `subTabId` as the wiki's Realm Depot page lists them: 1 the weekly Realm Treasures (eight goods), 2 the daily Furnishings, 3 the Furnishing Blueprints, 4 Riches of the Realm, 5 the weekly Creatures of the Realm and 6 the weekly Wood. Every good is priced in Realm Currency, item 204, which the wallet holds once its save carries every currency as a key of its record.
- **The depot publishes as six tab records.** `buildRealmDepotGoods` writes each sub tab as a record of the shops dataset (`realmDepotTreasures`, `realmDepotFurnishings`, `realmDepotBlueprints`, `realmDepotRiches`, `realmDepotCreatures`, `realmDepotWood`), each row the shape Mondstadt's general goods have. The 7.1 dump holds 1173 goods, 8, 264, 794, 27, 47 and 33 across the six, and the dry run builds every one. A good the table leaves no refresh for is none, the table's zero, which the dump omits from the row.
- **The weekly refresh is the Monday at the game's hour.** The depot's weekly goods restock at four in the morning on the Monday, as the game's own Realm Depot text reads (from 4:00 AM every Friday to 4:00 AM on the Monday of the next week). `ShopRefresh.Weekly` counts the week's Monday at that hour the way the monthly refresh counts the first of the month. The as-built shops spec names only the daily and monthly refreshes, so its weekly line is owed when this change archives.
- **A depot good's furnishing goes to the bag.** `buyHomeDepotGood` is `buyShopGood` given the furnishing's own definition, since a furnishing has no row in the material table: a currency goes to the wallet, any other item to the bag as that definition takes it, and the purchase is refused where the bag has no room, so nothing is spent. The depot's purchases are passed in: the realm's progress does not hold them yet, so where a weekly limit's purchases are kept waits on the realm's save.
- **A furnishing's load is its `cost`.** `HomeWorldFurnitureExcelConfigData` gives each furnishing its `comfort` and its `cost`, the load it counts against its area. The area's limit is the `MMLKIBLLOGP` field of `HomeWorldAreaComfortExcelConfigData`, which the dump obfuscates: 16,000 in an exterior area and 6,400 in a room, as the wiki's [Load](https://genshin-impact.fandom.com/wiki/Serenitea_Pot/Load) page gives them. The refusal is an area's furnishings' loads summed against that limit, and a placement that takes the sum past it is refused, the limit itself allowed. The home dataset publishes both as `home/areas` and `home/furnishings`.

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

**Still to build, in order:**

1. **Companions invited.** `models/home/HomeProgress.ts` gains `companionIds`, the characters living in the realm. A new `services/home/inviteHomeCompanion.ts` adds one, refusing the Traveler (`TRAVELER_CHARACTER_ID`), a character the player does not own, one already living there, and one past the `npcCount` of the Trust Rank `computeHomeTrustRank` reads from the progress's Trust EXP; `services/home/dismissHomeCompanion.ts` takes one out. Test: `inviteHomeCompanion.test.ts` (a rank-one realm takes one companion and refuses a second, the Traveler is refused, and a character already living there is refused).
2. **The Realm Depot.** Realm Currency joins the wallet as a currency, item 204 in `CurrencyItemIdMap` and `ShopItemCurrencyMap`, its name a `GameTextKey` written by `genshin:text`, and the save's currencies record with it; then the depot's tabs are written from the goods rows the Decisions name through the shops' `buildShopGoodSlice`, and bought through `buyShopGood` at each tab's refresh.
3. **The gadget and one realm layout**, entered and left, once the first layout's scene (world scene 2001 of `HomeworldModuleExcelConfigData`) is extracted as a region's is.
4. **The placement editor and its load.** The refusal is built (`placeHomeFurnishing`, over the `home/areas` and `home/furnishings` records). Still to build: the editor's surface, the traffic light, the per-area furnishing count and the reduced load of a second copy.
5. **Gift sets**, once the editor places the furnishing sets they are.
6. **Gardens, ponds, the other layouts and the Adeptal Mirror.**

## Data and measures

- **Read from the game's data, not yet read:** the layouts' own scene data, the furnishings' comfort and types from `HomeWorldFurnitureExcelConfigData`, and the fish-raising table's pond rule (its fish kinds are not yet read).
- **Read:** the load each area holds, from `HomeWorldAreaComfortExcelConfigData`, matching the wiki's Load page: an exterior area's traffic light turns orange at `highLoadLimit` (10,000) and red at `lowLoadLimit` (15,000), and its limit is 16,000. Those two lines are read but not yet drawn; a recording of one area's load would confirm them, and is listed as owed.
- **Not located:** how a pond's fish change over real time. `HomeWorldRaiseFishExcelConfigData` names only the fish each pond kind holds, three rows with no count or time, and the wiki's Furnishing Subsystem page gives the ornamental fish no real-time rule. The seed half of the garden is read: the wiki's Gardening page gives two days and twenty-two hours to grow, the table's 252000 seconds.
- **Measured:** each furnishing's shape against its export, as every building's is, and the editor's movement and snapping off a recording of placement mode, provisional until then.

## What this does not propose

- **Visiting another player's realm.** It needs other players, which [co-op](../../deferred/genshin/co-op/design.md) defers.

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

## Reference

- `realm-store-start.png`, `realm-store-hour.png` — two stills, not a clip, of one realm's Realm Currency and Realm Bounty stores an hour of real time apart, with its Adeptal Energy rank and Trust Rank shown beside them; they read whether a store fills per real hour at the table's rate ([Serenitea Pot](../../specs/genshin/serenitea-pot/design.md)). `realm-store-start.png` searched 2026-10-11 on the wiki and YouTube, none found; `realm-store-hour.png` searched 2026-10-11 on the wiki and YouTube, none found.
- `trust-queues.mkv` — Tubby's making at two Trust Ranks, the rank read off the Trust screen, a furnishing started in each queue, 30 seconds at most; it shows whether each rank holds one queue more than the rank below it ([Serenitea Pot](../../specs/genshin/serenitea-pot/design.md)). On the wiki and YouTube, none found (searched 2026-10-11).
- `realm-load.png` — one realm area's load traffic light at a few placements, with its load figure visible; it confirms the limits read from the game's area table and the traffic light's two thresholds ([Serenitea Pot](design.md)). On the wiki and YouTube, none found (searched 2026-10-11).
