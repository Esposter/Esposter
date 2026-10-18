import { DASHBOARD_GRID_MARGIN } from "@/services/dashboard/constants";

// The grid's width less the one margin before the first column, shared out so each column takes its width and the margin after it
export const getColumnPitch = (gridWidth: number, columnNumber: number) =>
  (gridWidth - DASHBOARD_GRID_MARGIN) / columnNumber;
