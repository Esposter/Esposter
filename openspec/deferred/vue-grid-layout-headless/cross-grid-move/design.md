# Cross-grid move

## What it was

A drag released over another mounted grid was handed to it. The grid under the pointer was found among the grids mounted on the page: the first element the browser reports at the pointer that was not the dragged element, then its nearest registered root. That grid accepted the item with its top-left under the pointer, narrowed to its columns, and committed the addition. Only then did the source commit the removal of the item and the compaction of the rest, so a refused drop stayed in its source. A release over no grid dropped the item and committed nothing. The pointer stayed captured by the source grid, since the HTML Drag and Drop API does not fire for touch input.

## Why deferred

The dashboard needs none of it: it mounts one grid per page, so no release can reach a second grid.

## Revisit when

A second grid is mounted in one view.
