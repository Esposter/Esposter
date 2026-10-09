---
title: Genius Invokation TCG
description: Proposal — the card game against its residents, past its rules engine, which is built: each card's effect is a module over the engine's shared effects, the duel is played on a screen at a resident's table, and invitationals, tavern challengers, the Card Shop and the Player Level follow.
model: claude-opus-5-5
---

# Genius Invokation TCG

The card game's rules engine is built, so [Genius Invokation TCG](/docs/genshin/genius-invokation) is what stands. This proposal is what is left of it: each card's module, the duel screen opened from a resident's talk, and the duels, decks and rewards the game gives beyond the tutorial. The talk it is opened from is the [dialogue](/docs/genshin/dialogue)'s, which is built.

## Decisions

- **Each card's effect is a module.** The game keeps its cards' behaviour in configs under `BinOutput/GCG`, which are written as each card's module over the engine's shared effects, from the card's own description where the configs are not read, as a character's kit is. A skill that names a shared effect, such as `Effect_Damage_<element>_<n>`, needs no module of its own; a character's own `Char_Skill_<id>` script is one.
- **Every card is the game's own row.** Characters, skills, costs and cards come from the `GCGCharExcelConfigData`, `GCGSkillExcelConfigData`, `GCGCostExcelConfigData` and `GCGCardExcelConfigData` tables, and names and descriptions are the game's by text id. The standard rule and the reactions are already read from the rule and reaction tables.
- **Duels are against the game's opponents.** The residents the game seats for an Invitational and the tavern's challengers play the decks `GCGDeckExcelConfigData` gives them. Winning earns their cards and Lucky Coins, the Card Shop sells cards for Lucky Coins, and the player's Player Level grows by duels, as the game earns each.
- **Opened at Adventure Rank 32 with its tutorial quest**, as the wiki gives it.
- **No duel against another player.** Duels with friends need other players, which [co-op](/docs/genshin/deferred/co-op) defers; the game gives them no reward either.

## Scope and order

**Today:** the rules engine stands on the standard rule, with its calls on its [as-built page](/docs/genshin/genius-invokation). No card has a module and no screen opens a duel, so nothing can be played.

**This adds, in order:**

1. **The tutorial's starting characters and their cards**, each character's skills and each action card in the tutorial's decks given the module the engine needs to play it.
2. **The duel screen**, opened from a resident's talk.
3. **Every card's module**, in the order the game's opponents use them.
4. **Invitationals, tavern challengers, the Card Shop and the Player Level.**

## Data and measures

- **Read from the game's tables:** the `GCG*` tables and the configs under `BinOutput/GCG`. The tables are fetched into the dump beside the standard rule's, and only the slices a duel loads are written into the world.
- **Read from the wiki:** each card's effect where its configs are not read, and each duel rule's detail.
- **Measured:** the duel screen's layout off a recording, through the recreation passes.

## Key files

| File                                                     | Role after the change                          |
| :------------------------------------------------------- | :--------------------------------------------- |
| `packages/genshin-world/src/models/world/Resident.ts`    | A resident who challenges the player to a duel |
| `packages/genshin-world/src/models/screen/ScreenKind.ts` | Gains the duel's screen                        |
| `packages/genshin-text/src/models/GameTextKey.ts`        | Gains the duel's interface words               |

## Sources

- [Genius Invokation TCG](https://genshin-impact.fandom.com/wiki/Genius_Invokation_TCG), Genshin Impact Wiki: the unlock at rank 32 and the tutorial quest, duels against characters and NPCs, unrewarded duels with friends, character and action cards, and the Card Shop and Lucky Coins.
- [Come Try Genius Invokation TCG!](https://genshin-impact.fandom.com/wiki/Come_Try_Genius_Invokation_TCG!), Genshin Impact Wiki: the tutorial's duels, the tutorial deck and the characters its quest gives.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the GCG card, character, skill, cost and deck tables, and the GCG configs.
