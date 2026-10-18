# Offering systems

Beside the Statues of The Seven, many areas keep an offering of their own: the Frostbearing Tree in Dragonspine, the Sacred Sakura on Narukami Island, the Lumenstone Adjuvant in the Chasm's mines, Vanarana's Tree of Dreams, the Amrita Pool, the Fountain of Lucine, the Votive Rainjade, Tona's Flame and the Throne of the Primal Fire in Natlan, the Temple of Space's Memory Core and Snezhnaya's Shadow Realm Analyzer. Each takes items found exploring its place and gives rewards for levels, as a statue does for Oculi. They are one rule over different items. The [offering systems](../../specs/genshin/offering-systems/design.md) page holds the rule and the Frostbearing Tree built on it.

## Decisions

- **Its items are found exploring its place.** Each offering's items stand at the [spawned places](../genshin-spawned-places/design.md) or come from its region's quests, as the wiki lists for each.
- **What a level unlocks is its region's.** A level that changes the place itself, such as a stronger Lumenstone Adjuvant, belongs to its region's page, which reads the offering's level.
- **Every offering's levels and rewards now, its place with its region.** An offering's items, thresholds and rewards are table data on the Frostbearing Tree's rule and wait on nothing, so every offering whose table names its rewards is published at once. Where it stands is published per region beside `frostbearingTreePlaces`, from the official map's point for it, and where its items stand comes with the spawned places.
- **The tree's landmark waits on the world's drawing.** The Frostbearing Tree's place is published per region as the `frostbearingTreePlaces` dataset, as the chests are, rather than into the region's landmark data, since the tree is not yet a landmark the world draws.
- **One levels builder over the dump's offering table.** `buildOfferingLevels` publishes each offering id the level-up table names under its kind (`offerings/<kind>`), the kind given by `OfferingIdKindMap`. An id the map does not hold is an error, so a new offering cannot publish under no key, unless its event has ended.
- **A level takes a list of items.** `items` holds every item a level takes, each with its count, in the slots the dump names them. Lumenstone Adjuvant's levels 2, 6 and 8 take Lumenspar and Lumenstone Ore, so their `items` hold both. The Frostbearing Tree's levels hold one item or none, and the tree's reader still reads them as the offer rule's single item: that rule holds one count, and its saved progress is one count shared with the statues' progress. A level naming more than one item is refused as the tree's data is read. Lumenstone's two-item levels publish, and no world reader reads them until the rule holds each item, a decision the main session owns with the save.
- **A level at level 0 is the unstarted state.** The table writes it with no level, no reward and no item, and the builder keeps only levels above zero, so it is left out. The tree has no such row: its level 1 is a real level paying its reward.
- **An offering whose level names no reward the table holds is left out, with a note.** The Gift of Amrita is the one case; see below.
- **The Gift of Amrita is left out.** Its six level rows take six Plumes of Purifying Light and name no reward in the level table: they name a Lua group (`133317140`) which draws the blessing. The table's only reward for the offering is the finish reward `313007`, one item (`210160`). The wiki's Gift of Amrita page gives six sets of rewards, "The player receives each set of rewards once, their order is randomized", and a fixed per-level reward would invent the order the game draws. A random pool is a shape the level does not have. Waits on that decision.
- **Primal Flame Resonance is published from the wiki, provisionally.** The dump holds no level table for it (`ActivityNatlanOfferExcelConfigData` has no rows). The wiki's Primal Flame Resonance page gives six levels, "offered in groups of 1. A total of 6 Blazing Flint Ores are required to reach the maximum level", and its bonuses are per constellation, not items. The six levels take one Blazing Flint Ore each (the dump's material `918`) and pay no reward. The values are provisional in `constants.ts` until a recording confirms them.
- **Michiae Casket's event has ended, so its id is left out.** Michiae Casket (id 4) is the Three Realms Gateway Offering's, a Version 2.5 flagship event that ran from 2022/02/17 to 2022/03/30. The event's Part I page gives its Japanese name, "Sankai Michiae-no-Matsuri". `ENDED_OFFERING_IDS` names the id, and the kind is not held.
- **Offering places beside the tree's, one generic builder.** `buildOfferingPlaces` publishes each offering's map point through the shared placement into the `offeringPlaces` dataset, one slice per region, each place carrying its offering's kind. The tree keeps its own `frostbearingTreePlaces` dataset, which the world reads, so it is not published twice.
- **Tonatiuh is taken as the Tablet of Tona, provisionally.** Its label names no offering, and its one point lies in Natlan's area, near the Throne. The wiki's Tona's Flame's Restitution page places the offering at the Tablet of Tona, in Temple of Pax. Unmeasured, so it stays provisional until a recording places the tablet.

## Wiki check against the rule

