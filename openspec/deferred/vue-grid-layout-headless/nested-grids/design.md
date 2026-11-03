# Nested grids

## What it was

A press belonged to the grid whose nearest registered root it sat under. The root was found by walking up from the press's target, so a grid inside an item moved its own items without the item it sat in moving, and an outer grid took no gesture from an inner grid's item. The check was the grid's own root, so a nested grid needed no configuration.

## Why deferred

The dashboard needs none of it: no visual hosts a grid, so every press sits under the one grid's root.

## Revisit when

A grid item hosts a grid.
