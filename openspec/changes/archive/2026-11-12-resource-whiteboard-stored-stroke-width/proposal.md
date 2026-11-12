## Why

The stroke-and-fill change narrowed a freehand stroke's stored width from any positive number to the three steps thin, medium and bold. Its design says no backfill is owed, because every stored stroke already holds a valid width, since the one gesture that writes a stroke has always written medium. That holds for the gesture but not for the agent: an agent could write a stroke's width as any positive number through the element's path, and the save re-parses only the value it wrote. A stored document holding such a stroke, such as a width of 3, now fails to parse on read.

## What Changes

- A one-off backfill, run as the `backfills` skill describes, rewrites each stored whiteboard's working copy so that every freehand stroke, and every outline, route or arrow, holds one of the three widths. A value that is not a step moves to the nearest step, and an element already on a step is left alone.
- The script is a scratchpad and is never committed. The schema stays strict: no read path accepts a width outside the three steps.
- Published versions are not rewritten, as the persisted-data rule states, so a version taken before the backfill keeps the old width.

## Capabilities

### Modified Capabilities

- whiteboard (resource/whiteboard): the stored width of a stroke, outline and arrow is brought to a step by a backfill, not read leniently.

## Impact

Only whiteboard documents that an agent wrote a non-step width into are rewritten. The archived stroke-and-fill design's claim that no backfill is owed is superseded by this change. The rule the backfill applies is stated in [persisted data, latest shape only](../../specs/architecture/persisted-data-latest-shape-only/design.md).
