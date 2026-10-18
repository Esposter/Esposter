import { DASHBOARD_GRID_MARGIN } from "@/services/dashboard/constants";

// The pixel offset of a cell from the grid's edge. A cell's pitch is its size plus one margin, so a cell starts
// As many pitches in as its index, past the margin that comes before the first
export const getCellPosition = (index: number, pitch: number) => Math.round(index * pitch + DASHBOARD_GRID_MARGIN);
