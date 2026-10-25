# Whiteboard

The whiteboard is a freeform canvas resource that succeeds the Flowchart. It is built in four phases on our own headless core and drawn in Vue 3 as SVG, with no third-party dependency. Its arrows bind to shapes and route the way a flowchart's connectors do, so the whiteboard carries every flowchart behaviour the gap analysis below marks as must-have. The cutover removes the Flowchart type in the change that handles its stored flowcharts, with no period where both run.

## Direction

The owner's decisions behind this design, taken as given:

- The whiteboard is the flowchart's successor. A flowchart is a whiteboard with connected shapes, not a separate type kept alongside.
- The product takes no new third-party dependency. The whiteboard is built on the headless core and drawn by our own code. Excalidraw is a reference for how a whiteboard feels, and the whiteboard copies none of its code or packages.
- There is no parity gate. The whiteboard ships, the stored flowcharts are handled as the owner chooses, and the Flowchart type is removed once that runs.

## What exists today

Measured from the repository, non-test lines:

- **The Flowchart's app code**, its editor, view, export, store, models and services: about 930 lines. Most of its behaviour is the canvas engine's, which the Flowchart imports with four plugin packages ([flowchart canvas](../resource-flowchart-canvas/design.md) states the current decision).
- **The headless editor core**, `packages/headless-block-editor/src`: about 840 lines. It models a tree of typed nodes with slots, and its commands return JSON Patch operations ([editor core](../../specs/headless-block-editor/editor-core/design.md)). It has no element that is placed at coordinates, and no reference from one node to another.
- **The shared history**, `packages/shared/src/services/history/createHistory.ts`, which the page builder's undo already uses ([undo as patches](../../specs/resource/page-builder/undo-as-patches/design.md)). The whiteboard's undo reuses it.
- **The page builder's canvas components**, about 1,170 lines, a frame over a typed tree. They are a reference for a canvas drawn in the app's own components, not a model for free placement.

The Flowchart's stored content is the canvas engine's own node and edge JSON, and its published view and its exports read that JSON. Nothing in the repository reads it except the Flowchart's own code.

## Gap analysis

Each Flowchart feature, one line, with the whiteboard's verdict. The verdicts are **carried** (the whiteboard does it as the flowchart does), **changed** (it does it differently, and the difference is named), or **dropped** (it is not in the whiteboard). The rows marked **must-have** are the flowchart behaviour the whiteboard has to carry before the cutover, and a row marked **cannot carry** is one the whiteboard cannot carry as it stands.

