import type { UiCommand } from "@/models/ui/UiCommand";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

// The grid the editor lays visuals out on. The published dashboard reflows from the same cells, so a visual's stored x/w
// Lands where it was placed the moment it is viewed, and only a narrower screen takes fewer columns
export const DASHBOARD_NO_COLUMNS = 12;
export const DASHBOARD_EDITOR_ROW_HEIGHT = 40;
export const DASHBOARD_PUBLISHED_ROW_HEIGHT = 50;
// The space before, between and after the cells, on both axes
export const DASHBOARD_GRID_MARGIN = 10;
// Widest first, so the first breakpoint the width reaches is the one a screen takes
export const DASHBOARD_BREAKPOINTS = [
  { columnNumber: DASHBOARD_NO_COLUMNS, minimumWidth: 1200 },
  { columnNumber: 10, minimumWidth: 996 },
  { columnNumber: 6, minimumWidth: 768 },
  { columnNumber: 4, minimumWidth: 480 },
  { columnNumber: 2, minimumWidth: 0 },
] as const;
// The key a dashboard dataset's category column is read under, and a table visual totals it under
export const DASHBOARD_TABLE_CATEGORY_KEY = "category";
// The keys a focused visual takes, listed as the grid's shortcuts. The grid binds them itself, so no command runs them
export const DASHBOARD_GRID_COMMANDS: UiCommand[] = [
  {
    group: "Dashboard",
    id: "dashboard-visual-open",
    meaning: UiIconMeaning.Edit,
    shortcut: "Enter",
    title: "Open the focused visual",
  },
  {
    group: "Dashboard",
    id: "dashboard-visual-move",
    meaning: UiIconMeaning.Drag,
    shortcut: "Arrow keys",
    title: "Move the focused visual one cell",
  },
  {
    group: "Dashboard",
    id: "dashboard-visual-resize",
    meaning: UiIconMeaning.Expand,
    shortcut: "Shift+Arrow keys",
    title: "Resize the focused visual one cell",
  },
];
