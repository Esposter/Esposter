# Resource editors

## Why

The editors a reader builds with, the page builder for webpages and emails, the survey Creator and the whiteboard, read as the parts they are made of. The palettes are flat lists or grids, the survey's palette has no icons at all, a drag shows a line or an outline and never the block that would land, the survey cannot be dragged into at all, and the side panes and tab bars spend the screen on padding. Each editor reached its own answer to the same questions, so the three drift apart.

## What Changes

The three editors share one drag-and-drop behaviour and one compact, categorized palette and chrome.

- A drag from a palette, or of a node already placed, shows the block drawn where it would land, so the reader sees the result before releasing, and a release outside every accepting place inserts nothing and says why.
- The survey Creator takes drags from its palette and on its canvas, with the keyboard moves it already has as the twin.
- Every palette is grouped into named categories, each kind has an icon, and a search field filters across the groups.
- The toolbars, tab bars, side panes and properties are compact: one density for every editor, a readable width for the canvas, and panels that open over the canvas instead of moving it.

The flowchart editor is not part of this: it was removed, and the whiteboard replaced it.

## Capabilities

The program holds no capability of its own; each part holds its own.

- **resource/editor-drag-preview** (part: resource-editors-drag-preview)
- **resource/editor-compact-chrome** (part: resource-editors-compact-chrome)

## Impact

The page builder, survey Creator and whiteboard shells, palettes and canvases change, the survey kinds gain a category and an icon map in the app, and the specs that recorded "the palette inserts; it is not dragged" and "reorder lives in the layers tree" are overturned in the part that ships it.
