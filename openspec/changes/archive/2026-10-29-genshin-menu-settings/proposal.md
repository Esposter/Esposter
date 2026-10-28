# Menu Settings screen

## Why

The Paimon menu opens a Settings screen whose tabs and rows are drawn, but the world does not open it, so its rows change nothing. The rows the world backs need to work, and their settings need to be kept on the player's device, as the game keeps them.

## What Changes

The Settings screen opens from the Paimon menu's side bar, and each row the world backs changes the game.

- Graphics Quality chooses one of the renderer's quality tiers, kept on this device.
- Volume, Music Volume and SFX Volume set a level from 1 to 10 for the music and the sound effects.
- Game Language offers the game's fifteen languages, and the screen's labels follow the choice.
- A row the world does not back is drawn disabled, showing the value the game's recording shows.
- The Controls tab's defaults follow once the follow camera change supplies them.

## Capabilities

- **genshin/menu-settings** (new)

## Waiting on

- The Controls tab's sensitivities and default distance are the follow camera's values, so they wait on `openspec/changes/genshin-follow-camera/`, once the interface export holds the Settings screen.

## Impact

The Settings entry of the Paimon menu, the Settings screen and its tabs, the renderer's quality tiers, the music and sound effect levels, the game's labels in its fifteen languages, and the settings the browser keeps on each device.
