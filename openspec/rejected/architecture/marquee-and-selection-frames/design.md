# Marquee and selection frames

The whiteboard's marquee, the rectangle drawn while the pointer selects, and the frame around a selected element, drawn by one shared frame component.

## Why not

They are two occurrences, below the bar a shared piece earns. The whiteboard's selection change rewrites both, since it draws a selection's handles and changes the frame around it, so a shared frame built now would be rebuilt by that change before it had a third consumer.

## The revisit trigger

The whiteboard's selection change has shipped and a third frame draws the same rectangle, so the shared piece has the third consumer that earns it. The change is [selection editing](../../../changes/resource-whiteboard-selection-editing/design.md).
