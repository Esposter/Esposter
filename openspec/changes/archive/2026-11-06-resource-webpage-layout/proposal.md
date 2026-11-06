# Webpage layout

## Why

The webpage editor shows four right-hand tabs, Content, Style, Theme and Check, for every selection, so a selected paragraph offers a page-wide theme and a page-wide check beside its own settings. Its device toggle floats over the canvas and its critique findings sit in a tab that is seen only when it is opened. A webpage sits between the poles: the reader composes freely within a block tree whose slots accept some kinds, and the page's findings are advisory, not blocking.

## What Changes

- The inspector's tabs follow the selection: the page's settings and its theme with nothing selected, and Content and Style with a node.
- The Check tab is removed. The critique's findings are listed in the problems surface in the bar, as warnings.
- The device toggle moves into the bar.
- The blocks region keeps its Blocks and Layers tabs, and a compact window opens it and the inspector as sheets.

## Capabilities

- **resource/webpage-layout** (new)

## Impact

The webpage editor's arrangement is replaced by a layout and a registry on the [editor shell](../resource-editor-shell/design.md), beside the email's. The document, the canvas, the style panel and the critique's rules do not change.
