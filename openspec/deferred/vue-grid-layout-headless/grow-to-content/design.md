# Grow to content

## What it was

An item marked `isAutoHeight` took the whole rows that hold the content its consumer reported through `reportContentHeight`. The reported height was rounded up to rows past a row's gap, the layout compacted around the taller item, and the changed cells were committed as one commit, as a gesture's would be.

## Why deferred

The dashboard needs none of it: a visual keeps the span it was saved with, and nothing in the dashboard reports a content height to the grid.

## Revisit when

A second grid consumer needs it.
