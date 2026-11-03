# Every-edge resize

## What it was

A resize pulled any of an item's four edges or four corners, named by an edge enum, and kept the opposite edges in place. Pulling the left or the top edge moved the origin and changed the span together, so the opposite edge stayed where it was. Each edge stopped at the grid's sides and at the least span, so an item never shrank below one cell or left the grid.

## Why deferred

The dashboard needs none of it: it draws one handle, at its bottom-right corner, and that corner's resize is the only one the grid builds. An edge handle would need the same placement logic on its own side.

## Revisit when

A second grid consumer needs it.
