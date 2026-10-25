## 1. Core model (phase 1)

- [ ] 1.1 Add the positioned element kinds to the headless core, each with its bounds, and take z-order from the element list. Verify: a test named after the scenario 'A document of typed elements parses with bounds and z-order'.
- [ ] 1.2 Check each arrow binding as a reference: the shape exists, the connection point exists, and an annotation takes none. Verify: tests named after the scenarios 'An arrow bound to a missing shape is refused' and 'An annotation refuses a binding'.
- [ ] 1.3 Compute shape outlines, connection points and hit testing as pure functions over the model. Verify: a test named after the scenario 'A click on a diamond's edge hits it and its corner misses'.
- [ ] 1.4 Route straight, curved and right-angled paths between connection points, a right-angled path leaving along its point's direction. Verify: a test named after the scenario 'A right-angled arrow leaves a shape from its bottom point'.
- [ ] 1.5 Write the commands as JSON Patch: insert, move with the reroute of bound arrows, resize, bind, unbind, delete with its cascade, and z-order. Verify: tests named after the scenarios 'Moving a shape reroutes its bound arrows in the same edit' and 'Deleting a shape removes arrows bound only to it'.
- [ ] 1.6 Undo each command through the shared history with its inverse patch, as one entry. Verify: a test named after the scenario 'An undo reverts a move and its reroute together'.

## 2. Renderer (phase 2)

- [ ] 2.1 Draw each element kind as an SVG component in z-order, with the hand-drawn outline seeded from the shape's own identity. Verify: a test named after the scenario 'A shape draws the same hand-drawn outline on every render'.
- [ ] 2.2 Take the pointer gestures as a state machine over Pointer Events: select, move, resize, draw, pan. Verify: a test named after the scenario 'Moving a shape keeps its arrows attached'.
- [ ] 2.3 Select by click, add with Shift, and select by marquee over the elements it fully covers. Verify: a test named after the scenario 'A marquee selects every shape it covers'.
- [ ] 2.4 Edit a shape's text, an arrow's label and a sticky note's text in place, with input-method composition. Verify: tests named after the scenarios 'Double clicking a shape edits its text in place' and 'An arrow's label sits at its midpoint'.
- [ ] 2.5 Draw freehand strokes along the pointer's path. Verify: a test named after the scenario 'A freehand stroke follows the pointer'.
- [ ] 2.6 Place the palette's shapes by drag and by click, with the properties panel, zoom in and out, and fit to content. Verify: a test named after the scenario 'The palette lists the flowchart shapes'.
- [ ] 2.7 Map the keyboard: Delete and Backspace to delete with confirmation, Escape to deselect, arrow keys to nudge, undo and duplicate. Verify: a test named after the scenario 'Deleting a shape from the canvas asks first and then removes its arrows'.
- [ ] 2.8 Upload a pasted image as a file asset of the whiteboard, and place sticky notes with a fill and text. Verify: tests named after the scenarios 'A pasted image is stored as a file asset' and 'A sticky note takes a fill and text'.

## 3. Export and publish (phase 3)

- [ ] 3.1 Write the SVG export as a pure function over the model. Verify: a test named after the scenario 'The whiteboard exports to SVG'.
- [ ] 3.2 Write the PNG export by drawing the SVG on a canvas through the platform APIs. Verify: a test named after the scenario 'The whiteboard exports to PNG'.
- [ ] 3.3 Render the read-only published view at the public route, with pan and zoom and no editing. Verify: a test named after the scenario 'A published whiteboard shows its shapes read-only'.

## 4. Agent surface and cutover (phase 4)

- [ ] 4.1 Describe the content as JSON Schema with the binding rules and the derived fields read-only, and expose the typed move. Verify: tests named after the scenarios 'An agent adds an arrow bound to a shape by patch' and 'A patch leaving a dangling binding is refused'.
- [ ] 4.2 Record the owner's choices A to D in the design, each with its date, before any migration is written. Verify: the design's Owner choices section records each choice, and `openspec validate resource-whiteboard --strict --no-interactive` passes.
- [ ] 4.3 Convert each stored flowchart to a whiteboard as a backfill over fixtures of stored flowcharts, reporting any it cannot map. Verify: a test named after the scenario 'A stored flowchart opens as a whiteboard with its shapes, arrows and labels'. This task is written for the convert choice, and is rewritten if the owner chooses otherwise.
- [ ] 4.4 Add the whiteboard's enum value, rewrite each row that holds the flowchart value, and recreate the enum without the old value once the count of flowchart rows is zero. Verify: a test named after the scenario 'A published flowchart's old address stops resolving'.
- [ ] 4.5 Remove the Flowchart's editor, router, models and canvas packages from the repository and the catalog, and rewrite or delete its specs. Verify: CI's typecheck passes, and the catalog no longer lists the canvas packages.
- [ ] 4.6 Point the flowchart achievement's definition at the whiteboard and keep every earned achievement. Verify: a test named after the scenario 'An earned flowchart achievement stays earned after the cutover'.

## 5. Specs, names and the earlier flowchart changes

- [ ] 5.1 Keep the type's name as the owner chooses in owner choice A, renaming every name the choice touches listed in the design. Verify: `openspec validate resource-whiteboard --strict --no-interactive` passes.
- [ ] 5.2 Link this change from the flowchart canvas and flowchart shapes changes and from the deferred flowchart page, and mark each superseded or interim as the owner chooses in owner choice C. Verify: `openspec validate resource-whiteboard --strict --no-interactive` passes, and each page links this folder.
- [ ] 5.3 On ship, archive the change, rewrite each capability's design as built, and add one shipped-log line to the resource README. Verify: `openspec archive` succeeds and the resource README indexes the whiteboard capability.
