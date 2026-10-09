---
title: Fishing
description: Proposal — fishing as the game runs it, every number from its own fish tables. The points, stocks, fish, rods and the rules of a cast and a reel are built; the bite and its skills, bait, the rod's pull, the screen and the Fishing Associations' exchanges are what remains, each waiting on a call or a recording.
model: claude-opus-5-5
---

# Fishing

Fishing is one of the game's pastimes: bait crafted for the fish wanted, a line cast at a rippling fishing point, a bite struck, and the fish reeled in by keeping the line's tension in its zone. Fish are cooked, kept in the Serenitea Pot's ponds, and traded at each region's Fishing Association for rods and rewards. The game holds all of it in tables the client keeps whole, so it can be rebuilt to the number. Its bait is crafted ([crafting](/docs/proposals/genshin/crafting)), and the points, stocks, fish, rods and the cast's and reel's rules are [built](/docs/genshin/fishing).

## Decisions

- **A point's stock is its region's pools, for now.** Each region's pools are the game's, filed by city. Neither the official map's points nor the dump's tables tie a point to one pool, so until a recording shows which pool a point draws from, a point draws from every pool of its region. Nod-Krai's city is filed under no pool, so its points draw nothing, and the fifty-four pools filed under city zero, which no region names, are left out until a recording places them.
- **Stocks come back as the game sets them.** The day's stock is drawn from six to eighteen on the game's clock and the night's otherwise, and each refills apart from the other once emptied, as the [fishing](/docs/genshin/fishing) page builds it.
- **Bait is not tied to a fish yet.** The bait table's feature tags name no fish, and no fish row names the tags it wants, so which bait draws which fish waits on the crafting recipes and a recording of a bait at work. Each kind is drawn only by its own bait, crafted from its recipe.
- **The bite is the fish's own.** A fish nibbles for a time within its feeler range and bites, and the bite is struck within its `biteTimeout` or lost. The timing and the caller's clock are not yet built.
- **The reel's zone moves by the fish's own fields.** The moving zone's width, speed, offset and duration are the fish's, and the reel takes the zone as its input meanwhile. How the zone travels over its duration waits on a recording of the minigame, as the tension rate and the allowance do.
- **The fish fights back with its skills.** Each fish's skills from `FishSkillExcelConfigData` act on the tension and the hit points on a clock of their own; the rod's pull and the struggles are read from the skill rows once the reel's zone is.
- **The stock limits stay unread.** Each pool's two limit numbers have scrambled names, and their meaning is not settled by any table here, so they wait on a reading.
- **What a catch gives.** The fish itself into the bag, its reward row, and proficiency toward the Fishing Association's rewards, exchanged at its shop ([shops](/docs/proposals/genshin/shops)).
- **Opened as the game opens it**, once the Serenitea Pot is owned and its quest is done, as the wiki gives the unlock.

## How it works

```mermaid
stateDiagram-v2
  [*] --> Aiming: at a fishing point, rod out
  Aiming --> Waiting: cast
  Waiting --> Aiming: the lure within a fish's flee range, it flees
  Waiting --> Biting: a fish within attract range takes the bait
  Biting --> Aiming: not struck within its bite timeout
  Biting --> Reeling: struck
  Reeling --> Caught: its health worn to none
  Reeling --> Aiming: the tension out of the zone too long
  Caught --> [*]
```

## Scope and order

**Built** ([fishing](/docs/genshin/fishing)): the fishing points by region, the fish, rods and each region's pools, the day and night stocks and their refill, the weighted draw, the lure's reaction and the reel's tension and allowance.

**This adds, in order:**

1. **The bite and the nibbles**, on the fish's timeout and feeler range, with the cast's `Biting` phase.
2. **The reel's zone and the fish's skills**, once a recording shows how the zone travels and the rod's pull is set.
3. **Bait and the rod's choice**, from the bait table's tags, the crafting recipes and the rod's multiplier and accuracy.
4. **The screen, the prompt in reach, the cast's input and the catch into the bag.**
5. **The Fishing Associations' exchanges.**

## Data and measures

- **Read from the game's tables:** `FishSkillExcelConfigData`, `FishBaitExcelConfigData` and `FishProficientExcelConfigData` are not read yet; the fish, pool, stock and rod tables are.
- **Waiting on a recording:** the reel's tension rate and its allowance, the zone's travel over its duration, and which pool a point draws from. Each is listed on the [roadmap](/docs/genshin/roadmap)'s Recordings owed list, and a provisional constant holds each meanwhile.

## Key files

| File                                                                           | Role after the change              |
| :----------------------------------------------------------------------------- | :--------------------------------- |
| `packages/genshin-world/src/services/interaction/computeInteractionPrompts.ts` | Offers fishing at a point in reach |
| `packages/genshin-engine/src/input/InputActionBindingMap.ts`                   | The cast, strike and reel          |
| `packages/genshin-world/src/services/inventory/addInventoryItem.ts`            | The fish caught, into the bag      |
| `packages/genshin-world/src/models/screen/ScreenKind.ts`                       | Gains the fishing view             |

## Sources

- [Fishing](https://genshin-impact.fandom.com/wiki/Fishing), Genshin Impact Wiki: the unlock after the Serenitea Pot, one bait per fish, the cast's distance, the bite and the tension, points emptied and back every 72 hours with separate day and night fish, and the Fishing Associations.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the tables of fish, pools, stocks, skills, rods, baits and proficiency.
