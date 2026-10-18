# Dashboard Live Canvas

## Why

The dashboard editor draws every tile as a stock icon for its visual type, and the chart is drawn only on the published page. An owner who binds a bar chart to a survey's responses sees a bar-chart icon, and the only way to see the bars is to publish and open the public page. The editor never shows the data. Power BI's report editing canvas is the same surface the reader sees, so an added visual shows its data as it is being built.

## What Changes

The dashboard editor draws each tile with its real chart over its live data.

- Each editor tile shows the chart over the binding's live read, with the loading, error and row-cap states the published page shows, and the error state offers Retry.
- The chart body takes no pointer input in the editor. A drag moves the tile and a click opens its edit form, while zoom, brushing, the ruler and annotation stay on the published page.
- Saving an edit redraws its tile, and resizing a tile redraws its chart at the new height.
- The tile's corner keeps Edit, Delete, Refresh and Copy link above the chart.
- The stock icons for tiles are removed.
- **Capabilities:** `resource/dashboard-live-canvas` (new).

## Capabilities

- **resource/dashboard-live-canvas** (new)

## Waiting on

None.

## Impact

- The dashboard editor's tiles, which now show the chart over its live read.
- The visual renderer, now the one used by both the editor and the published page.
- The editor's content, which passes each tile its whole visual rather than only its id and type. The saved dashboard content keeps its shape.
- The stock tile icons and their preview component, which are removed.

Size kept as the source page's own: splitting it is a later decision.
