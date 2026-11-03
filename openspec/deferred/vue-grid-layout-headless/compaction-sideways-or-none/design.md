# Compaction sideways or none

## What it was

A compaction direction option named the way a layout compacted. Horizontal compaction rose items to the left, and a horizontal push that ran past the last column moved the item down a row and back along it. No compaction left a dropped item where it landed, and still pushed an overlapping item down until it cleared. Upward compaction, which the grid keeps, is the only direction left.

## Why deferred

The dashboard needs none of it: its visuals compact upward, so a published dashboard reads top to bottom.

## Revisit when

A second grid consumer needs it.
