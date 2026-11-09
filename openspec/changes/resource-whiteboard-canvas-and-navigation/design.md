## Context

The whiteboard's canvas draws an SVG dot pattern behind the elements, and one rounding function sits in every gesture that places or moves an element. The viewport only changes through the zoom buttons, the hand tool and the middle button. The keyboard registers tools, nudges, delete, duplicate and history, and has no select all and no clipboard for elements.

## Gap analysis

Each row is a feature of Excalidraw, the reference product, read from its source, with the verdict this change gives it.

| Feature                                        | Verdict                                                                           |
| ---------------------------------------------- | --------------------------------------------------------------------------------- |
| Plain canvas, no grid by default               | Built here: the grid and snap are removed                                         |
| Grid mode toggle                               | Rejected: the grid is not a mode here at all                                      |
| Snap to objects with alignment guides          | Deferred: revisit when the style panel and selection handles have shipped         |
| Wheel pans, pinch and Ctrl or Cmd wheel zoom   | Built here                                                                        |
| Space and drag pans                            | Built here                                                                        |
| Reset zoom, zoom to fit, zoom to fit selection | Built here                                                                        |
| Zoom range to 30                               | Built here: the maximum rises from 8 to 30                                        |
| Scroll-back-to-content indicator               | Deferred: revisit once wheel panning is in use                                    |
| Select all                                     | Built here                                                                        |
| Copy, cut and paste of elements                | Built here                                                                        |
| Minimap                                        | Rejected: Excalidraw has none, and the fit and zoom controls answer the same need |

## Decisions

- **No grid and no snap, together.** The grid is deleted with the snap, because a snap with no visible grid is invisible behaviour. The alternative was to keep the snap and hide the grid, which keeps the surprise and removes its only explanation. This overturns the earlier direction of a dot grid with snap on by default, which is recorded as rejected.
- **The plain wheel pans and a modifier zooms.** Ctrl or Cmd with the wheel zooms about the pointer, which is also what a trackpad pinch sends. The alternative was wheel zoom with no modifier, which turns a trackpad's two-finger scroll into a zoom and leaves no way to pan by scrolling.
- **Zoom is clamped at the limits, about the pointer.** The point under the pointer stays under it as the scale changes, so a zoom never slides the board away from what the reader is looking at.
- **The clipboard carries the elements as JSON text with a marker.** A paste reads the marker and places the elements offset from the copies, with arrows rebound to the pasted shapes they were bound to. The alternative was a private in-memory clipboard, which cannot cross two open boards.
- **Placement lands at the pointer.** A click places the default size centred on the point and a drag sizes to the drag, as before, without rounding.

## Risks and trade-offs

- A board that relied on snapping to line shapes up loses that. The deferred object snapping is the replacement, and until then a nudge by the arrow keys places an element exactly.

## Tasks that depend on it

The element styling, the text editing and the selection handles all read the plain canvas and the clamped viewport, so this change lands first.
