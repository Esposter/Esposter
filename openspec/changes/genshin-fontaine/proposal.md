# Fontaine

## Why

Fontaine is the nation of the Hydro Archon, a raised plate that ends in a massive waterfall, with half of it under water. Its terrain, vegetation, water, sky and weather are built on the shared engine, but the region itself is not in the world: its plate and waterfall, its underwater areas, its building kit and its landmarks are not drawn, so the nation a player would reach is absent.

## What Changes

Fontaine is built into the world in build order, from the Court of Fontaine to the Sea of Bygone Eras.

- Fontaine's plate stands above its neighbours, with a great waterfall and its mist at its edge.
- Diving takes a player into the underwater areas, with turquoise fog, caustics and light shafts, and kelp and coral on the seabed.
- Buildings stand from the Fontaine building kit, with aqueducts, bridges, clock towers and machinery as kit pieces of their own.
- Palais Mermonia, Opera Epiclese, Elynas and the Fortress of Meropide stand as landmarks, and aquabus lines run on their authored paths.
- Each area of Fontaine appears under the name the game gives it, and the Sea of Bygone Eras is a map layer of its own.

## Capabilities

- **genshin/fontaine** (new)

## Waiting on

- `openspec/changes/genshin-flowing-water/`: the region's rivers and falls, which Fontaine's plate is built on.
- `openspec/changes/genshin-trees-and-scatter/`: the vegetation and scatter the region is built on.
- `openspec/changes/genshin-weather/`: the weather the region is built on.
- `openspec/changes/genshin-recreation-passes/`: each scene is rebuilt in its recreation passes.
- The Court's camera pose, which waits on the genshin-landmark-closure unit and its asset-map change on the PC, since the clock tower and the station have no OBJ exports yet.

## Impact

The world gains Fontaine's terrain, its underwater layer, its building kit and its landmark meshes, and the region's generators for aqueducts, clock towers and machinery in the Fontaine services. The noise that shapes the plate and the seabed is read from the engine. The map gains Fontaine's areas as the game names them, and the Sea of Bygone Eras as its own layer.
