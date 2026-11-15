# Retroactive Unlocks

Backfilling achievement progress from historical data when a new achievement ships.

**Why not:** Most triggers are events, not state — "save 50 times" or "50 short comments" have no historical record to replay (messages live in each room's object with no per-user mutation count, and a save overwrites a blob). A partial backfill (only state-derived achievements) would be inconsistent and confusing. Definitions count from the moment they ship; everyone races from the same line.
