---
title: Adventure Rank
description: Proposal — the parts of the player's Adventure Rank still unbuilt: the Adventure EXP each source gives, Katheryne's rewards for each rank, and the systems each rank opens. The rank, its holds, the World Level, the enemies it raises, the profile card and the World Level dialog are built.
model: claude-opus-5-5
waiting: "the Adventure EXP sources of the quests, chests, unlocks, commissions and resin pages, Katheryne among Mondstadt's residents from resident-schedules, and the systems' own pages"
touches:
  [
    "packages/genshin-world/src/composables/useWorldAdventureRank.ts",
    "packages/genshin-world/src/composables/useWorldMap.ts",
    "packages/genshin-world/src/components/World/Session/**",
  ]
---

# Adventure Rank

The rank, its holds, the World Level, the enemies it raises, the profile card and the World Level dialog are built ([Adventure Rank](/docs/genshin/adventure-rank)). What remains reaches the player through other pages: the Adventure EXP that quests, chests, unlocks, commissions and spent resin give, the rewards each rank hands out, and the systems a rank opens. Each waits on its own page, so each is built there.

## Decisions

- **Every source states its own EXP.** Quests, chests, Teleport Waypoints and statues unlocked, Oculi, commissions and the handbook's Experience chapters each give Adventure EXP their own page or table sets, and spending Original Resin gives five for each one spent ([original resin](/docs/proposals/genshin/original-resin)). Each source's page adds it through `gainAdventureExp`, which takes the completed main quests and returns the Mora a gain past rank 60 pays.
- **A rank's reward is claimed from Katheryne.** Each rank's reward is its `rewardId` in `RewardExcelConfigData`, claimed by talking to Katheryne at any branch of the Adventurers' Guild, as the game hands it out.
- **What a rank opens is stated by its system.** Each page names the rank its system opens at, from the wiki's table of unlocks, since the game's own open-state table names each system only by a number. The Paimon menu's entry for a system not yet open stays disabled, as it already is for one not built.
- **A claimed reward is kept with the player's progress.** The ranks' rewards claimed are kept in the save beside the EXP and the quests' progress ([save data](/docs/genshin/save-data)), since the world is the person's own.
- **Bosses and ley line outcrops stand at the World Level.** Their enemies and rewards follow the World Level as the wiki gives them, on the pages that build them.

## How it works

```mermaid
flowchart TD
  SRC["Quests, chests, unlocks, commissions, resin spent"] -->|"Adventure EXP"| G["gainAdventureExp, with the completed main quests"]
  G --> RANK["Rank rises, held at its ascension quests"]
  RANK --> REWARD["Its reward, claimable from Katheryne"]
  RANK --> SYSTEMS["The systems it opens take their entries"]
  G -->|"past rank 60"| MORA["Mora, ten for each point"]
```

## Scope and order

**Still to build, in order:**

1. **The other Adventure EXP sources, as their pages land.** Each calls `gainWorldAdventureExp`; the quests carried by the [quests](/docs/proposals/genshin/quests) page feed the holds as they complete.
2. **Katheryne's rewards.** Waits on Katheryne standing among Mondstadt's residents in region data, which the [resident schedules](/docs/proposals/genshin/resident-schedules) build: none of her name's text ids is a resident's yet.
3. **The Paimon menu's rank gates**, as the systems' pages open.

## Data and measures

- **Read from the game's tables:** the ranks' rows of `RewardExcelConfigData`, read when Katheryne lands.
- **Read from the wiki:** which rank opens each system.

## Key files

| File                                                          | Role after the change                                          |
| :------------------------------------------------------------ | :------------------------------------------------------------- |
| `packages/genshin-world/src/components/Menu/Paimon/Index.vue` | Keeps an entry disabled until its system's rank                |
| `packages/genshin-world/src/services/handbook/constants.ts`   | The Experience tab's chapters, once the EXP sources exist      |
| `packages/genshin-world/src/data/regions/mondstadt.json`      | Katheryne's place among Mondstadt's residents, for the rewards |

## Sources

- [Adventure Rank](https://genshin-impact.fandom.com/wiki/Adventure_Rank), Genshin Impact Wiki: rewards from Katheryne at each rank, and the systems each rank opens.
- [Original Resin](https://genshin-impact.fandom.com/wiki/Original_Resin), Genshin Impact Wiki: five Adventure EXP for each resin spent.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: `RewardExcelConfigData`, the table the ranks' rewards are read from.
