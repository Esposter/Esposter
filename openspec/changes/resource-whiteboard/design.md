# Whiteboard

The whiteboard is a freeform canvas resource that succeeds the Flowchart. It is built in four phases on our own headless core and drawn in Vue 3 as SVG, with no third-party dependency. Its arrows bind to shapes and route the way a flowchart's connectors do, so the whiteboard carries each flowchart behaviour the gap analysis below marks as must-have. The Flowchart itself is removed by the [flowchart retirement](../resource-flowchart-retirement/design.md), which the owner decided: its stored flowcharts are deleted, not converted or kept read-only.

## Direction

The owner's decisions behind this design, taken as given:

- The whiteboard is the flowchart's successor. A flowchart is a whiteboard with connected shapes, not a separate type kept alongside.
- The product takes no new third-party dependency. The whiteboard is built on the headless core and drawn by our own code. Excalidraw is a reference for how a whiteboard feels, and the whiteboard copies none of its code or packages.
- There is no parity gate. The whiteboard ships, and the Flowchart is removed by the retirement change once that change's feature check is confirmed. Its stored flowcharts are deleted, not converted or kept read-only.

## What exists today

Measured from the repository, non-test lines:

- **The Flowchart's app code**, its editor, view, export, store, models and services: about 930 lines. Most of its behaviour is the canvas engine's, which the Flowchart imports with four plugin packages ([flowchart retirement](../resource-flowchart-retirement/design.md) lists every file it removes).
- **The headless editor core**, `packages/headless-block-editor/src`: about 840 lines. It models a tree of typed nodes with slots, and its commands return JSON Patch operations ([editor core](../../specs/headless-block-editor/editor-core/design.md)). It has no element that is placed at coordinates, and no reference from one node to another.
- **The shared history**, `packages/shared/src/services/history/createHistory.ts`, which the page builder's undo already uses ([undo as patches](../../specs/resource/page-builder/undo-as-patches/design.md)). The whiteboard's undo reuses it.
- **The page builder's canvas components**, about 1,170 lines, a frame over a typed tree. They are a reference for a canvas drawn in the app's own components, not a model for free placement.

The Flowchart's stored content is the canvas engine's own node and edge JSON. Nothing in the repository reads it except the Flowchart's own code, and the retirement deletes it.

## Gap analysis

Each Flowchart feature, one line, with the whiteboard's verdict. The verdicts are **carried** (the whiteboard does it as the flowchart does), **changed** (it does it differently, and the difference is named), or **dropped** (it is not in the whiteboard). The rows marked **must-have** are the flowchart behaviour the whiteboard must carry before the retirement runs. A row marked **cannot carry** is one the whiteboard cannot carry as it stands.

The retirement change's own feature check lists the rows the owner confirms. This table is the design's view of the whiteboard; where a row is a loss, the owner's confirmation is what makes it one.

