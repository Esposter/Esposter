# Dashboard layout

## Why

The dashboard editor is a bar, a collapsible palette strip and a grid of tiles, and editing a visual opens a dialog. The dialog covers the canvas, so an owner who binds a chart to a dataset and changes its type cannot see the live chart redraw behind the scrim, which is the point of the [live canvas](../../specs/resource/dashboard-live-canvas/design.md). The dashboard also holds a setting of the whole canvas, how visuals pack, in a popover on the bar, and it is the one editor the [editor layout program](../resource-editor-layout-program/design.md) left unchanged.

## What Changes

- Selecting a visual shows its edit form in an inspector beside the grid, in place of the dialog, so the canvas stays in view.
- With nothing selected the inspector shows the dashboard's own settings, which the Layout popover held.
- The palette becomes a region the reader opens, in place of the strip above the grid.
- The bar keeps the visual count and the one primary action, Add visual.
- A compact window opens the palette and the inspector as sheets.

## Capabilities

- **resource/dashboard-layout** (new)

## Impact

The dashboard editor's component is replaced by a layout and a registry on the [editor shell](../resource-editor-shell/design.md). The edit form's content moves from a dialog into the inspector. The grid, its tiles, the visual menu, the delete and move dialogs and the published page do not change.
