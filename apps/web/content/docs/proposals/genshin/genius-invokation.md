---
title: Genius Invokation TCG
description: Proposal — the card game against its residents, past its rules engine, its decks and its duel board, which are built: the board opens from a resident's talk, and what follows is a resident's talk held in the world, the game's own decks, each further card's module, and invitationals, tavern challengers, the Card Shop and the Player Level.
model: claude-opus-5-5
needs: [game-exports]
touches:
  [
    "scripts/src/services/genshinAssets/gcg/**",
    "scripts/src/models/genshinAssets/gcg/**",
    "packages/genshin-world/src/models/gcg/**",
    "packages/genshin-world/src/services/gcg/**",
    "packages/genshin-world/src/generated/gcg/**",
    "packages/genshin-world/src/services/friendship/**",
    "packages/genshin-world/src/services/profile/readCharacterProfile.ts",
    "packages/genshin-world/src/services/shared/computeLevelReached.ts",
  ]
---

# Genius Invokation TCG

The card game's rules engine is built, so [Genius Invokation TCG](/docs/genshin/genius-invokation) is what stands. This proposal is what is left of it: each card's module, the duel screen opened from a resident's talk, and the duels, decks and rewards the game gives beyond the tutorial. The talk it is opened from is the [dialogue](/docs/genshin/dialogue)'s, which is built.

## Decisions

- **Each card's effect is a module.** The game keeps its cards' behaviour in configs under `BinOutput/GCG`, which are written as each card's module over the engine's shared effects, from the card's own description where the configs are not read, as a character's kit is. A skill that names a shared effect, such as `Effect_Damage_<element>_<n>`, needs no module of its own; a character's own `Char_Skill_<id>` script is one. The modules of the tutorial deck and of decks 3 and 4 are built, as the [as-built page](/docs/genshin/genius-invokation) records.
- **Every card is the game's own row.** Characters, skills, costs and cards come from the `GCGCharExcelConfigData`, `GCGSkillExcelConfigData`, `GCGCostExcelConfigData` and `GCGCardExcelConfigData` tables, and names and descriptions are the game's by text id. The standard rule and the reactions are already read from the rule and reaction tables.
- **Duels are against the game's opponents.** The residents the game seats for an Invitational and the tavern's challengers play the decks `GCGDeckExcelConfigData` gives them. Winning earns their cards and Lucky Coins, the Card Shop sells cards for Lucky Coins, and the player's Player Level grows by duels, as the game earns each.
- **Opened at Adventure Rank 32 with its tutorial quest**, as the wiki gives it.
- **The Player Level is the game's level table.** `GCGLevelExcelConfigData` holds ten levels, each with the EXP that passes it (the tenth passes none) and its reward id. A player who has finished the tutorial quest holds level one at no EXP. A challenger's games open by the level its week row names: Marjorie's `levelCondList` opens game 1021 at level 1 and the next four at levels 3, 5, 7 and 10, so a challenger offers each game once the Player Level reaches its level. The ladder is read as the Friendship Levels' is, by one shared rule, never a twin of it.
- **Seating waits on the scene groups.** The challengers are absent from the dump's NPC birth records: neither NPC 9701 nor 9704 is among the 893 the open world places there, so their places are the `Lua/Scene/3` groups' that the scene group export reads.
- **More decks wait on the static-data host.** Each further deck is a slice of its own and more card text in every language, the kind of bulk generated data the package stops adding until the static-data host's design lands. Its card modules are code and are written with the deck they serve.
- **No duel against another player.** Duels with friends need other players, which [co-op](/docs/genshin/deferred/co-op) defers; the game gives them no reward either.

## Scope and order

**Today:** the rules engine stands on the standard rule, and the tutorial deck, decks 3 and 4, and the tutorial quest's decks 7, 30111 and 30112, each have their characters, skills and action cards built, decks 2, 11005 and 11002 too, and every duel the early opponents play is played to its end by the engine's tests. The duel board opens from a resident's talk, and no duel is seated yet: the two challengers whose decks are built, Marjorie and Ellin, have no resident row in the regions' data. The [as-built page](/docs/genshin/genius-invokation) records the calls. The world's screen holds only the quests' talks, and the standing-talk source waits on the talks system's split.

**This adds, in order:**