Checked on 2026-10-18 against the [Offering System](https://genshin-impact.fandom.com/wiki/Offering_System) page on the Genshin Impact Wiki (the page `Offering` redirects to it), read through its API (`api.php?action=parse&page=<Title>&prop=wikitext`), and each linked sub-page the same way.

**The wording matches the rule.** The page says an offering system takes items found through exploration, is "similar to Statue of The Seven but instead of being able to offer one item at a time, the player automatically offers all in Inventory". That is the rule's first requirement, every offering item in the bag offered at once.

**The page lists eleven offerings; ten match the dump one for one by item, group size and total.** Each sub-page's "groups of" and total give the dump's per-level count and level count:

| Wiki section (sub-page)           | Dump id | Item and figure                                                                                                |
| :-------------------------------- | ------: | :------------------------------------------------------------------------------------------------------------- |
| Frostbearing Tree's Gratitude     |       1 | Crimson Agate, groups of 10, 110 total: 11 levels of 10                                                        |
| Sacred Sakura's Favor             |       2 | Electro Sigil, groups of 25, 1,250 total: 50 levels of 25                                                      |
| Enhance the Lumenstone Adjuvant   |       3 | Lumenspar, groups of 8, 80 total, and one Lumenstone Ore at levels 2, 6 and 8                                  |
| Vanarana's Favor (Tree of Dreams) |       5 | Dendro Sigil, groups of 35, 1,750 total: 50 levels of 35                                                       |
| The Gift of Amrita                |       6 | Plume of Purifying Light, groups of 6, 36 total: 6 levels of 6. Not published, see above                       |
| Fountain of Lucine's Accolades    |       7 | Hydro Sigil, groups of 30, 1,500 total: 50 levels of 30                                                        |
| Rainjade's Benediction            |       8 | Spirit Carp, groups of 5, 50 total: 10 levels of 5                                                             |
| Tona's Flame's Restitution        |       9 | Pyro Sigil, groups of 30, 1,500 total: 50 levels of 30                                                         |
| Temple of Space: Memory Core      |      16 | Memory Factor, groups of 20, 200 total: 10 levels of 20                                                        |
| Shadow Realm Analyzer             |      19 | Shadow Wingdrop in rising quantities; its cumulative count reaches level 5 with 6 of 58 left, as the page says |
| Primal Flame Resonance            |       - | Blazing Flint Ore, groups of 1, 6 total: six provisional levels from the wiki, no dump table                   |

**Where the published list and the page differ:**

- **The Gift of Amrita** is the page's one offering not published (see the decision above). It is the only page offering that does not match, so the check below does not pass.
- **Shadow Realm Analyzer:** the page says levels above 5 "will unlock in future", while the table holds nine levels. The dump's version table caps this offering at level 5, the page's level, so the published levels 6 to 9 sit above the cap, which the world applies.
- **Temple of Space: Memory Core:** the page's level table gates some levels on exploration progress at 10, 50 and 90 percent. The rule has no such gate, so those levels publish without it. The Memory Core's label has no point on the official map.
- **Version caps:** the dump's version table caps Sacred Sakura (id 2), Tree of Dreams (5), Fountain of Lucine (7) and Tona's Flame (9) at 20, 30, 40 and 50, and the Shadow Realm Analyzer (19) at 5. The page gives the caps by version, before Versions 2.4, 3.6, 4.6 and 5.8. The published levels run to 50 and ignore these caps, which are the world's to apply.

**The twelve published kinds the page does not list**, from the dump's open-state table (`OfferingOpenStateConfigData`, each id's `openState`), each checked against the wiki page that names it:

| Dump id   | Kind                         | Wiki page checked                                                                                         | Verdict                                                                                       |
| :-------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| 4         | Michiae Casket               | Three Realms Gateway Offering (Version 2.5 flagship event, 2022/02/17 to 2022/03/30)                      | Dropped: the event has ended. `ENDED_OFFERING_IDS`                                            |
| 10 to 15  | Nordkalai Offering 01 to 06  | Meeting Point/Nod-Krai: the Nod-Krai meeting points, of the Reputation system                             | Kept: current. The page lists six meeting points, and their Construction takes Luna Sigils    |
| 17 and 18 | Nordkalai Offering 07 and 08 | Meeting Point/Nod-Krai                                                                                    | Kept: current. Not matched to a named meeting point; the page's six leave two ids without one |
| 20 to 22  | Snezhnaya Offering 01 to 03  | Meeting Point/Snezhnaya: three meeting points, Tidesong Cavern, Huntsman's Cabin, The Korolevskiy Theater | Kept: current. Their per-level Cryo Sigil counts, 20, 30, 40, 50 and 60, match the page's     |

Meeting Point is the page the wiki names as "the Reputation system for Nod-Krai and Snezhnaya"; its offerings are Construction levels, the same rule. The Snezhnaya page's exploration gates (10, 30, 50, 70 and 90 percent) are not part of the rule. The Nod-Krai page's Luna Sigil figures are not compared here.

