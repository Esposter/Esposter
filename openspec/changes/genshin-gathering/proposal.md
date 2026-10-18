# Gathering

## Why

The gathering page holds the plants, the specialties and the ores, struck until they break. Its mining outcrops and investigation spots are not yet placed: no outcrop comes back each day, and a player cannot investigate a sparkling spot or see the daily cap stop new spots. Those are the parts of gathering that reward a player's daily return, so they remain missing until placed.

## What Changes

From Adventure Rank 30 each region's mining outcrops come daily, and investigation spots give their rewards up to a daily cap.

- From Adventure Rank 30 a region's mining outcrops stand at a few places drawn each day, and come at 06:00 in UTC+8.
- A mined outcrop stays gone until the next day's draw.
- Investigating a spot gives its rewards once.
- Investigation stops spawning new spots once a hundred investigations are counted in the game day, which starts at the 04:00 reset.

## Capabilities

- **genshin/gathering** (modified)

## Waiting on

- The mining outcrops' draw and respawn, which are the mining outcrops' own and not built here. Their places are built by `genshin:assets mining-outcrops`, which the main session publishes.
- The official map's Investigation label, which holds no points, so no investigation spot is placed.

## Impact

The world gains each region's daily outcrop places and the investigation spots, each drawn beside the ley line places. The saved progress keeps the day's investigation count from the 04:00 reset. The outcrops' item rows and the ores' categories are read from the game's tables, and the investigation rewards come from the wiki.
