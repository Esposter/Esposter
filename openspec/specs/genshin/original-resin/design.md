# Original Resin

The game keeps its energy for claiming challenge rewards as Original Resin. The wallet holds it as a count and the moment it last changed, so its regeneration is read to the present rather than run on a timer, and the page can be closed for a day and still show the resin filled. The map's top bar counts it. The claim's price, its Adventure EXP and the Primogem refill are pure services in `genshin-world`, read off the rules the [proposal](../../../changes/genshin-original-resin/design.md) settles.

The claim's ways to pay are pure services too: a blossom's offers, and a Condensed Resin spent for three rewards at a ley line or a domain. No challenge leaves a blossom to claim yet, so no offer is shown and the claims' rewards are the proposal's still.

## How it works

```mermaid
flowchart TD
  W["Wallet: the count and the moment it last changed"] --> R["Read to now: a point each eight minutes below 200"]
  R --> M["The map's top bar: the count out of 200"]
  R --> F{"Refill or claim?"}
  F -->|"refill with Primogems"| P["The day's price, 60 restored, filling to 2,000"]
  F -->|"claim at a blossom"| C["Its kind's price, the claim's resin spent"]
  C --> X["Five Adventure EXP a point, through the rank's gain, and the Mora past rank 60"]
```

## Decisions

- **One every eight minutes, to 200.** `regenerateOriginalResin` adds a point for each eight minutes since the moment the resin last changed, up to 200. It moves that moment on by the points it gives, so the time to the next point keeps its place. At 200 regeneration stops and the moment is now, so a spend that takes the resin below 200 starts the next point from there.
- **A refill passes the cap, to 2,000.** `refillOriginalResin` reads the regeneration to now, then adds to the count, filling to 2,000. Above 200 the resin does not regenerate.
- **Primogem refills, six a game day.** Each restores 60 at its price in `services/originalResin/constants.ts`, paid in the world's own Primogems, which are never sold. `refillOriginalResinWithPrimogems` refuses a refill short of its price, at the 2,000 cap, or once the day's six are used. The game's day starts at 04:00 in UTC+8, the game's server time, so the count restarts at that hour and not at midnight.
- **A claim's price by its kind.** `computeBlossomClaimResin` prices a claim by its blossom kind, and a weekly boss's by how many claims it has had that week.
- **A claim's offers.** `computeBlossomClaimOffers` lists how a blossom's claim is paid: one claim at its price; at a ley line or a domain also two claims at twice the price, and a Condensed Resin for three claims. A boss offers its one claim only.
- **Condensed Resin's claim.** `claimResinReward` takes its cost's Condensed Resin out of the bag, one for a ley line's or a domain's three claims. `computeBlossomClaimOffers` offers that cost only at a ley line or a domain, so a boss is refused it. It spends no Original Resin, so it gives no Adventure EXP.
- **Five Adventure EXP a point.** `claimOriginalResin` spends the resin, then gives five Adventure EXP a point through `gainAdventureExp`, so the EXP past rank 60 is paid into the wallet as Mora. A claim the resin does not cover returns undefined and spends nothing.
- **Settled calls.** A new player holds the full 200. The resin's rarity is 3, the game's material table's `rankLevel`. Its name is the game's own text, `GameTextKey.OriginalResin`. Both the starting amount and the 04:00 reset are settled from the game's own design rather than checked against the wiki.

## Data

- **The item's row.** Original Resin is item 106 in the game's material table, with the rarity above. Its name's text id is the one `GameTextKey.OriginalResin` holds.
- **The other resins' rows.** Fragile Resin is item 107009, whose use adds 60 of item 106, the restore the refill uses. Condensed Resin is item 220007, whose stack limit no source in this change or its specs records, so none is built. Neither is read by a page yet.

## Not built yet

