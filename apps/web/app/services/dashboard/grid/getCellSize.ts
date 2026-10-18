import { DASHBOARD_GRID_MARGIN } from "@/services/dashboard/constants";

// The pixel size of a span of cells: each one a pitch, less the margin that sits between the cell and the next
export const getCellSize = (span: number, pitch: number) => span * pitch - DASHBOARD_GRID_MARGIN;
