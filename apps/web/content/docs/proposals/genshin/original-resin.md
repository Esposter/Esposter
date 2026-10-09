---
title: Original Resin
description: Proposal — the claim every resin challenge shares: a cleared ley line, domain or boss leaves a blossom whose reward is claimed by spending resin, its fixed reward from the game's table and its rolled drops from the wiki's, and Condensed Resin crafted at the bench. The resin's count, regeneration, refills and the claim's price are built.
model: claude-haiku-5-5
---

# Original Resin

The game lets anyone clear a ley line outcrop, a domain or a boss as often as they like, but the reward is claimed only by spending Original Resin. The resin, its regeneration, its refills and a claim's price and Adventure EXP are [built](/docs/genshin/original-resin). This proposal keeps what is unbuilt: the blossom each challenge leaves and its claim offer, the rewards a claim gives, and Condensed Resin. Each challenge's own page spawns the blossom, and the claim here spends the resin for it.

## Decisions

- **A cleared challenge leaves its blossom.** A [ley line outcrop](/docs/proposals/genshin/ley-line-outcrops)'s Ley Line Blossom, a [domain](/docs/proposals/genshin/domains)'s Petrified Tree or a [boss](/docs/proposals/genshin/bosses)'s Trounce Blossom. F on it offers the claim at the challenge's price: 20 resin for a ley line or a domain, 40 for two claims at once, or one Condensed Resin for three; 40 for a normal boss; and 30 for a weekly boss's first three claims a week, 60 after. A challenge cleared but not claimed gives nothing. The single-claim prices are built as `computeBlossomClaimResin`.
- **Condensed Resin holds 60.** It is crafted from 60 Original Resin at the crafting bench ([crafting](/docs/proposals/genshin/crafting)), at most five held, and claims three rewards at a ley line or a domain but never at a boss.
- **Fixed rewards are read, rolled drops are the wiki's.** A claim's fixed reward is its `rewardId` in the game's reward table. What a claim rolls, its artifacts, materials and their counts, is drawn on a server whose drop tables the client never receives, so it is the wiki's drop data, as the [enemies](/docs/genshin/enemies)' drops already are. Both scale by the World Level or the domain's level the claim was made at.
- **Fragile Resin is used from the bag.** Its use restores 60 Original Resin, the refill rule the [as-built page](/docs/genshin/original-resin) already has, and it waits on the [inventory](/docs/genshin/inventory)'s using of an item.

## How it works

```mermaid
flowchart TD
  CLEAR["Challenge cleared"] --> BLOSSOM["Its blossom appears"]
  BLOSSOM -->|"F"| OFFER{"Which claim: one, two or Condensed?"}
  OFFER --> AFFORD{"That much resin held?"}
  AFFORD -->|"no"| KEEP["Blossom kept, nothing spent"]
  AFFORD -->|"yes"| SPEND["The claim spends the resin, five Adventure EXP a point"]
  SPEND --> FIXED["Fixed reward: the reward table"]
  SPEND --> ROLL["Rolled drops: the wiki's data, by World Level"]
  FIXED --> BAG["Into the bag and the wallet"]
  ROLL --> BAG
```

## Scope and order

**Built:** the resin's count, its regeneration, its refills and a claim's price and Adventure EXP, on the [as-built page](/docs/genshin/original-resin).

**This still adds, in order:**

1. **The claim**, with the first challenge that spawns a blossom: its offer on F, the claim's fixed and rolled rewards, and the blossom's kept state.
2. **Condensed Resin**, with the crafting bench, and its claim of three rewards at a ley line or a domain.

## Data and measures

- **Read from the game's tables:** each claim's `rewardId` rows of `RewardExcelConfigData`, which the dump holds. The blossoms' rows of `BlossomChestExcelConfigData`, which name each blossom's `rewardId`, are not among the dump's tables, so the claim's fixed rewards wait on a dump that carries that table.
- **Read from the wiki:** each challenge's rolled drops by World Level, as the enemies' are read.
- **Measured:** nothing; the claim's dialog is laid out by the [recreation passes](/docs/proposals/genshin/recreation-passes).

## Key files

| File                                                                           | Role after the change                         |
| :----------------------------------------------------------------------------- | :-------------------------------------------- |
| `packages/genshin-world/src/services/interaction/computeInteractionPrompts.ts` | Lists a blossom in reach as a claim           |
| `packages/genshin-world/src/services/enemy/computeEnemyDrops.ts`               | Its bands, which a claim's rolled drops share |

## Sources

- [Original Resin](https://genshin-impact.fandom.com/wiki/Original_Resin), Genshin Impact Wiki: claims at ley line outcrops, domains and bosses and their prices.
- [Condensed Resin](https://genshin-impact.fandom.com/wiki/Condensed_Resin), Genshin Impact Wiki: three rewards at once, and never at a boss.
- [Normal Bosses](https://genshin-impact.fandom.com/wiki/Normal_Bosses) and [Weekly Bosses](https://genshin-impact.fandom.com/wiki/Weekly_Bosses), Genshin Impact Wiki: the Trounce Blossom, 40 resin, and 30 for the first three weekly claims.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the reward table, and no drop table, which stays on the game's servers.
