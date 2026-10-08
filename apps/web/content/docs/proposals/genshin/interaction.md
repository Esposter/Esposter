---
title: Interaction
description: Proposal — the held F's interval, the prompt list's window and the reach, each read off a recording of the game. The prompts over the world, the drops and residents in reach, F, the wheel and a held F's repeat are built, and the three numbers are provisional until the recording measures them.
model: claude-opus-5-5
---

# Interaction

This page builds on [interaction](/docs/genshin/interaction), whose prompts, drops, residents, F, the wheel and a held F's repeat are built. What is left is the three numbers the game settles and this page cannot yet: the reach, the window's rows and the held F's interval, each provisional until measured.

## Decisions

- **Three numbers come from one recording.** A clip of the English PC client at 1080 high and 60 frames a second: the character walking slowly up to a lone item from several metres away, then standing in a pile of more drops than the list shows, the wheel turned from the first row to the last, then F held until the pile is gone. It answers the reach (the distance at which the prompt appears, read by the [recreation passes](/docs/proposals/genshin/recreation-passes)' motion pass), the window's rows (counted on a frame with the list full) and the held F's interval (frames between two pick ups). A published video is searched first.

## Scope and order

**Today:** the prompts, the drops and residents in the world, F, the wheel and the held F's repeat are built, with the three numbers as provisional constants in `packages/genshin-world/src/services/interaction/constants.ts`.

**This adds:** the three numbers, read off the recording through the compute-queue items in the [genshin roadmap](/docs/genshin/roadmap).

## What this does not propose

- **The prompt list's look.** Its place, sizes, colours and the kinds' icons are measured and traced in the [recreation passes](/docs/proposals/genshin/recreation-passes).
- **What each interaction opens.** A chest's loot, a dialogue's content and a book's pages each belong to the page that adds that content.

## Key files

| File                                                           | Role after the change                                            |
| :------------------------------------------------------------- | :--------------------------------------------------------------- |
| `packages/genshin-world/src/services/interaction/constants.ts` | The reach, the window's rows and the held F's interval, measured |
