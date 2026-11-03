# Palette drop

## What it was

An item from outside every grid, such as a palette entry, was dragged by its own element through `startExternalDrag`. The press captured the pointer on that element, and a release over a grid landed the item with its top-left under the pointer, narrowed to the grid's columns. A release over no grid dropped nothing. The drag had no threshold, so a click on a palette entry dropped it at the click point. A cancelled press was discarded without accepting, and the next press's release was the one that dropped the entry.

## Why deferred

The dashboard needs none of it: its visuals are placed from their saved cells, and no element outside the grid drags one in.

## Revisit when

A second grid consumer needs it.