- **The blossoms.** No challenge leaves a blossom, so no F prompt offers a claim. The prices are ready for the [ley line outcrops](../../../changes/genshin-ley-line-outcrops/design.md), [domains](../../../changes/genshin-domains/design.md) and [bosses](../../../changes/genshin-bosses/design.md) to call.
- **The claims' rewards.** Not read yet: a ley line blossom's are its refresh row's reward previews, one a World Level ([ley line outcrops](../../../changes/genshin-ley-line-outcrops/design.md)), and a normal boss's the wiki's world boss rewards ([bosses](../../../changes/genshin-bosses/design.md)).
- **Fragile Resin's refill.** `refillOriginalResinWithFragileResin` restores the sixty it gives and takes one from the bag, and the bag's Use reaches it through `useInventoryEntry`, routed by the item's id. The published material table (`items/materials`) carries item 107009 once `genshin:assets items` publishes the consumable source the builder now reads, so a bag holds one only after that publish; the refill's test holds it in the meantime.
- **Condensed Resin's claim is not wired.** Its spend is ready, but no offer is shown until a blossom is placed. Its crafting from 60 is the [crafting](../crafting/design.md) bench's.
- **The dialogs.** The refill and claim dialogs, and the top bar's plus for refilling, are unbuilt. The top bar shows the count only.

The top bar's place and type are provisional until a recording measures them. The line is on the [roadmap](../../../changes/genshin-roadmap/tasks.md)'s References sought list.

## Key files

| File                                                                                       | Role                                                                                           |
| :----------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/originalResin/constants.ts`                           | The cap, the refill cap, the regeneration interval, the Primogem prices and the game's day     |
| `packages/genshin-world/src/services/originalResin/regenerateOriginalResin.ts`             | The count and its moment read to now, a point each interval below the cap                      |
| `packages/genshin-world/src/services/originalResin/spendOriginalResin.ts`                  | A spend read to now, undefined where the resin is not held                                     |
| `packages/genshin-world/src/services/originalResin/refillOriginalResin.ts`                 | A refill added to the count, filling to the refill cap                                         |
| `packages/genshin-world/src/services/originalResin/refillOriginalResinWithPrimogems.ts`    | A refill for the day's next price, the day's count restarting at the game's day                |
| `packages/genshin-world/src/services/originalResin/refillOriginalResinWithFragileResin.ts` | A Fragile Resin used from the bag: sixty restored, one taken out, undefined where none is held |
| `packages/genshin-world/src/services/originalResin/computeBlossomClaimResin.ts`            | A claim's price by its blossom kind and the weekly boss's claims that week                     |
| `packages/genshin-world/src/services/originalResin/claimOriginalResin.ts`                  | A claim: the resin spent, the Adventure EXP gained and the Mora past rank 60                   |
| `packages/genshin-world/src/services/originalResin/claimResinReward.ts`                    | The one resin claim: a cost paid in Original or Condensed Resin, the reward list taken in      |
| `packages/genshin-world/src/services/reward/drawRewardItems.ts`                            | A reward's items drawn to a count in their range, shared by commissions and expeditions        |
| `packages/genshin-world/src/services/originalResin/computeBlossomClaimOffers.ts`           | The ways a blossom's claim is paid: one, two at twice the price, or a Condensed Resin          |
| `packages/genshin-world/src/services/originalResin/checkIsMultiClaimBlossom.ts`            | A ley line or a domain, the blossoms that can be doubled or paid in Condensed Resin            |
| `packages/genshin-world/src/models/originalResin/BlossomClaimOffer.ts`                     | One way to pay a claim: its claim count, its resin and its Condensed Resin                     |
| `packages/genshin-world/src/models/inventory/Wallet.ts`                                    | The count of each currency, the moment Original Resin last changed, and the day's refills      |
| `packages/genshin-world/src/services/inventory/constants.ts`                               | A new player's wallet, holding Original Resin at the cap                                       |
| `packages/genshin-world/src/components/Map/Overlay/Index.vue`                              | The count on the map's top bar, read when the map opens                                        |
| `packages/genshin-text/src/models/GameTextKey.ts`                                          | `OriginalResin`, the item's name in the game's text                                            |

## Notes

- **The map reads its count once.** The count is taken when the map opens, so it holds still while the map is up, which is the moment a player reads it.
- **A claim's Companionship EXP is a rule of its own.** The claim gives no Companionship EXP itself; a blossom's amount goes to the deployed team through the [companionship](../companionship/design.md) grant, its amounts provisional until recorded.

## Sources

- [Original Resin](https://genshin-impact.fandom.com/wiki/Original_Resin), Genshin Impact Wiki: the claims' prices, five Adventure EXP a point, one point every eight minutes to 200, the Fragile and Primogem refills, and the 2,000 cap.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the material rows of items 106, 107009 and 220007, and the reward table.
