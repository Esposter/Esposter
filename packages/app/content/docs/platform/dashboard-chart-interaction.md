---
title: Dashboard Chart Interaction
description: The ApexCharts v6 investigation surface on dashboard visuals — undo/redo, context menu, ruler, annotation authoring, linked highlighting and shareable view state, and the watermark they are accepted with.
---

# Dashboard Chart Interaction

A dashboard tile is something a reader interrogates, not only a picture they look at. ApexCharts v6 supplies that surface as configuration rather than code, so the whole of it lives in one constant — `VISUAL_INTERACTION_CHART_OPTIONS` — plus two features that need the app to hold state for them: which visuals move together, and what a shared link carries.

## What is on

```mermaid
flowchart TD
  SHARED["StyledApexChart<br/>every chart in the app"] -->|"renderer: auto"| CANVAS["dense series paint to canvas<br/>axes · tooltips · exports stay SVG"]
  VIS["Dashboard visual only"] --> INT["VISUAL_INTERACTION_CHART_OPTIONS<br/>history · contextMenu · measure · ink"]
  INT --> WM["each is watermarked<br/>editor and published view alike"]
  VIS --> LINK["getVisualLinkChartOptions<br/>group = the dataset reference"]
  LINK -->|"brush a range on one"| DIM["out-of-range marks dim<br/>on every visual over that dataset"]
  VIS --> PERS["useVisualPerspective<br/>?view=visualId~token"]
  PERS -->|"on mounted"| APPLY["zoom · hidden series · selection restored"]
```

Everywhere a chart renders (`StyledApexChart`):

- **Canvas rendering** — `chart.renderer: "auto"`. The series layer paints to canvas past the point threshold; axes, tooltips, annotations and exports stay SVG. Nothing else changes shape, which is why it is on for every chart rather than opted into per surface. It buys nothing at today's dataset row cap — it is what would let that cap rise.

On dashboard visuals only:

- **Undo / redo** (`history`) — Ctrl+Z over zooms, series toggles and annotation edits.
- **Context menu** (`contextMenu`) — right-click a point for actions that operate at that point.
- **Ruler** (`measure`) — hold and drag to read the change, percent and slope between two points.
- **Annotation authoring** (`ink`) — drag, resize and restyle annotations, wired into undo. Annotations are not persisted: they are the reader's working marks, and a dashboard's saved content holds visuals, not notes.
- **Linked highlighting** — `getVisualLinkChartOptions` groups visuals **by the dataset they read**, not by the dashboard they sit on. Two visuals over one dataset share an x column, so a range brushed on either names the same rows on the other; two unrelated datasets would dim each other's marks by coincidence of number. A visual with no binding renders demo data and joins no group, and a chart type with no x axis to brush (pie, donut, polar area, radar, radial bar, treemap) is left out.
- **Shareable view state** — `useVisualPerspective` captures a visual's zoom window, hidden series and selection into a token and puts it in the url as `?view=<visualId>~<token>`. The parameter repeats, so a link carries the state of every chart its sender touched, and a token that no longer decodes opens the dashboard unfiltered rather than failing.

## The watermark

`history`, `contextMenu`, `measure`, `ink`, linked highlighting and perspectives are gated by the vendor. They work as documented above, and every chart carrying one renders a repeating "APEXCHARTS" watermark over it — on the editor and on the published `/view/Dashboard/[id]` page alike.

**That is accepted, not overlooked.** No key is configured and no code reads one: the features are worth their watermark, and a key would be a purchase rather than a setting. There is deliberately nothing to switch on here — adding an environment variable for a key nobody holds would be config that never has a value.

The consequence for editing this page's features is that they move as a set: they are enabled together in `VISUAL_INTERACTION_CHART_OPTIONS`, and backing out of the watermark means deleting entries there rather than weighing them one at a time.

## What is deliberately off

- **Crossfilter FILTER mode** — the mode where clicking a bucket re-aggregates every linked chart. It asks each chart for one `dimension` and one `reduce`, which is a single derived series; a visual here declares `query.series[]` and can carry several. Expressing a multi-series visual through it is not possible, and running it alongside `computeDatasetVisualPropsData` would put two aggregation engines in the same tile. HIGHLIGHT mode, above, needs no aggregation change and is what ships.
- **OS-aware themes** (`theme.follow`) — Vuetify owns the theme, and `StyledApexChart` pins the mode to it deliberately. Following the OS instead would fight the app's own switch.
- **Streaming** (`chart.streaming`) — bounds memory for `appendData` on a live feed. Datasets are read and refreshed, never appended to; there is no feed to bound.
- **Scrollytelling** (`chart.storyboard`) — pairs prose sections with saved chart views. Nothing in the app puts a chart inside prose.
- **The plugin platform, custom series types and pluggable easing** — each needs a specific plugin, series or curve to be worth registering. None exists to register.

Coherent data transitions and the touch gestures are on by default in v6 and need no configuration.

## Key files

| File                                                                     | Role                                                   |
| ------------------------------------------------------------------------ | ------------------------------------------------------ |
| `packages/app/app/components/Styled/ApexChart.vue`                       | theme pinning, canvas renderer, instance getter        |
| `packages/app/app/services/dashboard/chart/constants.ts`                 | the gated interaction switch and the view url format   |
| `packages/app/app/services/dashboard/chart/getVisualLinkChartOptions.ts` | which visuals move together when one is brushed        |
| `packages/app/app/composables/dashboard/useVisualPerspective.ts`         | capture and restore a visual's view state from the url |
