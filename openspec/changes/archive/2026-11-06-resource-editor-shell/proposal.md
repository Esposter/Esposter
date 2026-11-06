# Editor shell

## Why

Each editor wires its own regions, its own narrow-window behaviour and its own toolbar, from the same low-level pieces. Only the survey changes at a breakpoint. No editor's toolbar follows the keyboard contract of a toolbar, and each draws its own contextual panel.

## What Changes

One shell draws a layout the [layout package](../vue-editor-layout-headless-package/design.md) resolved, and each editor supplies a layout and a registry of what fills each panel.

- The shell draws each resolved region docked, floating over the canvas, or as a sheet, and a handle between docked regions resizes them from the pointer and the keyboard.
- A toolbar is one component: groups of tools, a slot that holds the variants of one tool, an overflow menu for what does not fit, and the keyboard contract of a toolbar.
- A contextual panel shows its content by the selection, and the document's own settings when nothing is selected.
- On a compact window the tool region sits at the bottom, and the contextual panel opens from a button as a sheet.

## Capabilities

- **resource/editor-shell** (new)

## Impact

The whiteboard, survey and page builder shells are replaced by a layout each, in their own changes. The palette shell, the density tokens and the overflow menu are kept and reused.
