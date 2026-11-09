# Tasks

## 1. The text model

- [ ] 1.1 Add the optional text size and alignment fields to the shape, sticky note, text box and arrow models, and the optional wrap setting to the text box model, each described in the shared element schema. Verify: tests named after the scenarios 'A size that is not one of the four is refused' and 'An alignment that is not one of the choices is refused' written first and seen failing.

## 2. Layout at a size and an alignment

- [ ] 2.1 Lay out each text at its element's size, with the wrap estimate and the line step scaled from the size and the smallest size drawing as the text draws today. Verify: tests named after the scenarios 'A larger size draws and wraps the text larger' and 'Text draws at the smallest size until a size is chosen' written first and seen failing.
- [ ] 2.2 Place each text by its alignment inside a shape and a sticky note, at the left edge of a text box, and centred at an arrow's midpoint, on the canvas and in the export. Verify: tests named after the scenarios 'Shape text aligns to the left and the top', 'Text box text aligns to the right', 'Shape text is centred until an alignment is chosen' and 'An arrow label has no alignment control' written first and seen failing.

## 3. Wrapping and auto width

- [ ] 3.1 Let a text box be unwrapped, with its box sized to its widest line on commit, and keep a shape's, a sticky note's and an arrow's text wrapped. Verify: tests named after the scenarios 'Auto width sizes the box to its widest line', 'Auto width grows the box as a longer line is committed' and 'Returning to a wrapped width keeps the box width' written first and seen failing.
- [ ] 3.2 Keep the wrap of a shape's text unchanged, so the test named after the scenario 'A long label wraps inside its shape' stays green with the size and alignment in place.

## 4. The draft in place

- [ ] 4.1 Draw the draft of the element being edited through the same layout the committed text uses, and draw the committed text again on Escape. Verify: tests named after the scenarios 'The element shows the draft as the owner types', 'Escape returns the element to its committed text' and 'Committing does not move the text' written first and seen failing.

## 5. The properties panel

- [ ] 5.1 Add the size, alignment and wrap controls to the panel of one selected element by its kind, each committed through the property command. Verify: tests named after the scenarios 'A larger size draws and wraps the text larger' and 'Auto width sizes the box to its widest line' drive the controls, written first and seen failing.

## 6. The record

- [ ] 6.1 Update the whiteboard design's Features, Decisions and Notes for the text sizes, the alignment, the auto width text box and the live draft, in the change that ships them. Verify: `pnpm exec openspec validate resource-whiteboard-text-styling --strict --no-interactive` passes.
