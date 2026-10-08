---
title: Interaction
description: Proposal — the F prompts mounted over the world once it places something to act on. The prompt list drawn beside the character from the selector's rows, the mouse wheel read by the input, a held F repeating its pick ups at the game's interval, and the reach, the window's rows and that interval measured off a recording of the game.
model: claude-opus-5-5
---

# Interaction

This page builds on [interaction](/docs/genshin/interaction), whose selector rows what is in reach and whose prompt list draws it, and on the [character controller](/docs/genshin/character-controller), whose body reach is measured from. The rules are built; what is left is the world placing things to act on, the wheel and the held F reaching the selector, and the numbers measured off the game.

## Decisions

- **The prompts mount with the first thing the world places.** The world screen draws `InteractionPrompts` beside the character from `computeInteractionPrompts` each frame, once something in the world is an `Interactable`: drops with enemies, characters with quests, and waypoints with [exploring](/docs/proposals/genshin/exploring). Until then the world has nothing to act on, and no empty list is drawn.
- **The wheel is an input axis.** `input` reads the mouse wheel's notches since the last read beside the move and the look, and the world steps the selection by them through `stepInteractionSelection`, so no listener of the prompts' own reads the wheel.
- **A held F repeats at the game's interval.** A press of `InputAction.Interact` acts once on the selected row. While it is held, the world picks up `getHeldPickUp`'s item once each interval, the interval read off the recording below.
- **Three numbers come from one recording.** A clip of the English PC client at 1080 high and 60 frames a second: the character walking slowly up to a lone item from several metres away, then standing in a pile of more drops than the list shows, the wheel turned from the first row to the last, then F held until the pile is gone. It answers the reach (the distance at which the prompt appears, read by the [recreation passes](/docs/proposals/genshin/recreation-passes)' motion pass), the window's rows (counted on a frame with the list full) and the held F's interval (frames between two pick ups). A published video is searched first.

## Scope and order

**Today:** the selector, the wheel's step, the held F's choice and the prompt list are built; nothing in the world is an interactable.

**This adds, in order:**

1. **The recording**, and the three numbers read off it into `packages/genshin-world/src/services/interaction/constants.ts`.
2. **The wheel's axis** in the engine's input.
3. **The prompts over the world**, with the held F's repeat, when the first page places an interactable.

## What this does not propose

- **The prompt list's look.** Its sizes, colours and the kinds' icons are measured and traced in the [recreation passes](/docs/proposals/genshin/recreation-passes).
- **What each interaction opens.** A chest's loot, a dialogue and a book's pages each belong to the page that adds that content.

## Key files

| File                                                           | Role after the change                                            |
| :------------------------------------------------------------- | :--------------------------------------------------------------- |
| `packages/genshin-world/src/components/World/Screen/Index.vue` | Mounts the prompt list and repeats a held F's pick ups           |
| `packages/genshin-world/src/services/interaction/constants.ts` | The reach, the window's rows and the held F's interval, measured |
| `packages/genshin-engine/src/input/createInput.ts`             | Reads the mouse wheel's notches beside the move and the look     |

## Sources

- [Controls](https://genshin-impact.fandom.com/wiki/Controls), Genshin Impact Wiki: the default bindings for Pick Up and Interact, F on a keyboard, X on an Xbox pad and Square on a PlayStation's.
