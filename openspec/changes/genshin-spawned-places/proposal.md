# Spawned Places

## Why

The game's servers spawn places that are not in the client's data, so the world holds none of them yet. Nearly every system after this one stands on such a place, so it comes first. The official map's public points stand in for them: they are fitted onto the scene's transport points, and what remains is writing each kind's places into region data and standing each on the ground that holds it.

## What Changes

Each region holds the places the servers spawn, fitted from the official map, with enemy camps built from the map's enemy marks.

- Each kind's fitted map points enter region data at their fitted positions. Only fitted places are written; the map's own data stays a reference.
- Each fitted place stands on the ground beneath it, on the top of the landmark that holds it, or on its layer's floor. A place whose ground cannot be found is reported and not given a guessed height.
- Enemy marks on the map are clustered by distance into camps, each enemy taking its family's kind and an estimated level, and the clustered camps replace Mondstadt's stand-in camp.
- Each kind's count in each region is checked against the wiki's count, and any shortfall or surplus is reported per kind.

## Capabilities

- **genshin/spawned-places** (modified)

## Waiting on

- Game data: `game-exports` (per the change's needs).
- Each kind's wiki count, which lands as that kind's page does.

## Impact

The map point fit and its region placement, the Oculi slices, the enemy camps of each region, and the ground a place stands on are touched. The gathering points are placed by the gathering page, and the camps' levels are estimates marked provisional.

Size kept as the source page's own: splitting it is a later decision.
