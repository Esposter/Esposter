# resource/whiteboard Specification

## Purpose

A freeform canvas for sketching ideas and connected diagrams, with shapes, arrows bound to them, strokes, text, images and sticky notes, edited on the canvas, read and edited by agents, and exported as SVG or PNG.

## Requirements

### Requirement: An owner creates a whiteboard from the create flow

The create flow SHALL offer a Whiteboard resource, which opens on an empty canvas.

#### Scenario: A Whiteboard is created from the create flow

- **GIVEN** an owner on the resource explorer's Home
- **WHEN** the owner creates a Whiteboard with a name
- **THEN** a Whiteboard resource opens on its editor with an empty canvas
- **AND** the resource appears in the owner's list under the Whiteboard type

### Requirement: The palette offers the flowchart shapes with the basic shapes

The palette SHALL offer rectangles, ellipses and diamonds, and the six flowchart shapes, Terminal, Process, Decision, Input/Output, Predefined Process and Annotation, grouped together.

#### Scenario: The palette lists the shapes

- **GIVEN** an owner opens a whiteboard in the editor
- **WHEN** the palette is shown
- **THEN** the palette lists the rectangle, ellipse and diamond
- **AND** it lists Terminal, Process, Decision, Input/Output, Predefined Process and Annotation together

#### Scenario: An annotation takes no connection

- **GIVEN** an Annotation shape on the canvas
- **WHEN** the owner draws an arrow towards it
- **THEN** the arrow does not bind to the annotation

### Requirement: An arrow binds its ends to shapes and carries arrowheads at either end

An arrow SHALL bind each end to a connection point of a shape, or leave the end free at a position. It SHALL take an arrowhead at either end, each end's head being a kind of its own, and one of three path kinds: straight, curved or right-angled.

#### Scenario: An arrow binds its ends to two shapes' connection points

- **GIVEN** a Decision shape and a Process shape on the canvas
- **WHEN** the owner draws an arrow from the decision's bottom point to the process's left point
- **THEN** the arrow is bound at both ends to those connection points
- **AND** moving either shape keeps the arrow attached to its point

#### Scenario: An arrow with an arrowhead at each end

- **GIVEN** an arrow bound at both ends
- **WHEN** the owner sets an arrowhead of some kind on its start and on its end
- **THEN** the arrow draws an arrowhead at both ends

### Requirement: Moving a shape keeps its arrows attached

Moving a shape SHALL reroute each arrow bound to it, in the same edit as the move.

#### Scenario: Moving a shape keeps its arrows attached

- **GIVEN** a Process shape with a right-angled arrow bound to its bottom point
- **WHEN** the owner drags the shape to a new place
- **THEN** the arrow is rerouted from the moved point
- **AND** the move and the reroute undo as one step

### Requirement: Deleting a shape removes the arrows bound to it

Deleting a shape SHALL ask the owner first, and SHALL remove each arrow bound only to that shape.

#### Scenario: Deleting a shape from the canvas asks first and then removes its arrows

- **GIVEN** a Process shape with an arrow bound to it
- **WHEN** the owner deletes the shape
- **THEN** the owner is asked to confirm before anything is removed
- **AND** once confirmed, the arrow bound only to that shape is removed

### Requirement: The owner selects several shapes at once

The canvas SHALL select a shape with a click, add to the selection with Shift, and select every element a marquee fully covers.

#### Scenario: A marquee selects every shape it covers

- **GIVEN** three shapes on the canvas and a marquee drawn over two of them
- **WHEN** the owner releases the marquee
- **THEN** the two shapes it covers are selected
- **AND** the third shape is not selected

### Requirement: Text is edited in place

A shape's text, an arrow's label and a sticky note's text SHALL be edited in place by double clicking the element.

#### Scenario: Double clicking a shape edits its text in place

- **GIVEN** a Process shape with the text Review
- **WHEN** the owner double clicks the shape and types a new text
- **THEN** the shape shows the new text where the old one was

#### Scenario: An arrow's label sits at its midpoint

- **GIVEN** an arrow with a label
- **WHEN** the owner views the canvas
- **THEN** the label is drawn at the arrow's midpoint

### Requirement: Text wraps at the element's width

A shape's, a sticky note's and a text box's text SHALL wrap at the element's width unless a text box is set to auto width, and an arrow's label at a fixed label width. The canvas and the exported image SHALL break the text at the same words.

#### Scenario: A long label wraps inside its shape

- **GIVEN** a Process shape whose text is longer than its width
- **WHEN** the owner views the canvas or exports the whiteboard
- **THEN** the text is drawn on more than one line, each line within the shape's width
- **AND** the export breaks the text at the same words as the canvas

### Requirement: Freehand strokes follow the pointer

A freehand stroke SHALL be drawn along the path the pointer takes while it is held down.

