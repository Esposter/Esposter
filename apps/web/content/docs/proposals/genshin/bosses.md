---
title: Bosses
description: Proposal — the game's bosses as it runs them. A normal boss waits in its arena near a waypoint, fights by its own moves, and leaves a Trounce Blossom claimed for 40 resin; a weekly boss waits in its trounce domain once its quest is done, its reward claimed once a week, and their materials are the ones characters ascend and talents rise past six with. The claim's respawn and the weekly reset and count are built.
model: claude-opus-5-5
touches: ["packages/genshin-world/src/services/bosses/**"]
---

# Bosses

A boss is an enemy whose reward is claimed, not dropped. A normal boss gives the material each character ascends with, and a weekly boss the material talents need past level 6, so the character screen's ascension and the talents lean on them. The [enemies](/docs/genshin/enemies) already place a boss's camp, respawn it at once and drop nothing for it, leaving its reward to its blossom; this page is that blossom and the fight before it. It waits on [Original Resin](/docs/proposals/genshin/original-resin)'s claim, the [domains](/docs/proposals/genshin/domains)' scenes the trounce domains are, and the [character kits](/docs/proposals/genshin/character-kits) that fight them. The respawn after a claim and the weekly reset and count are [built](/docs/genshin/bosses); this page keeps the rest.

## Decisions

