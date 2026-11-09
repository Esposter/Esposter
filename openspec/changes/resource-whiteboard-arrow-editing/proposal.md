## Why

An arrow here takes one filled triangle at each end or none, so a reader cannot mark an arrow as a dependency, a containment or a return. A free end moves only as part of the whole arrow, so an arrow drawn to empty space cannot be aimed after it is placed. A flowchart step is also a second gesture: the next shape is placed by hand and then joined. Excalidraw, the reference for how a whiteboard feels, offers a head type for each end, a drag of a free end, and a helper that adds a connected next shape from a shape.

## What Changes

- Each end of an arrow takes one head from a set of five, chosen for that end alone, in place of the single filled triangle flag.
- A selected arrow shows a handle on each free end. Dragging the handle moves that end, and releasing it on a shape binds it there.
- A selected shape shows a handle at each of its connection points. Dragging a handle to empty canvas adds a shape of the same kind, joined to the shape by an arrow. Releasing it on another shape joins the two without adding one.
- The stored arrows are rewritten once, so each flag becomes a head kind. No stored arrow keeps the flag.

## Capabilities

### Modified Capabilities

- `whiteboard`: the arrowhead, free end drag and flowchart helper requirements are added.

## Impact

The arrow's end and its head drawing change, and the arrow's panel offers a head choice for each end. The arrow tool, the move, the reroute and the delete keep their behaviour. Every existing arrow keeps its route and its bindings, and its flag becomes the head kind it shows.
