## Why

Nothing on the canvas snaps, so a row of boxes is lined up by eye, and a reader who wants them even has no command to make them so. The stacking controls move one element, so a reader who wants a group above the rest moves its members one at a time, and there is no key for stacking at all. Excalidraw, the reference for how a whiteboard feels, aligns and distributes a selection and stacks it with a key for each step.

## What Changes

- A selection of two or more boxes can be aligned to the left, centre or right edge, or to the top, middle or bottom edge.
- A selection of three or more boxes can be distributed so the gaps between neighbours are equal, horizontally or vertically.
- The stacking controls move a whole selection, keeping its order among the selected elements.
- Cmd or Ctrl with the square brackets stacks the selection, and holding Shift as well moves it to the front or the back.

## Capabilities

### Modified Capabilities

- `whiteboard`: the align, distribute, selection stacking and stacking key requirements are added.

## Impact

The panel for a selection of several gains its controls, and the stacking of one element is unchanged. Align and distribute move boxes through the same move that a drag uses, so a bound arrow is rerouted in the same edit. No stored element changes, and no stored whiteboard is rewritten.
