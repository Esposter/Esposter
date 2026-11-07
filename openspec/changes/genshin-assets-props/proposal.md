# Props and gadgets asset family

## Why

The world's props and gadgets are drawn as plain stand-ins: a box for a chest, a sphere for an Oculus, a capsule for the frostbearing tree, a rock for a mining outcrop. A monument, a bench, a blossom, a domain entrance, a gate or a door is drawn as nothing at all. The game holds each of these as an export on the PC's install, and the repo has no props component, name lookup, fit, dataset or check that turns one of them into fitted parameters. So no prop kind has a conversion path, and the family's placements are data that nothing draws.

## What Changes

- Give the props a component, a lookup of a mesh name over the game's own index, a fit, a dataset and a check. These are missing commands, so they come first and run on this Mac.
- Fit the outline and colour of each prop kind from its export on the PC, and publish only the fitted numbers.
- Draw each published prop record in the world, and keep the stand-in for a kind with none.
- Place the Mora chests, read every region's chests, join the other regions' waypoints, and check the Windrise statue and oak against their recording.
- Leave each prop's behaviour where its open change owns it, and link there.

## Capabilities

- **genshin/props** (new): the props and gadgets a player meets in the world, what each stands as, and where each stands.

## Waiting on

Task 1.7 waits on task 3.1 of the [weapons](../genshin-assets-weapons/tasks.md) change, whose root primitive a PC session builds. The tasks that need the PC's game install are taken there, and the rest run on this Mac.

## Impact

The props component, the fits and the lookup in the asset scripts, the hosted datasets and their lock, the props kit in the engine, and the chest, landmark and statue components of the world. No game art ships: a published record holds fitted numbers and colours only.