| Feature                                 | Flowchart today                                                                       | Whiteboard                                                                                                       | Verdict                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Process node                            | one rectangle node with a label                                                       | the process shape, the rectangle of the set                                                                      | carried                                                                       |
| Flowchart shape set (must-have)         | one rectangle; the six shapes are in the rejected flowchart-shapes change             | terminal, process, decision, input/output, predefined process, annotation, each drawn by the core's own geometry | carried                                                                       |
| Annotation (must-have)                  | not present                                                                           | a shape that takes no connection                                                                                 | carried                                                                       |
| Node label                              | inline edit, from the panel and by double click                                       | text inside the shape, edited in place                                                                           | carried                                                                       |
| Node colour                             | background colour in the panel                                                        | fill colour in the panel                                                                                         | carried                                                                       |
| Node resize                             | handles with a minimum of 120 by 60                                                   | handles with a minimum for each shape                                                                            | carried                                                                       |
| Palette                                 | a sidebar of node types dragged onto the canvas                                       | the same sidebar, with a pointer drag and a click to place                                                       | changed: no native drag and drop                                              |
| Connection points (must-have)           | four handles per node                                                                 | four connection points per shape                                                                                 | carried                                                                       |
| Connector and arrowhead (must-have)     | an arrowhead at the end, closed by default                                            | arrowheads at either end                                                                                         | changed: both ends                                                            |
| Connector binds to shapes (must-have)   | an edge joins two nodes' handles                                                      | an arrow binds each end to a shape's connection point, and an end may be free                                    | carried                                                                       |
| Path kinds (must-have)                  | curved, right-angled, straight                                                        | the same three, computed by our routing                                                                          | carried                                                                       |
| Right-angled routing (must-have)        | steps between handles, with no obstacle avoidance                                     | the same rule, with no obstacle avoidance                                                                        | carried: neither avoids obstacles                                             |
| Edge follows its shapes                 | the engine redraws joined edges                                                       | the move command reroutes bound arrows in the same edit                                                          | changed: the reroute is in the command's patch                                |
| Edge label                              | inline edit at the path's midpoint                                                    | text at the arrow's midpoint, edited in place                                                                    | carried                                                                       |
| Delete a node                           | confirm; its joined edges go with it                                                  | confirm; arrows bound only to it go with it                                                                      | carried                                                                       |
| Delete a connector                      | from the panel                                                                        | from the panel and the keyboard                                                                                  | carried                                                                       |
| Pan and zoom                            | the engine's viewport                                                                 | our viewport in the renderer                                                                                     | carried                                                                       |
| Zoom and fit controls                   | controls at the bottom left                                                           | zoom in and out, and fit to content                                                                              | carried                                                                       |
| Background grid and snap                | background dots; the shapes change snaps to grid                                      | a grid, with snap to it                                                                                          | carried                                                                       |
| MiniMap                                 | a plugin in the editor and in the published view                                      | not in version one                                                                                               | **dropped; owner choice D**                                                   |
| Selection and multi-select              | the engine's single selection                                                         | single selection, shift to add, and a marquee                                                                    | carried, extended                                                             |
| Keyboard                                | Backspace removes the selection, which nothing on screen names; Enter commits a label | Delete and Backspace, Enter, Escape, arrow-key nudge, undo and duplicate                                         | carried, extended                                                             |
| Undo                                    | not in the files inspected                                                            | the shared history over inverse patches                                                                          | new for flowcharts                                                            |
| Export PNG and SVG                      | the editor's DOM is captured and rasterised                                           | both drawn from the model                                                                                        | changed                                                                       |
| Read-only published view                | read-only, with pan, zoom and the minimap                                             | not in version one                                                                                               | **dropped; owner choice E**                                                   |
| Stored content                          | the canvas engine's own node and edge JSON                                            | none; the whiteboard does not read it                                                                            | **cannot carry, and not converted: the retirement deletes stored flowcharts** |
| Earned achievement                      | the flowchart achievement                                                             | removed with the type, by the retirement                                                                         | removed by decision                                                           |
| Agent tools                             | the generic tools over the content schema                                             | the generic tools, plus a typed move that reroutes                                                               | carried, extended                                                             |
| Versions, recycle bin, tags, favourites | the generic resource layer                                                            | the same                                                                                                         | carried                                                                       |

Three rows are the whiteboard's losses, and each is stated rather than argued away. The **stored content** cannot be read by the whiteboard, and the owner decided that the retirement deletes it rather than converting it. The **minimap** and the **read-only published view** are not in version one, and each is an owner choice below. The Flowchart is publishable today, so the published view is a real loss. The retirement records it as a loss the owner confirms, and this design does not decide it for the owner.

## The model

Phase 1 adds a second document model to the headless core, beside its tree. The tree stays as it is, and the positioned model is its own registry of element types.

Elements are typed, each with its own fields:

- **Shape**, with a kind: rectangle, ellipse, diamond, and the flowchart set (terminal, process, decision, input/output, predefined process, annotation). Each has a position, a size, a fill, and its text.
- **Arrow**, with its two ends and its path kind (straight, curved or right-angled). Each end is either bound to a shape's connection point or free at a position. Its arrowheads are set for each end separately, and its label is text the arrow owns.
- **Stroke**, a freehand path of points, with a stroke width.
- **Text**, a box with a width the person set and wrapped text.
- **Image**, a box with the file id of an uploaded file.
- **Sticky note**, a box with a fill and text, with the sticky-note look.

Positions and sizes are in document units. An element's bounds are its box, or for an arrow the box its path covers. Z-order is the order of the element list, which the core already keeps for its tree, so the list needs no separate order field.

**Bindings are references the core checks.** An arrow end names a shape by id and a connection point by index. The core checks that the id exists, that the shape accepts a connection, that the index is one the shape has, and that an annotation takes none. A document that fails a check is refused. This is the one piece of a graph the whiteboard needs. It is not a graph engine: there is no path-finding and no traversal beyond one arrow's two ends.

