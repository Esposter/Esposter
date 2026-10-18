import { DASHBOARD_GRID_MARGIN } from "@/services/dashboard/constants";

// The grid's width less the margin before, between and after its columns, shared out among the columns
export const getColumnWidth = (gridWidth: number, columnNumber: number) =>
  (gridWidth - DASHBOARD_GRID_MARGIN * (columnNumber + 1)) / columnNumber;
