# Headless block editor core

## Why

The page builder's document, its undo and its structural moves are not about webpages or emails: they are a typed tree of nodes, edits written as reversible patches, and the rules for moving a node between the slots that accept it. Built inside the page builder, they would know its node types and could serve no other editor. A survey builder over the MIT form library, a Note's layout blocks and a node canvas each need the same skeleton, as the UI library's Vuetify 0 base gives every component the same headless parts.

## What Changes

- A workspace package, `headless-block-editor`, holds the editing model with no editor's node types in it: the tree, the registry contract, the document schema built from a registry, the commands that edit a tree, the navigation a keyboard path walks, and the undo history.
- It is pure TypeScript with no framework and no DOM, so the page builder's store and the server's agent tools call the same functions.
- The RFC 6902 applier the agent content tools already use moves from the app into `@esposter/shared`, where the package and the app both import it.
- The page builder's webpage and email editors are its first consumers. The page builder's own changes build only their product half over it.

## Capabilities

- **headless-block-editor/editor-core** (new)

## Waiting on

None.

## Impact

- A new workspace package, `headless-block-editor`.
- `apps/web/shared/services/jsonPatch/` and `apps/web/shared/models/jsonPatch/`, which move into `packages/shared`, and every importer of them in `apps/web/server`.
- The page builder program and its document model, undo and canvas changes, whose generic halves land in the package.