**Commands return JSON Patch.** Each command reads the document and returns the operations that change it, as the core's commands already do. The commands are insert, move, resize, bind and unbind, delete, z-order, and update of a prop. A move returns the operations that move the shape and reroute every arrow bound to it, in one list, so the edit is one patch and its inverse is one patch. A delete removes the shape and each arrow bound only to it, and unbinds an arrow bound to it at one end only. A command that would leave a dangling binding returns no operations.

**Geometry and routing are pure functions in the core.** Hit testing, a shape's connection points, the three path kinds, and the right-angled route between two points with exit directions are computed in the core, so they are tested without a DOM. The renderer draws the path the core computes.

**Undo is the shared history.** Each command's inverse is the JSON Patch that undoes it, and the history records one entry per command, so an undo reverts a move and its reroute together.

**Indexed, not keyed.** The element list is addressed by index, as the core addresses its tree, not keyed by id. An agent that reads an index and writes a patch is refused if another writer has changed the document, because the content door's content version guards the write. An index-addressed list costs an agent one read before a patch, and it keeps the core to one addressing model.

## The renderer

Phase 2 is a Vue 3 component that draws the model as SVG. It has one SVG component per element kind, layered in z-order.

**Pointer Events.** The component does not use the browser's native drag and drop. A small state machine over Pointer Events takes each gesture: select, move, resize, draw an arrow or shape, draw a stroke, pan, and marquee select. Each state's transitions are testable as functions over the model's commands, so the gesture code is thin.

**Hand-drawn look.** The look is our own drawing code. Each element draws its outline with a small deterministic offset, seeded from the element's id, so a repeated render draws the same lines and the export matches the editor. The offset is a short function over the path, and two strokes of an outline keep the sketch feel without a drawing library.

**Text.** The core stores a text box's width, which the person set, and no height. The renderer wraps the text and derives the height when it draws. An agent that writes text sets a width, and the renderer wraps it the same way. Text measurement is therefore a renderer concern and the core stays free of the DOM.

**Editing text.** Double clicking a shape, an arrow's label or a sticky note opens an inline editor over the element. The editor handles input-method composition, and a commit writes one command.

**Selection and multi-select.** Shift adds to the selection, and a marquee selects every element it fully covers. A move of a multi-selection is one command, and each arrow bound to a moved shape reroutes in that command.

## Export

Phase 3 draws the same model in two formats.

- **SVG.** A pure function over the model writes the SVG, using the same hand-drawn offsets the editor uses. It runs in the browser, and the server can run it too.
- **PNG.** The SVG is drawn onto a canvas by the platform's image and canvas APIs and written out with the canvas's own blob export. This is the platform, so it adds no dependency.

The read-only published view is owner choice E. If the owner keeps it, it is the renderer at the public route, with pan and zoom and no editing, and it publishes the document's current version as a Publishable resource does.

## The cutover

The Flowchart is removed by the [flowchart retirement](../resource-flowchart-retirement/design.md), which has its own order: owner confirmations of each environment's counts, a marking migration, the nightly purge that destroys the blobs, and a release that removes the code and the enum value. The owner's decision is recorded there: nothing is converted and nothing is kept read-only.

This change's part is the whiteboard. Its enum value is added by a migration before any whiteboard exists, and the whiteboard ships with its editor, its export and its agent surface. The retirement runs after this ships and after its owner confirms the feature check. No flowchart content is read, converted or migrated by anything in this change.

## The agent surface

The whiteboard is reached by the generic resource tools, as every type is: describe, read, patch and the lifecycle tools ([AI-native resources](../architecture-ai-native-resources-program/design.md)).

- **Describe** returns the content's JSON Schema, with the element kinds, their bounds and the binding rules stated, and with the fields the core derives marked read-only.
- **Read** returns the document, or one element by its index.
- **Edit** applies a JSON Patch. The core checks every binding, so an agent adding an arrow bound to a shape writes one patch, and a patch that leaves a dangling binding is refused with nothing written.
- **Typed move.** An agent that moves a shape uses the move command rather than a patch that moves only the shape, so the bound arrows reroute in the same write. The move is the one typed command the whiteboard needs at first, because a patch cannot compute a reroute.

## Dependencies

The change adds no catalog entry. The build uses only what the repository already has:

- The DOM's Pointer Events and SVG, for the renderer.
- The platform's canvas and image APIs, for PNG export. This is the platform rule of the [dependency admission](../../specs/architecture/dependency-admission/design.md) gate: a platform capability replaces a package.
- `@esposter/shared`'s history, for undo.

