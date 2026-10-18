# Special Story Mode

## Why

Some story quests restrict the player while one of their steps is active: the Paimon menu cannot be opened, and some steps also limit the player to a place or a character. The wiki lists these quests and their restrictions, and the game's own data marks each restricted step, but the world plays every story step the same, so a player can open the Paimon menu in a step the game closes it in.

## What Changes

- While the active step of a quest is restricted, the Paimon menu stays closed: Escape, the Start button and the Paimon menu shortcut do nothing.
- A step with no restriction opens the Paimon menu as it does now.
- The quest data carries each step's restriction, read from the game's own quest table.

## Capabilities

- **genshin/special-story-mode** (new)

## Waiting on

- `agent/data-quests`: the quest builder must carry each step's restriction into the quest dataset. This change cannot take effect until that dataset ships the field.
- The rest of each restriction, the place or character a step limits the player to and the map and transport it bans, is read from the client's own scripts, which only the PC export holds. Those locks wait on that export.
- Leaving the mode from the top left corner and the story review on return are a later change.

## Impact

Adds the restriction to the quest step, and the Paimon menu's open check reads it. The quest dataset's shape changes, so its publish is the main session's.
