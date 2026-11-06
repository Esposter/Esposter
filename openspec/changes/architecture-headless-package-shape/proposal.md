# Headless package shape

## Why

Headless packages are named and shaped three ways. The grid, PDF and canvas frame packages are named for Vue. The block editor, the survey engine, the survey expression language and the MJML blocks are named for what they are and hold no framework at all. Each editor then writes the same reactive layer over them: a document, an undo history, a commit that sets both, a load and a selected id.

Every consumer of these packages is Vue code. The Nuxt app, its server and the sibling packages consume them; the Azure Functions app consumes none and has no Vue. So the framework-free tier buys nothing a Vue package lacks, and costs a second place for every reactive wrapper.

## What Changes

One shape for every headless package: a Vue package with one entry. The abstractions are built and measured first, and the renames follow.

- A headless package is named `vue-<thing>-headless`, declares Vue as a peer and imports it, and exports one entry holding its functions and its composables together.
- The block editor and the survey engine, the two legacy packages that ship a Vue abstraction (the editing session and the survey runner), are renamed to the convention, with every consumer updated and no old name kept. The survey expression language and the MJML blocks ship none, so they keep their names.
- No headless package imports Pinia. A store is the app's, and the shared shape of three stores is a generic composable they call in their setup.
- The editing session the three editor stores repeat becomes one composable in the block editor package.

## Capabilities

- **architecture/headless-package-shape** (new)
- **vue-block-editor-headless/edit-session** (new)

## Impact

Two packages and their spec areas are renamed, and their descriptions, which say "no framework", are rewritten. The survey runner's reactive wrapper moves from the app into the survey engine package. The math expression compiler, the survey expression language and the MJML blocks are not renamed: they hold no state for Vue to act on.