#### Scenario: A freehand stroke follows the pointer

- **GIVEN** the freehand tool is selected
- **WHEN** the owner drags the pointer across the canvas
- **THEN** a stroke is drawn along the path the pointer took

### Requirement: Images and sticky notes are placed on the canvas

A pasted image SHALL be stored as a file asset of its whiteboard, and a sticky note SHALL take a fill and text.

#### Scenario: A pasted image is stored as a file asset

- **GIVEN** a whiteboard open in its editor
- **WHEN** the owner pastes an image onto the canvas
- **THEN** the image is uploaded to the whiteboard's file assets
- **AND** the element holds the file's id and no image bytes

#### Scenario: A sticky note takes a fill and text

- **GIVEN** a sticky note on the canvas
- **WHEN** the owner sets its fill and types text in it
- **THEN** the note draws that fill with that text

### Requirement: Shapes are drawn with a hand-drawn outline

Each shape SHALL draw its outline with an offset that is fixed for that shape and that its sketch level sets, so the same shape draws the same outline each time it is drawn.

#### Scenario: A shape draws the same hand-drawn outline on every render

- **GIVEN** a Process shape on the canvas
- **WHEN** the canvas is drawn twice
- **THEN** the shape's outline is the same both times

### Requirement: Undo reverts an edit as one step

Each edit SHALL be one undo step, so an undo reverts a move together with the reroute it caused.

#### Scenario: Undo reverts a move and its reroute together

- **GIVEN** a shape moved with an arrow rerouted by the move
- **WHEN** the owner undoes the move
- **THEN** the shape and the arrow return to where they were before the move

### Requirement: A whiteboard exports to SVG and to PNG

A whiteboard SHALL export to SVG and to PNG from its resource menu, with both drawn from the same canvas.

#### Scenario: The whiteboard exports to SVG

- **GIVEN** a saved whiteboard with shapes and text
- **WHEN** the owner exports it as SVG
- **THEN** the file holds every element of the whiteboard as drawn on the canvas

#### Scenario: The whiteboard exports to PNG

- **GIVEN** a saved whiteboard with shapes and text
- **WHEN** the owner exports it as PNG
- **THEN** the file is an image of the same elements as the SVG export

### Requirement: An agent reads and edits a whiteboard through the generic tools

An agent SHALL read a whiteboard's content and edit it by JSON Patch, through the generic resource tools. An agent that moves a shape SHALL use the typed move command, which reroutes each arrow bound to the shape in the same write.

#### Scenario: An agent adds an arrow bound to a shape by patch

- **GIVEN** a whiteboard open in its editor with a Process shape in it
- **WHEN** an agent patches the whiteboard to add an arrow bound to that shape
- **THEN** the open editor shows the arrow, bound to the shape
- **AND** the saved content holds the arrow in the whiteboard's z-order

#### Scenario: An agent moves a bound shape through the typed move

- **GIVEN** a saved whiteboard with a Process shape and an arrow bound to it
- **WHEN** an agent moves the shape with the typed move command
- **THEN** the saved content holds the shape at its new place
- **AND** the arrow is rerouted from the moved point in the same write

#### Scenario: A patch leaving a dangling binding is refused

- **GIVEN** a saved whiteboard
- **WHEN** an agent patches an arrow's binding to name a shape the whiteboard does not hold
- **THEN** the patch is refused
- **AND** the saved content is unchanged

### Requirement: A text box is placed from the palette

The palette SHALL offer a text box, which is placed at the middle of the canvas holding the text Text.

#### Scenario: Placing a text box from the palette adds a text box

- **GIVEN** a whiteboard open in its editor with an empty canvas
- **WHEN** the owner clicks the text box in the palette
- **THEN** a text box is added at the middle of the canvas, holding the text Text

### Requirement: The selected element is moved in z-order

The properties panel SHALL offer bring forward, send backward, bring to front and send to back for the selected element, and SHALL disable each control that would not move the element.

#### Scenario: Bringing a shape forward draws it above the next element

- **GIVEN** two shapes on the canvas, the first drawn below the second, with the first selected
- **WHEN** the owner chooses bring forward
- **THEN** the first shape is drawn above the second

#### Scenario: The first element cannot be sent further back

- **GIVEN** the first element in the z-order is selected
- **WHEN** the owner looks at the order controls
- **THEN** send backward and send to back are disabled

### Requirement: An arrow end can be detached

A bound arrow end SHALL be detachable from the arrow's properties. A detach SHALL leave the end free at the point it was bound to, and SHALL be one undo step.

#### Scenario: Detaching a bound arrow end frees it where it was

- **GIVEN** an arrow bound at its start to a shape's connection point, and free at its end
- **WHEN** the owner detaches the start from the arrow's properties
- **THEN** the start is free and stays at the point it was bound to
- **AND** the end, being free, has no detach control
- **AND** one undo restores the binding

