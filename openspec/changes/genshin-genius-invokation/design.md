# Genius Invokation TCG

The card game's rules engine is built, so [Genius Invokation TCG](../../specs/genshin/genius-invokation/README.md) is what stands. This proposal is what is left of it: each card's module, the duel screen opened from a resident's talk, and the duels, decks and rewards the game gives beyond the tutorial. The talk it is opened from is the [dialogue](../../specs/genshin/dialogue/design.md)'s, which is built.

## Decisions

- **Each card's effect is a module.** The game keeps its cards' behaviour in configs under `BinOutput/GCG`, which are written as each card's module over the engine's shared effects, from the card's own description where the configs are not read, as a character's kit is. A skill that names a shared effect, such as `Effect_Damage_<element>_<n>`, needs no module of its own; a character's own `Char_Skill_<id>` script is one.
- **Every card is the game's own row.** Characters, skills, costs and cards come from the `GCGCharExcelConfigData`, `GCGSkillExcelConfigData`, `GCGCostExcelConfigData` and `GCGCardExcelConfigData` tables, and names and descriptions are the game's by text id.
- **Duels are against the game's opponents.** The residents the game seats for an Invitational and the tavern's challengers play the decks `GCGDeckExcelConfigData` gives them. Winning earns their cards and Lucky Coins, the Card Shop sells cards for Lucky Coins, and the player's Player Level grows by duels, as the game earns each.
- **Opened at Adventure Rank 32 with its tutorial quest**, as the wiki gives it.
- **The Player Level is the game's level table.** `GCGLevelExcelConfigData` holds ten levels, each with the EXP that passes it (the tenth passes none) and its reward id. A player who has finished the tutorial quest holds level one at no EXP. A challenger's games open by the level its week row names: Marjorie's `levelCondList` opens game 1021 at level 1 and the next four at levels 3, 5, 7 and 10, so a challenger offers each game once the Player Level reaches its level. The ladder is read as the Friendship Levels' is, by one shared rule, never a twin of it.
- **Seating is estimated from the wiki.** The challengers are absent from the dump's NPC birth records: neither NPC 9701 nor 9704 is among the NPCs the open world places there, so the [scene group record](../../specs/genshin/scene-groups/design.md) holds no member for either. Each one's seat is estimated from the wiki's location for that challenger, marked provisional.
- **A further deck is a record of the hosted game data.** Each is a `gcg/deck<id>` record and more card text in every language, published by `genshin:assets gcg` and `genshin:text gcg`, with an entry of `GcgDeckLoaderMap` reading it by key. Its card modules are code and are written with the deck they serve.
- **No duel against another player.** Duels with friends need other players, which [co-op](../../deferred/genshin/co-op/design.md) defers; the game gives them no reward either.
- **The Player Level and the Friendship Level read one rule.** `computeLevelReached` counts the levels an EXP total has reached over any table of `{ exp }` rows, so the card game's level and the companionship level are the same function.

## Scope and order

**Standing:** the [as-built page](../../specs/genshin/genius-invokation/README.md) holds the rules engine, the decks already built and the duel board, which opens from a resident's talk. No duel is seated yet: the two challengers whose decks are built, Marjorie and Ellin, have no resident row in the regions' data. Every resident holds their standing talk, which offers a seated challenger's duel as a reply.
**This adds, in order:**

1. **The Player Level and the games it opens.** Left: `genshin:assets gcg` writing the slice from `toGcgLevels.ts`, and `services/gcg/readGcgLevels.ts` reading it with its schemas. Both wait on the hosted game data, since the slice is published to Blob storage and never written into `generated/`. **Publish, for the Mac:** once the hosted game data is built, the slice goes through `publishGameDataStep` with its `writeGcgLevels` dry run.

2. **Seating the challengers**, at the wiki's estimated seats. Marjorie (NPC 9701, game 1021 with deck 11005) and Ellin (NPC 9704, game 1031 with deck 11002) are seated on their NPCs once the region that holds their residents is written. Each seated challenger's talk is their standing talk, published with every resident's by `genshin:text standing-talks`, and its opening line offers the duel reply `191219274`, so no talk is written for a seat.
3. **The other opponent decks**, the invitationals', the tavern challengers' and the rest the duel rows name, each given the modules its cards and skills need. The decks the early duels play are built, and the as-built page records them. Each is published as its `gcg/deck<id>` record and read through `GcgDeckLoaderMap`.
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

## Reference

- `gcg-swirl-spread.mkv` — a duel's Swirl on a team whose other characters hold an aura, 15 seconds at most; whether its spread applies the aura's element and reacts is read from it, where the engine settles it as damage only ([Genius Invokation TCG](../../specs/genshin/genius-invokation/README.md)). On the wiki and YouTube, none found (searched 2026-10-11).
