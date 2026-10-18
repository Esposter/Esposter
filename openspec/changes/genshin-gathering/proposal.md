# Gathering

## Why

The gathering page holds the plants, the specialties and the ores, struck until they break. Its mining outcrops and investigation spots are not yet placed: no outcrop comes back each day, and a player cannot investigate a sparkling spot or see the daily cap stop new spots. Those are the parts of gathering that reward a player's daily return, so they remain missing until placed.

## What Changes

From Adventure Rank 30 each region's mining outcrops come daily, and investigation spots give their rewards up to a daily cap.

- From Adventure Rank 30 a region's mining outcrops stand at a few places drawn each day, and come at the 04:00 reset in UTC+8.
- A mined outcrop stays gone until the next day's draw.
- Investigating a spot gives its rewards once.
- Investigation stops spawning new spots once a hundred investigations are counted in the game day, which starts at the 04:00 reset.

## Capabilities

- **genshin/gathering** (modified)

## Waiting on

- The mining outcrops' places, built by `genshin:assets mining-outcrops` and published by the main session. The draw reads them once they are written, and draws none until then.
- The official map's Investigation label, which holds no points, so no investigation spot is placed.

## Impact

The world gains each region's daily mining outcrops, drawn at the region's places, and the investigation spots. The saved progress keeps the day's investigation count from the 04:00 reset. The outcrops' item rows and the ores' categories are read from the game's tables, and the investigation rewards come from the wiki.
