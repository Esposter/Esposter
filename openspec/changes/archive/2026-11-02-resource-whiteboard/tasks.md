## 1. Core model (phase 1)

- [x] 1.1 Add the positioned element kinds to the headless core, each with its bounds, and take z-order from the element list. Verify: a test named after the scenario 'A document of typed elements parses with bounds and z-order'.
- [x] 1.2 Check each arrow binding as a reference: the shape exists, the connection point exists, and an annotation takes none. Verify: tests named after the scenarios 'An arrow bound to a missing shape is refused' and 'An annotation refuses a binding'.
- [x] 1.3 Compute shape outlines, connection points and hit testing as pure functions over the model. Verify: a test named after the scenario 'A click on a diamond's edge hits it and its corner misses'.
- [x] 1.4 Route straight, curved and right-angled paths between connection points, a right-angled path leaving along its point's direction. Verify: a test named after the scenario 'A right-angled arrow leaves a shape from its bottom point'.
- [x] 1.5 Write the commands as JSON Patch: insert, move with the reroute of bound arrows, resize, bind, unbind, delete with its cascade, and z-order. Verify: tests named after the scenarios 'Moving a shape reroutes its bound arrows in the same edit' and 'Deleting a shape removes arrows bound only to it'.
- [x] 1.6 Undo each command through the shared history with its inverse patch, as one entry. Verify: a test named after the scenario 'An undo reverts a move and its reroute together'.

## 2. Renderer (phase 2)

- [x] 2.1 Draw each element kind as an SVG component in z-order, with the hand-drawn outline seeded from the shape's own identity. Verify: a test named after the scenario 'A shape draws the same hand-drawn outline on every render'.
- [x] 2.2 Take the pointer gestures as a state machine over Pointer Events: select, move, resize, draw, pan. Verify: a test named after the scenario 'Moving a shape keeps its arrows attached'.
- [x] 2.3 Select by click, add with Shift, and select by marquee over the elements it fully covers. Verify: a test named after the scenario 'A marquee selects every shape it covers'.
- [x] 2.4 Edit a shape's text, an arrow's label and a sticky note's text in place, with input-method composition. Verify: tests named after the scenarios 'Double clicking a shape edits its text in place' and 'An arrow's label sits at its midpoint'.
- [x] 2.5 Draw freehand strokes along the pointer's path. Verify: a test named after the scenario 'A freehand stroke follows the pointer'.
- [x] 2.6 Place the palette's shapes by drag and by click, with the properties panel, zoom in and out, and fit to content. Verify: a test named after the scenario 'The palette lists the flowchart shapes'.
- [x] 2.7 Map the keyboard: Delete and Backspace to delete with confirmation, Escape to deselect, arrow keys to nudge, undo and duplicate. Verify: a test named after the scenario 'Deleting a shape from the canvas asks first and then removes its arrows'.
- [x] 2.8 Upload a pasted image as a file asset of the whiteboard, and place sticky notes with a fill and text. Verify: tests named after the scenarios 'A pasted image is stored as a file asset' and 'A sticky note takes a fill and text'.

## 3. Export (phase 3)

- [x] 3.1 Write the SVG export as a pure function over the model. Verify: a test named after the scenario 'The whiteboard exports to SVG'.
- [x] 3.2 Write the PNG export by drawing the SVG on a canvas through the platform APIs. Verify: a test named after the scenario 'The whiteboard exports to PNG'.

## 4. Agent surface and the whiteboard's enum value (phase 4)

- [x] 4.1 Describe the content as JSON Schema with the binding rules and the derived fields read-only, and expose the typed move. Verify: tests named after the scenarios 'An agent adds an arrow bound to a shape by patch' and 'A patch leaving a dangling binding is refused'.
- [x] 4.2 Add the `Whiteboard` value to the resource type enum through a migration the drizzle skill generates. No row holds the value yet, so the migration is the add alone. Verify: the migration applies on a database holding no whiteboard row, and the enum lists the `Whiteboard` value, shown by the migration check in `packages/db-schema`.
- [x] 4.3 Link the flowchart retirement change to this change as the one it waits on, and check that each row of its feature check reads covered or a deliberate drop. Verify: the retirement change links this folder, and its own tasks run no step before this change is in the app.
- [x] 4.4 Expose the typed move to agents beside the generic JSON Patch tools, since a patch cannot compute a reroute. Verify: a test named after the scenario 'An agent moves a bound shape through the typed move' drives an agent's move of a bound shape, and the arrow is rerouted in the same write.

## 5. Names and specs

- [x] 5.1 Name the type Whiteboard throughout, with the renames the design's type section lists, and sweep the prose for the old name. Verify: `openspec validate resource-whiteboard --strict --no-interactive` passes, and a search of `openspec` outside `archive` for the old name finds no hit in this change.
- [x] 5.2 On ship, archive the change, rewrite each capability's design as built, and add one shipped-log line to the resource README. Verify: `openspec archive` succeeds and the resource README indexes the whiteboard capability.

## 6. Gaps found while building

- [x] 6.1 Draw an arrow with the Arrow tool in the pointer-gesture reducer: a press on a shape's connection point, or on the shape to its nearest point, and a release on another shape's point insert an arrow bound at both ends. Releasing on empty space or on an annotation leaves that end free, and each end carries its own arrowhead. Verify: tests named after the scenarios 'An arrow binds its ends to two shapes' connection points', 'An annotation takes no connection' and 'An arrow with an arrowhead at each end'.
- [x] 6.2 Resize an element by its bounds, so a resize from the top-left reaches the top and left edges, and reroute its bound arrows in the same edit. Verify: a test named 'Resizing from the top-left reroutes bound arrows in the same edit', and the gesture reducer's top-left resize tests.
- [x] 6.3 Move a stroke by translating every point, and an arrow by translating each free end while a bound end follows its shape, refusing an arrow bound at both ends, so the reducer drags both. Verify: tests named 'Moving a stroke moves every point of it', 'Moving an arrow moves its free end and leaves its bound end' and 'An arrow bound at both ends does not move'.
- [x] 6.4 Wrap a shape's, sticky note's and arrow label's text at its width, in the editor and the export by one shared rule, since the export breaks lines only at newlines and the editor never measures a wrap. Verify: a test named 'A long label wraps inside its shape', and the export's snapshot of the same text breaking at the same words.