### Requirement: An export survives an image that cannot be loaded

An export SHALL leave out an image that cannot be loaded from both its SVG and its PNG, rather than stop, and SHALL tell the owner how many images it left out.

#### Scenario: An image that fails to load is left out of the export and reported

- **GIVEN** a whiteboard with a shape and an image whose file cannot be fetched
- **WHEN** the owner exports it as PNG
- **THEN** the PNG is drawn from the elements that loaded, without the image's element
- **AND** the owner is alerted that one image could not be loaded and left out of the export

### Requirement: The canvas is plain

The canvas SHALL draw its elements on a plain background and SHALL draw no grid. A resize and a placement SHALL land where the pointer puts them, a move SHALL land where the pointer puts it unless it snaps to another element, and the editor SHALL hold no snap setting.

#### Scenario: A moved shape lands where the pointer puts it

- **GIVEN** a Process shape on the canvas with no other element within the snap distance
- **WHEN** the owner drags the shape by an offset that is not a multiple of any step
- **THEN** the shape's top-left corner has moved by exactly that offset

#### Scenario: The canvas draws no grid

- **GIVEN** an open whiteboard
- **WHEN** the canvas is drawn
- **THEN** it draws no grid pattern behind the elements
- **AND** the toolbar offers no snap toggle

### Requirement: The wheel pans and a pinch zooms about the pointer

A wheel without a modifier SHALL pan the canvas by the wheel's delta. A wheel with Ctrl or Cmd held, and a trackpad pinch, SHALL zoom about the pointer, so the point under the pointer stays under it. Space held with a drag SHALL pan. The zoom SHALL stay between 0.1 and 30, and a zoom past either limit SHALL leave the viewport where the limit put it.

#### Scenario: The wheel pans

- **GIVEN** a canvas at its default viewport
- **WHEN** the owner scrolls the wheel by a vertical delta
- **THEN** the viewport has panned by that delta and its zoom is unchanged

#### Scenario: Ctrl and the wheel zoom about the pointer

- **GIVEN** a canvas with the pointer over a point of the board
- **WHEN** the owner scrolls the wheel with Ctrl held
- **THEN** the zoom changes
- **AND** the board point under the pointer is the same point as before

#### Scenario: Zoom stops at the limits

- **GIVEN** a canvas already at the maximum zoom
- **WHEN** the owner zooms in again
- **THEN** the zoom stays at the maximum

#### Scenario: Space and a drag pan

- **GIVEN** a canvas with a tool other than the hand tool active
- **WHEN** the owner holds Space and drags
- **THEN** the viewport pans by the drag and no element is created or moved

### Requirement: The keyboard resets and fits the view

Ctrl or Cmd with 0 SHALL reset the zoom to 1 about the centre of the view. Shift with 1 SHALL fit every element in the view, and Shift with 2 SHALL fit the selection, each with the zoom held within its limits. With nothing to fit, the viewport SHALL stay where it is.

#### Scenario: Shift and 1 fit the content

- **GIVEN** a whiteboard with elements outside the view
- **WHEN** the owner presses Shift and 1
- **THEN** every element lies inside the view

#### Scenario: Fitting an empty board changes nothing

- **GIVEN** a whiteboard with no elements
- **WHEN** the owner presses Shift and 1
- **THEN** the viewport is unchanged

### Requirement: The owner selects every element at once

Ctrl or Cmd with A SHALL select every element, except while text is being edited, where it selects the text.

#### Scenario: Select all selects every element

- **GIVEN** a whiteboard with several elements
- **WHEN** the owner presses Ctrl and A
- **THEN** every element is selected

#### Scenario: Select all while editing text selects the text

- **GIVEN** an element's text open for editing
- **WHEN** the owner presses Ctrl and A
- **THEN** the selection of elements is unchanged

### Requirement: Elements are copied and cut

Ctrl or Cmd with C SHALL write the selected elements to the clipboard as JSON text carrying a marker. Ctrl or Cmd with X SHALL do the same and delete them as one undo step.

#### Scenario: Cut and its paste undo separately

- **GIVEN** a shape cut and then pasted
- **WHEN** the owner undoes once
- **THEN** only the paste is reverted

### Requirement: Elements are pasted from the clipboard

Ctrl or Cmd with V SHALL read the clipboard, and when it carries the marker, add copies of the elements offset from the originals, with fresh ids, selected, as one undo step. An arrow copied with its bound shapes SHALL stay bound to the pasted copies, and an arrow copied without them SHALL paste with those ends free. Clipboard text without the marker SHALL be left to the other paste handlers.

#### Scenario: Paste adds offset copies with fresh ids

- **GIVEN** a shape copied to the clipboard
- **WHEN** the owner pastes
- **THEN** a second shape exists with a different id and an offset position
- **AND** the pasted shape is the selection

