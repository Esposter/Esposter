# Investigation Daily Reset

## Why

The daily cap of investigations counts a game day. The game's daily reset already exists, at four in the morning on its own clock, as `GAME_DAY_START_HOUR` and `GAME_TIME_ZONE`, and the forge's daily cap counts its points in that day. The investigation count is not kept per game day, so the cap has no day to count in. The rule sat in the built spec, which holds only what exists, so it is recorded here until it is built.

## What Changes

The investigation count is kept from the game's latest daily reset, so investigations made before the reset do not count toward the new day.

## Capabilities

- **genshin/investigation** (modified)

## Waiting on

- The store that keeps the game day's count, which is not built.

## Impact

- The investigation services in the Genshin world: the count the cap compares, taken from the game day that the existing reset constants in `originalResin/constants.ts` define, not a second reset.
