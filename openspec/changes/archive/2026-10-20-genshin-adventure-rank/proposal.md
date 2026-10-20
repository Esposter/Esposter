# Adventure Rank

## Why

The rank, its holds, the World Level, the enemies it raises, the profile card and the World Level dialog are built. A rank still cannot be reached by most of the player's doings, its rewards cannot be claimed, and the systems it opens are not gated by it. Those reach the player through other pages: the Adventure EXP that quests, chests, unlocks, commissions and spent resin give, the rewards each rank hands out, and the systems a rank opens. Each waits on its own page, so each is built there.

## What Changes

The rank's sources, rewards and gates take effect as the pages that hold them land.

- Each Adventure EXP source adds its EXP through the shared grant, and spending Original Resin gives five Adventure EXP for each one spent.
- Gaining Adventure EXP at rank 60 pays ten Mora for each point gained.
- Each rank's reward is claimable from Katheryne at any branch of the Adventurers' Guild, once the rank is reached.
- A claimed rank reward is kept with the player's progress and cannot be claimed twice.
- The Paimon menu keeps a system's entry disabled until the rank that opens it.

## Capabilities

- **genshin/adventure-rank** (modified)

## Waiting on

- `openspec/changes/genshin-quests/`: the quests that carry Adventure EXP into the holds as they complete.
- `openspec/specs/genshin/original-resin/`: the resin spent that gives Adventure EXP.
- `openspec/changes/genshin-resident-schedules/`: Katheryne standing among Mondstadt's residents, which her rewards need.
- The chests, unlocks and commissions pages, each of which gives its own Adventure EXP when built.

## Impact

- The Adventure EXP grant, the profile and the Paimon menu's entries.
- The save, which keeps the claimed rank rewards beside the EXP and the quests' progress.