- **A normal boss waits in its arena.** It stands idle at its arena's centre until a player comes too close or strikes it, as the wiki describes, which the enemies' notice already models. A few are fought only after a world quest's step or a simple puzzle, named with their camp.
- **Each boss fights by its own moves.** A boss's attacks, phases and shields are a module per boss over the enemies' step, its states, its notice and its leash kept as they are. Each module is written from the wiki's page of that boss, and its timings measured off recordings, as the controller's are. Bosses resist displacement, carry high interruption resistance and are never frozen by Frozen: the first two are the boss's poise type, and the last an immunity [combat](/docs/genshin/combat)'s Frozen learns to check.
- **A normal boss leaves a Trounce Blossom.** Its reward, Adventure EXP, Mora, Companionship EXP, its own ascension material and artifacts by World Level, is claimed for 40 resin. The boss comes back five seconds after the claim; left unclaimed, it stays defeated until the player teleports away, as the game does, which replaces the enemies' respawn "at once" for a boss. The respawn rule is built; the blossom's offer and its rewards are not.
- **A normal boss's claim pays its Mora and its own drop by World Level, from the wiki.** No table counts a normal boss's claim: its `RewardPreviewExcelConfigData` rows (such as `无相之风_90级`, the Anemo Hypostasis's) list its items with their counts mostly blank, and no blossom row names a boss. So the counts are the Basic Drops tab of the wiki's `Template:World_Boss_Rewards`, its normal branch: the Mora a fixed count, and the boss's own drop a guaranteed count plus one more at a chance. Its Adventure EXP column, 200, is the claim's 40 resin at five a point, and its Companionship EXP column is the grant's, so the claim's draw holds neither, as [Original Resin](/docs/proposals/genshin/original-resin) decides. Its Character EXP column waits on the enemies' Character EXP, which the world does not give yet. The boss's gems and artifacts are the wiki's other tabs, read with the first boss.
- **A weekly boss waits in its trounce domain.** Its domain opens once the Archon or story quest that introduces it is done, every day of the week, and is entered as any [domain](/docs/proposals/genshin/domains) is. Andrius alone is fought in the open world. From Adventure Rank 40, a locked one can be challenged from the handbook alone.
- **A weekly claim is once a week.** Each weekly boss's reward is claimed once a week, at the price [Original Resin](/docs/genshin/original-resin) already gives. The week's count and its reset are built; the once-a-week gate for each boss is not.
- **What a weekly boss gives.** Its talent materials, Adventure EXP, Mora, Companionship EXP, ascension gems and artifacts by World Level, with a 12% chance of a billet for forging and a 33% chance of a Dream Solvent, as the wiki gives them. Its highest difficulty's first clear also gives one of each of its materials, claimed in the handbook.

## How it works

```mermaid
stateDiagram-v2
  [*] --> Idle: in its arena
  Idle --> Fighting: approached or struck
  Fighting --> Defeated: health reaches zero
  Defeated --> Claimed: Trounce Blossom claimed with resin
  Defeated --> Idle: the player teleports away
  Claimed --> Idle: five seconds later
```

## Scope and order

**Built:** the [bosses page](/docs/genshin/bosses) holds the claim and count rules.

**This still adds, in order:**

```text
packages/genshin-world/src/services/bosses/
├── drawNormalBossReward.ts
└── drawNormalBossReward.test.ts
```

1. **A normal boss's claim draw.** Add `drawNormalBossReward.ts`: for a World Level, the boss's own drop's item id and a random source, the claim's Mora and drop as `ItemCount[]`, read from two lists in `services/bosses/constants.ts`, one row per World Level from the Basic Drops tab of `Template:World_Boss_Rewards` (read through the persona's `readWikiPageText`). `NORMAL_BOSS_MORA` holds 3,450 at World Levels 0 and 1, then 3,650, 3,850, 4,125, 4,450, 4,725, 5,200 and 6,000 to World Level 8. `NORMAL_BOSS_UNIQUE_DROPS` holds each level's guaranteed count and its chance of one more: 1 and 61.85% at World Levels 0 and 1, then 1 and 70.37%, 1 and 87.41%, 2 and 4.45%, 2 and 21.49%, 2 and 38.52%, and 2 and 55.56% at World Levels 7 and 8. World Level 9's row is read from the same tab. Test: `drawNormalBossReward.test.ts`, asserting that World Level 0 with a random of 0.9 gives 3,450 Mora and one drop and with 0.1 two, and that World Level 4 with 0.9 gives two.
2. **The Trounce Blossom and its claim**, with the respawn wired to the defeat map, for the first normal boss in Mondstadt, the Anemo Hypostasis: its place the official map's one point under its label, carried by the [spawned places](/docs/genshin/spawned-places) fit, its kind from the monster table, its blossom on defeat claimed through Original Resin's `claimBlossom` with `drawNormalBossReward` as its draw.
3. **The first boss's own moves**, then each boss's as its region is built.
4. **Weekly bosses**, in their trounce domains, with the once-a-week gate for each boss.
5. **The handbook's quick challenge and first-clear rewards.**

## Data and measures

- **Read from the game's tables:** each boss's kind from the monster table, which the enemies' run already reads, the trounce domains from the dungeon table, and each boss's items from its reward preview rows. The dump's blossom tables hold the ley lines' and Dragonspine's rows only, and no table counts a boss's claim.
- **Read from the wiki:** each boss's moves and phases, and its claim's counts by World Level (`Template:World_Boss_Rewards`).
- **Measured:** each boss's attacks' timings, ranges and speeds, off recordings of the fight, provisional until then.

## Key files

| File                                                                   | Role after the change                               |
| :--------------------------------------------------------------------- | :-------------------------------------------------- |
| `packages/genshin-world/src/services/enemy/stepEnemy.ts`               | Hands a boss's moves to its module, its states kept |
| `packages/genshin-world/src/services/enemy/computeEnemyRespawnTime.ts` | A boss back by its claim's time, not at once        |
| `packages/genshin-world/src/services/enemy/computeEnemyDrops.ts`       | Still nothing for a boss, its reward the blossom's  |
| `packages/genshin-world/src/services/enemy/EnemyKindTraitsMap.ts`      | Each boss's poise type and immunities               |
| `scripts/src/services/genshinAssets/enemies/buildEnemyKinds.ts`        | Builds the bosses' kinds as it builds every camp's  |

## Sources

- [Normal Bosses](https://genshin-impact.fandom.com/wiki/Normal_Bosses), Genshin Impact Wiki: arenas near waypoints, idle until approached, immune to Frozen and resistant to displacement, the Trounce Blossom for 40 resin and its rewards.
- [Weekly Bosses](https://genshin-impact.fandom.com/wiki/Weekly_Bosses), Genshin Impact Wiki: trounce domains opened by quests, Andrius in the open world, the quick challenge from Adventure Rank 40, the rewards with the billet's and Dream Solvent's chances, and the highest difficulty's first-clear reward.
- The Domains and Daily Reset sources are the [bosses page](/docs/genshin/bosses)'s.
