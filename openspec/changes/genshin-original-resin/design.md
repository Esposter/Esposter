# Original Resin

The [original resin](../../specs/genshin/original-resin/design.md) page holds the resin's count, its regeneration and refills, a claim's price, its rewards and Condensed Resin. What is left is the claim's offer on F, which each challenge's blossom needs once a challenge places one. Each challenge's own page spawns the blossom, and the claim spends the resin for it.

## Decisions

- **A cleared challenge leaves its blossom, and F offers its claim.** A [ley line outcrop](../genshin-ley-line-outcrops/design.md)'s Ley Line Blossom, a [domain](../genshin-domains/design.md)'s Petrified Tree or a [boss](../genshin-bosses/design.md)'s Trounce Blossom. A challenge cleared but not claimed gives nothing. The offers and their prices are the [original resin](../../specs/genshin/original-resin/design.md) page's.
- **Offers the holdings can pay.** `computeAffordableBlossomClaimOffers` keeps a resin offer while the Original Resin covers its price, and the Condensed Resin offer while the bag holds one, since that claim spends no Original Resin. A blossom whose offers the holdings cannot pay offers nothing.
- **Fragile Resin is used from the bag.** Its use restores 60 Original Resin, the refill rule the [as-built page](../../specs/genshin/original-resin/design.md) already has, and it waits on the [inventory](../archive/2026-10-18-genshin-inventory/design.md)'s using of an item.
- **The offers are Original Resin and Condensed Resin.** Fragile Resin is not a claim, and Transient Resin is left out until it is carried. The game's claim text also names Fragile and Transient Resin as claim items; they are left out for now.
- **A short Original Resin offers the restore first.** When the held Original Resin covers no resin offer, the claim's offer list shows a restore prompt: one Fragile Resin restores sixty, through `refillOriginalResinWithFragileResin`, after which the claims are offered again, as the game's claim dialog does.
- **The bag's Use action is left out.** Another agent is building it, so the offers and the restore are services until it lands.
- **One claim service takes a cost and a reward list.** `claimResinReward` pays a claim in Original Resin, or in Condensed Resin where its cost names it, and takes in the reward list the challenge drew. A blossom, a domain's Petrified Tree and a boss's Trounce Blossom each pass their own cost and list. `claimBlossom` and `spendCondensedResin` are retired, and the rule that refuses a boss Condensed Resin now lives in `computeBlossomClaimOffers`.

## How it works

```mermaid
flowchart TD
  CLEAR["Challenge cleared"] --> BLOSSOM["Its blossom appears"]
  BLOSSOM -->|"F"| OFFER["Offers the claims, the ones the resin held affords"]
  OFFER -->|"one chosen"| CLAIM["claimResinReward spends the cost and takes the rewards in"]
  CLAIM --> BAG["Into the bag and the wallet"]
```

## Scope and order

**This still adds:** the claim's offer on F, its one step left. It waits on the ley line outcrops' blossom, which the world does not place yet.

1. **The claim's offer on F**, with the first blossom a challenge places ([ley line outcrops](../genshin-ley-line-outcrops/design.md) or [bosses](../genshin-bosses/design.md)): its prompt row through `computeInteractionPrompts`, its offers from `computeAffordableBlossomClaimOffers` shown to choose from, Condensed Resin's among them at a ley line or a domain, and `claimResinReward` on the one chosen.

## Key files

| File                                                                           | Role after the change                         |
| :----------------------------------------------------------------------------- | :-------------------------------------------- |
| `packages/genshin-world/src/services/interaction/computeInteractionPrompts.ts` | Lists a blossom in reach as a claim           |
| `packages/genshin-world/src/services/enemy/computeEnemyDrops.ts`               | Its bands, which a claim's rolled drops share |

## Sources

- [Original Resin](https://genshin-impact.fandom.com/wiki/Original_Resin), Genshin Impact Wiki: claims at ley line outcrops, domains and bosses and their prices.
- [Condensed Resin](https://genshin-impact.fandom.com/wiki/Condensed_Resin), Genshin Impact Wiki: three rewards at once, and never at a boss.
- [Normal Bosses](https://genshin-impact.fandom.com/wiki/Normal_Bosses) and [Weekly Bosses](https://genshin-impact.fandom.com/wiki/Weekly_Bosses), Genshin Impact Wiki: the Trounce Blossom, 40 resin, and 30 for the first three weekly claims.

## Reference

- `map-top-bar.mkv` — the map on M opened from standing still in the open world, its top bar in view with the Original Resin counter, 10 seconds at most; the counter's place and type are measured from it. On the wiki and YouTube, none found (searched 2026-10-11).
