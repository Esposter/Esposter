## Why

The whiteboard draws every outline, arrow, label and freehand stroke in the page's text colour, at one fixed width, and draws no dashes. A new shape starts with a white fill, which hides light text when the page is dark. The owner cannot tell one outline from another by colour or weight, and a box on a dark page hides its own text. The reference lets the owner set each of these, and its shapes start with no fill.

## What Changes

- An outline, an arrow with its heads, a label and a freehand stroke take a colour the owner chooses. Until one is chosen they draw in the page's text colour.
- A shape, a sticky note, an arrow and a freehand stroke take a width of thin, medium or bold. Medium is the width each draws at today.
- A shape's or a sticky note's outline and an arrow's route take solid, dashed or dotted. Until one is chosen they draw solid.
- A new shape starts with no fill, and the owner can set a shape's fill or clear it. A stored shape keeps the fill it has. A sticky note keeps its yellow fill.
- A stored value outside its choices is refused: a colour that is not a hex colour, a width that is not one of the three, a pattern that is not one of the three, or a fill that is neither a hex colour nor empty.
- The canvas and the export draw the same colour, width and pattern.

## Capabilities

### Modified Capabilities

- whiteboard (resource/whiteboard): colour, width and dash pattern are added to the elements that draw them, and a new shape's fill starts empty.

## Impact

The properties panel gains controls for the one selected element. A stored element that lacks a new field reads that field's default, which draws as it does today, so no stored document is rewritten. A shape placed before this change keeps the white fill it was stored with. The panel is also changed by the shape-look and text-styling changes, so this change lands first.
