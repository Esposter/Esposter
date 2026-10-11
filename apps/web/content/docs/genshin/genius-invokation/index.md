---
title: Genius Invokation TCG
description: The card game in the world, its rules engine, its decks and its duel board, each on its own page. A duel is a plain state over two sides, played through the engine's public functions and opened from a resident's talk. No duel is seated yet, since no challenger with a built deck stands in a built region's residents.
---

# Genius Invokation TCG

The card game is a rules engine of its own in `genshin-world`: a duel is a plain state over two sides, advanced by the actions a duel answers, and it shares only the elements with the world. This section is what is built of [Genius Invokation TCG](/docs/proposals/genshin/genius-invokation).

| Page                                                     | What it holds                                                                                                                   |
| :------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| [Rules](/docs/genshin/genius-invokation/rules)           | The engine: the standard rule, dice and rerolls, rounds and turns, energy, reactions, damage, defeats and the phases' hooks     |
| [Decks](/docs/genshin/genius-invokation/decks)           | The characters, skills and action cards each built deck plays, their card modules, the opponent decks and the words they show   |
| [Duel board](/docs/genshin/genius-invokation/duel-board) | How a talk opens a duel, the board's choices, the session host, the opponent's policy and the frame the board is judged against |

## The data is the dump's

`genshin:assets gcg` publishes the standard rule and one record per opponent deck (`gcg/standardRule` and `gcg/deck<id>`) from the dump's `GCGDeckExcelConfigData`, `GCGCharExcelConfigData`, `GCGSkillExcelConfigData`, `GCGCardExcelConfigData` and `GCGCostExcelConfigData`, and `gcg/games` from the game table. Each row's obfuscated keys are unread: the plain fields carry everything a duel reads, and each cost type must be named by the cost table or the build refuses. The [rules](/docs/genshin/genius-invokation/rules) page covers what the standard rule holds, and the [decks](/docs/genshin/genius-invokation/decks) page what each deck record holds.
