# Menu Time screen

## Why

The Paimon menu's side bar reaches a Time screen that it does not yet draw. Time is the game's own control of the clock, and the world has no way for the player to move the hour, so the screen is needed to set the world's clock.

## What Changes

The Time screen opens from the Paimon menu and sets the world's hour to a target the player dials.

- The dial sets an advance of at least thirty minutes and at most two days ahead, never backward.
- Confirm sets the world's clock to the target minute, and the world runs on from the hour set.
- Each whole turn of the dial counts as a day.
- The world gets no other clock control of its own.

## Capabilities

- **genshin/menu-time** (new)

## Waiting on

None.

## Impact

The Time entry of the Paimon menu, the world's clock and the hour it shows, and the game's labels for the Time screen. The screen is laid out from a public clip until the player's own recording lands; its comparison is a later check.
