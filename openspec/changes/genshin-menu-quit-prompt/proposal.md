# Menu quit prompt

## Why

The Paimon menu's Quit Game opens an exit prompt that works but is drawn at a provisional scale and has never been scored over its whole frame. The current build's prompt is a different dialog from the three-choice one this project had drawn: a question with Cancel and Confirm. Until it is drawn at the game's own scale and with the game's choices, its size, placement and wording cannot be checked against the game.

## What Changes

The exit prompt opened from Quit Game is drawn as the current build draws it: the question "Are you sure you want to quit?" over the dimmed menu, with two choices, at the game's own scale.

- The prompt is drawn at the scale of the game's own exit prompt, taken from a 2026 recording, instead of a provisional scale.
- It offers Cancel and Confirm: Cancel closes it back to the menu, and Confirm leaves for the app's home.

## Capabilities

- **genshin/menu-quit-prompt** (new)

## Waiting on

None.

## Impact

The Quit Game entry of the Paimon menu, the exit prompt and its two choices, the Paimon menu that hosts it, and the parity reference that holds the prompt's frame. A re-measure from a longer clip is a later check and does not hold the build.
