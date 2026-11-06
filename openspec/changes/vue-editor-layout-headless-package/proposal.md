# Headless editor layout engine

## Why

An editor's screen is arranged by hand in its own component, so nothing can check that a selection has a panel, a narrow window is handled once per editor, and no two editors can differ in their layout without differing in their code. The layout libraries that exist model docking, which an editor here does not need, and none of them changes a panel's content with what is selected or turns a panel into a sheet on a narrow window.

## What Changes

A new Vue package holds an editor's layout as plain data and resolves it.

- A layout names regions, the panels in them and the conditions each panel is shown under.
- A resolve function takes the layout, the context (mode, tool, selection kind) and the size class the caller derives, and answers which regions are present, how each is presented and which content each panel shows.
- A reader's sizes, collapsed regions and active tabs are state kept apart from the layout, changed by pure functions and safe to persist.
- One composable keeps the reader's state and answers the resolved layout from a reactive context, so no editor writes that wiring.
- A check reports a layout that leaves a selection kind without content or names a content nobody registered.

## Capabilities

- **vue-editor-layout-headless/layout-engine** (new)

## Impact

A new workspace package with no runtime dependency beyond the shared package, with Vue and the schema library as peers. Nothing consumes it until the editor shell does.