#### Scenario: A pasted arrow is bound to the pasted shapes

- **GIVEN** an arrow and the two shapes it is bound to, all copied
- **WHEN** the owner pastes
- **THEN** the pasted arrow is bound to the pasted shapes and not to the originals

#### Scenario: An arrow pasted without its shapes has free ends

- **GIVEN** only an arrow copied, whose ends were bound
- **WHEN** the owner pastes
- **THEN** the pasted arrow's ends are free

#### Scenario: Clipboard text without the marker is ignored

- **GIVEN** clipboard text that is not a copied-elements payload
- **WHEN** the owner pastes on the canvas
- **THEN** no element is added by this handler

### Requirement: A right-click on the canvas opens the whiteboard's own menu

The whiteboard SHALL open a context menu at the pointer on a right-click, selecting the element under the pointer first when it is not already selected and clearing the selection when the pointer is on empty canvas.

#### Scenario: A right-click on an unselected element selects it and opens its menu

- **GIVEN** a shape that is not selected
- **WHEN** the owner right-clicks it
- **THEN** the shape is the selection
- **AND** the menu opens with the selection's commands

#### Scenario: A right-click on a selected element keeps the selection

- **GIVEN** two selected elements
- **WHEN** the owner right-clicks one of them
- **THEN** both stay selected

#### Scenario: A right-click on empty canvas clears the selection and opens the board's menu

- **GIVEN** a selected shape
- **WHEN** the owner right-clicks empty canvas
- **THEN** nothing is selected
- **AND** the menu opens with the board's commands

### Requirement: A menu opened from the keyboard keeps the selection

The whiteboard SHALL open the same menu from the keyboard, with the menu key or Shift+F10 on the focused canvas, at the canvas's corner. A keyboard menu SHALL NOT hit-test the pointer or change the selection, so it lists the commands for what is already selected, or the board's commands when nothing is.

#### Scenario: The menu key on a selected element keeps it selected

- **GIVEN** a shape that is selected
- **WHEN** the owner presses the menu key on the focused canvas
- **THEN** the shape stays the selection
- **AND** the menu opens at the canvas's corner with the selection's commands

#### Scenario: Shift+F10 with nothing selected opens the board's menu

- **GIVEN** nothing is selected
- **WHEN** the owner presses Shift+F10 on the focused canvas
- **THEN** nothing is selected
- **AND** the menu opens with the board's commands

### Requirement: The element menu lists the selection's commands

The menu over an element SHALL list cut, copy, paste, duplicate, the stacking steps that can move one selected element, edit text for an element that has text, and delete, each running what its shortcut runs.

#### Scenario: Duplicate in the menu copies the selection

- **GIVEN** a selected shape
- **WHEN** the owner chooses Duplicate in the menu
- **THEN** the shape is copied and the copy is selected

#### Scenario: Delete in the menu asks first

- **GIVEN** a selected shape
- **WHEN** the owner chooses Delete in the menu
- **THEN** the delete confirmation opens
- **AND** the shape is still on the board

#### Scenario: Stacking is listed for one element only

- **GIVEN** two selected elements
- **WHEN** the owner opens the menu on one of them
- **THEN** the stacking steps are not listed

#### Scenario: Edit text opens the editor over the element

- **GIVEN** a selected shape
- **WHEN** the owner chooses Edit text in the menu
- **THEN** the text of the shape opens for editing in place

### Requirement: The canvas menu lists the board's commands

The menu over empty canvas SHALL list paste, select all, zoom to fit and reset zoom, each running what its shortcut runs.

#### Scenario: Select all in the menu selects every element

- **GIVEN** a board of two elements and nothing selected
- **WHEN** the owner chooses Select all in the menu
- **THEN** both elements are selected

#### Scenario: Paste in the menu adds the clipboard's elements

- **GIVEN** the clipboard holds a copied shape
- **WHEN** the owner chooses Paste in the menu
- **THEN** a copy of the shape is added and selected

#### Scenario: A refused clipboard read says so

- **GIVEN** the browser refuses to let the page read the clipboard
- **WHEN** the owner chooses Paste in the menu
- **THEN** an alert says the clipboard could not be read
- **AND** nothing is pasted

### Requirement: An element's outline, arrow, stroke and text take the colour the owner chooses

The owner SHALL choose a colour for the outline and text of a shape or a sticky note, for an arrow, for a text box and for a freehand stroke, and an element with no colour chosen SHALL draw in the page text colour.

#### Scenario: A chosen colour draws the outline and the text

- **GIVEN** a Process shape with the text Review on the canvas
- **WHEN** the owner chooses red as the shape's colour
- **THEN** the shape's outline and its text draw in red
- **AND** the exported image draws the outline and the text in red

