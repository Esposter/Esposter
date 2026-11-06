# Retire the grid layout package

Remove the grid layout package, move the dashboard's tiles onto something simpler, and unpublish the package.

## Why deferred

The grid and the editor layout engine solve different problems. The grid places items inside a canvas on a grid of cells, with packing, collision and compaction, and runs the pointer gestures that move and resize them. The engine arranges regions around a canvas by the window's size class and what is selected. Their models share a size and a pointer and nothing else, and the engine's canvas region can hold the grid, so one does not fold into the other without the engine growing a cell grid of its own, which is the grid package under a new name. The [program](../../../specs/resource/editor-shell/design.md) rejected one engine for both on that ground.

What would make the package unnecessary is a product decision, not an engine one: that a dashboard's tiles are placed by order and span, in a reflowing grid a reader reorders, and not by cell, so that no tile is placed freely, nothing collides and nothing compacts. The dashboard's [grid design](../../../specs/resource/dashboard-grid/design.md) and its [layout change](../../../specs/resource/dashboard-layout/design.md) do not make that decision, and the dashboard's controls and its saved layout are built on free placement.

Removal is also a release question. A package that has been published for a while cannot always be unpublished from npm, so the route is the repository's own removal and a deprecation of each published version, and unpublishing only where npm allows it.

## Revisit when

The dashboard's refactor decides that tiles are placed by order and span. Until then the grid is the dashboard's canvas, and the package stays.
