import { DASHBOARD_GRID_MARGIN, DASHBOARD_GRID_MIN_SPAN } from "@/services/dashboard/constants";

// The number of cells a pixel size covers, the inverse of getCellSize, and never fewer than the least span
export const getCellSpan = (size: number, pitch: number) =>
  Math.max(DASHBOARD_GRID_MIN_SPAN, Math.round((size + DASHBOARD_GRID_MARGIN) / pitch));
