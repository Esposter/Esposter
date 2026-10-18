// The grid the editor lays visuals out on. The published dashboard reflows from the same cells, so a visual's stored x/w
// Lands where it was placed the moment it is viewed, and only a narrower screen takes fewer columns
export const DASHBOARD_NO_COLUMNS = 12;
export const DASHBOARD_EDITOR_ROW_HEIGHT = 40;
export const DASHBOARD_PUBLISHED_ROW_HEIGHT = 50;
// The space before, between and after the cells, on both axes
export const DASHBOARD_GRID_MARGIN = 10;
export const DASHBOARD_GRID_MIN_SPAN = 1;
// A collider the moved visual has passed over by more than this share of its own height is left where it is
export const DASHBOARD_GRID_PASS_RATIO = 0.25;
// Widest first, so the first breakpoint the width reaches is the one a screen takes
export const DASHBOARD_BREAKPOINTS = [
  { columnNumber: 12, minimumWidth: 1200 },
  { columnNumber: 10, minimumWidth: 996 },
  { columnNumber: 6, minimumWidth: 768 },
  { columnNumber: 4, minimumWidth: 480 },
  { columnNumber: 2, minimumWidth: 0 },
] as const;
