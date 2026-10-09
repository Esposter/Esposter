---
title: Interaction
description: Proposal — the held F's interval, the prompt list's window and the reach, each read off a recording of the game. The prompts over the world, the drops and residents in reach, F, the wheel and a held F's repeat are built, and the three numbers are provisional until the recording measures them.
model: claude-opus-5-5
needs: [game-install, media-engine]
waiting: "the reach needs a motion measure (a camera solve on the clip and the item's world position) that no command produces yet; the window rows and held F interval are the queued world-prompt-rows item"
---

# Interaction

This page builds on [interaction](/docs/genshin/interaction), whose prompts, drops, residents, F, the wheel and a held F's repeat are built. What is left is the three numbers the game settles and this page cannot yet: the reach, the window's rows and the held F's interval, each provisional until measured.

## Decisions

- **Three numbers come from one recording.** A clip of the English PC client at 1080 high and 60 frames a second: the character walking slowly up to a lone item from several metres away, then standing in a pile of more drops than the list shows, the wheel turned from the first row to the last, then F held until the pile is gone. It answers the reach (the distance at which the prompt appears, read by the [recreation passes](/docs/proposals/genshin/recreation-passes)' motion pass), the window's rows (counted on a frame with the list full) and the held F's interval (frames between two pick ups). A published video is searched first.
- **The clip is captured and its stills are written.** `captures/world-pickup.mkv` holds the recording, 30 seconds long, and `frames/world-pickup@0/` its 1800 stills at 60 a second. The compute queue's count of the window's rows and the held F's interval reads those stills, so those two numbers wait on no recording.
- **The reach waits on a measure that does not exist yet.** The stills do not give the distance from the body to the item at the frame its prompt appears: no compute-queue command turns a frame into that distance, and the motion pass does not yet read the character's walk against the camera for this clip. The reach stays provisional until a motion item is queued and its measure written.

## Scope and order

**Today:** the prompts, the drops and residents in the world, F, the wheel and the held F's repeat are built, with the three numbers as provisional constants in `packages/genshin-world/src/services/interaction/constants.ts`.

**This adds:** the three numbers, read off the recording through the compute-queue items in the [genshin roadmap](/docs/genshin/roadmap).

## What this does not propose

- **The prompt list's open look.** Its rows, cap, pill and place are built against the pickup at 1080 high ([interaction](/docs/genshin/interaction#parity)). What stays open is the item icons (the game's art, which nothing ships), the kinds' icons, the selection's move and the pill's right end, each waiting on a recording the [roadmap](/docs/genshin/roadmap) lists as owed.
- **What each interaction opens.** A chest's loot, a dialogue's content and a book's pages each belong to the page that adds that content.

## Key files

| File                                                           | Role after the change                                            |
| :------------------------------------------------------------- | :--------------------------------------------------------------- |
| `packages/genshin-world/src/services/interaction/constants.ts` | The reach, the window's rows and the held F's interval, measured |