The flowchart's canvas packages leave the catalog in the retirement change, which is a removal.

## Sizing

The estimates below are judgement, checked against the measured sizes above: the Flowchart's app code is about 930 non-test lines, and the headless core is about 840. They are production lines before tests, and the tests are likely to be about as many again. Each line names the work it covers, so the build can be checked against it. The Flowchart's removal is sized in the retirement change.

| Work                               | Covers                                                              | Estimate, production lines |
| ---------------------------------- | ------------------------------------------------------------------- | -------------------------- |
| Core element model                 | element kinds, validation, bindings, commands as patches            | 900 to 1,300               |
| Geometry and hit testing           | shape outlines, the flowchart set, connection points, hit tolerance | 500 to 800                 |
| Arrows and routing                 | shape and free-end binding, three path kinds, right-angled routes   | 600 to 900                 |
| Freehand                           | point sampling, smoothing, stroke outline, hit testing              | 300 to 500                 |
| Text editing                       | inline editor, wrapping, box and height, input composition          | 500 to 800                 |
| Selection and multi-select         | single, shift-add, marquee, group move, z-order                     | 500 to 800                 |
| Resize and transform               | handles, minimum sizes, snap to grid                                | 300 to 500                 |
| Gesture state machine and viewport | Pointer Events, pan, zoom, fit to content                           | 400 to 600                 |
| Hand-drawn look                    | seeded offsets for each kind, our own drawing                       | 200 to 400                 |
| Undo and redo                      | the shared history, inverse patches per command                     | 100 to 200                 |
| Palette, panel and controls        | the sidebar, the properties panel, zoom controls                    | 500 to 800                 |
| Keyboard and accessibility         | key map, focus, announcements of selection and moves                | 300 to 500                 |
| SVG and PNG export                 | the SVG writer, the canvas route to PNG                             | 300 to 500                 |
| Agent surface                      | describe, patch validation, the typed move                          | 200 to 300                 |
| Published view, if kept            | the read-only renderer at the public route                          | 150 to 250                 |
| **Total**                          |                                                                     | **about 5,750 to 9,550**   |

Say plainly: **this is a large build**, several times the Flowchart's current app code and larger than the headless core it extends. The engine the Flowchart rents today does a share of this work the whiteboard must do itself: hit testing, routing, pan and zoom, and the selection model. Phases 1 and 2 are the bulk. Phase 1 can ship and be tested without the renderer, and phase 2 can be built against it, so the work can be cut at phase boundaries.

## Rejected alternatives

- **A third-party whiteboard engine, embedded in the app.** This was the first recommendation of this change, with its editor mounted by a Vue component. It is rejected, because the owner's direction rules out a new third-party dependency. Its cost was also real: a second UI runtime beside the app's, a second element model to convert to, and an engine's own interaction and styling in place of ours. Excalidraw's feel is the reference for the whiteboard, not a package the whiteboard uses.
- **Other third-party drawing and graph engines**, including whiteboard SDKs and node-graph libraries. Each is rejected by the same direction, and each would replace the Flowchart's canvas engine with another one.
- **Extending the Flowchart on its current canvas engine.** The flowchart shapes change and the flowchart canvas change proposed this. The retirement has removed both, since the whiteboard supersedes the Flowchart and growing it would add work the removal discards.
- **Rebuilding the Flowchart on the headless editor core.** The retirement records this as rejected: the core has no graph shape, and building one for a type being removed is not worth the cost.
- **Building the whiteboard as a page builder document.** The page builder's core is a tree, and a canvas positions elements and refers to them by id. Forcing a canvas into slots would make the arrows children of the shapes they join. The core is extended with the positioned model instead, and its tree stays as it is.

## Owner choices

**A. The resource type's name.** The feature is named Whiteboard. The type can take the same name or another one.

- **Whiteboard (recommended).** One word names the feature, the type, the route and the tools, and it is the owner's word for it.
- **Design.** The name of the earlier draft. It names a page-design tool, which the Webpage and the Email already are in part, so it reads two ways.

Whichever name the type takes, a type rename touches the following, which the change lists so the choice is made knowing its cost:

