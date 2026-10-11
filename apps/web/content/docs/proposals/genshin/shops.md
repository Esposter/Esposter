---
title: Shops
description: Proposal — the game's shops on one rule over its own goods table, its first parts built as Paimon's Bargains' Fates and the Mondstadt grocery's Mora-priced goods. Still to build: Paimon's Bargains' rotation, weapons and materials, every other vendor's goods and restocks, each region's Souvenir Shop taking its Sigils, and nothing that costs Genesis Crystals.
model: claude-opus-5-5
needs: [game-exports]
touches:
  [
    "scripts/src/services/genshinAssets/items/**",
    "packages/genshin-world/src/services/shop/**",
  ]
---

# Shops

The game's shops are its vendors in the cities, the Souvenir Shops that take each region's Sigils, the Fishing Associations, and the shops in the Paimon menu, Paimon's Bargains among them. They turn Mora, Sigils, Starglitter and Stardust into ingredients, recipes, materials, Fates and characters. They spend from the [inventory](/docs/genshin/inventory)'s wallet and stand at the vendors placed in region data.

The rule over Paimon's Bargains' Fates and the Mondstadt grocery's goods is built, as the [shops](/docs/genshin/shops) page sets out. This page keeps what is not.

## Decisions

- **Every shop's goods are the game's.** `ShopGoodsExcelConfigData` holds each good: the shop it belongs to, the item and how many, its price in Mora or in items, its buy limit, its refresh, the Adventure Rank it shows from and the dates it sells between. `ShopExcelConfigData` names the shop, and `ShopRotateExcelConfigData` a rotation's order.
- **Restocked by its refresh.** What was bought is kept with when it was bought, and a good's limit comes back when its refresh comes round, each good by its own row. The table names four refreshes: none (3732 goods), daily (639), weekly (224) and monthly (169). There is no every-two-or-three-days kind in the table, and the wiki's [Shop](https://genshin-impact.fandom.com/wiki/Shop) page names only daily and weekly restocks, so that cycle is not proposed. The daily and monthly refreshes are built; the weekly one waits on its vendors.
- **Paimon's Bargains' rotation.** The wiki gives the schedule: two characters a month from a six-month cycle of twelve, at 34 Starglitter each; a set of five weapons, Royal or Blackcliff, every two months at 24 Starglitter; and a monthly set of top materials and the Crown of Insight. The table holds the characters as rotations 10201 and 10202, six orders each, and the weapons as 10203 to 10207, with the goods naming no item of their own. The rotation's item ids name no avatar or material row in the dump, so its names wait on the bag's definitions. A character whose constellations are full cannot be bought. Fates for Primogems are the [inventory](/docs/proposals/genshin/inventory) proposal's.
- **Souvenir Shops take Sigils.** Each region's main city trades its own Sigils for materials, blueprints and Mora, never restocking. The table's Souvenir rows price in item 305 for Mondstadt and 307 for Liyue, and the wallet's Sigils are the [inventory](/docs/proposals/genshin/inventory)'s to hold. Since 2.0 a region's shop opens only once its region's offering is at its last level, as Sumeru's waits on Vanarana's Favor ([offering systems](/docs/proposals/genshin/offering-systems)).
- **Nothing for Genesis Crystals.** The Gift Shop and the outfit shop sell only for Genesis Crystals, which the world never sells, so their goods are never offered, as the [Genshin](/docs/proposals/genshin) proposal rules out any payment.
- **A Reputation discount is the price's.** The table gives a city's named shops a Mora discount at its reputation level four, a rate of 90 in the table, which is ten percent off. The rounding is the proposal's: in the player's favour, to a multiple of five Mora ([reputation](/docs/proposals/genshin/reputation)). The wiki's Blanche (Mondstadt) page bears it out: Salt at 60 is 50 after the discount, Pepper at 80 is 70 and Tomato at 120 is 105.
- **A vendor is a resident.** A city's vendor is placed as a resident, and their shop opens from their talk, as the game opens it.
- **The Mondstadt general goods vendor is Blanche, on shop 1004.** The table's shop types are numbers that no dump file names, so the link is read from the table's order, as the [shops](/docs/genshin/shops) page sets out. The wiki's Blanche (Mondstadt) page confirms it without a recording: her shop lists the same eight goods at the same Mora prices and daily limit of 100 as shop 1004, and is open at all times of the day.
- **A good that is no currency goes into the bag.** A purchase whose item the wallet does not hold adds it to the bag through `addInventoryItem`, as `claimExpedition` adds a reward, and a purchase the bag cannot take whole is refused with nothing spent.

## Scope and order

**Today:** the wallet holds the currencies. Paimon's Bargains' Fates and the Mondstadt grocery's Mora-priced goods are offered by the rule, with no screen. The grocery's goods give ingredients the bag does not hold yet, so the rule refuses them until it does.

**This adds, in order:**

1. **The grocery's purchases into the bag.** The bag's materials hold only what drops, expeditions and the forge name, so the grocery's eight ingredients have no definition yet.
   - `scripts/src/services/genshinAssets/items/buildItems.ts` adds the item ids of the `shops/mondstadtGeneralGoods` record to the ids it builds; `pnpm -C scripts genshin:assets items` republishes `items/materials` from the dump's `MaterialExcelConfigData`, and `pnpm -C scripts genshin:text names` adds their names to the existing name-text chunks.
   - `packages/genshin-world/src/services/shop/buyShopGood.ts` takes the bag (`Inventory`), the reader's names and the material table by item id (`materialDataMap`, which the world reads as it opens) beside the wallet. An item in `ShopItemCurrencyMap` still goes to the wallet; any other is added with `addInventoryItem(inventory, getItemDefinition(itemId, names, materialDataMap), itemCount)`, and an addition with any overflow returns undefined. The result gains `inventory`.
   - `packages/genshin-world/src/services/shop/buyShopGood.test.ts` gains two cases on good 203001 (item 100075, 60 Mora): bought into an empty bag it adds one item and takes 60 Mora, and into a bag with no room for a new kind it is refused with the wallet unchanged. The existing Fate cases pass the bag through unchanged.
2. **Paimon's Bargains' screen, its rotation, weapons and materials**, once the bag holds the items' definitions.
3. **Each city's vendors and Souvenir Shop**, as its region is built, with the Sigils in the wallet.
4. **The Fishing Associations**, with fishing.

## Data and measures

- **Read from the game's tables:** `ShopExcelConfigData`, `ShopGoodsExcelConfigData`, `ShopRotateExcelConfigData` and `ShopSheetExcelConfigData`, the goods' item rows, and which resident runs which shop, which no table here yet names.
- **Read from the wiki:** Paimon's Bargains' rotation, the names of its characters and weapons, and the Mondstadt grocery's stock, where the table leaves them open.

## Key files

| File                                                          | Role after the change                            |
| :------------------------------------------------------------ | :----------------------------------------------- |
| `packages/genshin-world/src/models/inventory/Currency.ts`     | Gains each region's Sigils                       |
| `packages/genshin-world/src/models/screen/ScreenKind.ts`      | `Shop`, filled in                                |
| `packages/genshin-world/src/models/world/Resident.ts`         | A vendor, whose talk opens their shop            |
| `packages/genshin-world/src/components/Wish/Screen/Index.vue` | Opens Paimon's Bargains, as the game's wish does |

## Sources

- [Shop](https://genshin-impact.fandom.com/wiki/Shop), Genshin Impact Wiki: the kinds of shop, daily and weekly restocks, the special shops for Genesis Crystals and for Starglitter, Stardust and Primogems, Souvenir Shops for Sigils, and the Fishing Associations.
- [Paimon's Bargains](https://genshin-impact.fandom.com/wiki/Paimon%27s_Bargains), Genshin Impact Wiki: the monthly reset, two characters a month from a six-month rotation, the weapons' rotation, Stardust's monthly limits, and no character past its full constellations.
- [Souvenir Shop](https://genshin-impact.fandom.com/wiki/Souvenir_Shop), Genshin Impact Wiki: Sigils for materials, blueprints and Mora, no restock, and the region's offering at its last level since 2.0.
- [General Goods](https://genshin-impact.fandom.com/wiki/General_Goods), Genshin Impact Wiki: Blanche, the Mondstadt general goods vendor.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the shop, goods, rotation and sheet tables.
