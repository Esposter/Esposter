# Offering systems

Beside the Statues of The Seven, many areas keep an offering of their own: the Frostbearing Tree in Dragonspine, the Sacred Sakura on Narukami Island, the Lumenstone Adjuvant in the Chasm's mines, Vanarana's Tree of Dreams, the Amrita Pool, the Fountain of Lucine, the Votive Rainjade, Tona's Flame and the Throne of the Primal Fire in Natlan, the Temple of Space's Memory Core and Snezhnaya's Shadow Realm Analyzer. Each takes items found exploring its place and gives rewards for levels, as a statue does for Oculi. They are one rule over different items. The [offering systems](../../specs/genshin/offering-systems/design.md) page holds the rule and the Frostbearing Tree built on it.

## Decisions

- **Its items are found exploring its place.** Each offering's items stand at the [spawned places](../genshin-spawned-places/design.md) or come from its region's quests, as the wiki lists for each.
- **What a level unlocks is its region's.** A level that changes the place itself, such as a stronger Lumenstone Adjuvant, belongs to its region's page, which reads the offering's level.
- **Every offering's levels and rewards now, its place with its region.** An offering's items, thresholds and rewards are table data on the Frostbearing Tree's rule and wait on nothing, so every offering is published at once. Where it stands is published per region beside `frostbearingTreePlaces`, from the official map's point for it, and where its items stand comes with the spawned places.
- **The tree's landmark waits on the world's drawing.** The Frostbearing Tree's place is published per region as the `frostbearingTreePlaces` dataset, as the chests are, rather than into the region's landmark data, since the tree is not yet a landmark the world draws.
- **One levels builder over the dump's offering table.** `buildOfferingLevels` publishes each offering id the level-up table names under its kind (`offerings/<kind>`), the kind given by `OfferingIdKindMap`. An id the map does not hold is an error, so a new offering cannot publish under no key. The Frostbearing Tree's levels publish unchanged: their rebuilt record hashes to the key the lock holds.
- **A level at level 0 is the unstarted state.** The table writes it with no level, no reward and no item, and the builder keeps only levels above zero, so it is left out. The tree has no such row: its level 1 is a real level paying its reward.
- **An offering with a level the builder cannot hold is left out, with a note.** Two cases, both named in the dry-run notes. The Lumenstone Adjuvant's levels 2, 6 and 8 take a second item, Lumenstone Ore, and the level shape holds one item, so publishing it would drop the ore. The Gift of Amrita's six levels name no reward in the level table, and a level that pays nothing is not published. Both wait on a decision the main session owns: the level shape holding a list of items, and where the Amrita Pool's blessings are read from.
- **Offering places beside the tree's, one generic builder.** `buildOfferingPlaces` publishes each offering's map point through the shared placement into the `offeringPlaces` dataset, one slice per region, each place carrying its offering's kind. The tree keeps its own `frostbearingTreePlaces` dataset, which the world reads, so it is not published twice.
- **Tonatiuh is taken as the Tablet of Tona, provisionally.** Its label names no offering, and its one point lies in Natlan's area, near the Throne. The Tablet of Tona is the wiki's place for Tona's Flame. Unmeasured, so it stays provisional until a recording places the tablet.

## Wiki check against the rule

