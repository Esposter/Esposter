# Whiteboard ideas not taken

Ideas for the whiteboard that its settled design refuses, one section each. Each section names the idea and the reason it is refused: the whiteboard already does the thing another way, or it deliberately does not do it, or the idea would add a second route to a job one route already does.

## Arrow binding toggle

A switch that turns arrow binding off for the whole board, so that arrows never attach to shapes.

**Why not:** Each arrow end can already be detached from the properties panel, and a detached end stays where it was bound, as the [whiteboard spec](../../../specs/resource/whiteboard/spec.md) requires. An arrow drawn from empty space is free at that end from the start, so a board with no bindings is already possible without a switch. A board-wide switch would add a second binding mode that every arrow and every move would have to read, for what the per-end detach already does one end at a time.

## Canvas background colour

A board-wide background colour for the canvas, set from the board's own controls.

**Why not:** The whiteboard keeps no document setting for the canvas. Its properties panel is absent with nothing selected, because the document has no setting that needs one ([whiteboard layout](../../../specs/resource/whiteboard-layout/design.md)). The canvas is transparent over the page, so it takes the app's own surface and follows its light and dark mode. A board colour would be a second surface that a reader sets against that theme.

## Excalidraw scene import

Opening an Excalidraw scene file as a board, with its elements converted to the whiteboard's own.

**Why not:** The store holds each board as a positioned document, and SVG and PNG are the exports ([whiteboard](../../../specs/resource/whiteboard/design.md)). An Excalidraw scene is a different document. Some of its element types have no counterpart here, such as the line, the frame and the embed, and a shape here holds its own text where Excalidraw keeps the text bound to a shape as a separate element. A conversion would drop elements or invent them. The [rejected third-party engine](../whiteboard-third-party-engine/design.md) record already keeps other products' engines out of the whiteboard.

## Lasso selection

Selecting the elements inside a freeform loop drawn around them, as an alternative to the marquee.

**Why not:** The marquee already selects every element a drawn box fully covers, and the [whiteboard spec](../../../specs/resource/whiteboard/spec.md) names that set. A lasso selects by a drawn outline instead, so it differs only where a box cannot follow the arrangement of the elements. A reader can already add to a selection with Shift-click, so the second gesture answers little that the marquee and Shift-click do not.

## Minimap

A small overview of the whole board in a corner, with the visible part marked, for moving around a large board.

**Why not:** The whiteboard's [original design](../../../changes/archive/2026-11-02-resource-whiteboard/design.md) drops the minimap, since a whiteboard does not need one and Excalidraw has none. The fit to content control and the zoom buttons answer the same need, finding the content of a large board, in one press.

## Outline point binding

Binding an arrow end to any point on a shape's outline, rather than to one of the shape's connection points.

**Why not:** Each bound end names one of four connection points, numbered from the top clockwise, and the [positioned elements](../../../specs/vue-block-editor-headless/positioned-elements/design.md) design settles that. The index is what keeps a bound end at its point through a move, and the export draws the same points. A binding to any outline point would store a position along an edge or a curve, and each shape kind would need its own way to recompute it on a move. The nearest connection point is kept instead.

## Scene file download

Saving a board to a file on disk, as an Excalidraw scene, with a shortcut.

**Why not:** The store is the save: a board saves into the resource store as it is edited, and the [account data export](../../../specs/user/data-export/design.md) already carries each resource the person owns. A scene file would be a second copy of the document that can drift from the store. A reader who wants the board as a file has the SVG and PNG exports ([whiteboard](../../../specs/resource/whiteboard/design.md)).

## Text to diagram

Writing a diagram as text, such as Mermaid, and turning it into shapes and arrows on the board.

**Why not:** A text-to-diagram converter needs a Mermaid dependency or a parser of its own, and the owner decided that the product takes no new third-party dependency. The whiteboard is built on the headless editor core and drawn by our own code, as the [rejected third-party engine](../whiteboard-third-party-engine/design.md) record says. Shapes come from the toolbar, which places each one by its tool and a drag, so the board does not need a second way in.

## Welcome screen and templates

A welcome screen with a gallery of board templates, shown when a board is new.

**Why not:** A new board opens on an empty canvas, as the [whiteboard spec](../../../specs/resource/whiteboard/spec.md) says. Blueprints are the platform's route to starting a resource from prepared content: a blueprint's manifest deploys as real resources through the standard write paths ([blueprint resource](../../../specs/resource/blueprint-resource/design.md)). A template gallery would be a second route to the same starting content, beside the one the platform already has.

## Whiteboard theme toggle

A theme switch on the board itself, separate from the app's light and dark mode.

**Why not:** The canvas follows the app's light and dark mode. The [design language](../../../specs/architecture/design-language/design.md) palettes share one set of token names, so nothing that reads a token knows which theme is selected, and the board needs no theme of its own. A second whiteboard theme would repeat the switch the app already has. The element fills are fixed colours in the whiteboard's palette, so a theme of its own would also have to remap them.
