import type { ApexOptions } from "apexcharts";

// What turns a dashboard tile from a picture into something a reader can interrogate without leaving the page:
// Undo/redo over every zoom, series toggle and annotation edit; a right-click menu that acts at the point under
// The cursor; a ruler for the change between two points; and draggable, editable annotations. They sit in one
// Switch because they share one condition — each is a vendor feature that renders a watermark over the chart
// It is on (packages/app/content/docs/platform/dashboard-chart-interaction.md), so they are turned on and off
// As a set rather than weighed one at a time
export const VISUAL_INTERACTION_CHART_OPTIONS = {
  contextMenu: { enabled: true },
  history: { enabled: true, keyboard: true },
  ink: { enabled: true },
  measure: { enabled: true },
} as const satisfies ApexOptions["chart"];
// The query parameter a shared dashboard link carries its view state in, one entry per visual whose view was
// Captured, so adjusting a second chart adds to the link rather than replacing what the first one said
export const DASHBOARD_VIEW_QUERY_KEY = "view";
// Splits a view entry's visual id from its token. Its own named separator rather than ID_SEPARATOR: these
// Strings live in links people keep, so the url format has a compatibility contract an in-memory key does not
export const DASHBOARD_VIEW_SEPARATOR = "~";
