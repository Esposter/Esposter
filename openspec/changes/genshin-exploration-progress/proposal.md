# Exploration progress

## Why

The game's map shows, for each area, how much a player has explored, and a nation's exploration raises its Reputation at set thresholds. Only Galesong Hill's count is shown today, and no nation's threshold reward is paid. The count is a sum over what the other exploring pages do, so until those pages count their doings the percentage stays incomplete.

## What Changes

The map shows each area's exploration percentage and counts each doing toward it, and a nation's exploration pays its Reputation reward as it crosses each threshold.

- An area's percentage is its done weight over its total, rounded down, so a near-complete area never reads as complete.
- Each doing adds its kind's weight to its area once, however often it is revisited.
- A nation's percentage is weighed over its areas by the game's ratios, or by their summed totals where the ratios are all zero.
- A nation's exploration reaching a threshold pays its Reputation reward once.

## Capabilities

- **genshin/exploration-progress** (modified)

## Waiting on

- `openspec/changes/genshin-map-unlocking/`: a waypoint unlocked counts toward its area.
- `openspec/changes/genshin-chests/`: a chest opened counts toward its area.
- `openspec/changes/genshin-spawned-places/`: the chests and camps are placed before they can be done.
- `openspec/changes/genshin-puzzles/`: a puzzle solved counts toward its area.
- `openspec/changes/genshin-statues-of-the-seven/`: a statue unlocked counts toward its area.
- `openspec/changes/genshin-offering-systems/`: the Oculi offered count toward their area.

## Impact

The world's exploration services and the map's area labels gain the count and the threshold payments. The wallet and Reputation state gain each reward, and the saved progress keeps each doing once. The area totals, the exploration events and the nations' thresholds are read from the game's tables, and each kind's weight is re-measured from a recording before the table's weight is replaced.

Size kept as the source page's own: splitting it is a later decision.
