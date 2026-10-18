# Cutover

## Why

The webpage and email editors run GrapesJS in the browser, and each save captures the HTML a published view serves, since only the live editor can produce it. The replacement editors store a typed tree and render on the server, so no code can read a GrapesJS document and no document can outlive the code that reads it. The one change that ships the new editors deletes the old data and removes GrapesJS, so the two states never coexist.

## What Changes

The new editors ship, every existing webpage and email is deleted, and the old editor is removed.

- The new documents become what a webpage and an email store. Publishing renders a webpage to one HTML document and compiles an email on the server, the views serve that HTML whole, a webpage exports as one self-contained HTML file, an email's personalised export compiles from the saved email with the editor closed, a restore clears the undo history, and a survey invite links its survey, so deleting the survey warns about the page that holds it.
- **BREAKING:** Publishing an email refuses markup that fails strict validation, with the validator's message, where it previously checked only that HTML was present.

- **BREAKING:** Every existing webpage and email is deleted, whatever its state: working copy, recycle bin or published. Its versions, publications, accesses, favourites, links, activity and stored files go with it, and its owner's storage is released.
- **BREAKING:** The webpage and email entries captured in Blueprints lose their content and deploy as fresh documents. A Blueprint revision from before the cutover is refused for those entries until the revision expires.
- A program bound to a deleted email keeps its invite reference and reads it as missing. Earned achievements stay.
- The editor's dependencies, security origins, skill and ledger for the old engine are removed.
- The affected specs are rewritten as built.
- Each editor's script beyond the explorer is at most 200 KiB gzipped on this change's production build, and a build over it does not merge.
- **Capabilities:** `resource/page-builder/cutover` (new), `resource/blueprint-resource` and `resource/program-resource` (changed).

## Capabilities

- **resource/page-builder/cutover** (new)
- **resource/blueprint-resource** (changed: a Blueprint's webpage and email entries and the revisions saved before the cutover)
- **resource/program-resource** (changed: a program bound to a deleted email)

## Waiting on

The page builder's phases one to four, which this change swaps in:

- `openspec/changes/resource-page-builder-canvas/`, the webpage editor's canvas.
- `openspec/changes/resource-page-builder-style-panel/`, the style panel.
- `openspec/changes/resource-page-builder-email/`, the email editor.
- `openspec/changes/resource-page-builder-performance-and-proof/`, whose benches and proofs the editors pass before the swap.

## Impact

- The stored document, the publish path, the views and the exports of webpages and emails, and the resource link registry, which indexes a survey invite's survey.
- Postgres: every Email and Webpage resource row is binned past retention by a custom migration, and the daily purge removes it with its cascades.
- Blob storage: each removed resource's directory is deleted, and its storage is released in the ledger.
- Azure Table: each removed resource's activity and view partitions are cleared.
- Blueprints: the captured entries of the two types lose their content through a backfill, run on dev and then prod.
- The security configuration loses the editor's third-party origins, and the dependency list loses the old editor and its plugins.
- The grapesjs skill and ledger are replaced, and the specs that name the old editor are rewritten.
