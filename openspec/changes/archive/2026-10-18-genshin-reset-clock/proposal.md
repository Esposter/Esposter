# Reset clock

## Why

The world's daily, weekly and monthly resets were worked out in several places, each with its own zone and constants. The shops kept the 04:00 hour and the Monday and first-of-month days as constants of their own; the Original Resin refill day and the Forging cap counted the game day from another copy; the enemies' and the bosses' resets were read in the reader's own time zone; and the mining outcrops' respawn had a function of its own. A player in another zone saw the daily reset on another day, and the same moment could fall in one week for one system and another week for a second. One clock that every system reads makes the resets agree.

## What Changes

The world reads every daily, weekly and monthly reset on the server's clock, the Asia server's: the daily reset at 04:00 in `Asia/Shanghai`, the weekly reset on Monday at that hour, and the monthly reset on the first at that hour. One module owns the zone, the hour, and the weekday and day constants, with functions for the last and the next reset of each kind from a moment. Every system reads that module, and each copy it replaces is deleted, with no fallback or alias.

- The game day turns at the daily reset, and the Primogem refills, the Forging cap, the investigation count and the commissions' day count are counted from it.
- Enemies and bosses reset on the server's clock rather than on the reader's own time zone.
- A mined mining outcrop comes back at the next 04:00 reset, read on the server's clock. The Mining Outcrop wiki page gives 06:00; the world keeps 04:00.
- The shops, the Paimon's Bargains month and the fishing and Moon Spire day zones read the same module.

## Capabilities

- **genshin/reset-clock** (new): the server's clock, and the last and next reset of each kind from a moment.
- **genshin/bosses** (modified): the weekly reset falls on Monday at 04:00 on the server's clock, not in the reader's zone.
- **genshin/enemies** (modified): an elite camp's member returns at the next daily reset on the server's clock.

## Impact

- `packages/genshin-world/src/services/time/`: the new module.
- The services, composables and components that read a reset, listed in the design's Key files.
- Deleted: the daily and weekly reset modules and their tests, the weekly constants, and the mining outcrop respawn module.
- The save keeps its shapes: its dates and instants are stored as they were, so no migration is needed.