Checked on 2026-10-18 against the [Offering System](https://genshin-impact.fandom.com/wiki/Offering_System) page on the Genshin Impact Wiki, read through its API (`api.php?action=parse&page=Offering_System&prop=wikitext`), and each linked sub-page the same way.

**The wording matches the rule.** The page says an offering system takes items found through exploration, is "similar to Statue of The Seven but instead of being able to offer one item at a time, the player automatically offers all in Inventory". That is the rule's first requirement, every offering item in the bag offered at once.

**The page lists eleven offerings; ten match the dump one for one by item, group size and total.** Each sub-page's "groups of" and total give the dump's per-level count and level count:

| Wiki section (sub-page)           | Dump id | Item and figure                                                                                                |
| :-------------------------------- | ------: | :------------------------------------------------------------------------------------------------------------- |
| Frostbearing Tree's Gratitude     |       1 | Crimson Agate, groups of 10, 110 total: 11 levels of 10                                                        |
| Sacred Sakura's Favor             |       2 | Electro Sigil, groups of 25, 1,250 total: 50 levels of 25                                                      |
| Enhance the Lumenstone Adjuvant   |       3 | Lumenspar, groups of 8, 80 total, and one Lumenstone Ore at levels 2, 6 and 8                                  |
| Vanarana's Favor (Tree of Dreams) |       5 | Dendro Sigil, groups of 35, 1,750 total: 50 levels of 35                                                       |
| The Gift of Amrita                |       6 | Plume of Purifying Light, groups of 6, 36 total: 6 levels of 6                                                 |
| Fountain of Lucine's Accolades    |       7 | Hydro Sigil, groups of 30, 1,500 total: 50 levels of 30                                                        |
| Rainjade's Benediction            |       8 | Spirit Carp, groups of 5, 50 total: 10 levels of 5                                                             |
| Tona's Flame's Restitution        |       9 | Pyro Sigil, groups of 30, 1,500 total: 50 levels of 30                                                         |
| Temple of Space: Memory Core      |      16 | Memory Factor, groups of 20, 200 total: 10 levels of 20                                                        |
| Shadow Realm Analyzer             |      19 | Shadow Wingdrop in rising quantities; its cumulative count reaches level 5 with 6 of 58 left, as the page says |

The eleventh section, Primal Flame Resonance, takes one Blazing Flint Ore at a time, six in all, and unlocks constellation bonuses rather than a reward per level. No offering in the level-up table takes one item at a time, so it is not published. Its place is label 662, the Throne.

**Where the published list and the page differ:**

- **The dump holds twelve offering ids the page does not list.** The Michiae casket (id 4) is not checked. Eight Nod-Krai offerings (ids 10 to 15, 17 and 18) and three Snezhnaya offerings (ids 20 to 22) are the joint meeting points. The Snezhnaya Meeting Point sub-page gives Cryo Sigils at 20, 30, 40, 50 and 60 per level, with exploration progress gates of 10, 30, 50, 70 and 90 percent. The dump's levels for ids 20 to 22 take item 306 at those same counts, so the costs match. The gates are not part of the rule. The Nod-Krai Meeting Point page is not compared here. The kinds of the twelve come from the dump's open-state table (`OfferingOpenStateConfigData`, each id's `openState`), not from a wiki page, so their names are provisional until a wiki page for each confirms them. The published list therefore does not match the page one for one, so task 3.1 stays open until the scope of this change is settled.
- **Lumenstone Adjuvant:** its levels 2, 6 and 8 take Lumenstone Ore as well as Lumenspar, which matches the dump's three two-item levels. The one-item level shape cannot hold them, so the offering is left out of this publish.
- **The Gift of Amrita:** the page says each set of rewards is given once in a random order, and the level table names no reward for any of its six levels. The Amrita Pool's rewards are not in the table; this offering is left out of this publish.
- **Shadow Realm Analyzer:** the page says levels above 5 "will unlock in future", while the table holds nine levels. The dump's version table caps this offering at level 5, the page's level, so the published levels 6 to 9 sit above the cap, which the world applies.
- **Temple of Space: Memory Core:** the page's level table gates some levels on exploration progress at 10, 50 and 90 percent. The rule has no such gate, so those levels publish without it. The Memory Core's label has no point on the official map.
- **Version caps:** the dump's version table caps Sacred Sakura (id 2), Tree of Dreams (5), Fountain of Lucine (7) and Tona's Flame (9) at 20, 30, 40 and 50, and the Shadow Realm Analyzer (19) at 5. The page gives the caps by version, before Versions 2.4, 3.6, 4.6 and 5.8. The published levels run to 50 and ignore these caps, which are the world's to apply.

## Scope and order

**This still adds:**

1. **Every offering's levels and rewards**, from its level-up table or its wiki page, on the one rule. Built for every id but the two left out above.
2. **Each offering's place**, from the official map's point, published per region as the Frostbearing Tree's is. The map has no point for the Fountain of Lucine, the Votive Rainjade, the Lumenstone Adjuvant or the Shadow Realm Analyzer, and the Memory Core's label has none, so those wait. The Snezhnaya and Nod-Krai meeting points (labels 518 and 693) are not placed: the map gives three and six points for three and eight offerings, and which point is which is not settled.

## Data and measures

- **Read from the game's tables and the wiki:** each offering's items, thresholds and rewards, from its level-up table where the dump holds one, and from the wiki's page where no table holds them. Every offering the level-up table names is read from it, so the wiki is read for the check, not for the values. Primal Flame Resonance is the one offering the table does not name.
- **Placed by the spawned places:** where each offering's items stand.

## Key files

| File                                                                           | Role after the change                                                           |
| :----------------------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/interaction/computeInteractionPrompts.ts` | Lists an offering in reach to offer to                                          |
| `packages/genshin-world/src/services/inventory/addInventoryItem.ts`            | The bag the offering items are taken from                                       |
| `packages/genshin-world/src/models/world/LandmarkKind.ts`                      | Gains the offering                                                              |
| `packages/genshin-world/src/models/data/GameDataset.ts`                        | Gains the `offeringPlaces` dataset beside the tree's                            |
| `scripts/src/models/genshinAssets/offerings/OfferingKind.ts`                   | Each offering's kind, the key its levels and places publish under               |
| `scripts/src/services/genshinAssets/offerings/OfferingIdKindMap.ts`            | Each level-up table id's kind                                                   |
| `scripts/src/services/genshinAssets/offerings/LabelIdOfferingKindMap.ts`       | Each offering's official map label, where the map has one                       |
| `scripts/src/services/genshinAssets/offerings/buildOfferingLevels.ts`          | Builds every offering's levels, each row's reward joined from the reward table  |
| `scripts/src/services/genshinAssets/offerings/buildOfferingPlaces.ts`          | Builds each region's offering places from the official map's points and the fit |
| `scripts/src/services/genshinAssets/offerings/getConsumedItems.ts`             | The item slots a level names, the zeroed empty slots dropped                    |
| `scripts/src/services/genshinAssets/offerings/toOfferingLevelRow.ts`           | One level's row: the item and count it takes, its rewards                       |
| `scripts/src/services/genshinAssets/offerings/buildFrostbearingTreePlaces.ts`  | Builds the tree's place from the official map's point and the fit               |
| `scripts/src/services/genshinAssets/rewards/readRewardMap.ts`                  | The reward table keyed by reward id, shared by the level builders               |

## Sources

- [Offering System](https://genshin-impact.fandom.com/wiki/Offering_System), Genshin Impact Wiki: the rule's wording, and the eleven sections checked above. The page itself refused scripted fetches (HTTP 402), so the text is the wiki's API's `wikitext` for the same title.
- The sub-pages the table cites, read the same way: Frostbearing Tree's Gratitude, Sacred Sakura's Favor, Enhance the Lumenstone Adjuvant, Vanarana's Favor, The Gift of Amrita, Fountain of Lucine's Accolades, Rainjade's Benediction, Tona's Flame's Restitution, Primal Flame Resonance, Temple of Space: Memory Core, Shadow Realm Analyzer, and the Meeting Point/Snezhnaya sub-page.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the offering level-up table, the offering open-state table, the version caps and the reward table the rewards are joined from.
- [Teyvat Interactive Map](https://act.hoyolab.com/ys/app/interactive-map/index.html), HoYoLAB: the map's labels and points for the offerings, read into the references folder and carried through the fit.
