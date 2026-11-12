# Tasks

## 1. The model

- [x] 1.1 Add the optional colour, width and dash fields to the shape, sticky note, arrow, text box and stroke models, let a shape's fill be empty, and describe each new field in the shared element schema. Verify: tests named after the scenarios 'A colour that is not a hex colour is refused', 'A width that is not one of the three is refused', 'A dash pattern that is not one of the three is refused' and 'A fill that is neither a hex colour nor empty is refused' written first and seen failing.

## 2. Drawing from one set of attributes

- [x] 2.1 Add the function that gives an element's colour, width and dash attributes, and draw each outline, route, stroke and label from it on the canvas and in the export, at medium width and in the page text colour until a value is stored. Verify: tests named after the scenarios 'A chosen colour draws the outline and the text', 'An element with no colour draws in the page text colour' and 'A new arrow draws at medium width' written first and seen failing.
- [x] 2.2 Draw the dash pattern on a shape's outline and an arrow's route, on the canvas and in the export, and leave the arrowheads filled. Verify: tests named after the scenarios 'A dashed outline draws with gaps on the canvas and in the export' and 'An arrow route draws dotted when the owner chooses dotted' written first and seen failing.
- [x] 2.3 Start a placed shape with no fill and keep a sticky note's yellow fill as it is. Verify: tests named after the scenarios 'A new shape starts with no fill' and 'A sticky note keeps the fill it starts with' written first and seen failing.

## 3. The properties panel

- [x] 3.1 Add the colour, width and dash controls to the panel of one selected shape, sticky note, arrow, text box and stroke, each committed through the property command. Verify: tests named after the scenarios 'Clearing a colour returns the element to the page text colour' and 'A bold width draws the outline and the export at bold' written first and seen failing.
- [x] 3.2 Let the fill control clear a shape's fill back to no fill. Verify: a test named after the scenario 'Clearing a shape fill leaves it open' written first and seen failing.

## 4. The record

- [x] 4.1 Update the whiteboard design's Features, Notes and Not built for the colour, width, dash pattern and fill, so the design describes what the change ships. Verify: `pnpm exec openspec validate resource-whiteboard-stroke-and-fill --strict --no-interactive` passes.