| Feature                                 | Flowchart today                                                                       | Whiteboard                                                                                                       | Verdict                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Process node                            | one rectangle node with a label                                                       | the process shape, the rectangle of the set                                                                      | carried                                                                   |
| Flowchart shape set (must-have)         | one rectangle; the six-shape change is pending                                        | terminal, process, decision, input/output, predefined process, annotation, each drawn by the core's own geometry | carried                                                                   |
| Annotation (must-have)                  | not present                                                                           | a shape that takes no connection                                                                                 | carried                                                                   |
| Node label                              | inline edit, from the panel and by double click                                       | text inside the shape, edited in place                                                                           | carried                                                                   |
| Node colour                             | background colour in the panel                                                        | fill colour in the panel                                                                                         | carried                                                                   |
| Node resize                             | handles with a minimum of 120 by 60                                                   | handles with a minimum for each shape                                                                            | carried                                                                   |
| Palette                                 | a sidebar of node types dragged onto the canvas                                       | the same sidebar, with a pointer drag and a click to place                                                       | changed: no native drag and drop                                          |
| Connection points (must-have)           | four handles per node, with the shapes change                                         | four connection points per shape                                                                                 | carried                                                                   |
| Connector and arrowhead (must-have)     | an arrowhead at the end, closed by default                                            | arrowheads at either end                                                                                         | changed: both ends                                                        |
| Connector binds to shapes (must-have)   | an edge joins two nodes' handles                                                      | an arrow binds each end to a shape's connection point, and an end may be free                                    | carried                                                                   |
| Path kinds (must-have)                  | curved, right-angled, straight                                                        | the same three, computed by our routing                                                                          | carried                                                                   |
| Right-angled routing (must-have)        | steps between handles, with no obstacle avoidance                                     | the same rule, with no obstacle avoidance                                                                        | carried: neither avoids obstacles                                         |
| Edge follows its shapes                 | the engine redraws joined edges                                                       | the move command reroutes bound arrows in the same edit                                                          | changed: the reroute is in the command's patch                            |
| Edge label                              | inline edit at the path's midpoint                                                    | text at the arrow's midpoint, edited in place                                                                    | carried                                                                   |
| Delete a node                           | confirm; its joined edges go with it                                                  | confirm; arrows bound only to it go with it                                                                      | carried                                                                   |
| Delete a connector                      | from the panel                                                                        | from the panel and the keyboard                                                                                  | carried                                                                   |
| Pan and zoom                            | the engine's viewport                                                                 | our viewport in the renderer                                                                                     | carried                                                                   |
| Zoom and fit controls                   | controls at the bottom left                                                           | zoom in and out, and fit to content                                                                              | carried                                                                   |
| Background grid and snap                | background dots; the shapes change snaps to grid                                      | a grid, with snap to it                                                                                          | carried                                                                   |
| MiniMap                                 | a plugin in the editor and in the published view                                      | not in version one                                                                                               | **dropped; cannot carry in version one**                                  |
| Selection and multi-select              | the engine's single selection                                                         | single selection, shift to add, and a marquee                                                                    | carried, extended                                                         |
| Keyboard                                | Backspace removes the selection, which nothing on screen names; Enter commits a label | Delete and Backspace, Enter, Escape, arrow-key nudge, undo and duplicate                                         | carried, extended                                                         |
| Undo                                    | not in the files inspected                                                            | the shared history over inverse patches                                                                          | new for flowcharts                                                        |
| Export PNG and SVG                      | the editor's DOM is captured and rasterised                                           | both drawn from the model                                                                                        | changed                                                                   |
| Published view                          | read-only, with pan, zoom and the minimap                                             | read-only, with pan and zoom                                                                                     | changed; the whiteboard becomes publishable in version one                |
| Stored content                          | the canvas engine's own node and edge JSON                                            | the whiteboard's document                                                                                        | **cannot carry as it stands**: converted, kept or dropped, owner choice B |
| Earned achievement                      | the flowchart achievement                                                             | kept, its definition pointed at the whiteboard                                                                   | carried                                                                   |
| Agent tools                             | the generic tools over the content schema                                             | the generic tools, plus a typed move that reroutes                                                               | carried, extended                                                         |
| Versions, recycle bin, tags, favourites | the generic resource layer                                                            | the same                                                                                                         | carried                                                                   |

Two rows are flagged as the whiteboard cannot carry them. The **stored content** cannot be read by the whiteboard as it stands, so the cutover has to convert it, keep it in a viewer, or drop it, and the owner decides which (owner choice B). The **minimap** is not in version one, and a viewport overview can come later as a read over the same bounds. Both are stated plainly so the cutover is not argued from a sense that the whiteboard does everything the flowchart does.

Publishing changes scope. An earlier draft kept the whiteboard unpublished. The flowchart is publishable today, so dropping the published view would remove a feature the cutover cannot leave out. The whiteboard is publishable in version one, read-only.

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

**Bindings are references the core checks.** An arrow end names a shape by id and a connection point by index. The core checks that the id exists, that the shape accepts a connection, that the index is one the shape has, and that an annotation takes none. A document that fails a check is refused. This is the reference check the flowchart canvas decision would otherwise have to build, and it is the one piece of a graph the whiteboard needs. It is not a graph engine: there is no path-finding and no traversal beyond one arrow's two ends.

**Commands return JSON Patch.** Each command reads the document and returns the operations that change it, as the core's commands already do. The commands are insert, move, resize, bind and unbind, delete, z-order, and update of a prop. A move returns the operations that move the shape and reroute every arrow bound to it, in one list, so the edit is one patch and its inverse is one patch. A delete removes the shape and each arrow bound only to it, and unbinds an arrow bound to it at one end only. A command that would leave a dangling binding returns no operations.

**Geometry and routing are pure functions in the core.** Hit testing, a shape's connection points, the three path kinds, and the right-angled route between two points with exit directions are computed in the core, so they are tested without a DOM. The renderer draws the path the core computes.

