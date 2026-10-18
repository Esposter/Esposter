# Page Builder

## Why

The webpage and email editors run GrapesJS, which mounts through a belt of a dozen plugins, saves the HTML that only the live editor can produce, and offers no keyboard or single-pointer path for a drag. The hard parts of the work are the document shape, the canvas, the styling model, the undo model, the email engine and the cutover, and the design answers each in one of its sub-pages. The program replaces the engine rather than thinning it, because thinning cannot reach the accessibility and state model the editors need.

## What Changes

Webpages and emails are edited in a new page builder that holds a typed tree, draws it on a canvas and records every edit as an undoable patch, in place of the GrapesJS editor. The existing webpages and emails are removed in the change that ships it.

- A webpage or an email is a typed tree of nodes, and each node type declares its fields, its allowed children and its published output.
- A webpage publishes as one HTML document, and an email compiles to email HTML on the server, so no editor state is kept as derived output.
- Every edit is undoable, and every pointer action has a keyboard path.
- An editor loads no third-party origin of its own.
- **BREAKING:** The cutover deletes every existing webpage and email, whatever its state, and removes the old editor's dependencies, origins and modules. A program bound to a deleted email keeps its reference and reads it as missing.
- The work ships in four phases: the model and its output, the webpage editor, the email editor, then the cutover that swaps them in.
- **Capabilities:** `resource/page-builder` (new).

## Capabilities

- **resource/page-builder** (new)

## Waiting on

None.

## Impact

- The webpage and email editors, their shells, their stores and their component trees.
- The page builder's shared models, schemas, renderers and patch applier, shared by the app and the server.
- The server's publish path for webpages and emails, and its email compile.
- Every existing webpage and email, which the cutover deletes, and the Blueprints that capture them.
- The security configuration, the dependency list, the skills and the ledgers, and the specs that describe the editors.

Size kept as the source page's own: splitting it is a later decision.