1. **The Player Level and the games it opens.** Add `GCGLevelExcelConfigData` and `GCGWeekLevelExcelConfigData` to `DUMP_TABLE_NAMES` in `scripts/src/services/genshinText/constants.ts`, with `GCGGameExcelConfigData`, which `writeGcgGames` already reads, and run `pnpm -C scripts genshin:text fetch`. Model the two rows in `scripts/src/models/genshinAssets/gcg/` (`ExcelGcgLevelRow`: `level`, `exp`, `rewardId`; `ExcelGcgWeekLevelRow`: `npcId`, `levelCondList` of `gcgLevel` and `levelId`). A new `toGcgLevels.ts` beside `toGcgGames.ts` turns them into one slice, `generated/gcg/levels.json`, written by `genshin:assets gcg`: `playerLevels`, each level with the total EXP that reaches it (level one at 0, each next adding the EXP that passes the one below), and `challengerGames`, each challenger's NPC id with its games and the level that opens each. In the world, `models/gcg/GcgPlayerLevel.ts` and `GcgChallengerGame.ts` with their schemas, and `services/gcg/readGcgLevels.ts` importing the slice on demand as `readGcgStandardRule.ts` does. Move `services/friendship/computeFriendshipLevel.ts` to `services/shared/computeLevelReached.ts` over any `{ exp, level }` rows, with its test, and point `services/profile/readCharacterProfile.ts` at it, so the Player Level reads the same rule. Add `services/gcg/listGcgOpenGameIds.ts`: a challenger's game ids whose level the Player Level has reached. Tests: `toGcgLevels.test.ts` (the totals add up from level one at 0, and a week row's conditions become its games by level), `listGcgOpenGameIds.test.ts` (level 3 opens a challenger's level-1 and level-3 games and not its level-5 one), and the moved `computeLevelReached.test.ts`.
2. **Seating the challengers**, once the scene group export the other machine is making places NPCs 9701 and 9704. Marjorie (NPC 9701, game 1021 with deck 11005) and Ellin (NPC 9704, game 1031 with deck 11002) are seated on their NPCs once the region that holds their residents is written. Each seated game's standing talk is written from the dialogue its NPC's talk config names: the NPC's greeting line, then the duel reply `191219274`. A line with no English text is skipped, and where an NPC has no English challenge line its talk's first line stands in. The world's screen then passes the merged talk sources in place of its quest-only talk map. **Hook:** in `components/World/Session/Index.vue`, the `talkMap` computed becomes `mergeTalks(questTalks, getStandingTalks(residents, standingTalkMap))`, once the talks system's split lands.
3. **The other opponent decks**, the invitationals', the tavern challengers' and the rest the duel rows name, each given the modules its cards and skills need. The decks the early duels play are built, and the as-built page records them. Their slices are delivered through the static-data host the pending design picks, so they wait on that design (the other machine).
4. **Invitationals, tavern challengers, the Card Shop, and the EXP the duels pay into the Player Level.**

## Data and measures

- **Read from the game's tables:** the `GCG*` tables and the configs under `BinOutput/GCG`. The tables are fetched into the dump beside the standard rule's, and only the slices a duel loads are written into the world.
- **Read from the wiki:** each card's effect where its configs are not read, and each duel rule's detail.
- **Measured:** the duel board's layout against a whole-frame public recording of the board, which scores its tints, words and places. Its card art, ornate frame and profile plates are the game's and are not drawn, so they stay in the score until the user accepts the layout.

## Key files

| File                                                             | Role after the change                                                              |
| :--------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| `packages/genshin-world/src/components/World/Session/Index.vue`  | Begins a resident's talk, its talks the quests' until the merged list is passed in |
| `scripts/src/services/genshinAssets/residents/writeResidents.ts` | Writes each resident's talk id, not yet the talk's own lines                       |

## Sources

- [Genius Invokation TCG](https://genshin-impact.fandom.com/wiki/Genius_Invokation_TCG), Genshin Impact Wiki: the unlock at rank 32 and the tutorial quest, duels against characters and NPCs, unrewarded duels with friends, character and action cards, and the Card Shop and Lucky Coins.
- [Come Try Genius Invokation TCG!](https://genshin-impact.fandom.com/wiki/Come_Try_Genius_Invokation_TCG!), Genshin Impact Wiki: the tutorial's duels, the tutorial deck and the characters its quest gives.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the GCG card, character, skill, cost and deck tables, and the GCG configs.