**Undo is the shared history.** Each command's inverse is the JSON Patch that undoes it, and the history records one entry per command, so an undo reverts a move and its reroute together.

**Keyed or indexed.** The element list is addressed by index, as the core addresses its tree, not keyed by id. An agent that reads an index and writes a patch is refused if another writer has changed the document, because the content door's content version guards the write. An index-addressed list costs an agent one read before a patch, and it keeps the core to one addressing model.

## The renderer

Phase 2 is a Vue 3 component that draws the model as SVG. It has one SVG component per element kind, layered in z-order.

**Pointer Events.** The component does not use the browser's native drag and drop. A small state machine over Pointer Events takes each gesture: select, move, resize, draw an arrow or shape, draw a stroke, pan, and marquee select. Each state's transitions are testable as functions over the model's commands, so the gesture code is thin.

**Hand-drawn look.** The look is our own drawing code. Each element draws its outline with a small deterministic offset, seeded from the element's id, so a repeated render draws the same lines and the export matches the editor. The offset is a short function over the path, and two strokes of an outline keep the sketch feel without a drawing library.

**Text.** The core stores a text box's width, which the person set, and no height. The renderer wraps the text and derives the height when it draws. An agent that writes text sets a width, and the renderer wraps it the same way. Text measurement is therefore a renderer concern and the core stays free of the DOM.

**Editing text.** Double clicking a shape, an arrow's label or a sticky note opens an inline editor over the element. The editor handles input-method composition, and a commit writes one command.

**Selection and multi-select.** Shift adds to the selection, and a marquee selects every element it fully covers. A move of a multi-selection is one command, and each arrow bound to a moved shape reroutes in that command.

## Export and publish

Phase 3 draws the same model in two places.

- **SVG.** A pure function over the model writes the SVG, using the same hand-drawn offsets the editor uses. It runs in the browser, and the server can run it too.
- **PNG.** The SVG is drawn onto a canvas by the platform's image and canvas APIs and written out with the canvas's own blob export. This is the platform, so it adds no dependency.
- **Published view.** The renderer runs read-only at the public view route, with pan and zoom and no selection or editing. Publishing renders the document's current version, as a Publishable resource does.

## The cutover

Phase 4 ships the whiteboard, handles the stored flowcharts, and removes the Flowchart type. It follows the shape of the page builder's cutover: one change ships the new resource, deletes or converts the old data, and removes the old code, so no code reads the old document and no document outlives the code that reads it. There is no parity gate, so the whiteboard does not wait on a comparison with the flowchart before it ships.

The order in that change:

1. The whiteboard type, its enum value and its editor ship. The Flowchart still exists until step 4.
2. The stored flowcharts are handled as the owner chooses in owner choice B. A conversion runs as a backfill, under the backfills skill, in each environment in turn. The count of Flowchart rows is checked against zero before step 4.
3. The migration that removes the Flowchart enum value runs. Postgres cannot drop an enum value in place, so the migration recreates the enum without it, as the deferred flowchart page describes for its two-step removal.
4. The Flowchart's code, its router, its components, its models and its canvas packages leave the repository and the catalog in the same change. Its specs are rewritten or deleted, and its achievement stays, pointed at the whiteboard.

**Converting a flowchart** maps each stored node to a shape: the rectangle becomes the process shape, and the label, the background colour and the position and size carry over. Each stored edge becomes an arrow bound to the connection points its handles name, with its path kind and its arrowhead carried over and its label placed at its midpoint. A stored flowchart the converter cannot map is listed for the owner, and no silent loss happens. The converter is tested on fixtures taken from stored flowcharts' shapes, with the expected whiteboard documents written beside them.

**The published view URL changes.** A published flowchart's public address names the Flowchart type, and the whiteboard's names the Whiteboard type. The no-compatibility-debt rule removes the old path rather than redirecting it, so a published flowchart's link stops working when the cutover runs unless the owner chooses otherwise. Owner choice B records that consequence.

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

The phase 4 cutover removes the flowchart's canvas packages from the catalog, which is a removal.

## Sizing