- **The `ResourceType` value** in `packages/db-schema/src/models/resource/ResourceType.ts`, and every map keyed by the type: the definition map, the description map, the editor, view and portable-format maps, and the blade map.
- **The Postgres enum and its rows.** The enum `resourceTypeEnum` is read by `resources.type` and by `bookmarks.resourceType`. A migration adds the new value. Before any whiteboard exists, nothing holds the new value, so the add is the whole migration. A rename after rows exist would rewrite them, and then a later migration would remove the old value by recreating the enum.
- **The public route.** A published view's address is `/view/<Type>/[id]`, so each published address changes with the type's name. The published view itself is owner choice E.
- **The router key and the MCP tool names.** A type's tRPC router is named from the type (its accessor is `uncapitalize` of the type), and the type-specific MCP tools take their names from it. The generic tool names do not change.
- **openspec folder names.** The change folder is already `resource-whiteboard`. Any page that names a type folder is renamed in the same change, as this change's sweep does.
- **Code names.** The components, services and models named after the type. On the order of a hundred files mention the flowchart's name, and a rename of the new type's code would touch its own files only. None is renamed by this change.

The content blobs are not touched. They are keyed by id, not by type, so no stored document moves.

**B. The stored flowcharts.** Decided, not open. The [retirement](../resource-flowchart-retirement/proposal.md) records the owner's decision: every stored flowchart is deleted, with its blob and its storage count, and nothing is converted or kept read-only. The converting and read-only options were considered there and rejected by the owner, so this change has no conversion to build.

**C. The flowchart shapes and the flowchart canvas.** Decided, not open. The shapes change is in [rejected](../../rejected/resource/flowchart-shapes/proposal.md), and the canvas change was removed with the retirement. The six shapes are part of this whiteboard's shape set.

**D. The minimap in version one.** Open. Recommended: no. The minimap is dropped in version one, and a viewport overview is a later read over the same bounds. The retirement lists it as dropped or added, which the owner confirms. Adding it before the retirement runs adds to phase 2.

**E. The read-only published view.** Open. The retirement lists the loss as one the owner confirms. Recommended: confirm the loss for version one, so the whiteboard is unpublished and the Publishable capability is added to it later as its own change. Keeping the view in version one makes the whiteboard publishable at once, and adds the renderer at the public route to phase 3, and the path to be settled with the type's name in owner choice A.

## Notes

- A patch cannot compute a reroute, so an agent's move of a shape goes through the typed move command. Without it, an arrow would stay where it was until the editor opened.
- The renderer measures text, so an agent's text box is wrapped the same way the person's is, and the core does not store a measured height.
- The keyboard map's Backspace removes the selection, as the Flowchart's does, and the whiteboard names it: the Delete key and Backspace both delete, and the help text says so. The Flowchart's Backspace went unnamed on screen.
- The core's element list is the same order the tree already keeps, so z-order needs no field of its own.

## Key files

The table lists existing files this change touches, and the role each plays after it.

| File                                                                       | Role                                                                      |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `packages/headless-block-editor/src/services/createBlockDocumentSchema.ts` | the document schema the positioned model's bindings are checked beside    |
| `packages/headless-block-editor/src/services/checkBlockNodeIds.ts`         | the id walk, which the positioned model's references extend               |
| `packages/headless-block-editor/src/services/applyBlockEdit.ts`            | applies a command's patch, refusing an edit that cannot apply             |
| `packages/headless-block-editor/src/services/removeBlockNode.ts`           | the removal the delete command cascades through to bound arrows           |
| `packages/shared/src/services/history/createHistory.ts`                    | the shared history the whiteboard's undo reuses                           |
| `packages/db-schema/src/models/resource/ResourceType.ts`                   | the `ResourceType` enum, which gains the whiteboard                       |
| `packages/db-schema/src/schema/resource/resourcesInResource.ts`            | the `resourceTypeEnum` column the whiteboard's enum migration extends     |
| `apps/web/shared/services/resource/ResourceDefinitionMap.ts`               | the whiteboard's entry, with its `fileAssets` and `portable` capabilities |
| `apps/web/app/services/resource/ResourceEditorComponentMap.ts`             | maps the whiteboard to its async editor                                   |
| `apps/web/app/services/resource/ResourceTypeDescriptionMap.ts`             | the whiteboard's description in the create flow                           |
| `apps/web/app/services/resource/PortableFormatMap.ts`                      | the PNG and SVG formats of the whiteboard                                 |

## Sources

- [Excalidraw](https://excalidraw.com/): a reference for how a whiteboard feels, the hand-drawn look and the arrow behaviour the whiteboard copies in feel only. Its code and its packages are not used.
- [the owner's direction](#direction): no new third-party dependency, and the whiteboard succeeds the flowchart. Taken from the owner, not from a source.