#### Scenario: An element with no colour draws in the page text colour

- **GIVEN** a Process shape with no colour chosen
- **WHEN** the page switches between light and dark mode
- **THEN** the shape's outline and its text follow the page text colour

#### Scenario: Clearing a colour returns the element to the page text colour

- **GIVEN** a Process shape with red as its colour
- **WHEN** the owner clears its colour
- **THEN** the shape's outline and its text draw in the page text colour again

#### Scenario: A colour that is not a hex colour is refused

- **GIVEN** a saved whiteboard with a Process shape
- **WHEN** an agent patches the shape's colour to the word red
- **THEN** the patch is refused
- **AND** the saved content is unchanged

### Requirement: An element's outline, arrow and stroke take a width of thin, medium or bold

The owner SHALL choose a width of thin, medium or bold for a shape, a sticky note, an arrow and a freehand stroke, and until a width is chosen each of them draws at medium.

#### Scenario: A bold width draws the outline and the export at bold

- **GIVEN** a Process shape drawn at medium width
- **WHEN** the owner chooses bold
- **THEN** the shape's outline draws at the bold width
- **AND** the exported image draws the outline at that width

#### Scenario: A new arrow draws at medium width

- **GIVEN** an owner with a whiteboard open
- **WHEN** the owner draws a new arrow
- **THEN** the arrow's route draws at medium width

#### Scenario: A width that is not one of the three is refused

- **GIVEN** a saved whiteboard with a freehand stroke
- **WHEN** an agent patches the stroke's width to 3
- **THEN** the patch is refused
- **AND** the saved content is unchanged

### Requirement: A shape's or a sticky note's outline and an arrow's route take a dash pattern

The owner SHALL choose solid, dashed or dotted for the outline of a shape or a sticky note and for the route of an arrow, and until a pattern is chosen each draws solid.

#### Scenario: A dashed outline draws with gaps on the canvas and in the export

- **GIVEN** a Process shape with a solid outline
- **WHEN** the owner chooses dashed
- **THEN** the shape's outline draws with gaps on the canvas
- **AND** the exported image draws the outline with the same gaps

#### Scenario: An arrow route draws dotted when the owner chooses dotted

- **GIVEN** an arrow with a solid route
- **WHEN** the owner chooses dotted
- **THEN** the arrow's route draws dotted
- **AND** its arrowheads stay filled

#### Scenario: A dash pattern that is not one of the three is refused

- **GIVEN** a saved whiteboard with a Process shape
- **WHEN** an agent patches the shape's dash pattern to wavy
- **THEN** the patch is refused
- **AND** the saved content is unchanged

### Requirement: A shape takes a fill the owner chooses or none, and a new shape starts with none

A shape SHALL take a fill the owner chooses or no fill, and a new shape SHALL start with no fill.

#### Scenario: A new shape starts with no fill

- **GIVEN** an owner with a whiteboard open
- **WHEN** the owner places a rectangle with the shape tool
- **THEN** the shape has no fill and its outline draws on the canvas

#### Scenario: Clearing a shape fill leaves it open

- **GIVEN** a shape with a blue fill
- **WHEN** the owner clears its fill
- **THEN** the shape draws with no fill

#### Scenario: A sticky note keeps the fill it starts with

- **GIVEN** an owner with a whiteboard open
- **WHEN** the owner places a sticky note
- **THEN** the note draws with the yellow fill it starts with

#### Scenario: A fill that is neither a hex colour nor empty is refused

- **GIVEN** a saved whiteboard with a shape
- **WHEN** an agent patches the shape's fill to the word blue
- **THEN** the patch is refused
- **AND** the saved content is unchanged

### Requirement: A sketch level sets how far a shape, a sticky note and an arrow are sketched

The owner SHALL set a sketch level of architect, artist or cartoonist for each shape, sticky note and arrow, and until a level is chosen each draws at the artist level.

#### Scenario: Architect draws a shape with straight edges

- **GIVEN** a Process shape drawn at the artist level
- **WHEN** the owner sets its level to architect
- **THEN** the shape's outline runs straight between its corners
- **AND** the exported image draws the outline the same way

#### Scenario: Cartoonist draws a larger offset than artist

- **GIVEN** a Process shape drawn at the artist level
- **WHEN** the owner sets its level to cartoonist
- **THEN** the outline moves further from its box than it did at the artist level

#### Scenario: An arrow route is drawn straight at the architect level

- **GIVEN** an arrow drawn at the artist level
- **WHEN** the owner sets its level to architect
- **THEN** the arrow's route draws without any hand-drawn offset

#### Scenario: A sketch level that is not one of the three is refused

- **GIVEN** a saved whiteboard with a Process shape
- **WHEN** an agent patches the shape's level to wobbly
- **THEN** the patch is refused
- **AND** the saved content is unchanged

