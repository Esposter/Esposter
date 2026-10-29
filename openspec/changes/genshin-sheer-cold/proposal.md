# Sheer Cold

## Why

Dragonspine is cold in the game, and the world shows its snow but nothing of the cold. The game keeps a gauge for it: a character standing in the subzero climate fills the gauge, bonfires and other heat drain it, and once it is full the character starts losing HP. Without the gauge a player walks Dragonspine with nothing to answer to, and the campfires the cooking rules already light have no effect on the world.

## What Changes

The subzero climate fills a gauge, heat drains it, and a full gauge deals damage, shown as a bar across the top of the screen.

- The gauge fills while the character stands in Dragonspine, faster while it swims.
- A lit campfire near the character drains the gauge, wherever it stands.
- A full gauge deals its share of the character's max HP each interval it stays full.
- The gauge shows as a bar across the top of the screen while it holds any cold.

## Capabilities

- **genshin/sheer-cold** (new)

## Waiting on

- Campfires are not placed in the world, so the drain has no source until they are. The official map's Campfire/Torch points are the source that would place them.
- The heat's reach is provisional until a clip isolates it. The bar's placement and look are read off a public clip, and the bar moves to them with the Hud component's owner.

## Impact

Windrise steps the gauge each frame where the character stands, and the HUD gains a bar. The character's controller exposes its locomotion phase, which the gauge reads for swimming. The game's own climate data is read from the dump, and the dump names no area for the climate, so the area list is the catalogue's Dragonspine.
