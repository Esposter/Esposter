# Investigation Daily Reset

## Why

The daily cap of investigations counts a game day, and no code finds where one turns over: the game's daily reset, at four in the morning on its own clock. Nothing keeps a count per game day yet, so the cap has no day to count in. The rule sat in the built spec, which holds only what exists, so it is recorded here until it is built.

## What Changes

The investigation count is kept from the game's latest daily reset, so investigations made before the reset do not count toward the new day.

## Capabilities

- **genshin/investigation** (modified)

## Waiting on

- The store that keeps the game day's count, which is not built.

## Impact

- The investigation services in the Genshin world: the reset that a game day starts at and the count the cap compares.
