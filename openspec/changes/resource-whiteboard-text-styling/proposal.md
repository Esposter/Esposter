## Why

Every text on the whiteboard draws at one fixed size, centred in its shape or hung from its corner by the kind of its element, and it always wraps at its box's width. A text box cannot take its width from its text, and the element a text sits in jumps when the owner commits the text, because the canvas draws only committed text. The reference offers four sizes, alignment, a wrap toggle and auto-resizing text boxes.

## What Changes

- The text of a shape, a sticky note, a text box and an arrow's label takes one of four sizes. The smallest is the size text draws at today.
- The text of a shape, a sticky note and a text box takes a horizontal alignment. The text of a shape and a sticky note also takes a vertical alignment. Until one is chosen, each text keeps the alignment its kind has.
- A text box can be set to auto width. Its text is then not wrapped, and its box is as wide as its widest line.
- A text being edited draws its draft in its element while it is typed, so the element does not change on commit.
- A stored size, alignment or setting outside its choices is refused.

## Capabilities

### Modified Capabilities

- whiteboard (resource/whiteboard): text wrapping now allows an auto width text box, and sizes, alignment and a live draft are added.

## Impact

The properties panel gains text controls for the one selected element, chosen by its kind. The stored document gains optional fields on the shape, the sticky note, the text box and the arrow. A stored element that lacks a new field reads that field's default, so no stored text moves or changes size. The export draws the same sizes and alignments as the canvas. This change extends the panel controls the stroke-and-fill and shape-look changes added.
