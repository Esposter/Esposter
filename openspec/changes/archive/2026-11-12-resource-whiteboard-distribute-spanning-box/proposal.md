## Why

Distribute keeps the outermost two boxes in place. When one box starts before every other box and ends after every other box, it is both outer edges at once, and the moves computed for the boxes between them place a box inside the spanning box's span, outside the selection's first edge. The spec does not say what a distribute of such a selection does, so the move is taken as if the spanning box were not there.

## What Changes

- A distribute of a selection in which one box spans every other box along the axis is disabled, as a distribute below three boxes already is.
- The distribute's move is unchanged for every other selection.

## Capabilities

### Modified Capabilities

- whiteboard (resource/whiteboard): the distribute control is disabled for a selection with a box spanning the rest.

## Impact

The distribute control's disabled rule gains one case. No stored document changes, and the moves of every other distribute stay as they are.