The estimates below are judgement, checked against the measured sizes above: the Flowchart's app code is about 930 non-test lines, and the headless core is about 840. They are production lines before tests, and the tests are likely to be about as many again. Each line names the work it covers, so the build can be checked against it.

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
| Published view                     | the read-only renderer at the public route                          | 150 to 250                 |
| Agent surface                      | describe, patch validation, the typed move                          | 200 to 300                 |
| Cutover                            | the converter or drop, the enum migration, removing the Flowchart   | 500 to 800                 |
| **Total**                          |                                                                     | **about 6,700 to 10,400**  |

Say plainly: **this is a large build**, several times the Flowchart's current app code and larger than the headless core it extends. The engine the Flowchart rents today does a share of this work the whiteboard must do itself: hit testing, routing, pan and zoom, and the selection model. Phases 1 and 2 are the bulk. Phase 1 can ship and be tested without the renderer, and phase 2 can be built against it, so the work can be cut at phase boundaries.

## Rejected alternatives

- **A third-party whiteboard engine, embedded in the app.** This was the first recommendation of this change, with its editor mounted by a Vue component. It is rejected, because the owner's direction rules out a new third-party dependency. Its cost was also real: a second UI runtime beside the app's, a second element model to convert to, and an engine's own interaction and styling in place of ours. Excalidraw's feel is the reference for the whiteboard, not a package the whiteboard uses.
- **Other third-party drawing and graph engines**, including whiteboard SDKs and node-graph libraries. Each is rejected by the same direction, and each would replace the Flowchart's canvas engine with another one.
- **Extending the Flowchart on its current canvas engine** ([flowchart shapes](../resource-flowchart-shapes/design.md) and [flowchart canvas](../resource-flowchart-canvas/design.md)). The whiteboard supersedes the Flowchart, so growing it adds work the cutover then discards. Owner choice C decides whether either change ships first as an interim.
- **Building the whiteboard as a page builder document.** The page builder's core is a tree, and a canvas positions elements and refers to them by id. Forcing a canvas into slots would make the arrows children of the shapes they join. The core is extended with the positioned model instead, and its tree stays as it is.

## Owner choices

**A. The resource type's name.** The feature is named Whiteboard. The type can take the same name or another one.

- **Whiteboard (recommended).** One word names the feature, the type, the route and the tools, and it is the owner's word for it.
- **Design.** The name of the earlier draft. It names a page-design tool, which the Webpage and the Email already are in part, so it reads two ways.

Whichever name the type takes, a type rename touches the following, which the change lists so the choice is made knowing its cost:

- **The `ResourceType` value** in `packages/db-schema/src/models/resource/ResourceType.ts`, and every map keyed by the type: the definition map, the description map, the editor, view and portable-format maps, and the blade map.
- **The Postgres enum and its rows.** The enum `resourceTypeEnum` is read by `resources.type` and by `bookmarks.resourceType`. A migration adds the new value and rewrites each row that holds the old one. A later migration removes the old value by recreating the enum, the two-step shape the deferred flowchart page already sets out.
- **The achievement.** The category value and the flowchart achievement's definition, whose name and category follow the type.
- **The public route.** The published view is `/view/<Type>/[id]`, so each published address changes with the type's name.
- **The router key and the MCP tool names.** A type's tRPC router is named from the type (its accessor is `uncapitalize` of the type), and the type-specific MCP tools take their names from it. The generic tool names do not change.
- **openspec folder names.** The change folder is already `resource-whiteboard`. The flowchart's spec folders and every page that links them are renamed or rewritten, which is a sweep across the specs.
- **Code names.** The components, services and models named after the type. About a hundred files mention the flowchart's name, and a rename would touch them. None is renamed by this change.

The content blobs are not touched. They are keyed by id, not by type, so no stored document moves.

**B. The stored flowcharts.** The owner chooses how the cutover handles them.

- **Convert (recommended).** Each flowchart becomes a whiteboard document, by the converter described above. Its current content is converted, its published version is published again as a whiteboard, and its versions beyond the current one are not carried over. A flowchart the converter cannot map is listed for the owner. The public address of a published flowchart changes, and the old address stops working, as the no-compatibility-debt rule requires.
- **Keep read-only.** The flowchart's stored content is kept for viewing, and the Flowchart's canvas packages stay in the catalog to render it. This keeps a third-party canvas engine for the life of the stored flowcharts, which is the cost the owner's direction rules out, so it is not recommended unless the owner accepts that cost.
- **Drop.** Every flowchart is removed, as the GrapesJS cutover removed its webpages and emails. Each is binned past the recycle bin's retention, and the daily purge removes it with its cascades. Earned achievements stay. This is the simplest, and it loses user content, which the owner weighs.

