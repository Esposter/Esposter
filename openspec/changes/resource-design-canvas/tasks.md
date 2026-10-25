## 1. Admission

- [ ] 1.1 Add the engine, React and React DOM to the catalog, then run the absorb score with `--analyze` and record the engine's client-bytes magnitude in the design's Notes. The figure decides whether the editor ships as drafted. Verify: the score report lists `@excalidraw/excalidraw` with its measured client bytes, and the owner has accepted that figure against open choice 9.
- [ ] 1.2 Add an `allowed` entry, with its reason, for the engine and React if `depend/ban-dependencies` flags them. Verify: CI's `depend/ban-dependencies` lint passes on the touched manifests.

## 2. Resource type

- [ ] 2.1 Add the `Design` value to the resource type enum and to its Postgres enum, through a migration the drizzle skill generates. Verify: a test named after the scenario 'A Design resource is created from the create flow'.
- [ ] 2.2 Declare `Design` in `ResourceDefinitionMap` with the `fileAssets` and `portable` capabilities and no `publishable`. Verify: a test named after the scenario 'A design has no publish route'.
- [ ] 2.3 Write the content schema: the keyed elements, `order`, `files` and `appState`, the binding refinement, and the server-filled fields. Verify: tests named after the scenarios 'A stored design reopens unchanged' and 'A patch leaving a dangling binding is refused'.

## 3. Editor

- [ ] 3.1 Build the Vue bridge: the engine in an async, client-only component, its React root created on mount and unmounted on leave, with the import path reviewed for user files. Verify: a test named after the scenario 'A rectangle, an arrow bound to it and a text label are drawn'.
- [ ] 3.2 Feed the engine's changes into the design store and save them through `saveResourceContent`. Verify: a test named after the scenario 'An edit is saved through the content door'.
- [ ] 3.3 Adopt an agent's save into an open editor through `useAdoptResourceContent`. Verify: a test named after the scenario 'An agent adds a bound arrow by patch'.

## 4. Images

- [ ] 4.1 Upload a pasted image through `useUploadResourceFile`, and have the element keep only its file id. Verify: a test named after the scenario 'A pasted image is stored as a file asset'.
- [ ] 4.2 Release an image no element names at the next save. Verify: a test named after the scenario 'A deleted image is released on the next save'.

## 5. Export

- [ ] 5.1 Declare PNG and SVG as the portable formats of `Design`. Verify: a test named after the scenario 'The design exports to SVG'.

## 6. Agent surface

- [ ] 6.1 Describe the content as JSON Schema with the server-filled fields marked read-only and the binding rule stated. Verify: a test named after the scenario 'An agent reads the design's schema with its server-filled fields marked'.
- [ ] 6.2 File the three typed-command candidates (move with reroute, text measurement, group move) as their own change in the typed-commands area once the patch path ships. Verify: `openspec validate` passes and the design's Notes link the filed change.

## 7. Specs and the deferred page

- [ ] 7.1 Link this change from the deferred flowchart page beside its Excalidraw sentence, and mark the option live for `Design`. Verify: `openspec validate resource-design-canvas --strict --no-interactive` passes and the deferred page links this folder.
- [ ] 7.2 On ship, archive the change, rewrite the capability's design as built, and add a shipped-log line to the resource README. Verify: `openspec archive` succeeds and the resource README indexes the design canvas capability.
