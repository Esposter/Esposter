# Canvas

## Why

The webpage editor draws its page in a region of the app's own document, so the page's styles and the editor's styles can leak into each other, and the editor's pointer-only drag offers no keyboard or single-pointer way to move a block. The published page is the only rendering that counts, so the editor has to draw the page in a context of its own, with every pointer action also reachable from the keyboard.

## What Changes

The webpage is drawn on a canvas that renders as the published page does, and every pointer action has a keyboard path.

- The page is drawn in an isolated frame at tablet and mobile widths, and at desktop width in the frame the style panel's desktop minimum allows. A narrow pane scales the frame down rather than reflowing it.
- The page's styles stay out of the editor, the editor's styles stay out of the page, and a script inside a custom HTML block does not run in the canvas.
- Hovering a node outlines it, and selecting a node shows its outline and toolbar.
- A block dragged from the palette drops into the slot the pointer is over, and a drop where no slot accepts the block is cancelled.
- Alt with an arrow key moves the selected node among its siblings or into and out of a container, each move is announced, and Move to lists every slot that accepts the node.
- A layers tree reaches every node from the keyboard.
- Enter edits a selected text node in place, and Escape returns focus to the tree.
- Copy and paste move a node between webpages, and a webpage node pasted into an email is refused with a message.
- **Capabilities:** `resource/page-builder/canvas` (new).

## Capabilities

- **resource/page-builder/canvas** (new)

## Waiting on

- `openspec/changes/resource-page-builder-document-model/`, which defines the typed nodes the canvas draws and the edits it makes.
- `openspec/changes/resource-page-builder-style-panel/`, which sets the narrowest desktop width the canvas frame keeps, beside its tablet and mobile breakpoints.

## Impact

- The webpage editor's canvas, its overlays, its node toolbar and its context menu.
- The layers tree, a new component in the shared UI library.
- The command registry, which lists every pointer and keyboard action in the shortcuts dialog.
- Text editing inside a node, which moves to the rich text editor mounted inside the frame.
- The clipboard, which carries a node between webpages.