### Requirement: A shape's corners are sharp or round

The owner SHALL set a shape's corners to sharp or round, and a round corner SHALL curve by a radius that grows with the shape's size up to a limit.

#### Scenario: Round corners curve the outline

- **GIVEN** a Rectangle shape with sharp corners
- **WHEN** the owner sets its corners to round
- **THEN** each corner of the outline is curved
- **AND** the exported image curves the same corners

#### Scenario: A round corner stops growing at the limit

- **GIVEN** a Rectangle below the size limit with round corners
- **WHEN** the owner enlarges the Rectangle past the size limit
- **THEN** each of its corners curves by the radius the limit gives

#### Scenario: An ellipse offers no corner setting

- **GIVEN** an Ellipse shape on the canvas
- **WHEN** the owner selects it
- **THEN** the properties panel offers no corner setting

#### Scenario: A corner setting that is not sharp or round is refused

- **GIVEN** a saved whiteboard with a Rectangle shape
- **WHEN** an agent patches the shape's corners to pointed
- **THEN** the patch is refused
- **AND** the saved content is unchanged

### Requirement: A freehand stroke is drawn smoothed along its points

A freehand stroke SHALL be drawn as a smooth curve that follows the points the pointer passed, on the canvas and in the export.

#### Scenario: A freehand stroke draws smoothed

- **GIVEN** a freehand stroke drawn with a quick turn
- **WHEN** the owner views the canvas
- **THEN** the stroke has no corner at the points the pointer passed
- **AND** the exported image draws the same curve

#### Scenario: A stroke saved before the change draws smoothed

- **GIVEN** a freehand stroke saved before this change
- **WHEN** the owner opens the whiteboard
- **THEN** the stroke draws smoothed along the points it was saved with

### Requirement: A text box set to auto width sizes its box to its text

The owner SHALL set a text box to auto width or back to a wrapped width, and in auto width the text is not wrapped and the box is as wide as its widest line.

#### Scenario: Auto width sizes the box to its widest line

- **GIVEN** a wrapped text box that reads Review the order at its drag width
- **WHEN** the owner sets the text box to auto width
- **THEN** the text is not broken within a line
- **AND** the box is as wide as its widest line

#### Scenario: Auto width grows the box as a longer line is committed

- **GIVEN** a text box in auto width
- **WHEN** the owner types a longer line and commits it
- **THEN** the box grows to the new widest line
- **AND** the line is not broken

#### Scenario: Returning to a wrapped width keeps the box width

- **GIVEN** a text box in auto width
- **WHEN** the owner sets it back to a wrapped width
- **THEN** the text wraps at the width the box has

### Requirement: A text's size is one of four steps

The owner SHALL choose one of four sizes for the text of a shape, a sticky note, a text box or an arrow's label, and until a size is chosen the text draws at the smallest size.

#### Scenario: A larger size draws and wraps the text larger

- **GIVEN** a Process shape with a sentence of text
- **WHEN** the owner chooses the largest size
- **THEN** the text draws at that size and wraps onto more lines within the shape's width
- **AND** the exported image draws the text at the same size

#### Scenario: Text draws at the smallest size until a size is chosen

- **GIVEN** a Process shape with text and no size chosen
- **WHEN** the owner views the canvas
- **THEN** the text draws at the smallest of the four sizes

#### Scenario: A size that is not one of the four is refused

- **GIVEN** a saved whiteboard with a Process shape
- **WHEN** an agent patches the shape's text size to 17
- **THEN** the patch is refused
- **AND** the saved content is unchanged

### Requirement: A text is aligned within its element

The owner SHALL align the text of a shape, a sticky note or a text box to the left, centre or right, and the text of a shape or a sticky note to the top, middle or bottom, and until an alignment is chosen a shape's and a sticky note's text is centred and a text box's text starts at its left edge.

#### Scenario: Shape text aligns to the left and the top

- **GIVEN** a Process shape with text centred in it
- **WHEN** the owner aligns the text to the left and to the top
- **THEN** the text starts at the shape's left inside edge and its first line sits at the top of the shape
- **AND** the exported image aligns the text the same way

#### Scenario: Text box text aligns to the right

- **GIVEN** a text box with the text Review at its drag width
- **WHEN** the owner aligns the text to the right
- **THEN** the text ends at the box's right edge

#### Scenario: Shape text is centred until an alignment is chosen

- **GIVEN** a new Process shape with text
- **WHEN** the owner views the canvas
- **THEN** the text is centred in the shape

#### Scenario: An arrow label has no alignment control

- **GIVEN** an arrow with a label
- **WHEN** the owner selects the arrow
- **THEN** the properties panel offers no alignment for the label
- **AND** the label stays centred at the route's midpoint

#### Scenario: An alignment that is not one of the choices is refused

