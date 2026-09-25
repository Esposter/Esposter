---
title: Diagonal movement
description: Walking diagonally in the world by pressing two direction keys, or pushing the joystick between two axes.
---

# Diagonal movement

Letting the player (and the joystick) move diagonally — up-left, down-right and so on — instead of only up, down, left and right.

**Why not:** The game is four-direction by design, and everything that reads a direction is built on that:

- **Interaction is four-way.** A sign, a chest or an NPC is interacted with from the tile the player faces, and `DEFAULT_INTERACTABLE_DIRECTION_MAP` lists only the four sides — a player left facing a diagonal could interact with nothing.
- **NPCs turn and animate four ways.** Talking to an NPC turns it to face the player (`getOppositeDirection`), and every NPC's walking animation has only the four rows.
- **Corners would be cut.** A diagonal step checks only the tile it lands on, so the player could slip between two wall tiles that touch at a corner.
- **The joystick feels worse.** Eight sectors make a thumb that is slightly off-axis walk diagonally, where four snap it to the direction meant.

So the input maps one key to one direction (`getDirectionFromCursorKeys`) and grid-engine runs with `NumberOfDirections.FOUR`.
