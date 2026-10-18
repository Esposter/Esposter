# Imaginarium Theater

## Why

The Imaginarium Theater is the game's roguelike combat challenge. Its season schedule, difficulties, Vigor, Blessing Level and Stella rewards are already built, but the cast a player brings, the stages it is fought on, the acts and events between battles, and the Theater Lobby are not. Without them the challenge has rules and no play.

## What Changes

Build the Imaginarium Theater's play on the season's rules: the cast, the stages, the acts and events, the rewind and the Lobby.

- The Alternate Cast is the player's characters of the season's three elements plus its four special guests, at or above the difficulty's level floor.
- Each stage is fought by four performers, and a character with no Vigor left cannot perform.
- Each act offers events between battles: Battle Events, Companion events, Brilliant Blessings and Mystery Caches, the paid ones costing Fantasia Flowers.
- Vigor returns only from a Mystery Cache's option.
- A run can reroll its events and rewind to its last boss stage a limited number of times.
- Meeting an act's star challenge gives one Stella.
- The Theater opens at Adventure Rank 35 with its quest, and its Lobby is entered from the Mondstadt Library.
- Supporting Cast characters lent by friends are not part of this change.

## Capabilities

- **genshin/imaginarium-theater** (modified)

## Waiting on

- The character kits, which the stages are fought with: `openspec/changes/genshin-character-kits/`.
- Adventure Rank, which opens the Theater with its quest: `openspec/changes/genshin-adventure-rank/`.
- The Mondstadt Library's interior, which the Theater Lobby stands in.
- The cast sizes and act counts wait on their difficulty table's fields being named.

## Impact

The Theater's cast, its stages, its acts and events, and its Lobby in the open world. The party's four performers on each stage and each character's stats as fixed for a run. The season's cast read from the game's avatar config table, and the data run that writes it.

Size kept as the source page's own: splitting it is a later decision.
