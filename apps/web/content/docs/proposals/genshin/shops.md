---
title: Shops
description: Proposal — the game's shops on one rule over its own goods table, its first part built as Paimon's Bargains' Fates. Still to build: Paimon's Bargains' rotation, weapons and materials, every vendor's goods and restocks, each region's Souvenir Shop taking its Sigils, and nothing that costs Genesis Crystals.
model: claude-opus-5-5
---

# Shops

The game's shops are its vendors in the cities, the Souvenir Shops that take each region's Sigils, the Fishing Associations, and the shops in the Paimon menu, Paimon's Bargains among them. They turn Mora, Sigils, Starglitter and Stardust into ingredients, recipes, materials, Fates and characters. They spend from the [inventory](/docs/genshin/inventory)'s wallet and stand at the vendors placed in region data.

The rule over Paimon's Bargains' Fates is built, as the [shops](/docs/genshin/shops) page sets out. This page keeps what is not.

## Decisions

- **Every shop's goods are the game's.** `ShopGoodsExcelConfigData` holds each good: the shop it belongs to, the item and how many, its price in Mora or in items, its buy limit, its refresh, the Adventure Rank it shows from and the dates it sells between. `ShopExcelConfigData` names the shop, and `ShopRotateExcelConfigData` a rotation's order.
- **Restocked by its refresh.** What was bought is kept with when it was bought, and a good's limit comes back when its refresh comes round: daily at the reset, every two or three days for some goods, weekly, or monthly, each good by its own row. The monthly refresh is built; the others wait on their vendors, and the every-few-days cycle's anchor is not in the table, so it is read from a source before it is built.
- **Paimon's Bargains' rotation.** A monthly two of the game's rotating four-star characters are its rotation's goods, the table's seven rotations naming them, with the monthly weapons and top materials paying in the same currencies. A character whose constellations are full cannot be bought. Those goods wait on the bag's definitions for the items they give. Fates for Primogems are the [inventory](/docs/proposals/genshin/inventory) proposal's.
- **Souvenir Shops take Sigils.** Each region's main city trades its own Sigils for materials, blueprints and Mora, never restocking. Since 2.0 a region's shop opens only once its region's offering is at its last level, as Sumeru's waits on Vanarana's Favor ([offering systems](/docs/proposals/genshin/offering-systems)).
- **Nothing for Genesis Crystals.** The Gift Shop and the outfit shop sell only for Genesis Crystals, which the world never sells, so their goods are never offered, as the [Genshin](/docs/proposals/genshin) proposal rules out any payment.
- **A Reputation discount is the price's.** The table gives a city's named shops a Mora discount at its reputation level four, a rate of 90 in the table, which is ten percent off. The rounding is the proposal's: in the player's favour, to a multiple of five Mora ([reputation](/docs/proposals/genshin/reputation)).
- **A vendor is a resident.** A city's vendor is placed as a resident, and their shop opens from their talk, as the game opens it.

## Scope and order

**Today:** the wallet holds the currencies, and Paimon's Bargains' Fates are bought by the rule ([shops](/docs/genshin/shops)), with no screen.

**This adds, in order:**

1. **Mondstadt's general goods vendor.** Its shop rows are the city's grocery and food shops, but no good in the table names either as its shop, so the link from a vendor to its goods is open: it is found in the table or from a source before this step is built.
2. **Paimon's Bargains' screen, its rotation, weapons and materials**, once the bag holds the items' definitions.
3. **Each city's vendors and Souvenir Shop**, as its region is built.
4. **The Fishing Associations**, with fishing.

## Data and measures

- **Read from the game's tables:** `ShopExcelConfigData`, `ShopGoodsExcelConfigData`, `ShopRotateExcelConfigData` and `ShopSheetExcelConfigData`, the goods' item rows, and which resident runs which shop, which no table here yet names.
- **Read from the wiki:** Paimon's Bargains' rotation where the rotation table leaves its months open.

## Key files

| File                                                          | Role after the change                            |
| :------------------------------------------------------------ | :----------------------------------------------- |
| `packages/genshin-world/src/models/inventory/Currency.ts`     | Gains each region's Sigils                       |
| `packages/genshin-world/src/models/screen/ScreenKind.ts`      | `Shop`, filled in                                |
| `packages/genshin-world/src/models/world/Resident.ts`         | A vendor, whose talk opens their shop            |
| `packages/genshin-world/src/components/Wish/Screen/Index.vue` | Opens Paimon's Bargains, as the game's wish does |

## Sources

- [Shop](https://genshin-impact.fandom.com/wiki/Shop), Genshin Impact Wiki: the kinds of shop, daily and weekly restocks, the special shops for Genesis Crystals and for Starglitter, Stardust and Primogems, Souvenir Shops for Sigils, and the Fishing Associations.
- [Paimon's Bargains](https://genshin-impact.fandom.com/wiki/Paimon%27s_Bargains), Genshin Impact Wiki: the monthly reset, two characters a month from a rotation, the weapons' rotation, Stardust's monthly limits, and no character past its full constellations.
- [Souvenir Shop](https://genshin-impact.fandom.com/wiki/Souvenir_Shop), Genshin Impact Wiki: Sigils for materials, blueprints and Mora, no restock, and the region's offering at its last level since 2.0.
- [Daily Reset](https://genshin-impact.fandom.com/wiki/Daily_Reset), Genshin Impact Wiki: shops restocking daily, or every two or three days, by item.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the shop, goods, rotation and sheet tables.