The published set is the page's offerings but the Gift of Amrita (ten, Primal Flame Resonance included from the wiki), the eleven kinds the Meeting Points list (Nod-Krai's eight and Snezhnaya's three), and no Michiae Casket. Only the Gift of Amrita is missing from the page's list, so task 3.1 stays open.

## Scope and order

**This still adds:**

1. **Every offering's levels and rewards**, from its level-up table or its wiki page, on the one rule. Built for every id but Michiae Casket's ended event and the Gift of Amrita, which waits on the random-pool decision.
2. **Each offering's place**, from the official map's point, published per region as the Frostbearing Tree's is. The map has no point for the Fountain of Lucine, the Votive Rainjade, the Lumenstone Adjuvant or the Shadow Realm Analyzer, and the Memory Core's label has none, so those wait. The Snezhnaya and Nod-Krai meeting points (labels 518 and 693) are not placed: the map gives three and six points for three and eight offerings, and which point is which is not settled.

## Data and measures

- **Read from the game's tables and the wiki:** each offering's items, thresholds and rewards, from its level-up table where the dump holds one, and from the wiki's page where no table holds them. Primal Flame Resonance is the one offering with no table, and its wiki values are provisional.
- **Placed by the spawned places:** where each offering's items stand.

## Key files

| File                                                                           | Role after the change                                                                                          |
| :----------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/interaction/computeInteractionPrompts.ts` | Lists an offering in reach to offer to                                                                         |
| `packages/genshin-world/src/services/inventory/addInventoryItem.ts`            | The bag the offering items are taken from                                                                      |
| `packages/genshin-world/src/models/world/LandmarkKind.ts`                      | Gains the offering                                                                                             |
| `packages/genshin-world/src/models/data/GameDataset.ts`                        | Gains the `offeringPlaces` dataset beside the tree's                                                           |
| `packages/genshin-world/src/services/offering/readFrostbearingTreeLevels.ts`   | Reads the tree's levels as the published list, one item a level, as the rule holds                             |
| `scripts/src/models/genshinAssets/offerings/OfferingKind.ts`                   | Each offering's kind, the key its levels and places publish under                                              |
| `scripts/src/models/genshinAssets/offerings/OfferingLevelRow.ts`               | One published level: the items it takes as a list, and its rewards                                             |
| `scripts/src/services/genshinAssets/offerings/OfferingIdKindMap.ts`            | Each level-up table id's kind                                                                                  |
| `scripts/src/services/genshinAssets/offerings/LabelIdOfferingKindMap.ts`       | Each offering's official map label, where the map has one                                                      |
| `scripts/src/services/genshinAssets/offerings/buildOfferingLevels.ts`          | Builds every offering's levels, each row's reward joined from the reward table, and Primal Flame's wiki levels |
| `scripts/src/services/genshinAssets/offerings/buildOfferingPlaces.ts`          | Builds each region's offering places from the official map's points and the fit                                |
| `scripts/src/services/genshinAssets/offerings/constants.ts`                    | The ended event's ids and Primal Flame's provisional wiki values                                               |
| `scripts/src/services/genshinAssets/offerings/getConsumedItems.ts`             | The item slots a level names, the zeroed empty slots dropped                                                   |
| `scripts/src/services/genshinAssets/offerings/toOfferingLevelRow.ts`           | One level's row: every item it takes, its rewards                                                              |
| `scripts/src/services/genshinAssets/offerings/buildFrostbearingTreePlaces.ts`  | Builds the tree's place from the official map's point and the fit                                              |
| `scripts/src/services/genshinAssets/rewards/readRewardMap.ts`                  | The reward table keyed by reward id, shared by the level builders                                              |

`StatueLevelRow` keeps its own flat shape: the statues' levels are published flat and read by the world's statue levels, so the offering row's widening does not reach them.

## Sources

- [Offering System](https://genshin-impact.fandom.com/wiki/Offering_System), Genshin Impact Wiki: the rule's wording, and the sections checked above. The page itself refused scripted fetches (HTTP 402), so the text is the wiki's API's `wikitext` for the same title. The page `Offering` redirects to it.
- The sub-pages the table cites, read the same way: Frostbearing Tree's Gratitude, Sacred Sakura's Favor, Enhance the Lumenstone Adjuvant, Vanarana's Favor, The Gift of Amrita, Fountain of Lucine's Accolades, Rainjade's Benediction, Tona's Flame's Restitution, Primal Flame Resonance, Temple of Space: Memory Core, Shadow Realm Analyzer.
- The pages the twelve kinds are checked against: Three Realms Gateway Offering (and its Part I page), Meeting Point, Meeting Point/Nod-Krai and Meeting Point/Snezhnaya.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the offering level-up table, the offering open-state table, the version table and the reward table the rewards are joined from.
- [Teyvat Interactive Map](https://act.hoyolab.com/ys/app/interactive-map/index.html), HoYoLAB: the map's labels and points for the offerings, read into the references folder and carried through the fit.
