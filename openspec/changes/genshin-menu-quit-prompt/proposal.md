# Menu quit prompt

## Why

The Paimon menu's Quit Game opens an exit prompt whose buttons work, but the prompt is drawn at a provisional scale and has never been scored over its whole frame. Until it is drawn at the game's own scale, its size and placement cannot be checked against the game's prompt.

## What Changes

The exit prompt opened from Quit Game is drawn at the game's own scale, so it matches the game's prompt in size and placement.

- The prompt is drawn at the scale of the game's own exit prompt, taken from a public recording, instead of a provisional scale.
- Continue Game, Exit to Login Interface and Exit to Desktop keep their outcomes.

## Capabilities

- **genshin/menu-quit-prompt** (new)

## Waiting on

None.

## Impact

The Quit Game entry of the Paimon menu, the exit prompt and its three buttons, and the parity reference that holds the prompt's frame. A re-measure from a longer clip is a later check and does not hold the build.