**C. Flowchart shapes and flowchart canvas.** Each is either shipped as an interim on the current canvas, or superseded by the whiteboard. Recommended: superseded, so no work is built on an engine the cutover removes. If the owner wants the flowchart's six shapes sooner, the whiteboard's shape set is the same list.

**D. The minimap in version one.** Recommended: no. The minimap is dropped in version one, and a viewport overview is a later read over the same bounds. The owner may want it before the cutover, which adds to phase 2.

## Notes

- A patch cannot compute a reroute, so an agent's move of a shape goes through the typed move command. Without it, an arrow would stay where it was until the editor opened.
- The renderer measures text, so an agent's text box is wrapped the same way the person's is, and the core does not store a measured height.
- The keyboard map's Backspace removes the selection, as the Flowchart's does, and the whiteboard names it: the Delete key and Backspace both delete, and the help text says so. The Flowchart's Backspace went unnamed on screen.
- The core's element list is the same order the tree already keeps, so z-order needs no field of its own.
- Stored flowcharts carry the canvas engine's node and edge JSON. The converter reads that JSON, and nothing else in the repository reads it, so the converter is the only place the old shape is decoded.

## Key files

The table lists existing files this change touches, and the role each plays after it.

| File                                                                       | Role                                                                                                               |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `packages/headless-block-editor/src/services/createBlockDocumentSchema.ts` | the document schema the positioned model's bindings are checked beside                                             |
| `packages/headless-block-editor/src/services/checkBlockNodeIds.ts`         | the id walk, which the positioned model's references extend                                                        |
| `packages/headless-block-editor/src/services/applyBlockEdit.ts`            | applies a command's patch, refusing an edit that cannot apply                                                      |
| `packages/headless-block-editor/src/services/removeBlockNode.ts`           | the removal the delete command cascades through to bound arrows                                                    |
| `packages/shared/src/services/history/createHistory.ts`                    | the shared history the whiteboard's undo reuses                                                                    |
| `packages/db-schema/src/models/resource/ResourceType.ts`                   | the `ResourceType` enum, which gains the whiteboard and loses the Flowchart                                        |
| `packages/db-schema/src/schema/resource/resourcesInResource.ts`            | the `resourceTypeEnum` column the enum migration rewrites                                                          |
| `apps/web/shared/services/resource/ResourceDefinitionMap.ts`               | the entry for the whiteboard, with its `fileAssets` and `portable` capabilities, and the Flowchart's entry removed |
| `apps/web/app/services/resource/ResourceEditorComponentMap.ts`             | maps the whiteboard to its async editor                                                                            |
| `apps/web/app/services/resource/ResourceTypeDescriptionMap.ts`             | the whiteboard's description in the create flow                                                                    |
| `apps/web/app/services/resource/PortableFormatMap.ts`                      | the PNG and SVG formats of the whiteboard, replacing the Flowchart's                                               |
| `apps/web/app/services/resource/flowchart/createFlowchartSvg.ts`           | the Flowchart's SVG capture, replaced by the model's SVG writer and removed in the cutover                         |
| `apps/web/app/components/Resource/Flowchart/Editor.vue`                    | the Flowchart's editor, replaced by the whiteboard's and removed in the cutover                                    |
| `apps/web/shared/models/flowchartEditor/data/GraphEdge.ts`                 | the stored edge the converter reads, removed in the cutover                                                        |
| `apps/web/shared/models/achievement/AchievementCategory.ts`                | the flowchart achievement's category, re-pointed at the whiteboard                                                 |
| `apps/web/server/trpc/routers/flowchart.ts`                                | the Flowchart's router, removed in the cutover                                                                     |
| `pnpm-workspace.yaml`                                                      | the catalog, from which the Flowchart's canvas packages are removed in the cutover                                 |

## Sources

- [Excalidraw](https://excalidraw.com/): a reference for how a whiteboard feels, the hand-drawn look and the arrow behaviour the whiteboard copies in feel only. Its code and its packages are not used.
- [the owner's direction](#direction): no new third-party dependency, and the whiteboard succeeds the flowchart. Taken from the owner, not from a source.