- **GIVEN** a saved whiteboard with a Process shape
- **WHEN** an agent patches the shape's text alignment to justify
- **THEN** the patch is refused
- **AND** the saved content is unchanged

### Requirement: A text being edited draws its draft in its element

While the owner edits a text, its element SHALL draw the draft in place of the committed text, so the element does not change when the owner commits the edit.

#### Scenario: The element shows the draft as the owner types

- **GIVEN** a Process shape with the text Review
- **WHEN** the owner double clicks the shape and types more text without committing
- **THEN** the shape already draws the typed text

#### Scenario: Escape returns the element to its committed text

- **GIVEN** a Process shape with a draft typed but not committed
- **WHEN** the owner presses Escape
- **THEN** the shape draws its committed text again

#### Scenario: Committing does not move the text

- **GIVEN** a Process shape showing a draft that differs from its committed text
- **WHEN** the owner commits the draft
- **THEN** the text draws at the same place, size and alignment as it did while being typed
- **AND** a line the editor wrapped by the glyphs' real widths may break at other words, since the layout wraps by the estimate the export shares

### Requirement: A selected element that takes a size shows a handle on each edge

A selected element that takes a size SHALL show a handle on each of its edges and on its top-left and bottom-right corners, and each handle SHALL resize the element along the edge or corner it sits on.

#### Scenario: An edge handle changes one dimension only

- **GIVEN** a selected Process shape
- **WHEN** the owner drags its right edge handle by an offset
- **THEN** its width has changed by that offset
- **AND** its height and its top-left corner are unchanged

#### Scenario: A text box shows only its left and right handles

- **GIVEN** a selected text box
- **WHEN** the owner views the canvas
- **THEN** handles show on its left and right edges
- **AND** no handle shows at its top or bottom edge or at a corner

#### Scenario: A selected arrow or stroke shows no resize handle

- **GIVEN** a selected arrow with both ends free
- **WHEN** the owner views the canvas
- **THEN** no resize handle shows on the arrow

#### Scenario: A resize stops at the smallest size an element takes

- **GIVEN** a selected Process shape
- **WHEN** the owner drags its right edge handle to the left past the shape's left edge
- **THEN** the width stops at the smallest size an element takes
- **AND** the left edge stays where it was

### Requirement: A selection of several elements resizes as one

A selection of several elements SHALL show the same handles around the box of the selection, and a drag of one handle SHALL scale each element of the selection in the same edit.

#### Scenario: Dragging a corner of several shapes scales each of them

- **GIVEN** three shapes selected together
- **WHEN** the owner drags the selection's bottom-right handle by an offset
- **THEN** each shape's box is scaled about the top-left corner of the selection's box
- **AND** one undo returns all three shapes to where they were

#### Scenario: An arrow bound to a resized shape follows it

- **GIVEN** a selected shape, and a selected arrow bound at its start to that shape and free at its end
- **WHEN** the owner drags the selection's bottom-right handle by an offset
- **THEN** the arrow's start is on the shape's connection point after the resize
- **AND** the arrow's free end is scaled with the selection

#### Scenario: A resize of several stops where the smallest element stops

- **GIVEN** a selection of a small shape and a large shape
- **WHEN** the owner drags a handle past the point where the small shape reaches its minimum size
- **THEN** no element of the selection is smaller than the minimum size

#### Scenario: A selection with no height has no top or bottom handle

- **GIVEN** two free arrows lying on one horizontal line, both selected
- **WHEN** the owner views the canvas
- **THEN** no top or bottom handle shows around the selection

### Requirement: Alt and a drag copies the selection and moves the copies

A drag of a selected element with Alt held SHALL leave the originals where they are and move a copy of the selection, which becomes the selection, as one undo step.

#### Scenario: Alt and a drag leaves the originals and moves the copies

- **GIVEN** a selected Process shape
- **WHEN** the owner holds Alt and drags the shape by an offset
- **THEN** the original is where it was
- **AND** a copy has moved by the offset and is the selection
- **AND** one undo removes the copy

#### Scenario: Alt and a drag copies an arrow with the shapes it is bound to

- **GIVEN** a selected shape and a selected arrow bound at its start to that shape
- **WHEN** the owner holds Alt and drags both by an offset
- **THEN** the copied arrow is bound to the copied shape
- **AND** the original arrow is still bound to the original shape

#### Scenario: An Alt press without travel copies nothing

- **GIVEN** a selected Process shape
- **WHEN** the owner presses the shape with Alt held and releases it without moving
- **THEN** no copy is added

### Requirement: Each end of an arrow takes its own arrowhead

Each end of an arrow SHALL take one arrowhead, chosen from a triangle, a diamond, a circle and a bar, or none at all, independently of the other end.

#### Scenario: An arrow takes a different arrowhead at each end

