# Blueprint Manifest Export and Import

## Why

A blueprint is the one resource whose purpose is reuse. Capture gathers a working setup into a manifest and deploy turns the manifest into resources, but the manifest leaves the app only as the text of the Editor blade. Every other resource with a reusable form already has a file through the Portable capability: a Sheet exports CSV, JSON and XLSX, a Note exports Markdown, a Flowchart exports PNG and SVG. The resource roadmap names the Azure portal's template deployment as the Blueprint's reference, and that product exports and imports the template. This is gap 9 of the [gap survey](../gap-survey-2026-10-25/proposal.md).

## What Changes

A blueprint gains one format through the Portable capability, the manifest as a JSON file, so its overflow menu offers Import and Export like every other portable type.

- **Export** downloads the saved manifest as `<name>.json`. It is the content Deploy runs, so the file never differs from what a deploy would create.
- **Import** reads a `.json` file, refuses one over the app's file limit before it is read, and checks it against the manifest schema the Editor's Save already uses. An accepted manifest takes a revision of the saved manifest, then lands in the Editor blade as unsaved text. Save commits it, and the previous manifest stays in version history.
- No server procedure, no migration and no new dependency. The manifest holds no owner ids, so a file carries its blueprint to another account.
- **Capabilities:** `resource/blueprint-portability` (new).

## Capabilities

- **resource/blueprint-portability** (new)

## Waiting on

None. The blueprint resource and its capture are built.

## Impact

- The blueprint's resource definition, which gains `portable`.
- The Portable format map, which gains a Blueprint entry. The map is keyed by the portable union, so a type that declares the capability without an entry is a compile error.
- The Editor blade, which shows an imported manifest as unsaved text.
- Storage: an import takes one revision of the saved manifest, charged as the Note's import is, and its Save is charged like any Editor save. Nothing new is stored.
