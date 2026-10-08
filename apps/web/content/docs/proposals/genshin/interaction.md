---
title: Interaction
description: Proposal — the F prompts mounted over the world in play, fed by what is in reach of the body. A defeated enemy's drops laid where it fell and picked up into the wallet or the bag, residents offered as talks, the wheel stepping the rows while more than one shows, a held F repeating its pick ups, and the reach, the window's rows and the repeat's interval measured off a recording of the game.
model: claude-opus-5-5
---

# Interaction

This page builds on [interaction](/docs/genshin/interaction), whose selector rows what is in reach and whose prompt list draws it, on [enemies](/docs/genshin/enemies), whose defeat hands on its drops, and on the [inventory](/docs/genshin/inventory), whose bag and wallet take them. The rules are built; what is left is the world placing things to act on, F, the wheel and a held F reaching the selector, and the numbers measured off the game.

## Decisions

- **The prompts mount over the world in play.** `Interaction/Prompts` draws the selector's window through `genshin-interface`'s `InteractionPrompts`, in a `prompts` slot of the HUD, so it hides wherever the HUD does: under every screen and a talk, with the HUD hidden, over a held camera and in a witness render. Each frame with the world in play, `useInteraction` runs `computeInteractionPrompts` over the world's interactables from the character's body, and hands the list on only when its rows, its selection or its window changed, so a still player re-renders nothing.
- **What is in reach is the drops and the residents.** Every drop lying in the world is a `PickUp`, named by its item's name in the reader's language, Mora by its own. Every resident of the regions in reach whose talk the world holds is a `Talk`, named from the talks' text map. A resident whose talk is not held is drawn but offered no prompt, since the game's talk prompt always opens a talk.
- **Both are drawn as stand-ins.** `World/Interactables`, in the world's group, draws each drop as a small sphere and each resident as the capsule every body stands in as until it is measured (`PROVISIONAL_LOCOMOTION`'s), one instanced mesh per kind, rewritten only when the list changes. A witness render draws none.
- **A defeated enemy's drops lie where it fell.** The enemies' `defeat` reaches the world screen through Windrise, and `placeEnemyDrops` lays them at the enemy's ground point: its Mora as one pile under Mora's item id, 202, and each material piece as a drop of its own, each named by the spawn it fell from and a count of the drops the page has placed. Character EXP is given to the party rather than dropped, and waits on levelling. Drops last the page's life.
- **F acts on the selected row.** A pick up goes through `pickUpDroppedItem`: Mora into the wallet, any other item into the bag through `addInventoryItem` by its definition ([inventory](/docs/proposals/genshin/inventory)). What the bag has no room for stays where it lay as a smaller drop. F on a `Talk` row starts the resident's talk ([dialogue](/docs/proposals/genshin/dialogue)).
- **The wheel steps the rows while more than one shows.** The input's `zoomSteps` already count the wheel's notches since the last read, so the world steps the selection by them through `stepInteractionSelection` and then spends them, and the camera does not zoom. With one row or none, the wheel zooms the camera as before. This is the reading closest to play, which the recording below confirms.
- **A held F repeats its pick up.** A press acts once. While Interact stays held past it, the world picks up `getHeldPickUp`'s item once each `INTERACTION_HELD_REPEAT_SECONDS`, a provisional interval until the recording below reads it.
- **Three numbers come from one recording.** A clip of the English PC client at 1080 high and 60 frames a second: the character walking slowly up to a lone item from several metres away, then standing in a pile of more drops than the list shows, the wheel turned from the first row to the last, then F held until the pile is gone. It answers the reach (the distance at which the prompt appears, read by the [recreation passes](/docs/proposals/genshin/recreation-passes)' motion pass), the window's rows (counted on a frame with the list full) and the held F's interval (frames between two pick ups). A published video is searched first.

## Scope and order

**Today:** the selector, the wheel's step, the held F's choice and the prompt list are built; nothing in the world is an interactable.

**This adds, in order:**

1. **The dropped items' definitions**, read from the game's material table ([inventory](/docs/proposals/genshin/inventory)).
2. **Drops and residents in the world**, their stand-ins and the prompts over them, with F, the wheel and the held F's repeat.
3. **The recording**, and the three numbers read off it into `packages/genshin-world/src/services/interaction/constants.ts`.

## What this does not propose

- **The prompt list's look.** Its place, sizes, colours and the kinds' icons are measured and traced in the [recreation passes](/docs/proposals/genshin/recreation-passes).
- **What each interaction opens.** A chest's loot, a dialogue's content and a book's pages each belong to the page that adds that content.

## Key files

| File                                                             | Role after the change                                                       |
| :--------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| `packages/genshin-world/src/components/World/Screen/Index.vue`   | Holds the drops, reads F, the wheel and a held F, and acts on the selection |
| `packages/genshin-world/src/components/World/Windrise/Index.vue` | Hands on the enemies' drops and its residents, and draws the stand-ins      |
| `packages/genshin-world/src/components/Hud/Screen/Index.vue`     | Gains the slot the prompt list is drawn in                                  |
| `packages/genshin-world/src/services/interaction/constants.ts`   | The reach, the window's rows and the held F's interval, measured            |

## Sources

- [Controls](https://genshin-impact.fandom.com/wiki/Controls), Genshin Impact Wiki: the default bindings for Pick Up and Interact, F on a keyboard, X on an Xbox pad and Square on a PlayStation's.
- [Faster item pick up](https://gamestegy.com/post/genshin-impact/322/faster-item-pick-up), GameStegy: a player's tip that the scroll wheel and F work together on the prompts.