- **GIVEN** an arrow with no arrowhead at either end
- **WHEN** the owner sets the start to a circle and the end to a diamond
- **THEN** the start draws a circle and the end draws a diamond

#### Scenario: A patch naming an unknown arrowhead is refused

- **GIVEN** a saved whiteboard with an arrow
- **WHEN** an agent patches an end of the arrow to an arrowhead outside the five
- **THEN** the patch is refused
- **AND** the saved content is unchanged

### Requirement: A free arrow end is dragged by its handle

A selected arrow SHALL show a handle on each free end, and dragging a handle SHALL move that end with the pointer as one undo step.

#### Scenario: Dragging a free end moves that end only

- **GIVEN** a selected arrow whose start is bound to a shape and whose end is free
- **WHEN** the owner drags the end's handle by an offset
- **THEN** the end has moved by that offset
- **AND** the start stays on its connection point
- **AND** one undo returns the end to where it was

#### Scenario: Releasing a dragged end on a shape binds it

- **GIVEN** a selected arrow with a free end and a shape on the canvas
- **WHEN** the owner drags the end's handle onto a connection point of the shape and releases it
- **THEN** the end is bound to that connection point

#### Scenario: An arrow bound at both ends shows no end handle

- **GIVEN** an arrow bound at both ends to shapes
- **WHEN** the owner selects the arrow
- **THEN** no handle shows at either end

### Requirement: A selected shape adds a connected shape from its handle

A selected shape SHALL show a handle at each connection point, and dragging a handle to empty canvas SHALL add a shape of the same kind there, joined to the shape by an arrow, as one undo step.

#### Scenario: Dragging a connection handle to empty canvas adds a connected shape

- **GIVEN** a selected Process shape
- **WHEN** the owner drags its bottom handle to an empty point and releases it
- **THEN** a Process shape is added centred on the release point
- **AND** an arrow joins the bottom connection point of the first shape to the nearest connection point of the new shape
- **AND** one undo removes the new shape and the arrow together

#### Scenario: Releasing a handle on another shape joins it without adding a shape

- **GIVEN** a selected Process shape and a Decision shape beside it
- **WHEN** the owner drags the Process shape's handle onto the Decision shape and releases it
- **THEN** an arrow joins the two shapes
- **AND** no shape is added

#### Scenario: A press that does not travel adds nothing

- **GIVEN** a selected Process shape
- **WHEN** the owner presses one of its connection handles and releases it without moving
- **THEN** no shape or arrow is added

#### Scenario: An annotation shows no connection handle

- **GIVEN** a selected Annotation shape
- **WHEN** the owner views the canvas
- **THEN** no connection handle shows on the annotation

### Requirement: A dragged element snaps to the edges and centres of the others

The owner's drag of a shape, sticky note or text box SHALL snap the element's edges and centre to the nearest edge, centre or edge midpoint of another element within a short distance, and SHALL leave the element where the pointer puts it when none is in range.

#### Scenario: A dragged element snaps its edge to a neighbour's edge

- **GIVEN** a Process shape and a second shape whose left edge is 3 units from the first shape's left edge
- **WHEN** the owner drags the first shape until its left edge is within the snap distance of the second shape's left edge
- **THEN** the first shape's left edge lands on the second shape's left edge

#### Scenario: A dragged element snaps its centre to a neighbour's edge midpoint

- **GIVEN** a Process shape and a second shape whose bottom edge midpoint is within the snap distance of the first shape's centre
- **WHEN** the owner drags the first shape to that point
- **THEN** the first shape's centre lands on the second shape's bottom edge midpoint

#### Scenario: An element outside the snap distance does not snap

- **GIVEN** a Process shape and a second shape
- **WHEN** the owner drags the first shape with no edge or centre within the snap distance of the second shape
- **THEN** the element lands where the pointer puts it

#### Scenario: Holding Alt places the element exactly where the pointer is

- **GIVEN** a Process shape near another shape's edge
- **WHEN** the owner drags the first shape with Alt held
- **THEN** the element lands where the pointer puts it

#### Scenario: The snap distance is held in screen pixels

- **GIVEN** a Process shape and a second shape whose left edge is 4 units from the first shape's left edge
- **WHEN** the board is zoomed to twice its scale and the owner drags the first shape to that edge
- **THEN** the first shape lands where the pointer puts it, since 4 units is 8 screen pixels at that zoom

### Requirement: A guide shows each alignment a drag holds

The canvas SHALL draw a guide line for each alignment a drag currently holds and SHALL clear the guides when the drag ends.

#### Scenario: A guide shows while the drag holds an alignment and clears at its end

- **GIVEN** a drag that has snapped a shape's edge to another shape's edge
- **WHEN** the owner is still dragging
- **THEN** a guide line runs along the aligned edge
- **AND** the guide is gone once the owner releases the pointer
